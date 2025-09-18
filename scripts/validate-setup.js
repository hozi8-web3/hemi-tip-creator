#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Onchain Creator Tipping Platform setup...\n');

let hasErrors = false;

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('❌ .env file not found');
  console.log('   Run: cp .env.example .env');
  hasErrors = true;
} else {
  console.log('✅ .env file exists');
  
  // Check environment variables
  require('dotenv').config();
  
  const requiredVars = ['MONGODB_URI'];
  const optionalVars = ['PRIVATE_KEY', 'NEXT_PUBLIC_CONTRACT_ADDRESS', 'IPFS_PROJECT_ID'];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`❌ Required environment variable ${varName} not set`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName] && process.env[varName] !== 'your_value_here') {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`⚠️  ${varName} not set (optional)`);
    }
  });
}

// Check if contracts are compiled
if (!fs.existsSync('artifacts/contracts/CreatorTipping.sol/CreatorTipping.json')) {
  console.log('❌ Contracts not compiled');
  console.log('   Run: npm run compile');
  hasErrors = true;
} else {
  console.log('✅ Contracts are compiled');
}

// Check if deployment info exists
if (!fs.existsSync('deployment.json')) {
  console.log('⚠️  Contract not deployed yet');
  console.log('   Run: npm run deploy');
} else {
  console.log('✅ Contract deployment info found');
  
  try {
    const deployment = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
    console.log(`   Contract Address: ${deployment.contractAddress}`);
  } catch (error) {
    console.log('❌ Invalid deployment.json file');
    hasErrors = true;
  }
}

// Check node_modules
if (!fs.existsSync('node_modules')) {
  console.log('❌ Dependencies not installed');
  console.log('   Run: npm install');
  hasErrors = true;
} else {
  console.log('✅ Dependencies are installed');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ Setup validation failed. Please fix the issues above.');
  console.log('\n📖 See TROUBLESHOOTING.md for detailed solutions.');
  process.exit(1);
} else {
  console.log('✅ Setup validation passed! You can now run:');
  console.log('   npm run dev    # Start development server');
  console.log('   npm run build  # Build for production');
  console.log('   npm run listen # Start event listener (optional)');
}

console.log('\n🚀 Happy coding!');