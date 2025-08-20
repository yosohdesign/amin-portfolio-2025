#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpload() {
  console.log('🧪 Testing bucket access by uploading a test file...\n')
  
  // Create a small test file
  const testContent = 'This is a test file'
  const testFileName = 'test-file.txt'
  
  try {
    // Test upload to portfolio-images bucket
    console.log('📤 Testing upload to portfolio-images...')
    
    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('❌ Upload failed:', error.message)
      
      if (error.message.includes('not found')) {
        console.log('💡 Bucket not found - might be a permissions issue')
      } else if (error.message.includes('policy')) {
        console.log('💡 Policy issue - need to check bucket policies')
      }
    } else {
      console.log('✅ Upload successful!')
      console.log('📁 File path:', data.path)
      
      // Try to get public URL
      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(testFileName)
      
      console.log('🔗 Public URL:', urlData.publicUrl)
      
      // Clean up - delete test file
      await supabase.storage
        .from('portfolio-images')
        .remove([testFileName])
      
      console.log('🧹 Test file cleaned up')
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testUpload()

