'use client'

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { EmailIcon } from '@chakra-ui/icons'
import { useEffect, useState, useRef } from 'react'

export default function ContactSection() {
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add a small delay to ensure the animation is visible
          setTimeout(() => setIsVisible(true), 100)
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleEmailClick = () => {
    const subject = 'Please send CV'
    const body = 'Please send CV.\n\nI would appreciate if you could include:\n- Your name and company/organization\n- The role or position you\'re hiring for\n- Why you\'re interested in my background\n- Any specific requirements or questions you have\n\nThank you for your interest.'
    const mailtoLink = `mailto:yosoh.amin@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  return (
    <Box py={32} bg="gray.50" id="contact" ref={sectionRef}>
      <Container maxW="container.2xl" px={{ base: 4, lg: 8 }}>
        <VStack spacing={12} align="center" textAlign="center">
          {/* Main CTA */}
          <VStack spacing={6}>
            <Heading
              as="h2"
              size="2xl"
              fontWeight="medium"
              color="black"
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl', xl: '5xl' }}
              lineHeight="1.2"
              opacity={isVisible ? 1 : 0}
              transform={isVisible ? 'translateY(0)' : 'translateY(40px)'}
              transition="opacity 0.8s ease-out, transform 0.8s ease-out"
              transitionDelay="0.1s"
            >
              Curious about the rest?
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={textColor}
              lineHeight="1.7"
              maxW="md"
              fontWeight="light"
              opacity={isVisible ? 1 : 0}
              transform={isVisible ? 'translateY(0)' : 'translateY(40px)'}
              transition="opacity 0.8s ease-out, transform 0.8s ease-out"
              transitionDelay="0.3s"
            >
              I can't share everything here, but I'd be glad to share my full background and experience.
            </Text>
          </VStack>

          {/* Request CV Button */}
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
            leftIcon={<EmailIcon />}
            _hover={{ 
              bg: 'gray.50',
              borderColor: 'gray.500',
              transform: 'translateY(-1px)'
            }}
            onClick={handleEmailClick}
            opacity={isVisible ? 1 : 0}
            transform={isVisible ? 'translateY(0)' : 'translateY(40px)'}
            transition="opacity 0.8s ease-out, transform 0.8s ease-out"
            transitionDelay="0.5s"
          >
            Request CV
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}
