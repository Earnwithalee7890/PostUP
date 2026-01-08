import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, optimismSepolia, arbitrumSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Post Up',
  projectId: 'YOUR_PROJECT_ID', // TODO: User needs to provide this
  chains: [baseSepolia, optimismSepolia, arbitrumSepolia],
  ssr: false,
});

export const DISTRIBUTOR_ADDRESS = '0xE7B16C2E34Fc3a347e3243FBEb3518830AfE647b';
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

