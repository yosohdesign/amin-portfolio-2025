/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image optimization for external URLs (Supabase)
    unoptimized: true,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Build optimizations - Completely disable problematic features
  experimental: {
    // Disable build traces that cause the stack overflow
    buildTraces: false,
    // Enable webpack build worker for faster builds
    webpackBuildWorker: true,
    // Disable other potentially problematic features
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Disable telemetry completely
    telemetry: false,
    // Disable other experimental features that might cause issues
    optimizePackageImports: false,
    webpackBuildWorker: false,
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Completely disable build traces in webpack
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Create a vendor chunk for better caching
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Create a common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
    }
    
    return config
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Optimize bundle analyzer
  bundleAnalyzer: false,
  
  // Disable build traces completely
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
