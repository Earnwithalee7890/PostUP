export const ADMIN_WALLETS = [
    '0x123...456', // Replace with your actual wallet address
    // Add more admin addresses here
].map(addr => addr.toLowerCase());

export function isAdmin(address?: string): boolean {
    if (!address) return false;
    return ADMIN_WALLETS.includes(address.toLowerCase());
}
