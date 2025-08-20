#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Debugging Supabase URLs...\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test URL generation
function testUrlGeneration() {
  console.log('📝 Testing URL generation...')
  
  // Test different bucket types
  const testCases = [
    { bucket: 'portfolio-images', path: 'diaverum.png', transform: 'w=800,h=600,fit=cover,format=webp' },
    { bucket: 'portfolio-logos', path: 'alfalaval.png', transform: 'w=200,h=100,fit=contain,format=webp' },
    { bucket: 'portfolio-videos', path: 'clasrental.mp4', transform: 'quality=80,format=mp4' }
  ]
  
  testCases.forEach(({ bucket, path, transform }) => {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)
      
      console.log(`✅ ${bucket}/${path}:`)
      console.log(`   Base URL: ${data.publicUrl}`)
      
      if (transform) {
        const urlWithTransform = `${data.publicUrl}?transform=${encodeURIComponent(transform)}`
        console.log(`   With Transform: ${urlWithTransform}`)
      }
      console.log('')
    } catch (error) {
      console.error(`❌ Error with ${bucket}/${path}:`, error.message)
    }
  })
}

// Test bucket access
async function testBucketAccess() {
  console.log('🔐 Testing bucket access...')
  
  const buckets = ['portfolio-images', 'portfolio-logos', 'portfolio-videos', 'portfolio-animations']
  
  for (const bucketName of buckets) {
    try {
      console.log(`\n📦 Testing bucket: ${bucketName}`)
      
      // List files in bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 5 })
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
      } else {
        console.log(`   ✅ Accessible, found ${data.length} files`)
        if (data.length > 0) {
          console.log(`   📁 Sample files: ${data.slice(0, 3).map(f => f.name).join(', ')}`)
        }
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`)
    }
  }
}

// Test actual file access
async function testFileAccess() {
  console.log('\n📁 Testing file access...')
  
  const testFiles = [
    { bucket: 'portfolio-images', path: 'diaverum.png' },
    { bucket: 'portfolio-logos', path: 'alfalaval.png' }
  ]
  
  for (const { bucket, path } of testFiles) {
    try {
      console.log(`\n🔍 Testing: ${bucket}/${path}`)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .getPublicUrl(path)
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
      } else {
        console.log(`   ✅ URL: ${data.publicUrl}`)
        
        // Test if URL is accessible
        try {
          const response = await fetch(data.publicUrl, { method: 'HEAD' })
          console.log(`   🌐 HTTP Status: ${response.status}`)
          if (response.ok) {
            console.log(`   ✅ File accessible`)
          } else {
            console.log(`   ❌ File not accessible`)
          }
        } catch (fetchError) {
          console.log(`   ❌ Fetch failed: ${fetchError.message}`)
        }
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`)
    }
  }
}

async function main() {
  console.log('🚀 Supabase Debug Script\n')
  
  testUrlGeneration()
  await testBucketAccess()
  await testFileAccess()
  
  console.log('\n✨ Debug completed!')
}

main().catch(console.error)

