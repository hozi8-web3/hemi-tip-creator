#!/usr/bin/env node

console.log('🔗 Setting up WalletConnect for TipChain\n');

console.log('To fix WalletConnect errors, you need a project ID:');
console.log('');
console.log('1. Go to: https://cloud.walletconnect.com');
console.log('2. Sign up or log in');
console.log('3. Create a new project');
console.log('4. Copy your Project ID');
console.log('5. Add it to your .env file:');
console.log('   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here');
console.log('');
console.log('Note: The app will work without this, but you may see some console warnings.');
console.log('');
console.log('🎯 For now, the app uses a fallback project ID that should work for development.');