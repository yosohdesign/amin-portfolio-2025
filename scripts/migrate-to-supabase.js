#!/usr/bin/env node

/**
 * Migration script to move assets from public/ to Supabase storage
 * Run with: node scripts/migrate-to-supabase.js
 */

const fs = require('fs').promises
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket mapping
const BUCKET_MAPPING = {
  'public/images': 'portfolio-images',
  'public/logos': 'portfolio-logos',
  'public/movies': 'portfolio-videos',
  'public/animations': 'portfolio-animations'
}

// Get MIME type based on file extension
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.json': 'application/json',
    '.txt': 'text/plain'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

async function uploadFile(filePath, bucketName) {
  try {
    const fileName = path.basename(filePath)
    
    // Skip .DS_Store files
    if (fileName === '.DS_Store') {
      console.log(`⏭️ Skipping ${fileName}`)
      return true
    }
    
    const fileBuffer = await fs.readFile(filePath)
    const relativePath = path.relative('public', filePath)
    const mimeType = getMimeType(fileName)
    
    console.log(`📤 Uploading ${fileName} (${mimeType}) to ${bucketName}...`)
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(relativePath, fileBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: mimeType
      })
    
    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error.message)
      return false
    }
    
    console.log(`✅ Uploaded ${fileName} successfully`)
    return true
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error.message)
    return false
  }
}

async function migrateDirectory(dirPath, bucketName) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name)
      
      if (file.isDirectory()) {
        await migrateDirectory(fullPath, bucketName)
      } else if (file.isFile()) {
        await uploadFile(fullPath, bucketName)
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error.message)
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase...\n')
  
  let totalFiles = 0
  let successfulUploads = 0
  
  for (const [localPath, bucketName] of Object.entries(BUCKET_MAPPING)) {
    if (await fs.access(localPath).then(() => true).catch(() => false)) {
      console.log(`📁 Processing ${localPath} → ${bucketName}`)
      await migrateDirectory(localPath, bucketName)
    } else {
      console.log(`⚠️  Directory ${localPath} not found, skipping...`)
    }
  }
  
  console.log('\n🎉 Migration completed!')
  console.log('Next steps:')
  console.log('1. Update your components to use Supabase URLs')
  console.log('2. Test the new asset loading')
  console.log('3. Remove old assets from public/ folder')
}

main().catch(console.error)
