/**
 * Farcaster Hub Client - Free verification using Farcaster protocol
 * No API keys needed, no limits!
 */

const HUB_URL = 'https://hub.pinata.cloud';

interface HubResponse {
    messages?: any[];
    error?: string;
}

/**
 * Get user's following list from hub
 */
export async function getFollowing(fid: number): Promise<number[]> {
    try {
        const response = await fetch(`${HUB_URL}/v1/linksByFid?fid=${fid}&link_type=follow`);

        if (!response.ok) {
            console.error('Hub API error:', response.status);
            return [];
        }

        const data = await response.json();
        const messages = data.messages || [];

        // Extract target FIDs from links
        const followingFids = messages
            .map((msg: any) => msg.data?.linkBody?.targetFid)
            .filter((fid: any) => fid !== undefined);

        return followingFids;
    } catch (error) {
        console.error('Error fetching following from hub:', error);
        return [];
    }
}

/**
 * Get cast reactions (likes/recasts) from hub
 */
export async function getCastReactions(castHash: string, reactionType: 'like' | 'recast'): Promise<number[]> {
    try {
        const type = reactionType === 'like' ? 1 : 2; // 1 = like, 2 = recast
        const response = await fetch(`${HUB_URL}/v1/reactionsByCast?target_cast_id=${castHash}&reaction_type=${type}`);

        if (!response.ok) {
            console.error('Hub API error:', response.status);
            return [];
        }

        const data = await response.json();
        const messages = data.messages || [];

        // Extract FIDs who reacted
        const reactorFids = messages
            .map((msg: any) => msg.data?.fid)
            .filter((fid: any) => fid !== undefined);

        return reactorFids;
    } catch (error) {
        console.error('Error fetching reactions from hub:', error);
        return [];
    }
}

/**
 * Check if user follows target
 */
export async function checkUserFollows(userFid: number, targetFid: number): Promise<boolean> {
    try {
        const following = await getFollowing(userFid);
        return following.includes(targetFid);
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
        const reactors = await getCastReactions(castHash, reactionType);
        return reactors.includes(userFid);
    } catch (error) {
        console.error('Error checking reaction:', error);
        return false;
    }
}
