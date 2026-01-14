# Post Up 🚀

**Task-based onchain growth engine for Farcaster**

Earn rewards by engaging with campaigns, create promotional campaigns, and grow your onchain audience.

## Features

- 🎯 **Campaign Discovery** - Browse and complete tasks to earn rewards
- 💰 **Fair Distribution** - 90% to rewards, 10% platform fee
- 🔗 **Farcaster Native** - Built for the Farcaster ecosystem
- ⚡ **Base Network** - Fast and low-cost transactions
- 📊 **Leaderboard** - Compete with other users
- 👤 **Profile** - Track your earnings and task history

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Custom CSS with modern design system
- **Blockchain**: Base (Ethereum L2)
- **Wallet**: RainbowKit + wagmi
- **Auth**: Farcaster Mini App SDK

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `NEYNAR_API_KEY` - Neynar API key for verification
- `SUPABASE_*` - Supabase configuration

## Deployment

Deploy on Vercel for automatic CI/CD:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
