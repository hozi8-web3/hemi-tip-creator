#!/usr/bin/env node

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function debugAPI() {
  console.log('🔍 Debugging API endpoints...\n');

  // Test 1: Basic API test
  console.log('Test 1: Basic API connectivity');
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    const data = await response.json();
    console.log('✅ API Response:', data);
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }

  // Test 2: Upload endpoint structure
  console.log('\nTest 2: Upload endpoint (without file)');
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: new FormData()
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response type:', response.headers.get('content-type'));
    console.log('Response preview:', text.substring(0, 200));
    
    if (text.startsWith('<!DOCTYPE')) {
      console.log('❌ API returning HTML instead of JSON - check for errors');
    } else {
      console.log('✅ API returning proper response format');
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
  } catch (error) {
    console.log('❌ Upload endpoint error:', error.message);
  }

  // Test 3: Check environment
  console.log('\nTest 3: Environment check');
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    const data = await response.json();
    
    console.log('Environment status:');
    console.log('- IPFS configured:', data.env?.hasIPFS ? '✅' : '❌');
    console.log('- Pinata configured:', data.env?.hasPinata ? '✅' : '❌');
    console.log('- IPFS URL:', data.env?.ipfsUrl || 'Not set');
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
  }

  console.log('\n📋 Debug Summary:');
  console.log('If you see HTML responses, check:');
  console.log('1. Next.js development server is running');
  console.log('2. No syntax errors in API routes');
  console.log('3. All imports are working correctly');
  console.log('4. Environment variables are set');
}

debugAPI().catch(console.error);