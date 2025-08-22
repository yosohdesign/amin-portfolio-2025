'use client'

import { Box, Image, useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { getPublicUrl } from '@/lib/storage'

interface VideoThumbnailGeneratorProps {
  videoPath: string
  bucket: 'VIDEOS' | 'IMAGES'
  width?: string | number
  height?: string | number
  fallbackSrc?: string
  alt?: string
  showPlayButton?: boolean
  onClick?: () => void
}

export default function VideoThumbnailGenerator({
  videoPath,
  bucket,
  width = '100%',
  height = 'auto',
  fallbackSrc,
  alt = 'Video thumbnail',
  showPlayButton = true,
  onClick
}: VideoThumbnailGeneratorProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const bgColor = useColorModeValue('gray.100', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        setIsLoading(true)
        
        // Try to get a thumbnail from Supabase transformations first
        const supabaseThumbnail = getPublicUrl(bucket, videoPath, 'w=800,h=450,fit=cover,format=webp')
        
        // Test if the thumbnail loads
        const img = document.createElement('img')
        img.onload = () => {
          setThumbnailUrl(supabaseThumbnail)
          setIsLoading(false)
        }
        img.onerror = () => {
          // Fallback to generating thumbnail from video element
          generateThumbnailFromVideo()
        }
        img.src = supabaseThumbnail
        
      } catch (error) {
        console.error('Error generating thumbnail:', error)
        generateThumbnailFromVideo()
      }
    }

    const generateThumbnailFromVideo = () => {
      if (videoRef.current) {
        const video = videoRef.current
        
        const handleLoadedData = () => {
          try {
            // Create canvas to capture first frame
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              
              // Draw the first frame
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              
              // Convert to data URL
              const thumbnailDataUrl = canvas.toDataURL('image/webp', 0.8)
              setThumbnailUrl(thumbnailDataUrl)
            }
          } catch (error) {
            console.error('Error capturing video frame:', error)
            setHasError(true)
          } finally {
            setIsLoading(false)
          }
        }

        video.addEventListener('loadeddata', handleLoadedData, { once: true })
        video.addEventListener('error', () => {
          setHasError(true)
          setIsLoading(false)
        })

        // Load video metadata
        video.preload = 'metadata'
        video.src = getPublicUrl(bucket, videoPath, 'quality=80,format=mp4')
      }
    }

    generateThumbnail()
  }, [videoPath, bucket])

  if (isLoading) {
    return (
      <Box
        w={width}
        h={height}
        bg={bgColor}
        borderRadius="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
      >
        <Box textAlign="center" p={8}>
          <Box fontSize="4xl" mb={4}>🎬</Box>
          <Box fontSize="sm" color="gray.500">Generating thumbnail...</Box>
        </Box>
      </Box>
    )
  }

  if (hasError && fallbackSrc) {
    return (
      <Box
        w={width}
        h={height}
        borderRadius="xl"
        overflow="hidden"
        position="relative"
        cursor={onClick ? 'pointer' : 'default'}
        onClick={onClick}
      >
        <Image
          src={fallbackSrc}
          alt={alt}
          w="full"
          h="full"
          objectFit="cover"
        />
        {showPlayButton && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="rgba(0, 0, 0, 0.7)"
            borderRadius="full"
            w="80px"
            h="80px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.3s ease"
            _hover={{
              bg: 'rgba(0, 0, 0, 0.9)',
              transform: 'translate(-50%, -50%) scale(1.1)'
            }}
          >
            <Box
              w="0"
              h="0"
              borderStyle="solid"
              borderWidth="20px 0 20px 32px"
              borderColor="transparent transparent transparent white"
              ml="4px"
            />
          </Box>
        )}
      </Box>
    )
  }

  if (hasError) {
    return (
      <Box
        w={width}
        h={height}
        bg="red.50"
        borderRadius="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="1px solid"
        borderColor="red.200"
      >
        <Box textAlign="center" p={8}>
          <Box fontSize="4xl" mb={4}>❌</Box>
          <Box fontSize="sm" color="red.600">Failed to load video</Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      w={width}
      h={height}
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      bg="black"
    >
      {thumbnailUrl && (
        <Image
          src={thumbnailUrl}
          alt={alt}
          w="full"
          h="full"
          objectFit="cover"
        />
      )}
      
      {showPlayButton && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="rgba(0, 0, 0, 0.7)"
          borderRadius="full"
          w="80px"
          h="80px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="all 0.3s ease"
          _hover={{
            bg: 'rgba(0, 0, 0, 0.9)',
            transform: 'translate(-50%, -50%) scale(1.1)'
          }}
        >
          <Box
            w="0"
            h="0"
            borderStyle="solid"
            borderWidth="20px 0 20px 32px"
            borderColor="transparent transparent transparent white"
            ml="4px"
          />
        </Box>
      )}
      
      {/* Hidden video element for thumbnail generation */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        muted
        playsInline
      />
    </Box>
  )
}
