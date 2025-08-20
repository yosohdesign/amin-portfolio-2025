'use client'

import { useEffect } from 'react'

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log performance metrics
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('🎯 LCP:', entry.startTime, 'ms')
        } else if (entry.entryType === 'first-input') {
          // Cast to PerformanceEventTiming for FID calculation
          const firstInputEntry = entry as PerformanceEventTiming
          if (firstInputEntry.processingStart) {
            console.log('⚡ FID:', firstInputEntry.processingStart - firstInputEntry.startTime, 'ms')
          } else {
            console.log('⚡ FID:', 'processingStart not available')
          }
        } else if (entry.entryType === 'layout-shift') {
          // Cast to LayoutShiftEntry for CLS calculation
          const layoutShiftEntry = entry as any
          if (layoutShiftEntry.value !== undefined) {
            console.log('📐 CLS:', layoutShiftEntry.value)
          } else {
            console.log('📐 CLS:', 'value not available')
          }
        }
      }
    })

    // Observe performance entries
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      console.log('📊 Page Load Time:', loadTime, 'ms')
    })

    return () => observer.disconnect()
  }, [])

  return null // This component doesn't render anything
}
