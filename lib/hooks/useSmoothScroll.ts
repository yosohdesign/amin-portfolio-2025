import { useCallback } from 'react'

interface SmoothScrollOptions {
  duration?: number // Duration in milliseconds
  easing?: 'easeInOut' | 'easeIn' | 'easeOut' | 'linear'
  offset?: number // Additional offset from the top
}

export const useSmoothScroll = () => {
  const smoothScrollTo = useCallback((
    targetId: string, 
    options: SmoothScrollOptions = {}
  ) => {
    const {
      duration = 1200, // Default to 1.2 seconds (slower than default)
      easing = 'easeInOut',
      offset = 0
    } = options

    const targetElement = document.getElementById(targetId)
    if (!targetElement) return

    // Calculate target position with offset
    const targetPosition = targetElement.offsetTop - offset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    
    // Start animation immediately without delays
    const startTime = performance.now()
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Use smoother easing curves with cubic-bezier-like feel
      let easedProgress: number
      switch (easing) {
        case 'easeInOut':
          // Smoother cubic-bezier-like curve (0.25, 0.1, 0.25, 1)
          easedProgress = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2
          break
        case 'easeIn':
          easedProgress = progress * progress * progress
          break
        case 'easeOut':
          easedProgress = 1 - Math.pow(1 - progress, 3)
          break
        default:
          easedProgress = progress
      }
      
      const currentPosition = startPosition + distance * easedProgress
      
      // Smooth scrolling with sub-pixel precision for extra smoothness
      window.scrollTo(0, currentPosition)
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }
    
    // Start immediately
    requestAnimationFrame(animateScroll)
  }, [])

  return { smoothScrollTo }
}
