import { QualityScore } from './qualityScore';

export interface RewardClaim {
    userAddress: string;
    fid: number;
    amount: number;
    qualityScore: QualityScore;
    claimed: boolean;
}

export interface WeightedDistribution {
    totalWeight: number;
    netBudget: number; // After 18% fee
    claims: RewardClaim[];
}

/**
 * Calculate weighted reward distribution based on quality scores
 */
export function calculateWeightedDistribution(
    participants: Array<{ address: string; fid: number; qualityScore: QualityScore }>,
    totalBudget: number,
    platformFeeRate: number = 0.18
): WeightedDistribution {
    // Calculate net budget after platform fee
    const platformFee = totalBudget * platformFeeRate;
    const netBudget = totalBudget - platformFee;

    // Calculate total weight
    const totalWeight = participants.reduce((sum, p) => sum + p.qualityScore.score, 0);

    // Calculate individual rewards
    const claims: RewardClaim[] = participants.map(p => {
        const userWeight = p.qualityScore.score;
        const reward = netBudget * (userWeight / totalWeight);

        return {
            userAddress: p.address,
            fid: p.fid,
            amount: reward,
            qualityScore: p.qualityScore,
            claimed: false,
        };
    });

    return {
        totalWeight,
        netBudget,
        claims,
    };
}

/**
 * Get summary statistics for a distribution
 */
export function getDistributionStats(distribution: WeightedDistribution) {
    const { claims } = distribution;

    const lowTier = claims.filter(c => c.qualityScore.tier === 'low');
    const midTier = claims.filter(c => c.qualityScore.tier === 'mid');
    const highTier = claims.filter(c => c.qualityScore.tier === 'high');

    const avgReward = (tier: RewardClaim[]) =>
        tier.length > 0 ? tier.reduce((sum, c) => sum + c.amount, 0) / tier.length : 0;

    return {
        participants: claims.length,
        distribution: {
            low: {
                count: lowTier.length,
                avgReward: avgReward(lowTier),
                totalPaid: lowTier.reduce((sum, c) => sum + c.amount, 0),
            },
            mid: {
                count: midTier.length,
                avgReward: avgReward(midTier),
                totalPaid: midTier.reduce((sum, c) => sum + c.amount, 0),
            },
            high: {
                count: highTier.length,
                avgReward: avgReward(highTier),
                totalPaid: highTier.reduce((sum, c) => sum + c.amount, 0),
            },
        },
    };
}
