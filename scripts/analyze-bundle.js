#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('📊 Analyzing bundle size...\n')

try {
  // Check if @next/bundle-analyzer is installed
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const hasBundleAnalyzer = packageJson.dependencies['@next/bundle-analyzer'] || 
                           packageJson.devDependencies['@next/bundle-analyzer']

  if (!hasBundleAnalyzer) {
    console.log('📦 Installing @next/bundle-analyzer...')
    execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' })
  }

  // Build the project
  console.log('🔨 Building project for analysis...')
  execSync('npm run build', { stdio: 'inherit' })

  // Analyze bundle
  console.log('📈 Analyzing bundle...')
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' })

  console.log('\n✅ Bundle analysis complete!')
  console.log('📊 Check the generated HTML files for detailed bundle breakdown')
  console.log('🎯 Look for large packages that could be optimized or lazy loaded')

} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message)
  console.log('\n💡 Manual optimization tips:')
  console.log('1. Check for large dependencies in package.json')
  console.log('2. Use dynamic imports for heavy components')
  console.log('3. Implement code splitting for routes')
  console.log('4. Consider tree shaking unused code')
}

