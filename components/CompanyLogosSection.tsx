'use client'

import {
  Box,
  Container,
  Image,
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { getPublicUrl } from '@/lib/storage'

const companies = [
  { name: 'Alfa Laval', logo: getPublicUrl('LOGOS', 'logos/alfalaval.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'Axis', logo: getPublicUrl('LOGOS', 'logos/axis.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'BBA', logo: getPublicUrl('LOGOS', 'logos/bba.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'Clas Ohlson', logo: getPublicUrl('LOGOS', 'logos/clasohlson.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'Diaverum', logo: getPublicUrl('LOGOS', 'logos/diaverum.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'Modity', logo: getPublicUrl('LOGOS', 'logos/modity.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'OL', logo: getPublicUrl('LOGOS', 'logos/ol.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'Oleter', logo: getPublicUrl('LOGOS', 'logos/oleter.webp', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'Tetra Pak', logo: getPublicUrl('LOGOS', 'logos/tetrapak.png', 'w=200,h=100,fit=contain,format=webp') },
  { name: 'Tretton37', logo: getPublicUrl('LOGOS', 'logos/tretton37.webp', 'w=200,h=100,fit=contain,format=webp') },
]

export default function CompanyLogosSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

  return (
    <Box py={16} pb={24} bg="white" ref={sectionRef}>
      {/* Container with normal padding for section layout */}
      <Box
        px={{ base: 0, lg: 8 }}
        maxW="container.2xl"
        mx="auto"
      >
        {/* Logos Container - breaks out of parent padding to go edge-to-edge */}
        <Box
          w="100vw"
          ml="calc(-50vw + 50%)"
          overflow="hidden"
          opacity={isVisible ? 1 : 0}
          transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
          transition="opacity 0.8s ease-out, transform 0.8s ease-out"
          transitionDelay="0.3s"
        >
          <Box
            className="logos-scroll"
            sx={{
              display: 'flex',
              gap: { base: 16, md: 20, lg: 24 },
              // Much faster scroll animation - 20s on mobile, 25s on larger screens
              animation: 'scroll 20s linear infinite',
              '@media (min-width: 768px)': {
                animation: 'scroll 25s linear infinite',
              },
              '@keyframes scroll': {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(-100%)' },
              },
            }}
          >
            {/* Duplicate logos for seamless loop */}
            {[...companies, ...companies].map((company, index) => (
              <Box
                key={`${company.name}-${index}`}
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                w={{ base: '140px', md: '160px', lg: '180px' }}
                h={{ base: '70px', md: '80px', lg: '90px' }}
                _hover={{
                  '& img': {
                    filter: 'grayscale(0%) brightness(1.1)',
                    opacity: 1,
                  },
                }}
              >
                <Image
                  src={company.logo}
                  alt={company.name}
                  maxW="100%"
                  maxH="100%"
                  objectFit="contain"
                  filter="grayscale(100%) brightness(0.7)"
                  opacity={0.7}
                  transition="all 0.3s ease"
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
