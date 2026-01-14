// Input validation utilities

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
    try {
        new URL(url);
        return true;
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
 * Validate Farcaster username (no @ symbol, alphanumeric)
 */
export const isValidFarcasterUsername = (username: string): boolean => {
    return /^[a-zA-Z0-9_]{1,16}$/.test(username);
};
