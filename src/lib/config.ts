import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, optimism, arbitrum, mainnet, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Post Up',
  projectId: 'YOUR_PROJECT_ID', // TODO: User needs to provide this or use a public one for dev
  chains: [base, baseSepolia, optimism, arbitrum, mainnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
