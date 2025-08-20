#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listBuckets() {
  console.log('📦 Listing all buckets...\n')
  
  try {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }
    
    if (data.length === 0) {
      console.log('🔍 No buckets found.')
      console.log('💡 Make sure you created them in the Supabase dashboard and they are set to "Public"')
    } else {
      console.log(`✅ Found ${data.length} bucket(s):`)
      data.forEach((bucket, index) => {
        console.log(`${index + 1}. Name: "${bucket.name}" | Public: ${bucket.public} | Created: ${bucket.created_at}`)
      })
    }
  } catch (error) {
    console.error('❌ Failed to list buckets:', error.message)
  }
}

listBuckets()

