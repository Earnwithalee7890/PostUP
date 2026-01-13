export const ADMIN_WALLETS = [
    '0xcf74bbbddbb7ed5129a715f20d1cc34fe1124fe4',
].map(addr => addr.toLowerCase());

export const ADMIN_FIDS = [
    338060,
];

export function isAdmin(address?: string, fid?: number): boolean {
    if (address && ADMIN_WALLETS.includes(address.toLowerCase())) return true;
    if (fid && ADMIN_FIDS.includes(fid)) return true;
    return false;
}
