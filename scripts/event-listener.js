const { ethers } = require('ethers');

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://rpc.hemi.network/rpc';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const CONTRACT_ABI = [
  "event ProfileCreated(address indexed creator, string username)",
  "event ProfileUpdated(address indexed creator, string username)",
  "event TipSent(address indexed from, address indexed to, uint256 amount, address token, string message, uint256 tipIndex)"
];

async function startEventListener() {
  if (!CONTRACT_ADDRESS) {
    console.error('CONTRACT_ADDRESS not set. Please deploy contract and set environment variable.');
    process.exit(1);
  }

  console.log('Starting blockchain event listener...');
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('RPC URL:', RPC_URL);
  console.log('API Base URL:', API_BASE_URL);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  // Listen for ProfileCreated events
  contract.on('ProfileCreated', async (creator, username, event) => {
    console.log('ProfileCreated:', creator, username);
    
    try {
      await fetch(`${API_BASE_URL}/api/indexer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ProfileCreated',
          data: {
            creator,
            username,
            txHash: event.transactionHash
          }
        })
      });
    } catch (error) {
      console.error('Error indexing ProfileCreated event:', error);
    }
  });

  // Listen for ProfileUpdated events
  contract.on('ProfileUpdated', async (creator, username, event) => {
    console.log('ProfileUpdated:', creator, username);
    
    try {
      await fetch(`${API_BASE_URL}/api/indexer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ProfileUpdated',
          data: {
            creator,
            username,
            txHash: event.transactionHash
          }
        })
      });
    } catch (error) {
      console.error('Error indexing ProfileUpdated event:', error);
    }
  });

  // Listen for TipSent events
  contract.on('TipSent', async (from, to, amount, token, message, tipIndex, event) => {
    console.log('TipSent:', from, to, amount.toString(), token, message);
    
    try {
      await fetch(`${API_BASE_URL}/api/indexer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'TipSent',
          data: {
            from,
            to,
            amount: amount.toString(),
            token,
            message,
            tipIndex: tipIndex.toString(),
            txHash: event.transactionHash
          }
        })
      });
    } catch (error) {
      console.error('Error indexing TipSent event:', error);
    }
  });

  console.log('Event listener started successfully!');
  console.log('Listening for blockchain events...');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down event listener...');
  process.exit(0);
});

// Start the listener
startEventListener().catch(console.error);