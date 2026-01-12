export const ADMIN_WALLETS = [
    '0x123...456', // Replace with your actual wallet address
    // Add more admin addresses here
].map(addr => addr.toLowerCase());

export const ADMIN_FIDS = [
    // Add your FID here
    1234, // PlaceHolder
];

export function isAdmin(address?: string, fid?: number): boolean {
    if (address && ADMIN_WALLETS.includes(address.toLowerCase())) return true;
    if (fid && ADMIN_FIDS.includes(fid)) return true;
    return false;
}
