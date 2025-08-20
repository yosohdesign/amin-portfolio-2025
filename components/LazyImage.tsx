'use client'

import { Image, ImageProps } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string
  placeholder?: string
  threshold?: number
}

export default function LazyImage({ 
  src, 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+',
  threshold = 0.1,
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return (
    <Image
      ref={imgRef}
      src={isInView ? src : placeholder}
      opacity={isLoaded ? 1 : 0.8}
      transition="opacity 0.3s ease"
      onLoad={handleLoad}
      {...props}
    />
  )
}

