import { TaskType } from './types';

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || 'NEYNAR_API_DOCS';

interface VerificationResult {
    success: boolean;
    error?: string;
}

/**
 * Extract FID from Farcaster profile URL or cast URL
 * Supports formats:
 * - https://warpcast.com/username
 * - https://warpcast.com/~/profiles/12345
 * - https://warpcast.com/username/0xcasthash (extracts author FID from cast)
 * - https://farcaster.xyz/username (profile)
 * - https://farcaster.xyz/username/0xcasthash (cast)
 * - https://farcaster.xyz/miniapps/... (mini app)
 */
async function extractFidFromUrl(profileUrl: string): Promise<number | null> {
    try {
        // Check if it's just a number (direct FID input)
        const trimmed = profileUrl.trim();
        if (/^\d+$/.test(trimmed)) {
            const fid = parseInt(trimmed);
            console.log('✅ Direct FID number detected:', fid);
            return fid;
        }

        // Check if URL contains direct FID
        const fidMatch = profileUrl.match(/profiles\/(\d+)/);
        if (fidMatch) {
            return parseInt(fidMatch[1]);
        }

        // Check if it's a cast URL (contains 0x hash)
        const castHashMatch = profileUrl.match(/0x[a-fA-F0-9]+/);
        if (castHashMatch) {
            // It's a cast URL, fetch the cast and get author FID
            const castHash = castHashMatch[0];
            const response = await fetch(
                `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`,
                {
                    headers: {
                        'accept': 'application/json',
                        'api_key': NEYNAR_API_KEY
                    }
                }
            );

            if (!response.ok) return null;

            const data = await response.json();
            return data.cast?.author?.fid || null;
        }

        // Extract username from warpcast.com or farcaster.xyz URL
        let usernameMatch = profileUrl.match(/warpcast\.com\/([^\/\?]+)/);
        if (!usernameMatch) {
            usernameMatch = profileUrl.match(/farcaster\.xyz\/([^\/\?]+)/);
        }

        if (!usernameMatch) return null;

        const username = usernameMatch[1];

        // Skip special paths
        if (username === '~' || username === 'profile' || username === 'miniapps') return null;

        // Look up user by username
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/user/by_username?username=${username}`,
            {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.result?.user?.fid || null;
    } catch (error) {
        console.error('Error extracting FID:', error);
        return null;
    }
}

/**
 * Extract cast hash from Warpcast URL
 * Format: https://warpcast.com/username/0x123abc...
 */
function extractCastHash(castUrl: string): string | null {
    const match = castUrl.match(/0x[a-fA-F0-9]+/);
    return match ? match[0] : null;
}

/**
 * Verify if user follows a specific profile
 */
async function verifyFollow(userFid: number, targetProfileUrl: string): Promise<VerificationResult> {
    try {
        console.log('=== VERIFY FOLLOW ===');
        console.log('User FID:', userFid);
        console.log('Target Profile URL:', targetProfileUrl);

        const targetFid = await extractFidFromUrl(targetProfileUrl);
        if (!targetFid) {
            return {
                success: false,
                error: `Invalid target profile URL: "${targetProfileUrl}". Please check the URL format (should be farcaster.xyz/username or warpcast.com/username)`
            };
        }

        console.log('Target FID extracted:', targetFid);

        // Use FREE Hub API instead of Neynar
        const { checkUserFollows } = await import('./hubClient');
        console.log('Using FREE Farcaster Hub for verification...');
        const isFollowing = await checkUserFollows(userFid, targetFid);

        console.log('Is following?', isFollowing);

        return {
            success: isFollowing,
            error: isFollowing ? undefined : 'You must follow this profile to complete the task'
        };
    } catch (error) {
        console.error('Follow verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Verify if user liked a specific cast
 */
async function verifyLike(userFid: number, castUrl: string): Promise<VerificationResult> {
    try {
        console.log('=== VERIFY LIKE ===');
        console.log('User FID:', userFid);
        console.log('Cast URL:', castUrl);

        if (!castUrl || castUrl.trim() === '') {
            console.error('Cast URL is empty or missing');
            return { success: false, error: 'Cast URL is required for Like verification. Please add a cast URL when creating the campaign.' };
        }

        const castHash = extractCastHash(castUrl);
        console.log('Extracted cast hash:', castHash);

        if (!castHash) {
            return { success: false, error: `Invalid cast URL: "${castUrl}". Cast URL should contain a hash like 0x123abc...` };
        }

        // Use FREE Hub API
        const { checkUserReaction } = await import('./hubClient');
        console.log('Using FREE Farcaster Hub for like verification...');
        const hasLiked = await checkUserReaction(userFid, castHash, 'like');
        console.log('User has liked?', hasLiked);

        return {
            success: hasLiked,
            error: hasLiked ? undefined : 'You must like this cast to complete the task'
        };
    } catch (error) {
        console.error('Like verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Verify if user recasted a specific cast
 */
async function verifyRecast(userFid: number, castUrl: string): Promise<VerificationResult> {
    try {
        console.log('=== VERIFY RECAST ===');
        console.log('User FID:', userFid);
        console.log('Cast URL:', castUrl);

        if (!castUrl || castUrl.trim() === '') {
            console.error('Cast URL is empty or missing');
            return { success: false, error: 'Cast URL is required for Recast verification. Please add a cast URL when creating the campaign.' };
        }

        const castHash = extractCastHash(castUrl);
        console.log('Extracted cast hash:', castHash);

        if (!castHash) {
            return { success: false, error: `Invalid cast URL: "${castUrl}". Cast URL should contain a hash like 0x123abc...` };
        }

        // Use FREE Hub API
        const { checkUserReaction } = await import('./hubClient');
        console.log('Using FREE Farcaster Hub for recast verification...');
        const hasRecasted = await checkUserReaction(userFid, castHash, 'recast');
        console.log('User has recasted?', hasRecasted);

        return {
            success: hasRecasted,
            error: hasRecasted ? undefined : 'You must recast this cast to complete the task'
        };
    } catch (error) {
        console.error('Recast verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Verify if user replied to a specific cast
 */
async function verifyComment(userFid: number, castUrl: string): Promise<VerificationResult> {
    try {
        const castHash = extractCastHash(castUrl);
        if (!castHash) {
            return { success: false, error: 'Invalid cast URL' };
        }

        // Get cast conversation/replies
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${castHash}&type=hash&reply_depth=1&limit=100`,
            {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            }
        );

        if (!response.ok) {
            return { success: false, error: 'Failed to verify comment' };
        }

        const data = await response.json();
        const replies = data.conversation?.cast?.direct_replies || [];
        const hasReplied = replies.some((reply: any) => reply.author?.fid === userFid);

        return {
            success: hasReplied,
            error: hasReplied ? undefined : 'You must reply to this cast to complete the task'
        };
    } catch (error) {
        console.error('Comment verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Main verification function that routes to specific verification logic based on task type.
 * 
 * @param userFid - The Farcaster ID of the user performing the task
 * @param taskType - The type of task to verify (e.g., 'Follow', 'Like', 'Repost')
 * @param profileUrl - The URL of the target profile (required for 'Follow' tasks)
 * @param castUrl - The URL of the target cast (required for 'Like', 'Repost', 'Comment' tasks)
 * @returns A promise resolving to a VerificationResult object
 * 
 * @example
 * const result = await verifyTask(1234, 'Follow', 'https://warpcast.com/vitalik.eth');
 */
export async function verifyTask(
    userFid: number,
    taskType: TaskType,
    profileUrl: string,
    castUrl?: string
): Promise<VerificationResult> {
    switch (taskType) {
        case 'Follow':
            return verifyFollow(userFid, profileUrl);

        case 'Like':
            if (!castUrl) return { success: false, error: 'Cast URL required for Like task' };
            return verifyLike(userFid, castUrl);

        case 'Repost':
            if (!castUrl) return { success: false, error: 'Cast URL required for Recast task' };
            return verifyRecast(userFid, castUrl);

        case 'Comment':
            if (!castUrl) return { success: false, error: 'Cast URL required for Comment task' };
            return verifyComment(userFid, castUrl);

        // For other task types, return success (placeholder)
        default:
            return { success: true };
    }
}
