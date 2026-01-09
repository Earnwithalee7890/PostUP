/**
 * Farcaster Verification Client
 * Uses Neynar free tier for reactions (no premium needed)
 */

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '';

/**
 * Get user's following list using Neynar
 */
export async function getFollowing(fid: number): Promise<number[]> {
    try {
        console.log('Fetching following list for FID:', fid);
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`,
            {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            }
        );

        if (!response.ok) {
            console.error('Neynar API error (following):', response.status, await response.text());
            return [];
        }

        const data = await response.json();
        const followingFids = data.users?.map((u: any) => u.fid) || [];
        console.log('Found', followingFids.length, 'following');

        return followingFids;
    } catch (error) {
        console.error('Error fetching following:', error);
        return [];
    }
}

/**
 * Get cast reactions (likes/recasts) using Neynar FREE tier
 */
export async function getCastReactions(castHash: string, reactionType: 'like' | 'recast'): Promise<number[]> {
    try {
        const type = reactionType === 'like' ? 'likes' : 'recasts';
        console.log(`Fetching ${type} for cast:`, castHash);

        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/reactions/cast?hash=${castHash}&types=${type}&limit=100`,
            {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Neynar API error (${type}):`, response.status, errorText);
            return [];
        }

        const data = await response.json();
        const reactions = data.reactions || [];
        const reactorFids = reactions.map((r: any) => r.user?.fid).filter((fid: any) => fid !== undefined);

        console.log(`Found ${reactorFids.length} ${type} on cast`);
        console.log('Reactor FIDs:', reactorFids);

        return reactorFids;
    } catch (error) {
        console.error(`Error fetching ${reactionType}:`, error);
        return [];
    }
}

/**
 * Check if user follows target
 */
export async function checkUserFollows(userFid: number, targetFid: number): Promise<boolean> {
    try {
        console.log('Checking if FID', userFid, 'follows', targetFid);
        const following = await getFollowing(userFid);
        const isFollowing = following.includes(targetFid);
        console.log('Result:', isFollowing);
        return isFollowing;
    } catch (error) {
        console.error('Error checking follow:', error);
        return false;
    }
}

/**
 * Check if user liked/recasted a cast
 */
export async function checkUserReaction(userFid: number, castHash: string, reactionType: 'like' | 'recast'): Promise<boolean> {
    try {
        console.log(`Checking if FID ${userFid} ${reactionType}d cast ${castHash}`);
        const reactors = await getCastReactions(castHash, reactionType);
        const hasReacted = reactors.includes(userFid);
        console.log(`User has ${reactionType}d:`, hasReacted);
        return hasReacted;
    } catch (error) {
        console.error('Error checking reaction:', error);
        return false;
    }
}
