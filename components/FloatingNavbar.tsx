'use client'

import {
  Box,
  Link,
  HStack,
  Button,
  Flex,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

interface FloatingNavbarProps {
  isHero?: boolean;
}

export default function FloatingNavbar({ isHero = false }: FloatingNavbarProps) {
  const [isFloating, setIsFloating] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const shouldFloat = scrollTop > viewportHeight

      // Only update floating state if this is not the hero navbar
      if (!isHero) {
        setIsFloating(shouldFloat)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [viewportHeight, isHero])

  const handleContactClick = () => {
    const subject = 'Portfolio Inquiry'
    const body = 'Hi Amin,\n\nI came across your portfolio and would like to get in touch.'
    const mailtoLink = `mailto:yosoh.amin@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const handleSmoothScroll = (targetId: string) => {
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
  }

  // Hero navbar is always visible and never floating
  if (isHero) {
    return (
      <Box
        position="relative"
        left="50%"
        zIndex={1000}
        transform="translateX(-50%)"
        mb={4}
      >
        <Box
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          px={{ base: 3, md: 4 }}
          py={{ base: 2, md: 3 }}
          display="inline-flex"
          w="fit-content"
          maxW={{ base: 'calc(100vw - 32px)', md: 'none' }}
        >
          <Flex alignItems="center" justifyContent="space-between" gap={{ base: 4, md: 8 }}>
            {/* Navigation Links */}
            <HStack spacing={{ base: 4, md: 6 }}>
              <Link
                href="#projects"
                color="gray.600"
                _hover={{ color: 'gray.800' }}
                fontWeight="medium"
                fontSize={{ base: 'sm', md: 'md' }}
                onClick={(e) => {
                  e.preventDefault()
                  handleSmoothScroll('projects')
                }}
              >
                Projects
              </Link>
              <Link
                href="#process"
                color="gray.600"
                _hover={{ color: 'gray.800' }}
                fontWeight="medium"
                fontSize={{ base: 'sm', md: 'md' }}
                onClick={(e) => {
                  e.preventDefault()
                  handleSmoothScroll('process')
                }}
              >
                Process
              </Link>
              <Link
                href="#about"
                color="gray.600"
                _hover={{ color: 'gray.800' }}
                fontWeight="medium"
                fontSize={{ base: 'sm', md: 'md' }}
                onClick={(e) => {
                  e.preventDefault()
                  handleSmoothScroll('about')
                }}
              >
                <Box as="span" display={{ base: 'none', md: 'inline' }}>
                  About me
                </Box>
                <Box as="span" display={{ base: 'inline', md: 'none' }}>
                  About
                </Box>
              </Link>
            </HStack>

            {/* Contact Button */}
            <Button
              variant="solid"
              bg="gray.900"
              color="white"
              _hover={{ bg: 'gray.800', transform: 'translateY(-1px)' }}
              transition="all 0.2s"
              borderRadius="lg"
              px={{ base: 4, md: 6 }}
              py={2}
              fontWeight="medium"
              h={{ base: '32px', md: '35px' }}
              fontSize={{ base: 'sm', md: 'md' }}
              onClick={handleContactClick}
            >
              <Box as="span" display={{ base: 'none', md: 'inline' }}>
                Contact me
              </Box>
              <Box as="span" display={{ base: 'inline', md: 'none' }}>
                Contact
              </Box>
            </Button>
          </Flex>
        </Box>
      </Box>
    )
  }

  // Floating navbar logic
  return (
    <Box
      position="fixed"
      top={{ base: '16px', md: '20px' }}
      left="50%"
      zIndex={1000}
      transition="all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      transform={`translateX(-50%) translateY(${isFloating ? '0' : '-100px'})`}
      opacity={isFloating ? 1 : 0}
      pointerEvents={isFloating ? "auto" : "none"}
    >
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
        border="1px solid"
        borderColor="gray.200"
        px={{ base: 3, md: 4 }}
        py={{ base: 2, md: 3 }}
        display="inline-flex"
        w="fit-content"
        maxW={{ base: 'calc(100vw - 32px)', md: 'none' }}
        minW={{ base: 'auto', md: 'max-content' }}
      >
        <Flex alignItems="center" justifyContent="space-between" gap={{ base: 3, md: 6 }}>
          {/* Navigation Links */}
          <HStack spacing={{ base: 3, md: 5 }}>
            <Link
              href="#projects"
              color="gray.600"
              _hover={{ color: 'gray.800' }}
              fontWeight="medium"
              whiteSpace="nowrap"
              fontSize={{ base: 'sm', md: 'md' }}
              onClick={(e) => {
                e.preventDefault()
                handleSmoothScroll('projects')
              }}
            >
              Projects
            </Link>
            <Link
              href="#process"
              color="gray.600"
              _hover={{ color: 'gray.800' }}
              fontWeight="medium"
              whiteSpace="nowrap"
              fontSize={{ base: 'sm', md: 'md' }}
              onClick={(e) => {
                e.preventDefault()
                handleSmoothScroll('process')
              }}
            >
              Process
            </Link>
            <Link
              href="#about"
              color="gray.600"
              _hover={{ color: 'gray.800' }}
              fontWeight="medium"
              whiteSpace="nowrap"
              fontSize={{ base: 'sm', md: 'md' }}
              onClick={(e) => {
                e.preventDefault()
                handleSmoothScroll('about')
              }}
            >
              <Box as="span" display={{ base: 'none', md: 'inline' }}>
                About me
              </Box>
              <Box as="span" display={{ base: 'inline', md: 'none' }}>
                About
              </Box>
            </Link>
          </HStack>

          {/* Contact Button */}
          <Button
            variant="solid"
            bg="gray.900"
            color="white"
            _hover={{ bg: 'gray.800', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
            borderRadius="lg"
            px={{ base: 4, md: 6 }}
            py={2}
            fontWeight="medium"
            h={{ base: '32px', md: '35px' }}
            fontSize={{ base: 'sm', md: 'md' }}
            whiteSpace="nowrap"
            onClick={handleContactClick}
          >
            <Box as="span" display={{ base: 'none', md: 'inline' }}>
              Contact me
            </Box>
            <Box as="span" display={{ base: 'inline', md: 'none' }}>
              Contact
            </Box>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
