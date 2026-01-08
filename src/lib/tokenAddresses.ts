// Base Mainnet Token Addresses
export const TOKEN_ADDRESSES = {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
} as const;

export function getTokenAddress(symbol: 'USDC' | 'USDT'): string {
    return TOKEN_ADDRESSES[symbol];
}
