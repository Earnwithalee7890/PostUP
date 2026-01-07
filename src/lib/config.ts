import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, optimism, arbitrum, mainnet, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Post Up',
  projectId: 'YOUR_PROJECT_ID', // TODO: User needs to provide this or use a public one for dev
  chains: [base, baseSepolia, optimism, arbitrum, mainnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

export const DISTRIBUTOR_ADDRESS = '0xE7B16C2E34Fc3a347e3243FBEb3518830AfE647b';

