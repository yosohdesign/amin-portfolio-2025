import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
