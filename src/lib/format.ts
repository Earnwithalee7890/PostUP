// Formatting utilities

/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format a number with commas
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a number into a shorter version (e.g., 1.2k, 1M)
 */
export const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    }).format(num);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

/**
 * Format an FID or address to a shorter version
 */
export const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
