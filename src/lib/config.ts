import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
  chains: [base],
  connectors: [
    farcasterFrame(), // Farcaster wallet (priority for Farcaster users)
    injected(), // Metamask, OKX, Bitget, Trust Wallet, etc.
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
      metadata: {
        name: 'Post Up',
        description: 'Task-based onchain growth engine',
        url: 'https://postup.app',
        icons: ['https://postup.app/icon.png']
      },
      showQrModal: false, // No QR on mobile
    }),
    coinbaseWallet({
      appName: 'Post Up',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true, // Important for Next.js
});

export const DISTRIBUTOR_ADDRESS = '0x310a9F6f4ed24f390A2ef7552b6F0b2Dd914C342'; // Base Mainnet V2 (USDC Support)
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base Mainnet USDC
// export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC (Commented out)

