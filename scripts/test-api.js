#!/usr/bin/env node

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  const endpoints = [
    '/api/creators',
    '/api/leaderboard',
    '/api/tips',
    '/api/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        console.log(`❌ ${endpoint}: HTTP ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (endpoint === '/api/creators' || endpoint === '/api/leaderboard') {
        if (Array.isArray(data)) {
          console.log(`✅ ${endpoint}: Returns array with ${data.length} items`);
        } else {
          console.log(`⚠️  ${endpoint}: Returns non-array data:`, typeof data);
        }
      } else if (endpoint === '/api/tips') {
        if (Array.isArray(data)) {
          console.log(`✅ ${endpoint}: Returns array with ${data.length} tips`);
        } else {
          console.log(`⚠️  ${endpoint}: Returns non-array data:`, typeof data);
        }
      } else if (endpoint === '/api/stats') {
        if (data && typeof data === 'object') {
          console.log(`✅ ${endpoint}: Returns stats object`);
        } else {
          console.log(`⚠️  ${endpoint}: Returns invalid stats:`, typeof data);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n📋 API test complete!');
  console.log('If you see errors, make sure:');
  console.log('1. The development server is running (npm run dev)');
  console.log('2. MongoDB is connected (check MONGODB_URI in .env)');
  console.log('3. The database has been initialized (curl -X GET http://localhost:3000/api/indexer)');
}

testAPI().catch(console.error);