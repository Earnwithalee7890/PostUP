import { supabase } from './supabase';
import { Campaign } from './types';
import { NeynarService } from './neynar';

export const SupabaseService = {
    async getCampaigns(includeEnded: boolean = false): Promise<Campaign[]> {
        let query = supabase
            .from('campaigns')
            .select('*');

        if (!includeEnded) {
            query = query.or(`ended_at.is.null,ended_at.gt.${new Date().toISOString()},status.eq.claimable`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }

        // Fetch participant counts for all campaigns
        const campaignIds = (data || []).map(row => row.id);
        const { data: submissionCounts } = await supabase
            .from('submissions')
            .select('campaign_id, user_fid')
            .in('campaign_id', campaignIds);

        // Count unique participants per campaign
        const participantCountMap: Record<string, Set<number>> = {};
        (submissionCounts || []).forEach((sub: any) => {
            if (!participantCountMap[sub.campaign_id]) {
                participantCountMap[sub.campaign_id] = new Set();
            }
            participantCountMap[sub.campaign_id].add(sub.user_fid);
        });

        // Transform database format to app format
        return (data || []).map(row => ({
            id: row.id,
            creator: row.creator,
            platform: row.platform,
            category: row.category,
            postUrl: row.post_url,
            castUrl: row.cast_url,
            tasks: row.tasks,
            rewardToken: row.reward_token,
            totalBudget: parseFloat(row.total_budget),
            platformFee: parseFloat(row.platform_fee),
            netBudget: parseFloat(row.net_budget),
            rewardAmountPerTask: parseFloat(row.reward_amount_per_task),
            remainingBudget: parseFloat(row.remaining_budget),
            minFollowers: row.min_followers,
            requirePro: row.require_pro,
            status: row.status,
            merkleRoot: row.merkle_root,
            onchainId: row.onchain_id,
            totalWeight: row.total_weight ? parseFloat(row.total_weight) : undefined,
            createdAt: new Date(row.created_at).getTime(),
            endedAt: row.ended_at ? new Date(row.ended_at).getTime() : undefined,
            participants: [],
            participantCount: participantCountMap[row.id]?.size || 0
        }));
    },

    async getCampaign(id: string): Promise<Campaign | undefined> {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error fetching campaign:', error);
            return undefined;
        }

        return {
            id: data.id,
            creator: data.creator,
            platform: data.platform,
            category: data.category,
            postUrl: data.post_url,
            castUrl: data.cast_url,
            tasks: data.tasks,
            rewardToken: data.reward_token,
            totalBudget: parseFloat(data.total_budget),
            platformFee: parseFloat(data.platform_fee),
            netBudget: parseFloat(data.net_budget),
            rewardAmountPerTask: parseFloat(data.reward_amount_per_task),
            remainingBudget: parseFloat(data.remaining_budget),
            minFollowers: data.min_followers,
            requirePro: data.require_pro,
            status: data.status,
            merkleRoot: data.merkle_root,
            totalWeight: data.total_weight ? parseFloat(data.total_weight) : undefined,
            onchainId: data.onchain_id,
            createdAt: new Date(data.created_at).getTime(),
            endedAt: data.ended_at ? new Date(data.ended_at).getTime() : undefined,
            participants: []
        };
    },

    async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'remainingBudget' | 'status' | 'participants'>): Promise<Campaign> {
        const { data, error } = await supabase
            .from('campaigns')
            .insert([{
                creator: campaign.creator,
                platform: campaign.platform,
                category: campaign.category,
                post_url: campaign.postUrl,
                cast_url: campaign.castUrl,
                tasks: campaign.tasks,
                reward_token: campaign.rewardToken,
                total_budget: campaign.totalBudget,
                platform_fee: campaign.platformFee,
                net_budget: campaign.netBudget,
                reward_amount_per_task: campaign.rewardAmountPerTask,
                remaining_budget: campaign.netBudget,
                min_followers: campaign.minFollowers || 0,
                require_pro: campaign.requirePro || false,
                onchain_id: campaign.onchainId,
                ended_at: campaign.endedAt ? new Date(campaign.endedAt).toISOString() : null
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating campaign:', error);
            throw new Error('Failed to create campaign');
        }

        return {
            id: data.id,
            creator: data.creator,
            platform: data.platform,
            category: data.category,
            postUrl: data.post_url,
            castUrl: data.cast_url,
            tasks: data.tasks,
            rewardToken: data.reward_token,
            totalBudget: parseFloat(data.total_budget),
            platformFee: parseFloat(data.platform_fee),
            netBudget: parseFloat(data.net_budget),
            rewardAmountPerTask: parseFloat(data.reward_amount_per_task),
            remainingBudget: parseFloat(data.remaining_budget),
            onchainId: data.onchain_id,
            minFollowers: data.min_followers,
            requirePro: data.require_pro,
            status: data.status,
            merkleRoot: data.merkle_root,
            totalWeight: data.total_weight ? parseFloat(data.total_weight) : undefined,
            createdAt: new Date(data.created_at).getTime(),
            endedAt: data.ended_at ? new Date(data.ended_at).getTime() : undefined,
            participants: []
        };
    },

    async completeTask(_campaignId: string, _taskType: any) {
        // For now, return success - verification happens via screenshot
        return { success: true };
    },

    /**
     * Submit a screenshot for a specific task
     */
    async submitScreenshot(campaignId: string, taskId: string, screenshot: string, userFid: number, address: string) {
        const { data, error } = await supabase
            .from('submissions')
            .upsert({
                campaign_id: campaignId,
                user_fid: userFid,
                user_address: address,
                task_id: taskId,
                screenshot_url: screenshot,
                status: 'pending'
            }, {
                onConflict: 'campaign_id,user_fid,task_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Error submitting screenshot:', error);
            throw new Error('Failed to submit screenshot');
        }

        return { success: true, submission: data };
    },

    /**
     * Get current user's submissions for a campaign
     */
    async getUserSubmissions(campaignId: string, userFid: number) {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('campaign_id', campaignId)
            .eq('user_fid', userFid);

        if (error) {
            console.error('Error fetching user submissions:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Get all submissions for a campaign (for admin/creator view)
     */
    async getSubmissions(campaignId: string) {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Verify/approve a screenshot submission (for admin)
     */
    async verifyScreenshot(campaignId: string, userFid: number, taskId: string, status: 'approved' | 'rejected') {
        const { data, error } = await supabase
            .from('submissions')
            .update({ status })
            .eq('campaign_id', campaignId)
            .eq('user_fid', userFid)
            .eq('task_id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error verifying screenshot:', error);
            throw new Error('Failed to verify screenshot');
        }

        return { success: true, submission: data };
    },

    /**
     * Get ALL submissions by a user across ALL campaigns (for Task History)
     */
    async getAllUserSubmissions(userFid: number) {
        // First get all submissions for this user
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('user_fid', userFid)
            .order('created_at', { ascending: false });

        if (subError) {
            console.error('Error fetching user submissions:', subError);
            return [];
        }

        if (!submissions || submissions.length === 0) {
            return [];
        }

        // Get unique campaign IDs
        const campaignIds = [...new Set(submissions.map((s: any) => s.campaign_id))];

        // Fetch campaign details
        const { data: campaigns, error: campError } = await supabase
            .from('campaigns')
            .select('id, platform, category, reward_token, net_budget, tasks')
            .in('id', campaignIds);

        if (campError) {
            console.error('Error fetching campaigns:', campError);
        }

        // Create campaign lookup
        const campaignMap = new Map((campaigns || []).map((c: any) => [c.id, c]));

        // Enrich submissions with campaign data
        return submissions.map((sub: any) => {
            const campaign = campaignMap.get(sub.campaign_id) || {};
            return {
                id: sub.id,
                campaignId: sub.campaign_id,
                taskId: sub.task_id,
                status: sub.status, // pending, approved, rejected
                createdAt: sub.created_at,
                // Campaign info
                platform: campaign.platform || 'Unknown',
                category: campaign.category || 'Unknown',
                rewardToken: campaign.reward_token || 'USDC',
                // Estimated reward (net budget / total tasks)
                estimatedReward: campaign.net_budget && campaign.tasks
                    ? (parseFloat(campaign.net_budget) / campaign.tasks.length).toFixed(4)
                    : '0'
            };
        });
    },

    /**
     * Get campaign IDs where user has completed ALL tasks
     */
    async getUserCompletedCampaignIds(userFid: number): Promise<string[]> {
        // Get all submissions for this user
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('campaign_id, task_id')
            .eq('user_fid', userFid);

        if (error || !submissions) {
            return [];
        }

        // Get campaigns to know total tasks per campaign
        const campaignIds = [...new Set(submissions.map((s: any) => s.campaign_id))];

        if (campaignIds.length === 0) return [];

        const { data: campaigns } = await supabase
            .from('campaigns')
            .select('id, tasks')
            .in('id', campaignIds);

        if (!campaigns) return [];

        // Check which campaigns have all tasks completed
        const completedIds: string[] = [];

        campaigns.forEach((campaign: any) => {
            const campaignSubs = submissions.filter((s: any) => s.campaign_id === campaign.id);
            const submittedTasks = new Set(campaignSubs.map((s: any) => s.task_id));

            // If submitted tasks count equals total tasks, campaign is completed
            if (campaign.tasks && submittedTasks.size >= campaign.tasks.length) {
                completedIds.push(campaign.id);
            }
        });

        return completedIds;
    },

    /**
     * Get top earners - users who joined the most campaigns
     */
    async getTopEarners(): Promise<{ rank: number, fid: number, address: string, value: number, campaigns: number, username?: string, pfpUrl?: string, displayName?: string }[]> {
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('user_fid, user_address, campaign_id');

        if (error || !submissions) {
            return [];
        }

        // Group by user and count unique campaigns
        const userStats: Record<number, { address: string, campaigns: Set<string> }> = {};

        submissions.forEach((sub: any) => {
            if (!userStats[sub.user_fid]) {
                userStats[sub.user_fid] = { address: sub.user_address || '', campaigns: new Set() };
            }
            userStats[sub.user_fid].campaigns.add(sub.campaign_id);
        });

        // Convert to array and sort by campaign count
        const leaderboard = Object.entries(userStats)
            .map(([fid, data]) => ({
                fid: parseInt(fid),
                address: data.address,
                campaigns: data.campaigns.size
            }))
            .sort((a, b) => b.campaigns - a.campaigns)
            .slice(0, 20);

        // Enrich with Neynar metadata
        const fids = leaderboard.map(item => item.fid);
        const userMap = await NeynarService.getUsersBulk(fids);

        return leaderboard.map((item, index) => ({
            rank: index + 1,
            fid: item.fid,
            address: item.address,
            value: item.campaigns,
            campaigns: item.campaigns,
            username: userMap[item.fid.toString()]?.username,
            pfpUrl: userMap[item.fid.toString()]?.pfpUrl,
            displayName: userMap[item.fid.toString()]?.displayName
        }));
    },

    /**
     * Get top spenders - creators who spent the most on campaigns
     */
    async getTopSpenders(): Promise<{ rank: number, fid: number, address: string, value: number, campaigns: number, username?: string, pfpUrl?: string, displayName?: string }[]> {
        const { data: campaigns, error } = await supabase
            .from('campaigns')
            .select('creator, total_budget');

        if (error || !campaigns) {
            return [];
        }

        // Group by creator and sum total budget
        const creatorStats: Record<string, { totalSpent: number, campaigns: number }> = {};

        campaigns.forEach((campaign: any) => {
            const creator = campaign.creator || 'unknown';
            if (!creatorStats[creator]) {
                creatorStats[creator] = { totalSpent: 0, campaigns: 0 };
            }
            creatorStats[creator].totalSpent += parseFloat(campaign.total_budget) || 0;
            creatorStats[creator].campaigns += 1;
        });

        // Convert to array and sort by total spent
        const leaderboard = Object.entries(creatorStats)
            .map(([address, data]) => ({
                address,
                totalSpent: data.totalSpent,
                campaigns: data.campaigns
            }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 20);

        // Enrich with Neynar metadata (by address)
        const addresses = leaderboard.map(item => item.address);
        const userMap = await NeynarService.getUsersBulk(addresses);

        return leaderboard.map((item, index) => {
            const userData = userMap[item.address.toLowerCase()];
            return {
                rank: index + 1,
                fid: 0, // We don't have FID easily here without a join, but Neynar might provide it if we joined earlier
                address: item.address,
                value: item.totalSpent,
                campaigns: item.campaigns,
                username: userData?.username,
                pfpUrl: userData?.pfpUrl,
                displayName: userData?.displayName
            };
        });
    },

    /**
     * Finalize a campaign: update status, merkle root, and total weight
     */
    async finalizeCampaign(campaignId: string, merkleRoot: string, totalWeight: number) {
        const { data, error } = await supabase
            .from('campaigns')
            .update({
                status: 'claimable',
                merkle_root: merkleRoot,
                total_weight: totalWeight,
                ended_at: new Date().toISOString()
            })
            .eq('id', campaignId)
            .select()
            .single();

        if (error) {
            console.error('Error finalizing campaign:', error);
            throw new Error('Failed to finalize campaign');
        }

        return { success: true, campaign: data };
    },

    /**
     * Cleanup old campaigns (from Bug #3)
     * Removes all campaigns not created today
     */
    async cleanupOldCampaigns() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { error } = await supabase
            .from('campaigns')
            .delete()
            .lt('created_at', today.toISOString());

        if (error) {
            console.error('Error cleaning up campaigns:', error);
            throw error;
        }

        return { success: true };
    }
};

