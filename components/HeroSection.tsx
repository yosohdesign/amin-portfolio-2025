'use client'

import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  Button,
  useColorModeValue,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import { Sparkle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import FloatingNavbar from './FloatingNavbar'
import Gallery from './Gallery'
import RoleMatcherModal from './RoleMatcherModal'
import { useScrollEffect } from '@/lib/hooks/useScrollEffect'
import { getPublicUrl } from '@/lib/storage'

export default function HeroSection() {
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const { getHeroScrollEffect } = useScrollEffect()
  const [isVisible, setIsVisible] = useState(false)
  const { isOpen: isRoleMatchOpen, onOpen: onRoleMatchOpen, onClose: onRoleMatchClose } = useDisclosure()

  // Trigger animations on component mount
  useEffect(() => {
    // Small delay to ensure smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const galleryImages = {
    left: [
      getPublicUrl('IMAGES', 'images/gallery/Gallery 01.png', 'w=400,h=500,fit=cover,format=webp,q=85'),
      getPublicUrl('IMAGES', 'images/gallery/Gallery 03.png', 'w=400,h=500,fit=cover,format=webp,q=85'),
      getPublicUrl('IMAGES', 'images/gallery/Gallery 05.png', 'w=400,h=500,fit=cover,format=webp,q=85'),
      getPublicUrl('IMAGES', 'images/gallery/Gallery 07.png', 'w=400,h=500,fit=cover,format=webp,q=85'),
      getPublicUrl('IMAGES', 'images/gallery/Gallery 09.png', 'w=400,h=500,fit=cover,format=webp,q=85')
    ],
    right: [
      getPublicUrl('IMAGES', 'images/gallery/Gallery 02.png', 'w=400,h=500,fit=cover,format=webp,q=85'),
      getPublicUrl('IMAGES', 'images/gallery/Gallery 04.png', 'w=400,h=500,fit=cover,format=webp,q=85'),
      getPublicUrl('IMAGES', 'images/gallery/Gallery 06.png', 'w=400,h=500,fit=cover,format=webp,q=85'),
      getPublicUrl('IMAGES', 'images/gallery/Gallery 08.png', 'w=400,h=500,fit=cover,format=webp,q=85')
    ]
  }

  // Simple preloading for better performance
  useEffect(() => {
    if (isVisible) {
      const allImages = [...galleryImages.left, ...galleryImages.right]
      allImages.forEach(src => {
        const img = new Image()
        img.src = src
      })
    }
  }, [isVisible, galleryImages])

  const { scale, translateY, opacity } = getHeroScrollEffect()

  return (
    <>
      {/* Floating Navbar for scroll state - positioned outside transformed container */}
      <Box position="fixed" top="20px" left="50%" zIndex={1000} transform="translateX(-50%)">
        <FloatingNavbar />
      </Box>

      <Box 
        h="100vh" 
        bg="white" 
        display="flex" 
        alignItems="center"
        position="relative"
        overflow="hidden"
        style={{
          transform: `scale(${scale}) translateY(${translateY}px)`,
          opacity: opacity,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          transformOrigin: 'center top',
        }}
      >


        <Container maxW="container.2xl" px={{ base: 4, lg: 8 }} h="100vh">
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={12}
            alignItems="center"
            h="100vh"
          >
            {/* Left Column - Text Content */}
            <GridItem>
              <Box 
                display={{ base: 'none', lg: 'block' }}
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
                transition="opacity 0.8s ease-out, transform 0.8s ease-out"
                transitionDelay="0.1s"
              >
                <FloatingNavbar isHero={true} />
              </Box>
              <VStack align="start" spacing={6} mt={12}>
                <Text
                  fontSize={{ base: "2xl", "2xl": "2.2rem" }}
                  color="gray.500"
                  fontWeight="medium"
                  pl={{ base: 0, lg: 2 }}
                  opacity={isVisible ? 1 : 0}
                  transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
                  transition="opacity 0.8s ease-out, transform 0.8s ease-out"
                  transitionDelay="0.2s"
                >
                  Amin Yosoh
                </Text>
                <Heading
                  as="h1"
                  fontSize={{ base: "48px", lg: "100px" }}
                  fontWeight="normal"
                  color="gray.800"
                  lineHeight="1.1"
                  letterSpacing="tight"
                  opacity={isVisible ? 1 : 0}
                  transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
                  transition="opacity 0.8s ease-out, transform 0.8s ease-out"
                  transitionDelay="0.4s"
                >
                  Product Designer
                </Heading>
                <Text
                  fontSize={{ base: "xl", "2xl": "1.375rem" }}
                  color={textColor}
                  lineHeight="1.7"
                  maxW="lg"
                  mt={6}
                  fontWeight="light"
                  opacity={isVisible ? 1 : 0}
                  transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
                  transition="opacity 0.8s ease-out, transform 0.8s ease-out"
                  transitionDelay="0.6s"
                >
                  Designing with clarity and intent, I bring structure to complex problems and create experiences people can rely on.
                </Text>
                
                {/* Role Match Button */}
                <Button
                  onClick={onRoleMatchOpen}
                  bg="white"
                  color="gray.800"
                  border="1px solid"
                  borderColor="gray.400"
                  borderRadius="lg"
                  px={8}
                  py={4}
                  fontSize="lg"
                  fontWeight="medium"
                  _hover={{ 
                    bg: 'gray.50',
                    borderColor: 'gray.500',
                    transform: 'translateY(-1px)'
                  }}
                  opacity={isVisible ? 1 : 0}
                  transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
                  transition="opacity 0.8s ease-out, transform 0.8s ease-out"
                  transitionDelay="0.8s"
                  leftIcon={<Sparkle color="blue.400" weight="regular" />}
                  className="shimmer-button"
                >
                  Role match me
                </Button>
              </VStack>
            </GridItem>

            {/* Right Column - Staggered Gallery */}
            <GridItem>
              <Box
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
                transition="opacity 0.8s ease-out, transform 0.8s ease-out"
                transitionDelay="0.7s"
              >
                <Gallery 
                  images={galleryImages} 
                  isVisible={isVisible} 
                />
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>
      
      {/* Role Matcher Modal */}
      <RoleMatcherModal isOpen={isRoleMatchOpen} onClose={onRoleMatchClose} />
    </>
  )
}
