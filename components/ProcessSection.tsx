'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'

export default function ProcessSection() {
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const accentColor = useColorModeValue('ksh.500', 'ksh.400')
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const animationRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for appear animation (separate from scroll logic)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    if (animationRef.current) {
      observer.observe(animationRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const processSteps = [
    {
      step: '01',
      title: 'Research & alignment',
      description: 'Every project starts with understanding the problem space. I work closely with stakeholders, review existing research, and talk to users to uncover needs, challenges, and opportunities. When needed, I run workshops or design sprints to align business goals with user goals.'
    },
    {
      step: '02', 
      title: 'Concept & prototyping',
      description: 'Once we know what to solve, I translate insights into user stories, flows, and initial wireframes. Depending on the complexity, this can range from low-fidelity sketches to high-fidelity interactive prototypes in Figma. Early validation is key, so I test concepts quickly with users and stakeholders to refine direction before scaling.'
    },
    {
      step: '03',
      title: 'Design & systems',
      description: 'I create clear, user-friendly designs that balance usability with business and brand needs. Whenever possible, I document in Figma and connect work to design systems to ensure consistency and scalability. I also adapt to evolving brand identities, hybrid systems, or accessibility requirements when projects demand it.'
    },
    {
      step: '04',
      title: 'Delivery & validation',
      description: 'I work closely with engineers to ensure a smooth handoff, adding specifications, states, and interaction notes where needed. After delivery, I follow up to see how the solution works in practice. That can mean remote testing, collecting feedback through staff, or pilot rollouts depending on the project.'
    }
  ]

  // Calculate scroll progress for smooth rolling animation
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const containerTop = container.offsetTop
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      
      // Calculate total scrollable height for the process section
      const sectionHeight = 320
      
      // Calculate which section we're currently in and progress within it
      let currentSection = 0
      let progress = 0
      
      for (let i = 0; i < processSteps.length; i++) {
        const sectionTop = containerTop + (i * sectionHeight)
        const sectionBottom = sectionTop + sectionHeight
        
        // More precise trigger points - start transition when section is actually visible
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = i
          // Calculate progress within this section (0 to 1)
          const sectionStart = sectionTop
          const sectionEnd = sectionBottom
          progress = Math.max(0, Math.min(1, (scrollPosition - sectionStart) / (sectionEnd - sectionStart)))
          break
        }
        
        // If we're past the last section, stay at the last step (04)
        if (i === processSteps.length - 1 && scrollPosition >= sectionBottom) {
          currentSection = i
          progress = 1
        }
      }
      
      // Calculate overall scroll progress (0 to 3 for smooth transition from 1 to 4)
      // Cap it at 3 to stay at "04" when past the last section
      const overallProgress = Math.min(3, currentSection + progress)
      setScrollProgress(overallProgress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [processSteps.length])

  // Generate all digits for smooth scroll-based rolling animation
  const generateDigits = () => {
    const digits = []
    for (let i = 1; i <= 4; i++) {
      // Calculate position based on scroll progress
      // As scrollProgress goes from 0 to 3, we want to show smooth transition from 1 to 4
      const targetPosition = i - 1 // 0, 1, 2, 3
      const currentPosition = scrollProgress
      
      // Calculate how far each digit should be from center
      const offset = (targetPosition - currentPosition) * 100
      
      // Determine if this is the current active number
      const isActive = Math.abs(offset) < 25 // Consider active when very close to center
      
      // Scroll-based opacity: fade based on how close we are to the target position
      // When scrollProgress is exactly at the target position, opacity is 1
      // As we scroll away, opacity smoothly decreases
      const distanceFromTarget = Math.abs(currentPosition - targetPosition)
      const opacity = Math.max(0, 1 - distanceFromTarget * 1.5)
      
      digits.push(
        <Text
          key={i}
          fontSize={{ base: '9xl', '2xl': '11xl' }}
          fontWeight="bold"
          color={isActive ? "#3575D9" : "blue.400"} // Custom blue when active
          opacity={opacity}
          lineHeight="1"
          fontFamily="var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          letterSpacing="tight"
          position="absolute"
          top="50%"
          left="50%"
          transform={`translate(-50%, -50%) translateY(${offset}%)`}
          transition="none" // Remove transition for instant scroll response
          textAlign="center"
          w="full"
          pointerEvents="none" // Prevent any interaction issues
        >
          {i}
        </Text>
      )
    }
    return digits
  }

  return (
    <Box py={20} bg="white" id="process" ref={containerRef}>
      <Container maxW="container.2xl" px={{ base: 4, lg: 8 }}>
        <VStack spacing={16} align="stretch">
          {/* Section Header */}
          <VStack spacing={6} align="start" ref={animationRef}>
            <Heading
              as="h2"
              size="2xl"
              fontWeight="medium"
              color="black"
              fontSize={{ base: '3xl', md: '3xl', lg: '4xl', xl: '5xl' }}
              opacity={isVisible ? 1 : 0}
              transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
              transition="opacity 0.6s ease-out, transform 0.6s ease-out"
            >
              My process
            </Heading>
          </VStack>

          {/* Process Steps */}
          <Box position="relative" ref={containerRef}>
            <Grid
              templateColumns={{ base: '1fr', lg: '280px 1fr', '2xl': '400px 1fr' }}
              gap={{ base: 0, lg: 8, '2xl': 24 }}
              alignItems="start"
            >
              {/* Sticky Number Container */}
              <GridItem
                position="sticky"
                top="20vh"
                h="320px"
                display={{ base: 'none', lg: 'flex' }}
                alignItems="center"
                justifyContent="center"
                zIndex={10}
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
                transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                transitionDelay="0.1s"
              >
                <Box position="relative" w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                  {/* First Digit (0) - Always visible */}
                  <Text
                    fontSize={{ base: '9xl', '2xl': '11xl' }}
                    fontWeight="bold"
                    color="blue.400"
                    opacity="0.25"
                    lineHeight="1"
                    fontFamily="var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    letterSpacing="tight"
                    position="absolute"
                    left={{ base: '35%', lg: '36%', '2xl': '40%' }}
                    transform="translateX(-50%)"
                    w="120px"
                    textAlign="center"
                  >
                    0
                  </Text>
                  
                  {/* Second Digit - Scroll-based rolling animation container */}
                  <Box 
                    position="absolute"
                    left={{ base: '65%', lg: '64%', '2xl': '60%' }}
                    transform="translateX(-50%)"
                    w="120px"
                    h="120px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                  >
                    {generateDigits()}
                  </Box>
                </Box>
              </GridItem>

              {/* Process Steps Content */}
              <GridItem>
                {processSteps.map((step, index) => {
                  // Determine if this section is currently active
                  const isSectionActive = scrollProgress >= index && scrollProgress < index + 1
                  const isLastSection = index === processSteps.length - 1
                  
                  return (
                    <Box
                      key={index}
                      minH={{ base: "420px", lg: "320px" }}
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      borderTop="2px solid"
                      borderTopColor={isSectionActive ? "#3575D9" : "gray.200"}
                      borderBottom={isLastSection ? "2px solid" : "none"}
                      borderBottomColor={isLastSection ? "gray.200" : "transparent"}
                      position="relative"
                      transition="border-top-color 0.3s ease"
                      py={{ base: 8, lg: 12 }}
                    >
                      {/* Mobile Step Number */}
                      <Text
                        fontSize="7xl"
                        fontWeight="bold"
                        color={isSectionActive ? "#3575D9" : "blue.400"}
                        opacity={isSectionActive ? 1 : 0.25}
                        lineHeight="1"
                        fontFamily="var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        letterSpacing="tight"
                        mb={4}
                        display={{ base: 'block', lg: 'none' }}
                        transition="color 0.3s ease, opacity 0.3s ease"
                      >
                        <Text as="span" color="blue.400" opacity="0.25">0</Text>
                        <Text as="span" color={isSectionActive ? "#3575D9" : "blue.400"} opacity={isSectionActive ? 1 : 0.25}>
                          {step.step === '01' ? '1' : step.step === '02' ? '2' : step.step === '03' ? '3' : '4'}
                        </Text>
                      </Text>

                      {/* Content */}
                      <VStack align="start" spacing={8} w="full" pt={{ base: 8, lg: 0 }} pb={{ base: 6, lg: 0 }}>
                        <Heading
                          as="h3"
                          size="lg"
                          fontWeight="medium"
                          color="black"
                          lineHeight="1.3"
                          fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                        >
                          {step.title}
                        </Heading>
                        <VStack align="start" spacing={6} w="full">
                          <Text
                            fontSize={{ base: 'lg', md: 'xl' }}
                            color={textColor}
                            lineHeight="1.8"
                            w="full"
                            fontWeight="light"
                          >
                            {step.description}
                          </Text>
                        </VStack>
                      </VStack>
                    </Box>
                  )
                })}
              </GridItem>
            </Grid>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
