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
    // ... (skip lines 16-160)
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
