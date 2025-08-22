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
  Image,
  useColorModeValue,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useEffect, useState, useRef } from 'react'
import { getPublicUrl } from '@/lib/storage'

export default function AboutSection() {
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reduced delay for faster response on mobile
          setTimeout(() => setIsVisible(true), 50)
        }
      },
      {
        threshold: 0.1, // Reduced from 0.2 to 0.1 for earlier trigger
        rootMargin: '0px 0px -30px 0px' // Reduced from -50px for earlier trigger
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <Box py={20} bg="white" id="about" ref={sectionRef}>
      <Container maxW="container.2xl" px={{ base: 4, lg: 8 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={{ base: 12, lg: 24 }}
          alignItems="stretch"
        >
          {/* Left Column - Portrait */}
          <GridItem display="flex" alignItems="stretch" w="full">
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <Image
                src={getPublicUrl('IMAGES', 'images/amin_portfolio.jpg', 'w=400,h=400,fit=cover,format=webp')}
                alt="Amin Yosoh - Product Designer"
                w="full"
                h="auto"
                maxH={{ base: "100%", "2xl": "90%" }}
                objectFit="cover"
                borderRadius="3xl"
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateX(0)' : 'translateX(-40px)'}
                transition="opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                transitionDelay="0.1s"
                sx={{
                  '@media (max-width: 767px)': {
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
                    transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDelay: '0.05s'
                  }
                }}
              />
            </Box>
          </GridItem>

          {/* Right Column - Content */}
          <GridItem w="full">
            <VStack align="start" spacing={8} h="full" justify="center" w="full">
              <Text
                fontSize={{ base: "lg", "2xl": "1.375rem" }}
                color="gray.500"
                fontWeight="medium"
                textTransform="uppercase"
                letterSpacing="wide"
                w="full"
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateX(0)' : 'translateX(40px)'}
                transition="opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                transitionDelay="0.2s"
                sx={{
                  '@media (max-width: 767px)': {
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDelay: '0.1s'
                  }
                }}
              >
                ABOUT ME
              </Text>
              
              <Heading
                as="h2"
                fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                fontWeight="normal"
                color="gray.800"
                lineHeight="1.1"
                letterSpacing="tight"
                w="full"
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateX(0)' : 'translateX(40px)'}
                transition="opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                transitionDelay="0.3s"
                sx={{
                  '@media (max-width: 767px)': {
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDelay: '0.15s'
                  }
                }}
              >
                UX/UI Designer
              </Heading>
              
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color={textColor}
                lineHeight="1.7"
                w="full"
                fontWeight="light"
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateX(0)' : 'translateX(40px)'}
                transition="opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                transitionDelay="0.4s"
                sx={{
                  '@media (max-width: 767px)': {
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDelay: '0.2s'
                  }
                }}
              >
                Dedicated to creative problem-solving and committed to crafting genuine user experiences. 
                I focus on simplifying complex processes and user journeys, turning them into innovative and modern solutions. 
                With over 8 years of experience, I've worked on diverse projects spanning IoT, healthcare, e-commerce, 
                internal tools, and B2B platforms, most recently contributing to audio software management systems.
              </Text>
              
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color={textColor}
                lineHeight="1.7"
                w="full"
                fontWeight="light"
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateX(0)' : 'translateX(40px)'}
                transition="opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                transitionDelay="0.5s"
                sx={{
                  '@media (max-width: 767px)': {
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDelay: '0.25s'
                  }
                }}
              >
                Outside of work, you'll find me exploring my love for creativity through various avenues. 
                In the past, I channeled my problem-solving skills into music production, striving to achieve specific sounds. 
                Today, as a UX/UI designer, my goal is to positively impact a wider audience by crafting desired user experiences.
              </Text>
              
              <Button
                bg="white"
                color="gray.800"
                border="1px solid"
                borderColor="gray.400"
                borderRadius="lg"
                px={6}
                py={3}
                fontSize={{ base: 'md', lg: 'lg' }}
                fontWeight="medium"
                rightIcon={<ExternalLinkIcon />}
                _hover={{ 
                  bg: 'gray.50',
                  borderColor: 'gray.500',
                  transform: 'translateY(-1px)'
                }}
                as="a"
                href="https://linkedin.com/in/aminyosoh"
                target="_blank"
                rel="noopener noreferrer"
                mt={4}
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateX(0)' : 'translateX(40px)'}
                transition="opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                transitionDelay="0.6s"
                sx={{
                  '@media (max-width: 767px)': {
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDelay: '0.3s'
                  }
                }}
              >
                LinkedIn Profile
              </Button>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
