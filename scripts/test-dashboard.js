#!/usr/bin/env node

console.log('🧪 Testing Dashboard Page Components...\n');

// Simple test to check if the dashboard page structure is correct
const fs = require('fs');
const path = require('path');

try {
  const dashboardPath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Check for required components
  const checks = [
    { name: 'ClientOnly import', pattern: /import.*ClientOnly.*from/ },
    { name: 'EditProfileModal import', pattern: /import.*EditProfileModal.*from/ },
    { name: 'CreatorProfile interface', pattern: /interface CreatorProfile/ },
    { name: 'DashboardContent component', pattern: /function DashboardContent/ },
    { name: 'EditProfileModal usage', pattern: /<EditProfileModal/ },
    { name: 'No duplicate imports', test: () => !content.includes('import { profile } from \'console\'') }
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach(check => {
    const result = check.pattern ? check.pattern.test(content) : check.test();
    if (result) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 Dashboard page structure looks good!');
  } else {
    console.log('⚠️  Some issues found in dashboard page structure.');
  }
  
} catch (error) {
  console.error('❌ Error reading dashboard page:', error.message);
  process.exit(1);
}