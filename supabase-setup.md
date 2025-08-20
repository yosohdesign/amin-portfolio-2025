# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project name: `amin-portfolio`
6. Set database password (save this!)
7. Choose region (closest to your users)
8. Click "Create new project"

## 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://abcdefghijklmnop.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Create Environment File

Create `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Storage Buckets

In Supabase dashboard, go to **Storage** and create these buckets:

### Bucket: `portfolio-images`
- **Public bucket**: ✅ Yes
- **File size limit**: 10MB
- **Allowed MIME types**: image/*

### Bucket: `portfolio-videos`
- **Public bucket**: ✅ Yes
- **File size limit**: 100MB
- **Allowed MIME types**: video/*

### Bucket: `portfolio-logos`
- **Public bucket**: ✅ Yes
- **File size limit**: 5MB
- **Allowed MIME types**: image/*

### Bucket: `portfolio-animations`
- **Public bucket**: ✅ Yes
- **File size limit**: 10MB
- **Allowed MIME types**: application/json

## 5. Set Storage Policies

For each bucket, go to **Policies** and add:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'bucket-name');

-- Allow authenticated uploads (optional)
CREATE POLICY "Authenticated Uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bucket-name' AND auth.role() = 'authenticated');
```

## 6. Test Configuration

After setup, restart your dev server:

```bash
npm run dev
```

## 7. Upload Assets

Use the storage utilities in `lib/storage.ts` to upload your optimized assets.

## Benefits You'll Get:
- ✅ **CDN delivery** (2-5x faster loading)
- ✅ **Automatic image optimization**
- ✅ **Video compression**
- ✅ **Better caching**
- ✅ **Global edge locations**
- ✅ **Automatic format conversion** (WebP, AVIF)
