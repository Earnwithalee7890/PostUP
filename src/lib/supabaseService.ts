import { supabase } from './supabase';
import { Campaign } from './types';

export const SupabaseService = {
    async getCampaigns(): Promise<Campaign[]> {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }

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
            totalWeight: row.total_weight ? parseFloat(row.total_weight) : undefined,
            createdAt: new Date(row.created_at).getTime(),
            endedAt: row.ended_at ? new Date(row.ended_at).getTime() : undefined,
            participants: []
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

    async completeTask(campaignId: string, taskType: any) {
        // TODO: Get user FID from authenticated session
        // For now, this is a placeholder - you'll need to pass userFid from the frontend
        // based on the authenticated Farcaster user

        // Fetch campaign to get URLs
        const campaign = await this.getCampaign(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // IMPORTANT: In production, you need to:
        // 1. Get the authenticated user's FID from the session
        // 2. Import and call verifyTask from './verifyTask'
        // 3. Return the verification result

        // Example implementation:
        // import { verifyTask } from './verifyTask';
        // const result = await verifyTask(userFid, taskType, campaign.postUrl, campaign.castUrl);
        // if (!result.success) {
        //     throw new Error(result.error || 'Task verification failed');
        // }

        // For now, return success to unblock development
        // Replace this with actual verification once FID is available
        return { success: true };
    }
};
