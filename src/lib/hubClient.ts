/**
 * Farcaster Protocol Verification using Hub SDK
 * Direct protocol access - NO API restrictions!
 */

import { getSSLHubRpcClient, Message } from '@farcaster/hub-nodejs';

// Public Farcaster Hub
const HUB_URL = 'nemes.farcaster.xyz:2283';

let hubClient: Awaited<ReturnType<typeof getSSLHubRpcClient>> | null = null;

async function getHubClient() {
    if (!hubClient) {
        hubClient = getSSLHubRpcClient(HUB_URL);
    }
    return hubClient;
}

/**
 * Get user's following list from Farcaster Hub
 */
export async function getFollowing(fid: number): Promise<number[]> {
    try {
        console.log('📡 Fetching following from Farcaster Hub for FID:', fid);
        const client = await getHubClient();

        const linksResult = await client.getLinksByFid({ fid });

        if (linksResult.isErr()) {
            console.error('Hub error fetching links:', linksResult.error);
            return [];
        }

        const followingFids = linksResult.value.messages
            .map((msg: Message) => {
                const link = msg.data?.linkBody;
                return link?.type === 'follow' ? link.targetFid : null;
            })
            .filter((fid): fid is number => fid !== null);

        console.log(`✅ Found ${followingFids.length} following`);
        return followingFids;
    } catch (error) {
        console.error('Error fetching following from hub:', error);
        return [];
    }
}

/**
 * Get cast reactions from Farcaster Hub
 */
export async function getCastReactions(castHash: string, reactionType: 'like' | 'recast'): Promise<number[]> {
    try {
        const type = reactionType === 'like' ? 1 : 2;
        console.log(`📡 Fetching ${reactionType}s from Farcaster Hub for cast:`, castHash);

        const client = await getHubClient();
        const hashBytes = Buffer.from(castHash.slice(2), 'hex'); // Remove 0x prefix

        const reactionsResult = await client.getReactionsByTarget({
            targetCastId: {
                hash: hashBytes,
                fid: 0 // Will be filled by hub
            }
        });

        if (reactionsResult.isErr()) {
            console.error(`Hub error fetching ${reactionType}s:`, reactionsResult.error);
            return [];
        }

        const reactorFids = reactionsResult.value.messages
            .filter((msg: Message) => msg.data?.reactionBody?.type === type)
            .map((msg: Message) => msg.data?.fid)
            .filter((fid): fid is number => fid !== undefined && fid !== null);

        console.log(`✅ Found ${reactorFids.length} ${reactionType}s`);
        console.log('Reactor FIDs:', reactorFids);
        return reactorFids;
    } catch (error) {
        console.error(`Error fetching ${reactionType}s:`, error);
        return [];
    }
}

/**
 * Check if user follows target
 */
export async function checkUserFollows(userFid: number, targetFid: number): Promise<boolean> {
    try {
        console.log(`🔍 Checking if FID ${userFid} follows FID ${targetFid}`);
        const following = await getFollowing(userFid);
        const isFollowing = following.includes(targetFid);
        console.log(`Result: ${isFollowing ? '✅ YES' : '❌ NO'}`);
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
        console.log(`🔍 Checking if FID ${userFid} ${reactionType}d cast ${castHash}`);
        const reactors = await getCastReactions(castHash, reactionType);
        const hasReacted = reactors.includes(userFid);
        console.log(`Result: ${hasReacted ? '✅ YES' : '❌ NO'}`);
        return hasReacted;
    } catch (error) {
        console.error('Error checking reaction:', error);
        return false;
    }
}
