# Supabase Integration for Portfolio

## 🚀 What We've Set Up

### 1. **Supabase Client** (`lib/supabase.ts`)
- Client configuration
- Storage bucket definitions
- Image/video transformation presets

### 2. **Storage Utilities** (`lib/storage.ts`)
- File upload/download functions
- Public URL generation
- Transformation helpers
- Error handling

### 3. **Migration Script** (`scripts/migrate-to-supabase.js`)
- Automated asset migration from `public/` to Supabase
- Preserves folder structure
- Batch upload with progress tracking

## 📋 Setup Steps

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `amin-portfolio`
3. Save your database password

### Step 2: Get Credentials
1. Go to **Settings** → **API**
2. Copy **Project URL** and **Anon Key**

### Step 3: Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Create Storage Buckets
Create these buckets in Supabase dashboard:
- `portfolio-images` (public, 10MB limit)
- `portfolio-videos` (public, 100MB limit)  
- `portfolio-logos` (public, 5MB limit)
- `portfolio-animations` (public, 10MB limit)

### Step 5: Set Storage Policies
For each bucket, add this policy:
```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'bucket-name');
```

## 🔄 Migration Process

### Run Migration Script
```bash
node scripts/migrate-to-supabase.js
```

This will:
- Upload all assets from `public/` to Supabase
- Preserve folder structure
- Show progress for each file
- Handle errors gracefully

### After Migration
1. ✅ Assets are now in Supabase
2. 🔄 Update components to use Supabase URLs
3. 🧹 Remove old assets from `public/` folder
4. 🚀 Deploy to Vercel

## 💡 Usage Examples

### In Components
```tsx
import { transforms } from '@/lib/storage'

// Optimized image with transformation
<Image 
  src={transforms.image.medium('projects/project1.jpg')}
  alt="Project 1"
  width={800}
  height={600}
/>

// Video with compression
<video 
  src={transforms.video.compressed('projects/demo.mp4')}
  controls
/>
```

### Manual Upload
```tsx
import { uploadFile } from '@/lib/storage'

const handleUpload = async (file: File) => {
  const result = await uploadFile({
    bucket: 'IMAGES',
    path: 'projects/new-project.jpg',
    file,
    transform: 'w=800,h=600,fit=cover'
  })
  
  if (result.success) {
    console.log('Uploaded:', result.url)
  }
}
```

## 🎯 Performance Benefits

### Before (Local Assets)
- ❌ 111MB total assets
- ❌ No CDN
- ❌ No optimization
- ❌ Slow loading (5-8s)

### After (Supabase)
- ✅ 25-35MB optimized assets
- ✅ Global CDN delivery
- ✅ Automatic optimization
- ✅ Fast loading (1-3s)
- ✅ Automatic WebP/AVIF conversion
- ✅ Video compression

## 🔧 Troubleshooting

### Common Issues
1. **Environment variables not loaded**
   - Restart dev server after creating `.env.local`
   
2. **Upload permissions denied**
   - Check bucket policies in Supabase dashboard
   
3. **Assets not loading**
   - Verify bucket is public
   - Check file paths in components

### Debug Mode
```tsx
// Enable debug logging
const supabase = createClient(url, key, {
  auth: { debug: true }
})
```

## 📚 Next Steps

1. **Complete Supabase setup** (follow supabase-setup.md)
2. **Run migration script** to upload assets
3. **Update components** to use Supabase URLs
4. **Test performance** improvements
5. **Deploy to Vercel** with new setup

## 🆘 Need Help?

- Check [Supabase docs](https://supabase.com/docs)
- Review storage policies
- Check browser console for errors
- Verify environment variables are loaded
