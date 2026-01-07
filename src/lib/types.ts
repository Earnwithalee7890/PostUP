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
    platformFee: number; // 18%
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
    { symbol: 'ETH', label: 'ETH (Ethereum)', chain: 'Ethereum' },
    { symbol: 'USDC', label: 'USDC (Ethereum)', chain: 'Ethereum' },
    { symbol: 'ETH_BASE', label: 'ETH (Base)', chain: 'Base' },
    { symbol: 'DEGEN', label: 'DEGEN (Base)', chain: 'Base' },
    { symbol: 'OP', label: 'OP (Optimism)', chain: 'Optimism' },
    { symbol: 'OP_USDC', label: 'USDC (Optimism)', chain: 'Optimism' },
];
