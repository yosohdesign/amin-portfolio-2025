#!/usr/bin/env node

/**
 * Test Supabase connection and storage access
 * Run with: node scripts/test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure .env.local contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

console.log('✅ Environment variables loaded')
console.log('🔗 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('🔄 Testing basic connection...')
    
    // Test basic connection by trying to access storage
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log(`📦 Found ${data.length} existing buckets`)
    return true
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

async function testStorage() {
  console.log('\n🔄 Testing storage access...')
  
  const buckets = ['portfolio-images', 'portfolio-videos', 'portfolio-logos', 'portfolio-animations']
  
  for (const bucketName of buckets) {
    try {
      console.log(`  📦 Testing bucket: ${bucketName}`)
      
      const { data, error } = await supabase.storage.getBucket(bucketName)
      
      if (error) {
        if (error.message.includes('not found')) {
          console.log(`    ❌ Bucket '${bucketName}' not found`)
          console.log(`    💡 Create it in Supabase dashboard: Storage → New Bucket`)
          console.log(`    💡 Name: ${bucketName}, Public: Yes`)
        } else {
          console.log(`    ❌ Error: ${error.message}`)
        }
      } else {
        console.log(`    ✅ Bucket '${bucketName}' accessible`)
      }
    } catch (error) {
      console.log(`    ❌ Failed to test bucket: ${error.message}`)
    }
  }
}

async function main() {
  console.log('🚀 Supabase Connection Test\n')
  
  const connectionOk = await testConnection()
  
  if (connectionOk) {
    await testStorage()
    
    console.log('\n📋 Next Steps:')
    console.log('1. Go to: https://supabase.com/dashboard/project/dcbnlyszqjmfseqrqdqz')
    console.log('2. Click "Storage" in left sidebar')
    console.log('3. Create these buckets:')
    console.log('   - portfolio-images (public, 10MB)')
    console.log('   - portfolio-videos (public, 100MB)')
    console.log('   - portfolio-logos (public, 5MB)')
    console.log('   - portfolio-animations (public, 10MB)')
    console.log('4. Run this test again to verify')
  }
  
  console.log('\n✨ Test completed!')
}

main().catch(console.error)
