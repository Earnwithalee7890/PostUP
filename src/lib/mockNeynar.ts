import { FarcasterQualityData } from './qualityScore';

/**
 * Mock Neynar service - simulates fetching Farcaster user data
 * In production, this would call the real Neynar API
 */
export const MockNeynarService = {
    /**
     * Fetch quality data for a user by FID
     */
    async getUserQualityData(fid: number): Promise<FarcasterQualityData> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Generate realistic mock data based on FID
        const random = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const ageDays = Math.floor(random(fid) * 730) + 30; // 30 days to 2 years
        const followerCount = Math.floor(random(fid * 2) * 5000);
        const isVerified = random(fid * 3) > 0.7;
        const hasEthActivity = random(fid * 4) > 0.4;
        const completedTasks = Math.floor(random(fid * 5) * 20);
        const hasSpamFlags = random(fid * 6) > 0.9; // 10% spam rate

        return {
            fid,
            accountAge: ageDays,
            followerCount,
            isVerified,
            hasEthActivity,
            completedTasks,
            hasSpamFlags,
        };
    },

    /**
     * Generate a batch of mock users with realistic distribution
     */
    async generateMockUsers(count: number): Promise<FarcasterQualityData[]> {
        const users: FarcasterQualityData[] = [];

        // Realistic distribution for Farcaster
        // ~47% low, ~33% mid, ~20% high quality

        for (let i = 0; i < count; i++) {
            const tier = Math.random();
            let data: FarcasterQualityData;

            if (tier < 0.47) {
                // Low tier user
                data = {
                    fid: 10000 + i,
                    accountAge: Math.floor(Math.random() * 90), // < 3 months
                    followerCount: Math.floor(Math.random() * 100), // < 100
                    isVerified: false,
                    hasEthActivity: false,
                    completedTasks: 0,
                    hasSpamFlags: Math.random() > 0.8,
                };
            } else if (tier < 0.80) {
                // Mid tier user
                data = {
                    fid: 10000 + i,
                    accountAge: 90 + Math.floor(Math.random() * 275), // 3mo - 1yr
                    followerCount: 100 + Math.floor(Math.random() * 900), // 100-1k
                    isVerified: Math.random() > 0.7,
                    hasEthActivity: Math.random() > 0.4,
                    completedTasks: Math.floor(Math.random() * 5),
                    hasSpamFlags: false,
                };
            } else {
                // High tier user
                data = {
                    fid: 10000 + i,
                    accountAge: 365 + Math.floor(Math.random() * 365), // 1-2 years
                    followerCount: 1000 + Math.floor(Math.random() * 10000), // 1k+
                    isVerified: Math.random() > 0.3,
                    hasEthActivity: Math.random() > 0.2,
                    completedTasks: 5 + Math.floor(Math.random() * 15),
                    hasSpamFlags: false,
                };
            }

            users.push(data);
        }

        return users;
    },
};
