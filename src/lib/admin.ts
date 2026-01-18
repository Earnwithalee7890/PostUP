export const ADMIN_WALLETS = [
    '0xcf74bbbddbb7ed5129a715f20d1cc34fe1124fe4',
    '0x6d52E77cEDB5614bB68574799D78635Ea1aa4381',
    '0x2aEad657c4acc9C5D1cD63d4131f55f4D3e3910A',
].map(addr => addr.toLowerCase());

export const ADMIN_FIDS = [
    338060,
    243721,
    520364,
];

export function isAdmin(address?: string, fid?: number): boolean {
    if (address && ADMIN_WALLETS.includes(address.toLowerCase())) return true;
    if (fid && ADMIN_FIDS.includes(fid)) return true;
    return false;
}
