#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkFileStructure() {
  console.log('🔍 Checking actual file structure in buckets...\n')
  
  const buckets = ['portfolio-images', 'portfolio-logos', 'portfolio-videos', 'portfolio-animations']
  
  for (const bucketName of buckets) {
    try {
      console.log(`📦 Bucket: ${bucketName}`)
      
      // List all files recursively
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 100 })
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
      } else {
        console.log(`   📁 Files found: ${data.length}`)
        
        // Group files by directory
        const filesByDir = {}
        data.forEach(item => {
          if (item.name.includes('/')) {
            const dir = item.name.split('/')[0]
            if (!filesByDir[dir]) filesByDir[dir] = []
            filesByDir[dir].push(item.name)
          } else {
            if (!filesByDir['root']) filesByDir['root'] = []
            filesByDir['root'].push(item.name)
          }
        })
        
        Object.entries(filesByDir).forEach(([dir, files]) => {
          console.log(`      📂 ${dir}: ${files.length} files`)
          if (files.length <= 5) {
            files.forEach(file => console.log(`         - ${file}`))
          } else {
            console.log(`         ... and ${files.length - 5} more`)
          }
        })
      }
      console.log('')
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`)
    }
  }
}

checkFileStructure().catch(console.error)

