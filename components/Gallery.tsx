'use client'

import { Box, Image } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useEffect, useState } from 'react'

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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Delay gallery animations slightly after the container animation
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

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
        {imageList.map((src, index) => (
          <Box
            key={`first-${index}`}
            w="full"
            h={{ base: "200px", md: "250px", lg: "300px", xl: "350px", "2xl": "400px" }}
            borderRadius="2xl"
            overflow="hidden"
            opacity={isVisible ? 1 : 0}
            transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
            transition="opacity 0.6s ease-out, transform 0.6s ease-out"
            transitionDelay={`${0.1 + (index * 0.1) + (columnIndex * 0.05)}s`}
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
        ))}
        {/* Duplicate set for seamless loop */}
        {imageList.map((src, index) => (
          <Box
            key={`duplicate-${index}`}
            w="full"
            h={{ base: "200px", md: "250px", lg: "300px", xl: "350px", "2xl": "400px" }}
            borderRadius="2xl"
            overflow="hidden"
            opacity={isVisible ? 1 : 0}
            transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
            transition="opacity 0.6s ease-out, transform 0.6s ease-out"
            transitionDelay={`${0.1 + (index * 0.1) + (columnIndex * 0.05)}s`}
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
        ))}
      </Box>
    </Box>
  )

  return (
    <Box
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
