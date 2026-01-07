export interface FarcasterQualityData {
    fid: number;
    accountAge: number; // days
    followerCount: number;
    isVerified: boolean;
    hasEthActivity: boolean;
    completedTasks: number;
    hasSpamFlags: boolean;
}

export interface QualityScore {
    score: number; // 1.0 to 3.0
    tier: 'low' | 'mid' | 'high';
    breakdown: {
        base: number;
        ageBonus: number;
        followerBonus: number;
        verifiedBonus: number;
        ethActivityBonus: number;
        taskHistoryBonus: number;
        spamFreeBonus: number;
    };
}

/**
 * Calculate Farcaster quality score based on multiple signals
 * Score range: 1.0 (base) to 3.0 (cap)
 */
export function calculateQualityScore(data: FarcasterQualityData): QualityScore {
    const breakdown = {
        base: 1.0,
        ageBonus: 0,
        followerBonus: 0,
        verifiedBonus: 0,
        ethActivityBonus: 0,
        taskHistoryBonus: 0,
        spamFreeBonus: 0,
    };

    // Age Bonus (non-stacking)
    const ageDays = data.accountAge;
    if (ageDays >= 365) {
        breakdown.ageBonus = 0.5;
    } else if (ageDays >= 90) {
        breakdown.ageBonus = 0.3;
    }

    // Follower Bonus (non-stacking)
    if (data.followerCount >= 1000) {
        breakdown.followerBonus = 0.6;
    } else if (data.followerCount >= 100) {
        breakdown.followerBonus = 0.3;
    }

    // Verified Bonus
    if (data.isVerified) {
        breakdown.verifiedBonus = 0.3;
    }

    // ETH Activity Bonus
    if (data.hasEthActivity) {
        breakdown.ethActivityBonus = 0.3;
    }

    // Task History Bonus
    if (data.completedTasks > 0) {
        breakdown.taskHistoryBonus = 0.5;
    }

    // Spam-Free Bonus
    if (!data.hasSpamFlags) {
        breakdown.spamFreeBonus = 0.2;
    }

    // Calculate total score
    const rawScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    // Apply cap
    const score = Math.min(rawScore, 3.0);

    // Determine tier
    let tier: 'low' | 'mid' | 'high';
    if (score >= 2.0) {
        tier = 'high';
    } else if (score >= 1.5) {
        tier = 'mid';
    } else {
        tier = 'low';
    }

    return {
        score,
        tier,
        breakdown,
    };
}

/**
 * Get tier label for display
 */
export function getTierLabel(tier: 'low' | 'mid' | 'high'): string {
    const labels = {
        low: 'Standard',
        mid: 'Trusted',
        high: 'Verified',
    };
    return labels[tier];
}

/**
 * Get tier color
 */
export function getTierColor(tier: 'low' | 'mid' | 'high'): string {
    const colors = {
        low: '#9ca3af',
        mid: '#60a5fa',
        high: '#a78bfa',
    };
    return colors[tier];
}
