import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Post Up',
  projectId: 'YOUR_PROJECT_ID',
  chains: [base],
  ssr: false,
});

export const DISTRIBUTOR_ADDRESS = '0x44b4E134f228404eA5013467484182f6fb90fa8D'; // Base Mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base Mainnet USDC
// export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC (Commented out)

