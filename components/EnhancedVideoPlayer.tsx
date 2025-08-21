'use client'

import { Box, useColorModeValue, Text, VStack } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { getPublicUrl } from '@/lib/storage'

interface EnhancedVideoPlayerProps {
  src: string
  bucket: 'VIDEOS' | 'IMAGES'
  path: string
  title?: string
  width?: string | number
  height?: string | number
  controls?: boolean
  light?: boolean
  playIcon?: React.ReactNode
  config?: any
  aspectRatio?: number
  showTitle?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
}

export default function EnhancedVideoPlayer({
  src,
  bucket,
  path,
  title,
  width = '100%',
  height = 'auto',
  controls = true,
  light = true,
  playIcon,
  config = {},
  aspectRatio = 16 / 9,
  showTitle = true,
  autoPlay = false,
  muted = true,
  loop = false
}: EnhancedVideoPlayerProps) {
  const [isClient, setIsClient] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const playerRef = useRef<HTMLVideoElement>(null)
  
  const bgColor = useColorModeValue('gray.100', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.300')

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Generate thumbnail URL
  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        // Try to get a thumbnail from Supabase transformations
        const supabaseThumbnail = getPublicUrl(bucket, path, 'w=800,h=450,fit=cover,format=webp')
        
        // Test if the thumbnail loads
        const img = new Image()
        img.onload = () => {
          setThumbnailUrl(supabaseThumbnail)
          setIsLoading(false)
        }
        img.onerror = () => {
          // Fallback to a generic thumbnail
          setThumbnailUrl('')
          setIsLoading(false)
        }
        img.src = supabaseThumbnail
        
      } catch (error) {
        console.error('Error generating thumbnail:', error)
        setIsLoading(false)
      }
    }

    generateThumbnail()
  }, [bucket, path])

  // Handle play/pause
  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleError = () => setHasError(true)
  const handleReady = () => setIsLoading(false)

  // Generate video URL with transformations
  const videoUrl = getPublicUrl(bucket, path, 'quality=80,format=mp4')

  if (!isClient) {
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
      >
        <Box textAlign="center" p={8}>
          <Box fontSize="4xl" mb={4}>🎬</Box>
          <Box fontSize="sm" color="gray.500">Loading video player...</Box>
        </Box>
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
          <Box fontSize="xs" color="red.500" mt={2}>{title || 'Video'}</Box>
        </Box>
      </Box>
    )
  }

  // Custom play icon with better styling
  const defaultPlayIcon = (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      bg="rgba(0, 0, 0, 0.8)"
      borderRadius="full"
      w="100px"
      h="100px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      transition="all 0.3s ease"
      _hover={{
        bg: 'rgba(0, 0, 0, 0.95)',
        transform: 'translate(-50%, -50%) scale(1.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}
      boxShadow="0 10px 30px rgba(0,0,0,0.2)"
    >
      <Box
        w="0"
        h="0"
        borderStyle="solid"
        borderWidth="25px 0 25px 40px"
        borderColor="transparent transparent transparent white"
        ml="6px"
      />
    </Box>
  )

  return (
    <VStack spacing={4} align="stretch" w={width}>
      {/* Video Player Container */}
      <Box
        w="full"
        borderRadius="xl"
        overflow="hidden"
        position="relative"
        bg="black"
        boxShadow="lg"
        style={{
          aspectRatio: aspectRatio
        }}
      >
        <video
          ref={playerRef}
          src={videoUrl}
          width="100%"
          height="100%"
          controls={controls}
          poster={light && thumbnailUrl ? thumbnailUrl : undefined}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
          onLoadedData={handleReady}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload="metadata"
          style={{
            borderRadius: '12px',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.7)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="xl"
          >
            <VStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                border="4px solid rgba(255,255,255,0.3)"
                borderTop="4px solid white"
                borderRadius="full"
                animation="spin 1s linear infinite"
              />
              <Text color="white" fontSize="sm" fontWeight="medium">
                Loading video...
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
      
      {/* Video title */}
      {showTitle && title && (
        <Box textAlign="center">
          <Text
            fontSize="lg"
            fontWeight="semibold"
            color={textColor}
            lineHeight="1.4"
          >
            {title}
          </Text>
        </Box>
      )}
      
      {/* Custom CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </VStack>
  )
}
