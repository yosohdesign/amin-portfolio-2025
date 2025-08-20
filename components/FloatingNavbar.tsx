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
          px={4}
          py={3}
          display="inline-flex"
          w="fit-content"
        >
          <Flex alignItems="center" justifyContent="space-between" gap={8}>
            {/* Navigation Links */}
            <HStack spacing={6}>
                          <Link
              href="#projects"
              color="gray.600"
              _hover={{ color: 'gray.800' }}
              fontWeight="medium"
            >
              Projects
            </Link>
              <Link
                href="#process"
                color="gray.600"
                _hover={{ color: 'gray.800' }}
                fontWeight="medium"
              >
                Process
              </Link>
              <Link
                href="#about"
                color="gray.600"
                _hover={{ color: 'gray.800' }}
                fontWeight="medium"
              >
                About me
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
              px={6}
              py={2}
              fontWeight="medium"
              h="35px"
              onClick={handleContactClick}
            >
              Contact me
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
      top="20px"
      left="50%"
      zIndex={1000}
      transition="all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      transform={`translateX(-50%) translateY(${isFloating ? '0' : '-100px'})`}
      opacity={isFloating ? 1 : 0}
      pointerEvents={isFloating ? "auto" : "none"}
      mb={4}
    >
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
        border="1px solid"
        borderColor="gray.200"
        px={4}
        py={3}
        display="inline-flex"
        w="fit-content"
        minW="max-content"
      >
        <Flex alignItems="center" justifyContent="space-between" gap={6}>
          {/* Navigation Links */}
          <HStack spacing={5}>
            <Link
              href="#projects"
              color="gray.600"
              _hover={{ color: 'gray.800' }}
              fontWeight="medium"
              whiteSpace="nowrap"
            >
              Projects
            </Link>
            <Link
              href="#process"
              color="gray.600"
              _hover={{ color: 'gray.800' }}
              fontWeight="medium"
              whiteSpace="nowrap"
            >
              Process
            </Link>
            <Link
              href="#about"
              color="gray.600"
              _hover={{ color: 'gray.800' }}
              fontWeight="medium"
              whiteSpace="nowrap"
            >
              About me
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
            px={6}
            py={2}
            fontWeight="medium"
            h="35px"
            whiteSpace="nowrap"
            onClick={handleContactClick}
          >
            Contact me
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
