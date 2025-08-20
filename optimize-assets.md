# Asset Optimization Guide

## Current Issues:
- **Videos**: 94MB total (36MB, 33MB, 20MB, 4.4MB)
- **Images**: 17MB total
- **Total**: ~111MB loading on first visit

## Quick Wins (No Supabase needed):

### 1. Video Optimization:
```bash
# Install ffmpeg if you don't have it
brew install ffmpeg

# Compress videos (example for webshop_web.mp4)
ffmpeg -i public/movies/webshop_web.mp4 \
  -c:v libx264 -crf 28 \
  -c:a aac -b:a 128k \
  -vf "scale=1280:720" \
  -movflags +faststart \
  public/movies/webshop_web_optimized.mp4
```

**Target sizes:**
- webshop_web.mp4: 36MB → ~8-12MB
- register product_web.mp4: 33MB → ~7-10MB
- modity_web.mp4: 20MB → ~4-6MB
- clasrental.mp4: 4.4MB → ~2-3MB

### 2. Image Optimization:
```bash
# Install image optimization tools
npm install -g imagemin-cli imagemin-webp imagemin-mozjpeg imagemin-pngquant

# Convert PNGs to WebP
imagemin public/images/*.png --plugin=webp --out-dir=public/images/webp

# Compress JPGs
imagemin public/images/*.jpg --plugin=mozjpeg --out-dir=public/images/compressed
```

### 3. Lazy Loading Implementation:
- Videos: Only load when in viewport
- Images: Use Next.js Image component with lazy loading
- Company logos: Implement intersection observer

## Supabase Benefits (Optional):
- **CDN delivery** (2-5x faster)
- **Auto image transformations**
- **Better caching**
- **Lazy loading built-in**

## Immediate Actions:
1. ✅ **Next.js config optimized** (done)
2. 🔄 **Compress videos** (use ffmpeg)
3. 🔄 **Convert images to WebP**
4. 🔄 **Implement lazy loading**
5. 🔄 **Add loading states**

## Expected Results:
- **First load**: 111MB → ~25-35MB
- **Page load time**: 5-8s → 1-3s
- **Core Web Vitals**: Improve significantly
