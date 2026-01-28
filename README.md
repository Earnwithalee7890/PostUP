# Post Up 🚀

<div align="center">

![Post Up Banner](https://img.shields.io/badge/Post%20Up-Farcaster%20Growth%20Engine-8b5cf6?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA)

**The Task-Based Onchain Growth Engine for Farcaster**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![Farcaster](https://img.shields.io/badge/Farcaster-Mini%20App-purple)](https://warpcast.com/)

[🌐 Live Demo](https://post-up-zeta.vercel.app) • [📖 Documentation](#features) • [🚀 Getting Started](#getting-started) • [![Build Status](https://img.shields.io/github/actions/workflow/status/Earnwithalee7890/PostUP/ci.yml?branch=main)](https://github.com/Earnwithalee7890/PostUP/actions)

</div>

---

## 🎯 What is Post Up?

Post Up is a **Web3 social engagement platform** built for the Farcaster ecosystem. Brands and creators can launch promotional campaigns, while users earn rewards by completing social tasks like following accounts, liking posts, and engaging with content.

### The Problem We Solve

- **For Creators**: Getting visibility and engagement on Farcaster is hard
- **For Users**: No easy way to discover and earn from quality content
- **For Brands**: Traditional advertising doesn't work in Web3

### Our Solution

A **fair, transparent reward system** where:
- 90% of campaign budget goes directly to participants
- 10% platform fee for sustainability
- Quality-based distribution (higher quality users earn more)

---

## ✨ Features

### 🎯 Campaign Discovery
Browse and join promotional campaigns across categories:
- **Follow** - Follow accounts to earn
- **Boost** - Like, repost, and comment on casts
- **Multi** - Complete multiple tasks for higher rewards
- **MiniApp** - Try Farcaster mini apps
- **Channel** - Join and engage with channels

### 💰 Fair Reward Distribution
- **Quality Scoring**: Based on account age, followers, verification status
- **Weighted Distribution**: Higher quality = higher rewards
- **Transparent**: See exactly how rewards are calculated

### 📊 Leaderboard
- **Top Earners**: Users who joined the most campaigns
- **Top Spenders**: Creators who invested the most in campaigns
- Real-time data from Supabase

### 👤 Profile & History
- View your task history
- Track pending/approved/rejected submissions
- See your wallet address and Farcaster stats

### 🔔 Notifications
- Daily check-in reminders
- Campaign approval updates
- Reward claim notifications

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Supabase** | Database & real-time subscriptions |
| **RainbowKit** | Wallet connection |
| **wagmi** | Ethereum hooks |
| **Farcaster SDK** | Mini App integration |
| **Base Network** | L2 for fast, low-cost transactions |
| **Neynar API** | Farcaster data & verification |

### Smart Contracts
| Network | Contract | Address |
|---------|----------|---------|
| Base | Distributor | `0xcf74BbBDDBB7ed5129a715F20d1cC34Fe1124fe4` |
---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (Recommended)
- npm or yarn
- Supabase account
- Neynar API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Earnwithalee7890/PostUP.git
cd PostUP

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WalletConnect (Required for Web3 features)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Neynar (Farcaster API - Required for verification)
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_key

# Hub URL (Optional: for direct Hub interaction)
NEXT_PUBLIC_HUB_URL=https://hub-api.neynar.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Local Development

1. **Setup Supabase**: Create a new project on [Supabase](https://supabase.com) and run the migrations/setup the tables as described in the [Database Schema](#database-schema) section.
2. **Neynar API**: Get an API key from [Neynar](https://neynar.com) for Farcaster data access.
3. **WalletConnect**: Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com).
4. **Run**: 
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── campaigns/          # Campaign listing & creation
│   ├── leaderboard/        # Top earners & spenders
│   ├── profile/            # User profile & history
│   └── api/                # API routes
├── components/             # React components
│   ├── CampaignCard.tsx    # Campaign display with tasks
│   ├── SuccessModal.tsx    # Task completion modal
│   └── ui/                 # UI components (Navbar, etc.)
├── lib/                    # Utilities & services
│   ├── supabaseService.ts  # Database operations
│   ├── qualityScore.ts     # User quality scoring
│   └── neynar.ts           # Farcaster API integration
├── hooks/                  # Custom React hooks
└── providers/              # Context providers
```

---

## 🗄 Database Schema

### Campaigns Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| creator | text | Creator wallet address |
| platform | text | 'Farcaster' or 'X' |
| category | text | Campaign category |
| tasks | text[] | Array of task types |
| total_budget | numeric | Total campaign budget |
| status | text | 'active', 'completed', etc. |

### Submissions Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| campaign_id | uuid | Foreign key to campaigns |
| user_fid | int | Farcaster ID |
| task_id | text | Task type completed |
| screenshot_url | text | Proof image URL |
| status | text | 'pending', 'approved', 'rejected' |

---

## 🔒 Security

- **Farcaster Auth**: Uses Farcaster Mini App SDK for authentication
- **Admin Checks**: FID-based admin verification
- **Screenshot Verification**: Manual review by campaign admins

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🙏 Acknowledgments

- [Farcaster](https://farcaster.xyz) - The decentralized social network
- [Neynar](https://neynar.com) - Farcaster API infrastructure
- [Base](https://base.org) - Ethereum L2 network
- [Supabase](https://supabase.com) - Backend as a Service

---

<div align="center">

**Built with 💜 for the Farcaster community**

[⬆ Back to top](#post-up-)

</div>
