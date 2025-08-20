import { useEffect, useState } from 'react'

interface ScrollEffectOptions {
  threshold?: number
  scaleFactor?: number
  translateFactor?: number
  opacityFactor?: number
}

export function useScrollEffect(options: ScrollEffectOptions = {}) {
  const {
    threshold = 0.5,
    scaleFactor = 0.1,
    translateFactor = 20,
    opacityFactor = 0.6
  } = options

  const [scrollY, setScrollY] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }

    // Set initial viewport height
    setViewportHeight(window.innerHeight)
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getScrollEffect = (element: HTMLElement | null) => {
    if (!element) return { scale: 1, translateY: 0, opacity: 1 }
    
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top
    const elementHeight = rect.height
    
    // Start effect only after scrolling past threshold of the element
    const scrollThreshold = -(elementHeight * threshold)
    const shouldApplyEffect = elementTop < scrollThreshold
    
    if (!shouldApplyEffect) return { scale: 1, translateY: 0, opacity: 1 }
    
    // Calculate effect progress from when we start to when element is fully out
    const effectProgress = Math.min(1, (scrollThreshold - elementTop) / (elementHeight * threshold))
    
    const scale = 1 - (effectProgress * scaleFactor)
    const translateY = effectProgress * translateFactor
    const opacity = 1 - (effectProgress * opacityFactor)
    
    return { scale, translateY, opacity }
  }

  const getHeroScrollEffect = () => {
    const scrollThreshold = viewportHeight * 0.5
    const shouldApplyEffect = scrollY > scrollThreshold
    const effectProgress = shouldApplyEffect ? Math.min(1, (scrollY - scrollThreshold) / (viewportHeight * 0.2)) : 0
    
    const scale = shouldApplyEffect ? 1 - (effectProgress * 0.1) : 1
    const translateY = shouldApplyEffect ? effectProgress * 20 : 0
    const opacity = shouldApplyEffect ? 1 - (effectProgress * 0.6) : 1

    return { scale, translateY, opacity }
  }

  return {
    scrollY,
    viewportHeight,
    getScrollEffect,
    getHeroScrollEffect
  }
}
