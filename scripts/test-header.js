// Simple test to check if the app loads without hydration errors
console.log('🧪 Testing header component...')

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment')
  
  // Check for hydration errors in console
  const originalError = console.error
  let hydrationErrors = []
  
  console.error = function(...args) {
    const message = args.join(' ')
    if (message.includes('hydration') || message.includes('Hydration')) {
      hydrationErrors.push(message)
    }
    originalError.apply(console, args)
  }
  
  // Wait a bit and check for errors
  setTimeout(() => {
    if (hydrationErrors.length === 0) {
      console.log('✅ No hydration errors detected')
    } else {
      console.log('❌ Hydration errors found:')
      hydrationErrors.forEach(error => console.log('  -', error))
    }
    
    // Restore original console.error
    console.error = originalError
  }, 3000)
  
} else {
  console.log('⚠️ Not in browser environment')
}

console.log('📱 Header should now be mobile-responsive with:')