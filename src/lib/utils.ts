/**
 * Utility helper functions for Post Up
 */

/**
 * Truncate wallet address for display
 * @example truncateAddress("0x1234...") => "0x1234...5678"
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
    if (!address) return '';
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format number with locale-aware thousands separator
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
}

/**
 * Format currency with $ symbol
 */
export function formatCurrency(amount: number, decimals = 2): string {
    return `$${amount.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

/**
 * Delay execution for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Generate random ID for temporary use
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

/**
 * Clamp number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}
