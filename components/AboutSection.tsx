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
                Always a designer
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
                Design has always been part of how I work and think, from simplifying problems to turning ideas into something people can actually use. Over the past 8 years I’ve worked across IoT, healthcare, e-commerce, internal tools, B2B platforms, and most recently audio software management systems, where my work also included hardware design. I enjoy creating products that feel clear, practical, and good to use.
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
                Outside of work, I spend time with my wife and two kids. I like to challenge myself, keep learning, and take on projects where I can grow while working with great teams. Remote work suits me well, giving me the balance of focus, flexibility, and collaboration that I value.
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
                <svg width="80" height="20" viewBox="0 0 147 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M113.019 0C111.521 0 110.25 1.19408 110.25 2.66351V34.3365C110.25 35.8077 111.083 37 112.581 37H143.9C145.4 37 147 35.8077 147 34.3365V2.66351C147 1.19408 145.837 0 144.337 0H113.019ZM118.125 4.625C119.938 4.625 121.406 6.10324 121.406 7.92857C121.406 9.7539 119.938 11.2321 118.125 11.2321C116.312 11.2321 114.844 9.7539 114.844 7.92857C114.844 6.10324 116.312 4.625 118.125 4.625ZM21.8784 4.75573C20.1407 4.75573 18.7236 6.1772 18.7236 7.92854C18.7236 9.67987 20.1407 11.1013 21.8784 11.1013C23.6179 11.1013 25.0264 9.67987 25.0264 7.92854C25.0264 6.1772 23.6179 4.75573 21.8784 4.75573ZM0 5.28571V31.7143H15.75V26.4286H5.25V5.28571H0ZM49 5.28571V31.7143H54.25V22.9048L60.7236 31.7143H66.9204L59.5 22.0823L66.5 14.0952H60.375L54.25 21.1429V5.28571H49ZM99.75 5.28571V16.1944H99.6987C98.6295 14.8941 96.8618 13.875 94.0181 13.875C89.4243 13.875 85.7124 17.4987 85.7124 22.9254C85.7124 28.6216 89.479 31.9345 93.854 31.9345C97.0635 31.9345 98.9571 30.8872 100.047 29.6151H100.099V31.7143H105V5.28571H99.75ZM38.7393 13.875C35.9848 13.875 33.7547 15.2659 33.0005 16.6349H32.9459V14.0952H28V31.7143H33.25V23.2523C33.25 20.6042 34.5075 18.5 37.1465 18.5C39.32 18.5 40.25 20.3043 40.25 22.8979V31.7143H45.5V21.9343C45.5 17.2512 44.026 13.875 38.7393 13.875ZM75.6499 13.875C69.6702 13.875 66.5 17.3976 66.5 22.5125C66.5 28.2704 69.9993 31.9345 75.4961 31.9345C79.6156 31.9345 82.1663 30.4909 83.4053 28.8753L80.1377 26.2083C79.4307 27.1756 77.8635 28.4107 75.5815 28.4107C72.967 28.4107 71.8282 26.5536 71.4834 25.0349L71.4561 24.4912H83.9043C83.9043 24.4912 84.0001 23.8979 84.0001 23.2971C84.0001 17.2907 80.8142 13.875 75.6499 13.875ZM134.989 13.875C140.276 13.875 141.75 16.6997 141.75 21.9343V31.7143H136.5V22.8979C136.5 20.5545 135.57 18.5 133.396 18.5C130.757 18.5 129.5 20.2994 129.5 23.2523V31.7143H124.25V14.0952H129.196V16.6349H129.25C130.005 15.2659 132.235 13.875 134.989 13.875ZM19.25 14.0952V31.7143H24.5V14.0952H19.25ZM115.5 14.0952H120.75V31.7143H115.5V14.0952ZM75.4927 17.3988C77.6277 17.3988 78.9832 19.284 78.9482 21.1429H71.4561C71.5978 19.3968 72.9517 17.3988 75.4927 17.3988ZM95.3374 17.8393C98.3422 17.8393 100.099 19.8542 100.099 22.86C100.099 25.7848 98.3422 27.9702 95.3374 27.9702C92.3362 27.9702 90.6514 25.7266 90.6514 22.86C90.6514 19.9952 92.3362 17.8393 95.3374 17.8393Z" fill="#0A66C2"/>
                </svg>
              </Button>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
