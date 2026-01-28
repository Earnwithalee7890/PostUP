import { Campaign, CampaignParticipant, UserStats } from './types';
import { MockNeynarService } from './mockNeynar';
import { calculateQualityScore } from './qualityScore';
import { calculateWeightedDistribution } from './distribution';
import { generateMerkleDistribution } from './merkle';

// MockService - stores campaign data
// Campaigns array starts empty - only real user-created campaigns will appear
let campaigns: Campaign[] = [];
let claimedRewards = new Map<string, Set<string>>();

// Helper to persist to localStorage
const saveToStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('tip2post_campaigns', JSON.stringify(campaigns));
        localStorage.setItem('tip2post_claims', JSON.stringify(Array.from(claimedRewards.entries()).map(([k, v]) => [k, Array.from(v)])));
    }
};

// Helper to load from localStorage
const loadFromStorage = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('tip2post_campaigns');
        if (stored) {
            campaigns = JSON.parse(stored);
        }

        const storedClaims = localStorage.getItem('tip2post_claims');
        if (storedClaims) {
            const parsed = JSON.parse(storedClaims);
            claimedRewards = new Map(parsed.map(([k, v]: [string, string[]]) => [k, new Set(v)]));
        }
    }
};

// Load immediately
loadFromStorage();

export const MockService = {
    async getCampaigns(): Promise<Campaign[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        loadFromStorage(); // Ensure fresh
        return [...campaigns];
    },
    ensureCampaign: (campaign: Campaign) => {
        loadFromStorage();
        if (!campaigns.find(c => c.id === campaign.id)) {
            campaigns.push(campaign);
            saveToStorage();
        }
    },
    getCampaign: async (id: string): Promise<Campaign | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        loadFromStorage();
        return campaigns.find(c => c.id === id);
    },

    createCampaign: async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'remainingBudget' | 'status' | 'participants'>) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newCampaign: Campaign = {
            ...campaignData,
            id: (campaigns.length + 101).toString(),
            onchainId: campaigns.length + 101,
            createdAt: Date.now(),
            remainingBudget: campaignData.netBudget,
            status: 'active',
            participants: [],
        };
        campaigns.unshift(newCampaign);
        saveToStorage();
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
        saveToStorage();
        return { success: true, qualityScore };
    },

    /**
     * Complete a specific task for a campaign
     */
    completeTask: async (_campaignId: string, _taskType: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // For now, just return success. In a real app, this would verify the specific task action.
        return { success: true };
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
        saveToStorage();

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
        saveToStorage();

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
            totalTasks: completedTasks,
            totalEarned: totalEarned,
            verifications: address ? [address] : [],
            username: 'mockuser',
            displayName: 'Mock User',
            followers: 0,
            neynarScore: 0,
            history: []
        };
    },

    getLeaderboard: async (_type: 'earners' | 'creators'): Promise<{ rank: number, address: string, fid: number, value: number }[]> => {
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
    submitScreenshot: async (campaignId: string, taskId: string, screenshot: string, userFid: number, address: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) throw new Error('Campaign not found');

        let participant = campaign.participants.find(p => p.fid === userFid);

        if (!participant) {
            participant = {
                address: address,
                fid: userFid,
                joinedAt: Date.now(),
                qualityScore: { total: 100, details: [] } as any,
                screenshots: {},
            };
            campaign.participants.push(participant);
        }

        if (!participant.screenshots) participant.screenshots = {};
        participant.screenshots[taskId] = screenshot;

        saveToStorage();
        return true;
    },

    getParticipants: async (campaignId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        loadFromStorage();
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return [];
        return campaign.participants;
    },
    verifyScreenshot: async (campaignId: string, userFid: number, taskId: string, status: 'approved' | 'rejected') => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) throw new Error('Campaign not found');
        const participant = campaign.participants.find(p => p.fid === userFid);
        if (!participant) throw new Error('Participant not found');

        if (!participant.screenshotStatus) participant.screenshotStatus = {};
        participant.screenshotStatus[taskId] = status;
        saveToStorage();
        return true;
    },
};
