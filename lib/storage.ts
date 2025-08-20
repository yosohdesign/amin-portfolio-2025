import { supabase, STORAGE_BUCKETS, IMAGE_TRANSFORMS, VIDEO_TRANSFORMS } from './supabase'

export interface UploadOptions {
  bucket: keyof typeof STORAGE_BUCKETS
  path: string
  file: File
  transform?: string
}

export interface DownloadOptions {
  bucket: keyof typeof STORAGE_BUCKETS
  path: string
  transform?: string
}

// Upload file to Supabase storage
export async function uploadFile({ bucket, path, file, transform }: UploadOptions) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    return {
      success: true,
      path: data.path,
      url: getPublicUrl(bucket, data.path, transform)
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error }
  }
}

// Get public URL for a file
export function getPublicUrl(bucket: keyof typeof STORAGE_BUCKETS, path: string, transform?: string) {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(path)

  if (transform) {
    // Add transformation parameters to URL
    const separator = data.publicUrl.includes('?') ? '&' : '?'
    return `${data.publicUrl}${separator}transform=${encodeURIComponent(transform)}`
  }

  return data.publicUrl
}

// Download file from Supabase storage
export async function downloadFile({ bucket, path, transform }: DownloadOptions) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .download(path)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Download error:', error)
    return { success: false, error }
  }
}

// List files in a bucket
export async function listFiles(bucket: keyof typeof STORAGE_BUCKETS, path?: string) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .list(path || '')

    if (error) throw error

    return { success: true, files: data }
  } catch (error) {
    console.error('List files error:', error)
    return { success: false, error }
  }
}

// Delete file from Supabase storage
export async function deleteFile(bucket: keyof typeof STORAGE_BUCKETS, path: string) {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .remove([path])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error }
  }
}

// Predefined transformation helpers
export const transforms = {
  // Image transformations
  image: {
    thumbnail: (path: string) => getPublicUrl('IMAGES', path, IMAGE_TRANSFORMS.THUMBNAIL),
    medium: (path: string) => getPublicUrl('IMAGES', path, IMAGE_TRANSFORMS.MEDIUM),
    large: (path: string) => getPublicUrl('IMAGES', path, IMAGE_TRANSFORMS.LARGE),
    webp: (path: string) => getPublicUrl('IMAGES', path, IMAGE_TRANSFORMS.WEBP),
    avif: (path: string) => getPublicUrl('IMAGES', path, IMAGE_TRANSFORMS.AVIF)
  },
  // Video transformations
  video: {
    compressed: (path: string) => getPublicUrl('VIDEOS', path, VIDEO_TRANSFORMS.COMPRESSED),
    webm: (path: string) => getPublicUrl('VIDEOS', path, VIDEO_TRANSFORMS.WEBM),
    thumbnail: (path: string) => getPublicUrl('VIDEOS', path, VIDEO_TRANSFORMS.THUMBNAIL)
  }
}
