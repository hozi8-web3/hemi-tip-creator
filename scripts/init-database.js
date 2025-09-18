#!/usr/bin/env node

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function initializeDatabase() {
  console.log('🔄 Initializing database with blockchain data...\n');

  try {
    console.log('Syncing existing blockchain data...');
    const response = await fetch(`${API_BASE_URL}/api/indexer`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Database initialization result:', result.message || 'Success');

    console.log('\n📊 Testing API endpoints...');
    
    // Test stats
    const statsResponse = await fetch(`${API_BASE_URL}/api/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Stats:', {
        creators: stats.totalCreators,
        tips: stats.totalTips,
        volume: stats.totalAmount
      });
    }

    // Test creators
    const creatorsResponse = await fetch(`${API_BASE_URL}/api/creators`);
    if (creatorsResponse.ok) {
      const creators = await creatorsResponse.json();
      console.log('✅ Creators found:', creators.length);
    }

    console.log('\n🎉 Database initialization complete!');
    console.log('You can now use the application with real blockchain data.');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the development server is running (npm run dev)');
    console.log('2. Check that MONGODB_URI is set in your .env file');
    console.log('3. Verify the contract address is correct');
    process.exit(1);
  }
}

initializeDatabase().catch(console.error);