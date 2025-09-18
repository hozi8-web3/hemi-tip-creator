#!/usr/bin/env node

const { startEventListener } = require('./background-indexer')

console.log('🚀 TipChain Background Indexer')
console.log('==============================')
console.log('')
console.log('This will listen for blockchain events and automatically')
console.log('sync new profiles and tips to your database.')
console.log('')
console.log('Press Ctrl+C to stop')
console.log('')

startEventListener().catch(error => {
  console.error('❌ Failed to start indexer:', error)
  process.exit(1)
})