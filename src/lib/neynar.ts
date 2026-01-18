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

            // Improved score logic: specific Score > Active Status > Default
            let calculatedScore = 50;
            if (user.experimental?.neynar_user_score) {
                calculatedScore = Math.round(user.experimental.neynar_user_score * 100);
            } else if (user.active_status === 'active') {
                calculatedScore = 85;
            }

            return {
                totalTasks: 0,
                totalEarned: 0,
                verifications: user.verified_addresses?.eth_addresses || [],
                username: user.username,
                displayName: user.display_name,
                pfpUrl: user.pfp_url,
                followers: user.follower_count || 0,
                following: user.following_count || 0,
                neynarScore: calculatedScore,
                isSpam: false,
                history: []
            };
        } catch (error) {
            console.error('Neynar API Error:', error);
            // Return empty stats on failure
            return {
                totalTasks: 0,
                totalEarned: 0,
                verifications: [],
                followers: 0,
                neynarScore: 0,
                history: []
            };
        }
    },

    getUsersBulk: async (identifiers: (number | string)[]): Promise<Record<string, { username: string, pfpUrl: string, displayName: string }>> => {
        if (identifiers.length === 0) return {};

        try {
            // Split into fids and addresses
            const fids = identifiers.filter(id => typeof id === 'number');
            const addresses = identifiers.filter(id => typeof id === 'string');

            let allUsers: any[] = [];

            if (fids.length > 0) {
                const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(',')}`, {
                    headers: { 'accept': 'application/json', 'api_key': NEYNAR_API_KEY }
                });
                if (response.ok) {
                    const data = await response.json();
                    allUsers = [...allUsers, ...(data.users || [])];
                }
            }

            if (addresses.length > 0) {
                const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?addresses=${addresses.join(',')}`, {
                    headers: { 'accept': 'application/json', 'api_key': NEYNAR_API_KEY }
                });
                if (response.ok) {
                    const data = await response.json();
                    allUsers = [...allUsers, ...(data.users || [])];
                }
            }

            const userMap: Record<string, { username: string, pfpUrl: string, displayName: string }> = {};
            allUsers.forEach(user => {
                if (user.fid) userMap[user.fid.toString()] = { username: user.username, pfpUrl: user.pfp_url, displayName: user.display_name };
                user.verified_addresses?.eth_addresses?.forEach((addr: string) => {
                    userMap[addr.toLowerCase()] = { username: user.username, pfpUrl: user.pfp_url, displayName: user.display_name };
                });
            });

            return userMap;
        } catch (error) {
            console.error('Neynar Bulk API Error:', error);
            return {};
        }
    }
};
