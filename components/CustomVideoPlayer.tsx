'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { getPublicUrl } from '@/lib/storage'

interface CustomVideoPlayerProps {
  src: string
  bucket: 'VIDEOS' | 'IMAGES'
  path: string
  title?: string
  width?: string | number
  height?: string | number
  controls?: boolean
  light?: boolean | string
  playIcon?: React.ReactNode
  config?: any
}

export default function CustomVideoPlayer({
  src,
  bucket,
  path,
  title,
  width = '100%',
  height = 'auto',
  controls = true,
  light = true,
  playIcon,
  config = {}
}: CustomVideoPlayerProps) {
  const [isClient, setIsClient] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const playerRef = useRef<HTMLVideoElement>(null)
  
  const bgColor = useColorModeValue('gray.100', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle play/pause
  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleError = () => setHasError(true)

  // Generate video URL with transformations
  const videoUrl = getPublicUrl(bucket, path, 'quality=80,format=mp4')
  
  // Generate thumbnail URL (first frame of video)
  const thumbnailUrl = getPublicUrl(bucket, path, 'w=800,h=450,fit=cover,format=webp')

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

  return (
    <Box
      w={width}
      h={height}
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      bg="black"
      boxShadow="lg"
    >
      <video
        ref={playerRef}
        src={videoUrl}
        width="100%"
        height="100%"
        controls={controls}
        poster={light ? thumbnailUrl : undefined}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        preload="metadata"
        style={{
          borderRadius: '12px',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      {/* Video title overlay */}
      {title && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
          p={4}
          color="white"
          fontSize="sm"
          fontWeight="medium"
        >
          {title}
        </Box>
      )}
    </Box>
  )
}
