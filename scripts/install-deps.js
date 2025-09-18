#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Installing dependencies for Onchain Creator Tipping Platform...\n');

try {
  // Install npm dependencies
  console.log('📦 Installing npm packages...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Dependencies installed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Copy .env.example to .env and fill in your values');
  console.log('2. Run "npm run compile" to compile smart contracts');
  console.log('3. Run "npm run deploy" to deploy to Hemi Network');
  console.log('4. Run "npm run dev" to start the development server');
  
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}