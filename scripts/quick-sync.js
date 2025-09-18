const fetch = require('node-fetch')

async function quickSync() {
  try {
    console.log('🔄 Quick sync - refreshing all creators...')
    
    // First, trigger the creators API to sync from blockchain
    const response = await fetch('http://localhost:3000/api/creators', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (response.ok) {
      const creators = await response.json()
      console.log(`✅ Found ${creators.length} creators`)
      
      creators.forEach((creator, index) => {
        console.log(`${index + 1}. ${creator.username} (${creator.address})`)
        console.log(`   Tips: ${creator.tipCount} | Total: ${creator.totalTipsReceived} wei`)
        console.log(`   Avatar: ${creator.avatarURI ? '✅' : '❌'}`)
        console.log('')
      })
    } else {
      console.error('❌ Failed to fetch creators:', response.status)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('💡 Make sure your Next.js app is running on localhost:3000')
  }
}

quickSync()