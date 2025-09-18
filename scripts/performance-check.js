#!/usr/bin/env node

const { performance } = require('perf_hooks')

async function checkPerformance() {
  console.log('🚀 Performance Check for TipChain')
  console.log('================================')
  
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
  
  const endpoints = [
    '/',
    '/creators',
    '/leaderboard',
    '/api/creators',
    '/api/stats'
  ]
  
  console.log(`Testing against: ${baseUrl}\n`)
  
  for (const endpoint of endpoints) {
    try {
      const start = performance.now()
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'User-Agent': 'TipChain-Performance-Test'
        }
      })
      
      const end = performance.now()
      const duration = Math.round(end - start)
      
      const status = response.ok ? '✅' : '❌'
      const cacheHeader = response.headers.get('cache-control') || 'no-cache'
      
      console.log(`${status} ${endpoint}`)
      console.log(`   Response: ${response.status} ${response.statusText}`)
      console.log(`   Time: ${duration}ms`)
      console.log(`   Cache: ${cacheHeader}`)
      console.log(`   Size: ${response.headers.get('content-length') || 'unknown'}`)
      console.log('')
      
    } catch (error) {
      console.log(`❌ ${endpoint}`)
      console.log(`   Error: ${error.message}`)
      console.log('')
    }
  }
  
  console.log('Performance recommendations:')
  console.log('- API responses should be < 500ms')
  console.log('- Pages should load < 2s')
  console.log('- Cache headers should be present')
  console.log('- Images should be optimized')
}

// Run if called directly
if (require.main === module) {
  checkPerformance().catch(console.error)
}

module.exports = { checkPerformance }