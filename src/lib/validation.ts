/**
 * Input validation utilities
 */

/**
 * Validate Ethereum address format
 */
export const isValidEthAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate Farcaster username
 */
export const isValidFarcasterUsername = (username: string): boolean => {
    if (!username) return false;
    const clean = username.startsWith('@') ? username.substring(1) : username;
    return /^[a-z0-9_-]{1,16}$/.test(clean);
};

/**
 * Validate number is positive
 */
export const isPositiveNumber = (val: any): boolean => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
};
