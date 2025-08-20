import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcbnlyszqjmfseqrqdqz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYm5seXN6cWptZnNlcXJxZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjk5NjMsImV4cCI6MjA3MTIwNTk2M30.29gd6T9beSrgeP5hXRIaswM99UMMm-I_KUYm2crhObo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket names
export const STORAGE_BUCKETS = {
  IMAGES: 'portfolio-images',
  VIDEOS: 'portfolio-videos',
  LOGOS: 'portfolio-logos',
  ANIMATIONS: 'portfolio-animations'
} as const

// Image transformation presets
export const IMAGE_TRANSFORMS = {
  THUMBNAIL: 'w=300,h=200,fit=crop',
  MEDIUM: 'w=800,h=600,fit=cover',
  LARGE: 'w=1200,h=800,fit=cover',
  WEBP: 'format=webp',
  AVIF: 'format=avif'
} as const

// Video transformation presets
export const VIDEO_TRANSFORMS = {
  COMPRESSED: 'quality=80,format=mp4',
  WEBM: 'format=webm',
  THUMBNAIL: 'w=400,h=300'
} as const
