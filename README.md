# 🎯 Onchain Creator Tipping Platform

A modern, wallet-only tipping platform built on Hemi Network with secure onchain profile editing and MongoDB API integration.

## 🚀 Features

- **Wallet-only authentication** (no email/database)
- **Onchain creator profiles** with secure editing
- **IPFS avatar uploads** via drag & drop
- **Native ETH & ERC-20 tipping**
- **MongoDB API** (Vercel-compatible)
- **Real-time blockchain indexing**
- **Modern orange UI** with dark theme
- **Leaderboard & analytics**

## 🔧 Quick Start

### 1. Install Dependencies
```bash
npm install
# Or use the setup script:
npm run setup
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your values:
# - PRIVATE_KEY (for deployment)
# - MONGODB_URI (MongoDB connection string)
# - IPFS credentials (optional)
```

### 3. Deploy Smart Contract
```bash
# Compile contracts
npm run compile

# Test connection and setup
npm run test-connection

# Deploy to Hemi Network
npm run deploy

# Verify contract (optional)
npx hardhat verify --network hemi <contract_address>
```

### 4. Initialize Database
```bash
# Start the app
npm run dev

# In another terminal, initialize the database:
npm run init-db
```

### 5. Validate Setup
```bash
# Check if everything is configured correctly
npm run validate
```

## 🚨 Quick Fixes

### Fix Deployment Errors
```bash
# Test your connection and private key setup
npm run test-connection

# Clean install if you encounter dependency issues
npm run clean

# Validate your setup
npm run validate
```

### Initialize with Real Data
```bash
# After deployment, sync blockchain data
npm run init-db

# Test API endpoints
npm run test-api
```

### Fix RainbowKit Theme Error
The theme error is already fixed in the latest code. If you still see it:
```bash
npm install @rainbow-me/rainbowkit@^1.3.0
```

## 🌐 Network Details

- **Network**: Hemi
- **Chain ID**: 43111
- **RPC**: https://rpc.hemi.network/rpc
- **Currency**: ETH
- **Explorer**: https://explorer.hemi.xyz

## � Projeect Structure

```
├── contracts/              # Smart contracts
├── scripts/               # Deployment scripts
├── src/app/api/          # Next.js API routes (MongoDB)
├── src/app/              # Frontend pages
├── components/           # UI components
└── lib/                 # Utilities
```

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Blockchain**: Solidity 0.8.30, Hardhat, wagmi, viem
- **Database**: MongoDB (Vercel-compatible)
- **Storage**: IPFS (Infura/Pinata)
- **UI**: shadcn/ui, Framer Motion, Radix UI
- **Deployment**: Vercel (full-stack)

## 🔐 Profile Editing Features

- **Secure onchain updates** (only profile owner can edit)
- **IPFS avatar uploads** with wallet signature verification
- **Input validation** (username, bio, social links)
- **Gas-efficient** smart contract with length limits
- **Real-time UI updates** after transaction confirmation

## 🛡️ Security Features

- **Wallet signature verification** for all uploads
- **Timestamped messages** prevent replay attacks
- **File type validation** (images only)
- **Size limits** (5MB max per file)
- **Action-specific permissions** (upload_avatar only)

## 📊 API Endpoints

- `GET /api/creators` - List all creators
- `GET /api/creator/:address` - Get creator profile & tips
- `GET /api/tips` - Recent tipping activity
- `GET /api/leaderboard` - Top creators by amount
- `GET /api/stats` - Platform statistics
- `POST /api/upload` - Upload avatar to IPFS
- `POST /api/indexer` - Blockchain event indexing

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
# Build the application
npm run build

# Set environment variables
export MONGODB_URI=mongodb+srv://...
export NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Start production server
npm start
```

## 🔧 Smart Contract Verification

```bash
# After deployment, verify on Hemi Explorer
npx hardhat verify \
  --network hemi \
  <contract_address>
```

## 🎯 Brand Colors

- Primary Orange: `#ff7a00`
- Dark backgrounds with gradient accents
- Glowing orange highlights

## 🛠️ Development Notes

- MongoDB collections: `profiles`, `tips`
- IPFS integration for avatar storage
- Event-driven blockchain indexing
- Responsive design for all devices
- Gas-optimized smart contracts