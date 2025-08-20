'use client'

import { Box, Image } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useEffect, useState, useRef } from 'react'

const scrollAnimation1 = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`

const scrollAnimation2 = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`

interface GalleryProps {
  images: {
    left: string[]
    right: string[]
  }
}

export default function Gallery({ images }: GalleryProps) {
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set())
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start revealing images one by one with gentle, smooth delays
          images.left.forEach((_, index) => {
            setTimeout(() => {
              setVisibleImages(prev => new Set([...prev, `left-${index}`]))
            }, 300 + (index * 80)) // 300ms initial delay, then gentle 80ms between each
          })
          
          images.right.forEach((_, index) => {
            setTimeout(() => {
              setVisibleImages(prev => new Set([...prev, `right-${index}`]))
            }, 500 + (index * 80)) // Right column starts 200ms after left
          })
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    if (galleryRef.current) {
      observer.observe(galleryRef.current)
    }

    return () => observer.disconnect()
  }, [images.left.length, images.right.length])

  const renderImageColumn = (imageList: string[], animation: string, duration: number, columnIndex: number) => (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="lg"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        animation={`${animation} ${duration}s linear infinite`}
        display="flex"
        flexDirection="column"
        gap={4}
        willChange="transform"
        transform="translateZ(0)"
      >
        {/* First set of images */}
        {imageList.map((src, index) => {
          const imageKey = `${columnIndex === 0 ? 'left' : 'right'}-${index}`
          const isVisible = visibleImages.has(imageKey)
          
          return (
            <Box
              key={`first-${index}`}
              w="full"
              h={{ base: "200px", md: "250px", lg: "300px", xl: "350px", "2xl": "400px" }}
              borderRadius="2xl"
              overflow="hidden"
              opacity={isVisible ? 1 : 0}
              transform={isVisible ? 'translateY(0)' : 'translateY(15px)'}
              transition="opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <Image
                src={src}
                alt={`Gallery Image ${index + 1}`}
                w="full"
                h="full"
                objectFit="cover"
                borderRadius="2xl"
              />
            </Box>
          )
        })}
        {/* Duplicate set for seamless loop */}
        {imageList.map((src, index) => {
          const imageKey = `${columnIndex === 0 ? 'left' : 'right'}-${index}`
          const isVisible = visibleImages.has(imageKey)
          
          return (
            <Box
              key={`duplicate-${index}`}
              w="full"
              h={{ base: "200px", md: "250px", lg: "300px", xl: "350px", "2xl": "400px" }}
              borderRadius="2xl"
              overflow="hidden"
              opacity={isVisible ? 1 : 0}
              transform={isVisible ? 'translateY(0)' : 'translateY(15px)'}
              transition="opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <Image
                src={src}
                alt={`Gallery Image ${index + 1}`}
                w="full"
                h="full"
                objectFit="cover"
                borderRadius="2xl"
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )

  return (
    <Box
      ref={galleryRef}
      h="100vh"
      position="relative"
      overflow="hidden"
      display="grid"
      gridTemplateColumns="repeat(2, 1fr)"
      gap={4}
      p={0}
      mt={{ base: "4", lg: "-20vh" }}
      mb={{ base: "4", lg: "-20vh" }}
    >
      {renderImageColumn(images.left, scrollAnimation1, 90, 0)}
      {renderImageColumn(images.right, scrollAnimation2, 120, 1)}
    </Box>
  )
}
