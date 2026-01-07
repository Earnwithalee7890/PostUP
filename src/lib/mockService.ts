import { Campaign, Platform, TaskType, CampaignParticipant, UserStats } from './types';
import { MockNeynarService } from './mockNeynar';
import { calculateQualityScore } from './qualityScore';
import { calculateWeightedDistribution } from './distribution';
import { generateMerkleDistribution } from './merkle';

// Start with EMPTY data as requested
let campaigns: Campaign[] = [];
let claimedRewards = new Map<string, Set<string>>(); // campaignId -> Set of addresses

export const MockService = {
    getCampaigns: async (): Promise<Campaign[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...campaigns];
    },
    getCampaign: async (id: string): Promise<Campaign | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return campaigns.find(c => c.id === id);
    },

    createCampaign: async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'remainingBudget' | 'status' | 'participants'>) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newCampaign: Campaign = {
            ...campaignData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: Date.now(),
            remainingBudget: campaignData.netBudget,
            status: 'active',
            participants: [],
        };
        campaigns.unshift(newCampaign);
        return newCampaign;
    },

    /**
     * User joins a campaign by completing the task
     */
    joinCampaign: async (campaignId: string, userAddress: string, fid: number) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) throw new Error('Campaign not found');
        if (campaign.status !== 'active') throw new Error('Campaign not active');

        // Check if already joined
        if (campaign.participants.some(p => p.address === userAddress)) {
            throw new Error('Already participated');
        }

        // Fetch quality data
        const qualityData = await MockNeynarService.getUserQualityData(fid);
        const qualityScore = calculateQualityScore(qualityData);

        // Add participant
        const participant: CampaignParticipant = {
            address: userAddress,
            fid,
            qualityScore,
            joinedAt: Date.now(),
        };

        campaign.participants.push(participant);
        return { success: true, qualityScore };
    },

    /**
     * End campaign and calculate all rewards via merkle tree
     */
    endCampaign: async (campaignId: string) => {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) throw new Error('Campaign not found');
        if (campaign.status !== 'active') throw new Error('Campaign not active');

        // Calculate weighted distribution
        const distribution = calculateWeightedDistribution(
            campaign.participants.map(p => ({
                address: p.address,
                fid: p.fid,
                qualityScore: p.qualityScore,
            })),
            campaign.totalBudget,
            0.18
        );

        // Generate merkle tree
        const merkleData = generateMerkleDistribution(distribution.claims);

        // Update campaign
        campaign.status = 'claimable';
        campaign.endedAt = Date.now();
        campaign.merkleRoot = merkleData.root;
        campaign.totalWeight = distribution.totalWeight;

        // Update participants with rewards and proofs
        campaign.participants = campaign.participants.map((p, index) => ({
            ...p,
            reward: merkleData.claims[index].amount,
            claimed: false,
            proof: merkleData.claims[index].proof,
        }));

        // Initialize claim tracking
        claimedRewards.set(campaignId, new Set());

        return {
            merkleRoot: merkleData.root,
            distribution,
        };
    },

    /**
     * Claim reward for a user
     */
    claimReward: async (campaignId: string, userAddress: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) throw new Error('Campaign not found');
        if (campaign.status !== 'claimable') throw new Error('Campaign not claimable');

        const participant = campaign.participants.find(p => p.address === userAddress);
        if (!participant) throw new Error('Not a participant');
        if (participant.claimed) throw new Error('Already claimed');

        // Mark as claimed
        participant.claimed = true;
        claimedRewards.get(campaignId)?.add(userAddress);

        return {
            success: true,
            amount: participant.reward,
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
        };
    },

    /**
     * Get claimable amount for a user
     */
    getClaimable: async (campaignId: string, userAddress: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return null;

        const participant = campaign.participants.find(p => p.address === userAddress);
        if (!participant || participant.claimed) return null;

        return {
            amount: participant.reward || 0,
            qualityScore: participant.qualityScore,
            proof: participant.proof,
        };
    },
    /**
     * Get user stats (updated for quality system)
     */
    getUserStats: async (address: string): Promise<UserStats> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Calculate from actual participation
        const userCampaigns = campaigns.filter(c =>
            c.participants.some(p => p.address === address)
        );

        const totalEarned = userCampaigns.reduce((sum, c) => {
            const participant = c.participants.find(p => p.address === address);
            return sum + (participant?.reward && participant?.claimed ? participant.reward : 0);
        }, 0);

        const completedTasks = userCampaigns.filter(c =>
            c.participants.find(p => p.address === address)?.claimed
        ).length;

        return {
            totalEarnedUSD: totalEarned,
            totalTasks: completedTasks,
            rank: 0,
            followers: 0,
            neynarScore: 0,
            history: []
        };
    },

    getLeaderboard: async (type: 'earners' | 'creators'): Promise<{ rank: number, address: string, fid: number, value: number }[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [];
    },

    /**
     * Simulate campaign with realistic participants
     */
    async simulateCampaign(campaignId: string, participantCount: number = 150) {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) throw new Error('Campaign not found');

        // Generate mock participants
        const mockUsers = await MockNeynarService.generateMockUsers(participantCount);

        for (const user of mockUsers) {
            const qualityScore = calculateQualityScore(user);
            campaign.participants.push({
                address: `0x${Math.random().toString(16).substr(2, 40)}`,
                fid: user.fid,
                qualityScore,
                joinedAt: Date.now() - Math.random() * 86400000, // Random time in last 24h
            });
        }

        return campaign;
    },
};
