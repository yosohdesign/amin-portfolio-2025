#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSubdirectories() {
  console.log('🔍 Checking subdirectories for actual files...\n')
  
  const subdirs = [
    { bucket: 'portfolio-images', path: 'images' },
    { bucket: 'portfolio-logos', path: 'logos' },
    { bucket: 'portfolio-videos', path: 'movies' },
    { bucket: 'portfolio-animations', path: 'animations' }
  ]
  
  for (const { bucket, path } of subdirs) {
    try {
      console.log(`📦 ${bucket}/${path}/`)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, { limit: 100 })
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
      } else {
        console.log(`   📁 Files found: ${data.length}`)
        
        if (data.length > 0) {
          data.slice(0, 10).forEach(item => {
            console.log(`      - ${item.name}`)
          })
          if (data.length > 10) {
            console.log(`      ... and ${data.length - 10} more`)
          }
        }
      }
      console.log('')
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`)
    }
  }
}

checkSubdirectories().catch(console.error)

