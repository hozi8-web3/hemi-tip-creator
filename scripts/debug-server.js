#!/usr/bin/env node

async function debugServer() {
  console.log('🔍 Debugging Server Issues')
  console.log('==========================')
  
  const baseUrl = 'http://localhost:3000'
  
  // Test basic endpoints
  const endpoints = [
    '/',
    '/api/stats',
    '/api/creators',
    '/creators',
    '/dashboard'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`)
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/html',
          'User-Agent': 'Debug-Script'
        }
      })
      
      const contentType = response.headers.get('content-type')
      
      if (response.ok) {
        console.log(`✅ Status: ${response.status}`)
        console.log(`📄 Content-Type: ${contentType}`)
        
        if (contentType?.includes('application/json')) {
          try {
            const data = await response.json()
            console.log(`📊 Data: ${JSON.stringify(data).substring(0, 100)}...`)
          } catch (e) {
            console.log(`📊 JSON Parse Error: ${e.message}`)
          }
        } else {
          console.log(`📊 Response Length: ${response.headers.get('content-length') || 'unknown'}`)
        }
      } else {
        console.log(`❌ Status: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        console.log(`📄 Error: ${errorText.substring(0, 200)}...`)
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }
  }
  
  console.log('\n💡 Troubleshooting Tips:')
  console.log('- Make sure MongoDB is running and accessible')
  console.log('- Check environment variables in .env')
  console.log('- Verify all dependencies are installed')
  console.log('- Check for TypeScript compilation errors')
}

// Run if called directly
if (require.main === module) {
  debugServer().catch(console.error)
}

module.exports = { debugServer }