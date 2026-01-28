/**
 * Formats a number as a currency string.
 * @param amount - The amount to format.
 * @param currency - The currency symbol (default: '$').
 * @param decimals - Number of decimal places (default: 0).
 */
export const formatCurrency = (amount: number, currency = '$', decimals = 0): string => {
    return `${currency}${amount.toFixed(decimals)}`;
};

/**
 * Formats an address to a shortened string.
 * @param address - The full address.
 * @param chars - Number of characters to show at start/end (default: 4).
 */
export const formatAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};
