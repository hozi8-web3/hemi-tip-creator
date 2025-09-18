const fetch = require('node-fetch')

async function triggerSync() {
  try {
    console.log('🔄 Triggering full profile sync...')
    
    const response = await fetch('http://localhost:3000/api/indexer', {
      method: 'GET'
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Sync completed:', result.message)
    } else {
      console.error('❌ Sync failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    console.log('💡 Make sure your Next.js app is running on localhost:3000')
  }
}

triggerSync()