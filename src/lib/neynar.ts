import { UserStats } from './types';

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || 'NEYNAR_API_DOCS'; // Fallback for dev if not set

export const NeynarService = {
    getUserStats: async (identifier: number | string): Promise<UserStats> => {
        try {
            const param = typeof identifier === 'number' ? `fids=${identifier}` : `addresses=${identifier}`;
            const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?${param}`, {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            });

            if (!response.ok) throw new Error('Failed to fetch user data');

            const data = await response.json();
            // Data structure: { users: [...] }
            const user = data.users?.[0]; // Optional chaining safety

            if (!user) throw new Error('User not found');

            return {
                totalEarnedUSD: 0,
                totalTasks: 0,
                rank: 0,
                followers: user.follower_count || 0,
                neynarScore: Math.round((user.active_status === 'active' ? 100 : 50)),
                history: []
            };
        } catch (error) {
            console.error('Neynar API Error:', error);
            // Return empty stats on failure
            return {
                totalEarnedUSD: 0,
                totalTasks: 0,
                rank: 0,
                followers: 0,
                neynarScore: 0,
                history: []
            };
        }
    }
};
