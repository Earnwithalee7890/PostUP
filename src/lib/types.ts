import { QualityScore } from './qualityScore';

export type Platform = 'X' | 'Farcaster' | 'Base';
export type TaskType = 'Like' | 'Repost' | 'Comment' | 'Follow' | 'Quote' | 'Cast' | 'JoinChannel' | 'OpenMiniApp';
export type CampaignCategory = 'Follow' | 'Channel' | 'Boost' | 'Multi' | 'MiniApp';
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'claimable';

export interface CampaignParticipant {
    address: string;
    fid: number;
    qualityScore: QualityScore;
    joinedAt: number;
    reward?: number; // Calculated when campaign ends
    claimed?: boolean;
    proof?: string[]; // Merkle proof
}

export interface Campaign {
    id: string;
    creator: string;
    platform: Platform;
    category: CampaignCategory;
    postUrl: string;
    castUrl?: string;
    tasks: TaskType[];
    rewardToken: 'ETH' | 'USDC' | 'DEGEN' | 'OP' | 'ETH_BASE' | 'OP_USDC';

    // Financials
    totalBudget: number;
    platformFee: number; // 15%
    netBudget: number;   // 82%
    remainingBudget: number;
    rewardAmountPerTask: number;

    // Requirements
    minFollowers: number;
    requirePro: boolean;

    // Participants & Distribution
    participants: CampaignParticipant[];
    merkleRoot?: string; // Set when campaign ends
    totalWeight?: number; // Sum of all quality scores

    createdAt: number;
    endedAt?: number;
    status: CampaignStatus;
}

export const SUPPORTED_TOKENS = [
    { symbol: 'USDC', label: 'USDC (Base)', chain: 'Base' },
    { symbol: 'USDT', label: 'USDT (Base)', chain: 'Base' },
    { symbol: 'USDC', label: 'USDC (Optimism)', chain: 'Optimism' },
    { symbol: 'USDT', label: 'USDT (Optimism)', chain: 'Optimism' },
    { symbol: 'USDC', label: 'USDC (Arbitrum)', chain: 'Arbitrum' },
    { symbol: 'USDT', label: 'USDT (Arbitrum)', chain: 'Arbitrum' },
];

export interface TaskHistoryItem {
    task: string;
    platform: string;
    date: number;
    reward: number;
}

export interface UserStats {
    totalEarnedUSD: number;
    totalTasks: number;
    rank: number;
    isPro: boolean; // Added to track Farcaster Pro/Power Badge status
    followers: number;
    neynarScore: number;
    verifications: string[]; // Added for auto-wallet detection
    history: TaskHistoryItem[];
}
