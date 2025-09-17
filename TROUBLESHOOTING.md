# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Runtime Errors

#### Error: `creators.map is not a function`
```bash
# This happens when the API returns an error or non-array data
# 1. Check if the API is running
npm run test-api

# 2. Check if MongoDB is connected
# Look for MongoDB connection errors in the console

# 3. Initialize the database
curl -X GET http://localhost:3000/api/indexer
```

#### Error: `Hydration failed because the initial UI does not match`
```bash
# This is usually caused by nested <a> tags or client/server mismatch
# The fix is already applied in the latest code

# If you still see this error:
# 1. Clear your browser cache
# 2. Restart the development server
npm run dev
```

#### Error: `WebSocket connection closed abnormally with code: 3000`
```bash
# This is a WalletConnect project ID issue
# 1. Get a project ID from https://cloud.walletconnect.com
# 2. Add it to your .env file:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Or run the setup helper:
npm run setup-walletconnect
```

#### TypeScript Errors: `Cannot find name 'showEditModal'`
```bash
# This happens if there are structural issues in components
# 1. Test the dashboard structure:
npm run test-dashboard

# 2. If errors persist, restart the TypeScript server:
# In VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# 3. Clear Next.js cache:
rm -rf .next
npm run dev
```

### 2. Hardhat Compilation Errors

#### Error: `@openzeppelin/contracts not found`
```bash
# Solution: Install OpenZeppelin contracts
npm install @openzeppelin/contracts@^4.9.0
```

#### Error: `Solidity 0.8.30 is not fully supported`
```bash
# Solution: Use Solidity 0.8.19 (already configured in hardhat.config.js)
npm run compile
```

### 3. RainbowKit Theme Errors

#### Error: `Cannot use 'in' operator to search for 'lightMode' in dark`
This is fixed by using the custom theme configuration in `lib/theme.ts`.

### 4. Deployment Issues

#### Error: `factory runner does not support sending transactions`
```bash
# This means the private key is not properly configured
# 1. Check if PRIVATE_KEY is set in .env
npm run test-connection

# 2. Make sure your private key is valid (64 hex characters)
# 3. Ensure your account has ETH on Hemi Network
```

#### Error: `Contract address not set`
```bash
# 1. Deploy the contract first
npm run deploy

# 2. Copy the contract address from deployment.json
# 3. Set it in your .env file
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

#### Error: `Private key not found`
```bash
# Set your private key in .env
PRIVATE_KEY=your_private_key_here

# Test the connection
npm run test-connection
```

#### Error: `Insufficient balance`
```bash
# Your account needs ETH on Hemi Network
# Get ETH from:
# 1. Hemi Network faucet (if available)
# 2. Bridge from Ethereum mainnet
# 3. Transfer from another wallet
```

### 5. MongoDB Connection Issues

#### Error: `MongoDB connection failed`
```bash
# Set your MongoDB URI in .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tipchain
```

### 6. IPFS Upload Issues

#### Error: `IPFS upload failed`
The app will fallback to a demo URL if IPFS fails. To fix:
```bash
# Set IPFS credentials in .env (optional)
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret
```

## Step-by-Step Setup

### 1. Clean Installation
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# Required:
# - PRIVATE_KEY (for deployment)
# - MONGODB_URI (for database)
# Optional:
# - IPFS credentials
# - WalletConnect project ID
```

### 3. Contract Deployment
```bash
# Compile contracts
npm run compile

# Deploy to Hemi Network
npm run deploy

# Verify contract (optional)
npm run verify <contract_address>
```

### 4. Database Initialization
```bash
# Start the app
npm run dev

# Initialize database with existing blockchain data
curl -X GET http://localhost:3000/api/indexer
```

### 5. Event Listening (Optional)
```bash
# Run separate event listener for real-time updates
npm run listen
```

## Verification Commands

### Check Contract Deployment
```bash
# Verify contract on Hemi Explorer
npx hardhat verify --network hemi <contract_address>
```

### Test Network Connection
```bash
# Test connection to Hemi Network and validate setup
npm run test-connection
```

### Test API Endpoints
```bash
# Test creators endpoint
curl http://localhost:3000/api/creators

# Test stats endpoint
curl http://localhost:3000/api/stats
```

### Check Database Connection
```bash
# The app will log MongoDB connection status on startup
npm run dev
```

## Getting Help

If you encounter issues not covered here:

1. Check the browser console for client-side errors
2. Check the terminal/server logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure your wallet has ETH for gas fees on Hemi Network
5. Check that the contract address is correctly set after deployment