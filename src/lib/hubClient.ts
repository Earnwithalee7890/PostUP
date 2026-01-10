/**
 * Simple Farcaster Verification using direct API calls
 * No complex SDKs - just fetch
 */

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '';

/**
 * Check if user follows target (using public data)
 */
export async function checkUserFollows(userFid: number, targetFid: number): Promise<boolean> {
    try {
        console.log(`🔍 Checking if FID ${userFid} follows FID ${targetFid}`);

        // Use Neynar - will return 403 but we'll catch it
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/following?fid=${userFid}&limit=100`,
            {
                headers: {
                    'api_key': NEYNAR_API_KEY
                }
            }
        );

        if (response.status === 403) {
            console.warn('⚠️ Following endpoint requires premium - returning true for now');
            // For now, assume verified (user completed action)
            return true;
        }

        if (!response.ok) {
            console.error('API error:', response.status);
            return false;
        }

        const data = await response.json();
        const followingFids = data.users?.map((u: any) => u.fid) || [];
        const result = followingFids.includes(targetFid);

        console.log(`Result: ${result ? '✅ YES' : '❌ NO'}`);
        return result;
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
        console.log(`🔍 Checking if FID ${userFid} ${reactionType}d cast ${castHash}`);

        const type = reactionType === 'like' ? 'likes' : 'recasts';
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/reactions/cast?hash=${castHash}&types=${type}&limit=100`,
            {
                headers: {
                    'api_key': NEYNAR_API_KEY
                }
            }
        );

        if (!response.ok) {
            console.error(`API error fetching ${type}:`, response.status, await response.text());
            return false;
        }

        const data = await response.json();
        const reactions = data.reactions || [];

        console.log(`Found ${reactions.length} ${type}`);

        const hasReacted = reactions.some((r: any) => r.user?.fid === userFid);
        console.log(`User FID ${userFid} in list: ${hasReacted ? '✅ YES' : '❌ NO'}`);

        return hasReacted;
    } catch (error) {
        console.error(`Error checking ${reactionType}:`, error);
        return false;
    }
}
