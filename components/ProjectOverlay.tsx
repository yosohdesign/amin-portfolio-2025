'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Tag,
  Button,
  Grid,
  GridItem,
  Image,
  IconButton,
  Container,
  useColorModeValue,
} from '@chakra-ui/react'
import { CloseIcon, ArrowBackIcon } from '@chakra-ui/icons'
import { useEffect, useRef, useState } from 'react'
import { getPublicUrl } from '@/lib/storage'
import Lottie from 'lottie-react'


interface ProjectOverlayProps {
  project: {
    dateRange: string
    title: string
    description: string
    tags: string[]
    imageSrc: string
    imageAlt: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function ProjectOverlay({ project, isOpen, onClose }: ProjectOverlayProps) {
  // Mobile Performance Optimizations:
  // - Single intersection observer instead of multiple
  // - Hardware acceleration with translateZ(0)
  // - Reduced animation complexity on mobile
  // - Optimized CSS properties for mobile scrolling
  // - Touch-friendly scroll behavior
  
  const cardBg = useColorModeValue('white', 'white')
  const tlDrRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const challengeRef = useRef<HTMLDivElement>(null)
  const processRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const conclusionRef = useRef<HTMLDivElement>(null)
  
  const [fluid1Animation, setFluid1Animation] = useState(null)
  const [fluid2Animation, setFluid2Animation] = useState(null)
  const [fluid3Animation, setFluid3Animation] = useState(null)
  
  const [isHovered1, setIsHovered1] = useState(false)
  const [isHovered2, setIsHovered2] = useState(false)
  const [isHovered3, setIsHovered3] = useState(false)
  
  const fluid1Ref = useRef<any>(null)
  const fluid2Ref = useRef<any>(null)
  const fluid3Ref = useRef<any>(null)
  
  const animationsRef = useRef(null)
  
  // Add state for closing animation
  const [isClosing, setIsClosing] = useState(false)
  
  // Manual Intersection Observer setup for content sections
  const [tlDrInView, setTlDrInView] = useState(false)
  const [backgroundInView, setBackgroundInView] = useState(false)
  const [roleInView, setRoleInView] = useState(false)
  const [toolsInView, setToolsInView] = useState(false)
  const [challengeInView, setChallengeInView] = useState(false)
  const [processInView, setProcessInView] = useState(false)
  const [resultsInView, setResultsInView] = useState(false)
  const [conclusionInView, setConclusionInView] = useState(false)

  // Optimized intersection observer for mobile performance
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Mobile detection for performance optimization
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection
      const mobile = window.innerWidth < 768 || 
                    'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0 ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      setIsMobile(mobile)
      console.log('Mobile detection:', { 
        width: window.innerWidth, 
        isMobile: mobile,
        userAgent: navigator.userAgent,
        touchPoints: navigator.maxTouchPoints,
        hasTouch: 'ontouchstart' in window
      })
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Helper function for mobile-optimized transitions
  const getMobileTransition = (desktopTransition: string, mobileTransition: string = "opacity 0.3s ease-out") => {
    return isMobile ? mobileTransition : desktopTransition
  }

  // Handle closing animation
  const handleClose = () => {
    setIsClosing(true)
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose()
    }, 300) // Match the animation duration
  }



  // Reset closing state when overlay opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  // Add CSS keyframes for contentSlideIn and contentSlideOut animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes contentSlideIn {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes contentSlideOut {
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Load Lottie animations
  useEffect(() => {
            if (project.title === 'Engaging health tracking') {
      const loadAnimations = async () => {
        try {
          console.log('Loading Lottie animations...')
          const [fluid1Res, fluid2Res, fluid3Res] = await Promise.all([
            fetch(getPublicUrl('ANIMATIONS', 'animations/fluid1.json')),
            fetch(getPublicUrl('ANIMATIONS', 'animations/fluid2.json')),
            fetch(getPublicUrl('ANIMATIONS', 'animations/fluid3.json'))
          ])
          
          if (!fluid1Res.ok || !fluid2Res.ok || !fluid3Res.ok) {
            throw new Error('Failed to fetch animations')
          }
          
          const [fluid1, fluid2, fluid3] = await Promise.all([
            fluid1Res.json(),
            fluid2Res.json(),
            fluid3Res.json()
          ])
          
          console.log('Animations loaded successfully:', { fluid1, fluid2, fluid3 })
          console.log('Setting animation states...')
          setFluid1Animation(fluid1)
          setFluid2Animation(fluid2)
          setFluid3Animation(fluid3)
          console.log('Animation states set')
        } catch (error) {
          console.error('Error loading animations:', error)
        }
      }
      
      loadAnimations()
    }
  }, [project.title])

  // Set animation speeds
  useEffect(() => {
    if (fluid1Ref.current && fluid2Ref.current && fluid3Ref.current) {
      fluid1Ref.current.setSpeed(0.3)
      fluid2Ref.current.setSpeed(0.3)
      fluid3Ref.current.setSpeed(0.3)
    }
  }, [fluid1Animation, fluid2Animation, fluid3Animation])

  // Handle mobile autoplay
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (fluid1Ref.current) fluid1Ref.current.play()
      if (fluid2Ref.current) fluid2Ref.current.play()
      if (fluid3Ref.current) fluid3Ref.current.play()
    }
  }, [fluid1Animation, fluid2Animation, fluid3Animation])

  // Debug hover states
  useEffect(() => {
    console.log('Hover states:', { isHovered1, isHovered2, isHovered3 })
  }, [isHovered1, isHovered2, isHovered3])

  // Debug section visibility states
  useEffect(() => {
    console.log('Section visibility states:', {
      tlDrInView,
      backgroundInView,
      roleInView,
      toolsInView,
      challengeInView,
      processInView,
      resultsInView,
      conclusionInView,
      isMobile
    })
  }, [tlDrInView, backgroundInView, roleInView, toolsInView, challengeInView, processInView, resultsInView, conclusionInView, isMobile])

  // Single intersection observer for all content sections (optimized for mobile)
  useEffect(() => {
    const sectionRefs = [
      { ref: tlDrRef, setter: setTlDrInView },
      { ref: backgroundRef, setter: setBackgroundInView },
      { ref: roleRef, setter: setRoleInView },
      { ref: toolsRef, setter: setToolsInView },
      { ref: challengeRef, setter: setChallengeInView },
      { ref: processRef, setter: setProcessInView },
      { ref: resultsRef, setter: setResultsInView },
      { ref: conclusionRef, setter: setConclusionInView }
    ]

    console.log('Setting up intersection observer:', { isMobile, sectionRefs: sectionRefs.map(s => ({ 
      ref: s.ref.current, 
      hasRef: !!s.ref.current 
    })) })

    // Create single observer for better mobile performance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const section = sectionRefs.find(s => s.ref.current === entry.target)
          if (section && entry.isIntersecting) {
            console.log('Section in view:', { 
              section: section?.ref.current?.textContent?.slice(0, 50), 
              isIntersecting: entry.isIntersecting,
              isMobile 
            })
            section.setter(true)
          }
        })
      },
      { 
        threshold: 0.1, 
        rootMargin: isMobile ? '-20px' : '-50px' // Smaller margin on mobile for better detection
      }
    )

    // Observe all sections
    sectionRefs.forEach(({ ref }) => {
      if (ref.current) {
        observerRef.current?.observe(ref.current)
        console.log('Observing section:', ref.current.textContent?.slice(0, 50))
      }
    })

    // Fallback: If on mobile, ensure all sections are visible after a short delay
    if (isMobile) {
      const fallbackTimer = setTimeout(() => {
        sectionRefs.forEach(({ setter }) => {
          setter(true)
        })
        console.log('Mobile fallback: All sections set to visible')
      }, 1000) // 1 second delay

      return () => {
        clearTimeout(fallbackTimer)
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isMobile]) // Re-run when mobile state changes

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

      // Optimized scroll prevention using CSS instead of event blocking
  const preventBackgroundScroll = (e: TouchEvent) => {
    // Early return if already locked to avoid unnecessary processing
    if (document.body.dataset.scrollLocked) return
    
    const target = e.target as Element
    if (!target.closest('[data-overlay-container]')) {
      // Use CSS-based prevention instead of preventDefault for better performance
      const body = document.body
      body.dataset.scrollLocked = 'true'
      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${window.scrollY}px`
      body.style.width = '100%'
    }
  }

  // Optimized wheel prevention using CSS
  const preventBackgroundWheel = (e: WheelEvent) => {
    // Early return if already locked to avoid unnecessary processing
    if (document.body.dataset.scrollLocked) return
    
    const target = e.target as Element
    if (!target.closest('[data-overlay-container]')) {
      // Use CSS-based prevention instead of preventDefault for better performance
      const body = document.body
      body.dataset.scrollLocked = 'true'
      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${window.scrollY}px`
      body.style.width = '100%'
    }
  }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('touchmove', preventBackgroundScroll, { passive: true })
      document.addEventListener('wheel', preventBackgroundWheel, { passive: true })
      
      // Enhanced body lock for mobile
      const scrollY = window.scrollY
      const body = document.body
      
      // Store current scroll position and lock body
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.width = '100%'
      body.style.overflow = 'hidden'
      body.style.touchAction = 'none'
      
      // Store scroll position for restoration
      body.dataset.scrollY = scrollY.toString()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('touchmove', preventBackgroundScroll)
      document.removeEventListener('wheel', preventBackgroundWheel)
      
      // Restore scroll position and body styles
      const body = document.body
      const scrollY = body.dataset.scrollY
      
      if (scrollY) {
        body.style.position = ''
        body.style.top = ''
        body.style.width = ''
        body.style.overflow = ''
        body.style.touchAction = ''
        delete body.dataset.scrollLocked
        
        // Restore scroll position
        window.scrollTo(0, parseInt(scrollY))
        delete body.dataset.scrollY
      }
    }
  }, [isOpen, handleClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={1000}
          onClick={handleBackdropClick}
                  style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overscrollBehavior: 'none',
          touchAction: 'none',
          // Performance optimizations for mobile
          WebkitTransform: 'translateZ(0)', // Force hardware acceleration
          transform: 'translateZ(0)', // Force hardware acceleration
        }}
        >
          {/* White backdrop that fades in/out */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="white"
        zIndex={1000}
        opacity={isClosing ? 1 : 0}
        animation={isClosing ? "fadeOut 0.3s ease-in forwards" : "fadeIn 0.4s ease-out forwards"}
        sx={{
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          },
          '@keyframes fadeOut': {
            '0%': { opacity: 1 },
            '100%': { opacity: 0 }
          }
        }}
      />
      
      {/* Close Button - Fixed outside scrollable container */}
      <IconButton
        aria-label="Close overlay"
        icon={<CloseIcon />}
        position="fixed"
        top={6}
        right={6}
        zIndex={1002}
        bg="white"
        color="gray.800"
        border="1px solid"
        borderColor="gray.300"
        borderRadius="lg"
        size="md"
        _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
        onClick={handleClose}
      />

      {/* Container background */}
      <Box
        width="100vw"
        height="100vh"
        backgroundColor={cardBg}
        borderRadius="0"
        border="none"
        overflow="auto"
        zIndex={1001}
        opacity={isClosing ? 1 : 0}
        transform={isClosing ? "scale(1) translateY(0)" : "scale(0.95)"}
        animation={isClosing ? "slideOut 0.3s ease-in forwards" : "slideIn 0.5s ease-out forwards"}
        data-overlay-container
        sx={{
          // Optimized scrolling for overlay content
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y', // Allow vertical scrolling only
          willChange: 'transform', // Optimize for animations
          // Mobile performance optimizations
          WebkitTransform: 'translateZ(0)', // Force hardware acceleration
          transform: 'translateZ(0)', // Force hardware acceleration
          backfaceVisibility: 'hidden', // Prevent flickering
          perspective: '1000px', // Optimize 3D transforms
          // Additional mobile optimizations
          WebkitBackfaceVisibility: 'hidden',
          WebkitPerspective: '1000px',
          // Animation keyframes
          '@keyframes slideIn': {
            '0%': { 
              opacity: 0, 
              transform: 'scale(0.95) translateY(20px)' 
            },
            '100%': { 
              opacity: 1, 
              transform: 'scale(1) translateY(0)' 
            }
          },
          '@keyframes slideOut': {
            '0%': { 
              opacity: 1, 
              transform: 'scale(1) translateY(0)' 
            },
            '100%': { 
              opacity: 0, 
              transform: 'scale(0.95) translateY(20px)' 
            }
          }
        }}
      >

                        <Container maxW="container.2xl" py={8} pt={16} h="full">
              {/* First Section - Card Layout (Stacked) */}
              <Box maxW="1000px" mx="auto" w="full">
                <VStack spacing={8} align="stretch">
                  {/* Content Section */}
                  <VStack align="start" spacing={6} w="full">
                        {/* Title */}
                          <Heading
                            as="h3"
                            size="xl"
                            fontWeight="medium"
                            color="black"
                            fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                            lineHeight="1.2"
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.2s forwards"}
                  sx={{
                    '@keyframes contentSlideIn': {
                      '0%': { 
                        opacity: 0, 
                        transform: 'translateY(20px)' 
                      },
                      '100%': { 
                        opacity: 1, 
                        transform: 'translateY(0)' 
                      }
                    },
                    '@keyframes contentSlideOut': {
                      '0%': { 
                        opacity: 1, 
                        transform: 'translateY(0)' 
                      },
                      '100%': { 
                        opacity: 0, 
                        transform: 'translateY(20px)' 
                      }
                    }
                  }}
                          >
                            {project.title}
                          </Heading>

                        {/* Date */}
                <Text 
                  fontSize={{ base: 'sm', md: 'md' }} 
                  color="gray.500" 
                  fontWeight="medium"
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.3s forwards"}
                >
                            {project.dateRange}
                          </Text>

                        {/* Description */}
                <Text 
                  fontSize={{ base: 'md', lg: 'lg' }} 
                  color="gray.700" 
                  lineHeight="1.7" 
                  fontWeight="normal"
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.4s forwards"}
                >
                            {project.description}
                          </Text>

                        {/* Tags */}
                        <HStack spacing={3} flexWrap="wrap" gap={3} mb={{ base: 0, lg: 6 }} align="flex-start">
                          {project.tags.map((tag, index) => (
                    <Tag
                      key={index}
                                size="md"
                                bg="#F3F8FE"
                                color="#5A7A9A"
                                borderRadius="lg"
                                fontWeight="medium"
                                fontSize={{ base: 'sm', md: 'md' }}
                                px={4}
                                py={2}
                                _hover={{ bg: '#E1F0FE', color: '#5A7A9A', cursor: 'pointer' }}
                      opacity={isClosing ? 1 : 0}
                      transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                      animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : `contentSlideIn 0.6s ease-out ${0.5 + (index * 0.1)}s forwards`}
                              >
                                {tag}
                              </Tag>
                          ))}
                        </HStack>
                      </VStack>

                                         {/* Image Section */}
                     <Box w="full">
                <Box
                        w="full"
                         h={{ base: "250px", md: "350px", lg: "450px", xl: "600px" }}
                        borderRadius="xl"
                        overflow="hidden"
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.6s forwards"}
                      >
                  <Image
                          src={project.imageSrc}
                          alt={project.imageAlt}
                    w="full"
                    h="full"
                    objectFit="cover"
                    borderRadius="12px"
                  />
                    </Box>
              </Box>
                  </VStack>
                </Box>

              {/* Second Section - Additional Case Study Content (Full Width) */}
              <VStack align="start" spacing={12} pt={16} pb={20} w="full" maxW="1000px" mx="auto">
                {project.title === 'Engaging health tracking' ? (
                  <>
                    
                    {/* TL;DR Section */}
                <Box
                      ref={tlDrRef}
                  data-section="tl-dr"
                  opacity={tlDrInView || isMobile ? 1 : 0}
                  transform={tlDrInView || isMobile ? 'translateY(0)' : 'translateY(20px)'}
                  transition={isMobile ? "none" : "opacity 0.6s ease-out, transform 0.6s ease-out"}
                    >
                      <Box
                        bg="#F8FAFC"
                        border="1px solid"
                        borderColor="#E2E8F0"
                        borderRadius="xl"
                        p={6}
                        mb={6}
                      >
                        <Text fontSize="lg" fontWeight="bold" color="black" mb={3}>
                          TL;DR
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.7" fontWeight="normal">
                          I created a fluid intake tracker for the d.CARE app that made daily monitoring easier and more engaging for dialysis patients. By adding streaks, daily tips, and simple edit flows, I turned a repetitive task into a motivating habit. The feature launched successfully with the rebranded app, praised as "fun, useful, super," and highlights my strength in leading remote-first, patient-centered design.
                        </Text>
                      </Box>
                </Box>

                    {/* Background Section */}
                <Box
                      ref={backgroundRef}
                  data-section="background"
                  opacity={backgroundInView || isMobile ? 1 : 0}
                  transform={backgroundInView || isMobile ? 'translateY(0)' : 'translateY(20px)'}
                  transition={isMobile ? "none" : "opacity 0.6s ease-out, transform 0.6s ease-out"}
                    >
                      <VStack align="start" spacing={6}>
                        <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                          Background
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          The client provides renal care to 38,000 patients across 23 countries. Their digital platform, d.CARE, had been mainly used for viewing lab results.
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          I observed that fluid intake management was a critical pain point for dialysis patients. For those not producing urine, accurate tracking is essential but often neglected. At the same time, healthcare teams lacked reliable data to support patient care. This gap made fluid tracking a high-impact opportunity for both patients and clinicians.
                        </Text>
                        
                      </VStack>
                </Box>

                    {/* My Role Section */}
                <Box
                      ref={roleRef}
                  data-section="role"
                  opacity={roleInView || isMobile ? 1 : 0}
                  transform={roleInView || isMobile ? 'translateY(0)' : 'translateY(20px)'}
                  transition={isMobile ? "none" : "opacity 0.6s ease-out, transform 0.6s ease-out"}
                    >
                      <VStack align="start" spacing={6} pt={8}>
                        <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                          My role
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          I was the lead designer, responsible for:
                        </Text>
                        <Box pl={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • Research and analysis of patient and stakeholder needs
                            <br />• Ideation, user flows, and prototyping in Figma
                            <br />• UX and UI design for onboarding, logging, and gamification features
                            <br />• Contributing to branding and illustration integration
                            <br />• Collaborating with engineers to assess feasibility
                            <br />• Documenting designs in Figma for consistency across the product
                          </Text>
                        </Box>
                        
                      </VStack>
                </Box>

                    {/* Tools and ways of working Section */}
                <Box
                      ref={toolsRef}
                  data-section="tools"
                  opacity={toolsInView || isMobile ? 1 : 0}
                  transform={toolsInView || isMobile ? 'translateY(0)' : 'translateY(20px)'}
                  transition={isMobile ? "none" : "opacity 0.6s ease-out, transform 0.6s ease-out"}
                    >
                      <VStack align="start" spacing={6} pt={8}>
                        <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                          Tools and ways of working
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          This was the first remote-first project with this client during the pandemic, so we had to adapt our tools and processes:
                        </Text>
                        <Box pl={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • <Text as="span" fontWeight="semibold">Figma</Text> – used for prototyping, design system documentation, and real-time collaboration with engineers and stakeholders
                            <br />• <Text as="span" fontWeight="semibold">Remote workshops</Text> – adapted traditional co-creation sessions with stakeholders and clinicians into flexible online formats
                            <br />• <Text as="span" fontWeight="semibold">Remote user testing</Text> – facilitated by nurses with selected patients, supported by digital tools for collecting feedback
                            <br />• <Text as="span" fontWeight="semibold">Continuous communication</Text> – frequent syncs with engineering and stakeholders to problem-solve quickly and keep alignment despite distributed teams
                          </Text>
                        </Box>
                      </VStack>
                </Box>

                    {/* Challenge Section */}
                <Box
                      ref={challengeRef}
                  data-section="challenge"
                  opacity={challengeInView || isMobile ? 1 : 0}
                  transform={challengeInView || isMobile ? 'translateY(0)' : 'translateY(20px)'}
                  transition={isMobile ? "none" : "opacity 0.6s ease-out, transform 0.6s ease-out"}
                    >
                      <VStack align="start" spacing={6} pt={8}>
                        <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                          Challenge
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          Changing patient behavior is difficult, and fluid intake is one of the hardest aspects for dialysis patients to manage. The challenge was to create an experience that:
                        </Text>
                        <Box pl={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • Encouraged daily input without feeling like a burden
                            <br />• Motivated patients to stay within safe intake levels
                            <br />• Provided clinicians with accurate data for treatment discussions
                            <br />• Worked well for elderly patients with varying digital literacy
                          </Text>
                        </Box>
                        
                      </VStack>
                </Box>

                    {/* Process and solution Section */}
                <Box
                      ref={processRef}
                  data-section="process"
                  opacity={processInView || isMobile ? 1 : 0}
                  transform={processInView || isMobile ? 'translateY(0)' : 'translateY(20px)'}
                  transition={isMobile ? "none" : "opacity 0.6s ease-out, transform 0.6s ease-out"}
                      style={{ 
                        width: '100%',
                        // Force visibility on mobile as fallback
                        ...(isMobile && { 
                          opacity: 1, 
                          transform: 'translateY(0)',
                          visibility: 'visible'
                        })
                      }}
                    >
                      <VStack align="start" spacing={6} pt={8} w="full">
                        <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                          Process and solution
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          <Text as="span" fontWeight="semibold">Research & alignment</Text>
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          I reviewed insights from previous internal research and conducted workshops with stakeholders to clarify goals. I noticed that earlier concepts had focused mainly on data accuracy, but less on patient motivation. This observation shaped my design direction: make the experience as motivating as it is precise.
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                          <Text as="span" fontWeight="semibold">Concept & prototyping</Text>
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          I mapped user stories with stakeholders and translated them into initial flows. Given the sensitivity of dialysis care, I decided to prototype early and often in Figma so we could validate flows remotely.
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mt={3}>
                          Key design elements included:
                        </Text>
                        <Box pl={4} mb={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • Onboarding to explain why logging matters
                            <br />• Fluid logging with simple add/edit flows
                            <br />• Gamification with streak cards to reward consistency
                            <br />• Customization so patients could adapt the tool to their habits
                            <br />• Guidance via "Thirst tips" for practical daily advice
                          </Text>
                        </Box>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          <Text as="span" fontWeight="semibold">Design & systems</Text>
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          I created a design system in Figma for consistency across screens and alignment with the client's recent rebrand. I noticed that accessibility would be critical (elderly patients, small devices), so I made decisions on contrast, typography, and interaction size accordingly.
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                          <Text as="span" fontWeight="semibold">Delivery & validation</Text>
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          I worked closely with engineers to ensure all states and interactions were documented, reducing ambiguity in handoff. Pandemic restrictions limited formal usability testing, so I adapted by coordinating nurse-facilitated feedback sessions with patients. This decision gave us practical validation while respecting safety constraints.
                        </Text>
                      </VStack>

                      {/* Lottie Animations */}
                  <VStack spacing={6} align="center" pt={12} w="full" ref={animationsRef} data-section="animations">
                        {/* Responsive grid layout: mobile (stacked), sm+ (3-column) */}
                        <Box 
                          w="full"
                          display="grid"
                          gridTemplateColumns={{
                            base: "1fr",           // Mobile: single column
                            sm: "repeat(3, 1fr)"   // sm and up: 3 columns
                          }}
                          gap={{ base: 12, sm: 16, lg: 32 }}
                          alignItems="center"
                        >
                          {/* Animation 1 */}
                          <Box 
                            w={{ base: "80%", sm: "full" }}
                            minH={{ base: "300px", sm: "350px", lg: "400px" }}
                            borderRadius="3xl" 
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx={{ base: "auto", sm: "0" }}
                            onMouseEnter={() => {
                              setIsHovered1(true)
                              if (fluid1Ref.current) fluid1Ref.current.play()
                            }}
                            onMouseLeave={() => {
                              setIsHovered1(false)
                              if (fluid1Ref.current) fluid1Ref.current.pause()
                            }}
                            cursor="pointer"
                          >
                            {fluid1Animation ? (
                              <Lottie
                                lottieRef={fluid1Ref}
                                animationData={fluid1Animation}
                                loop={true}
                                autoplay={false}
                                style={{ width: '100%', height: '100%' }}
                              />
                            ) : (
                              <Text fontSize="sm" color="gray.500">Loading animation 1... {fluid1Animation ? 'Loaded' : 'Not loaded'}</Text>
                            )}
                          </Box>

                          {/* Animation 2 */}
                          <Box 
                            w={{ base: "80%", sm: "full" }}
                            minH={{ base: "300px", sm: "350px", lg: "400px" }}
                            borderRadius="3xl" 
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx={{ base: "auto", sm: "0" }}
                            onMouseEnter={() => {
                              setIsHovered2(true)
                              if (fluid2Ref.current) fluid2Ref.current.play()
                            }}
                            onMouseLeave={() => {
                              setIsHovered2(false)
                              if (fluid2Ref.current) fluid2Ref.current.pause()
                            }}
                            cursor="pointer"
                          >
                            {fluid2Animation ? (
                              <Lottie
                                lottieRef={fluid2Ref}
                                animationData={fluid2Animation}
                                loop={true}
                                autoplay={false}
                                style={{ width: '100%', height: '100%' }}
                              />
                            ) : (
                              <Text fontSize="sm" color="gray.500">Loading animation...</Text>
                            )}
                          </Box>

                          {/* Animation 3 */}
                          <Box 
                            w={{ base: "80%", sm: "full" }}
                            minH={{ base: "300px", sm: "350px", lg: "400px" }}
                            borderRadius="3xl" 
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx={{ base: "auto", sm: "0" }}
                            onMouseEnter={() => {
                              setIsHovered3(true)
                              if (fluid3Ref.current) fluid3Ref.current.play()
                            }}
                            onMouseLeave={() => {
                              setIsHovered3(false)
                              if (fluid3Ref.current) fluid3Ref.current.pause()
                            }}
                            cursor="pointer"
                          >
                            {fluid3Animation ? (
                              <Lottie
                                lottieRef={fluid3Ref}
                                animationData={fluid3Animation}
                                loop={true}
                                autoplay={false}
                                style={{ width: '100%', height: '100%' }}
                              />
                            ) : (
                              <Text fontSize="sm" color="gray.500">Loading animation...</Text>
                            )}
                          </Box>
                        </Box>
                      </VStack>

                      {/* Feature Cards Section */}
                      <VStack spacing={{ base: 12, md: 8, lg: 8 }} align="center" pt={{ base: 20, md: 16, lg: 16 }} w="full">
                        {/* Mobile: Stacked layout (base) */}
                        <Box 
                          w="full"
                          display={{ base: "block", sm: "none", md: "none" }}
                        >
                          <VStack spacing={12} align="center" w="full">
                            {/* Gamification Card - Mobile */}
                            <VStack spacing={6} align="center" w="full">
                              <Box 
                                w="80%"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                mx="auto"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/gamification.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Gamification feature"
                                  w="full"
                                  h="auto"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={3} align="center" w="80%" mx="auto" textAlign="center">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Gamification
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Use of patient-centric gamification to improve patient engagement by making their experience more personalized.
                                </Text>
                              </VStack>
                            </VStack>

                            {/* Customization Card - Mobile */}
                            <VStack spacing={6} align="center" w="full">
                              <Box 
                                w="80%"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                mx="auto"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/customization.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Customization feature"
                                  w="full"
                                  h="auto"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={3} align="center" w="80%" mx="auto" textAlign="center">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Customization
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Customization allows our patients to optimize their experience with the feature, and also giving them the sense of control.
                                </Text>
                              </VStack>
                            </VStack>

                            {/* Guidance Card - Mobile */}
                            <VStack spacing={6} align="center" w="full">
                              <Box 
                                w="80%"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                mx="auto"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/guidelines.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Guidelines feature"
                                  w="full"
                                  h="auto"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={3} align="center" w="80%" mx="auto" textAlign="center">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Guidelines
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Provide the patient successively with guidance through daily tips on how they can more easily manage their fluid intake.
                                </Text>
                              </VStack>
                            </VStack>
                          </VStack>
                        </Box>

                        {/* sm: Side-by-side layout (image left, text right) */}
                        <Box 
                          w="full"
                          display={{ base: "none", sm: "block", md: "none" }}
                        >
                          <VStack spacing={8} align="stretch" w="full">
                            {/* Gamification Card - Side by side */}
                            <Box 
                              display="grid"
                              gridTemplateColumns="0.3fr 0.7fr"
                              gap={6}
                              alignItems="center"
                              minH="200px"
                            >
                              <Box 
                                w="full"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/gamification.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Gamification feature"
                                  w="full"
                                  h="full"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={4} align="start" justify="center" h="full">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Gamification
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Use of patient-centric gamification to improve patient engagement by making their experience more personalized.
                                </Text>
                              </VStack>
                            </Box>

                            {/* Customization Card - Side by side */}
                            <Box 
                              display="grid"
                              gridTemplateColumns="0.3fr 0.7fr"
                              gap={6}
                              alignItems="center"
                              minH="200px"
                            >
                              <Box 
                                w="full"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/customization.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Customization feature"
                                  w="full"
                                  h="full"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={4} align="start" justify="center" h="full">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Customization
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Customization allows our patients to optimize their experience with the feature, and also giving them the sense of control.
                                </Text>
                              </VStack>
                            </Box>

                            {/* Guidance Card - Side by side */}
                            <Box 
                              display="grid"
                              gridTemplateColumns="0.3fr 0.7fr"
                              gap={6}
                              alignItems="center"
                              minH="200px"
                            >
                              <Box 
                                w="full"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/guidelines.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Guidelines feature"
                                  w="full"
                                  h="full"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={4} align="start" justify="center" h="full">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Guidelines
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Provide the patient successively with guidance through daily tips on how they can more easily manage their fluid intake.
                                </Text>
                              </VStack>
                            </Box>
                          </VStack>
                        </Box>

                        {/* md and up: 3-column grid layout */}
                        <Box 
                          w="full"
                          display={{ base: "none", sm: "none", md: "block" }}
                        >
                          <Box 
                            w="full"
                            display="grid"
                            gridTemplateColumns={{
                              base: "1fr",           // Mobile: single column
                              md: "repeat(3, 1fr)"   // md and up: 3 columns
                            }}
                            gap={{ base: 12, md: 16, lg: 32 }}
                            alignItems="start"
                          >
                            {/* Gamification Card - 3-column */}
                            <VStack spacing={6} align="start" w="full">
                              <Box 
                                w="full"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                aspectRatio="1"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/gamification.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Gamification feature"
                                  w="full"
                                  h="full"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={3} align="start" w="full">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Gamification
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Use of patient-centric gamification to improve patient engagement by making their experience more personalized.
                                </Text>
                              </VStack>
                            </VStack>

                            {/* Customization Card - 3-column */}
                            <VStack spacing={6} align="start" w="full">
                              <Box 
                                w="full"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                aspectRatio="1"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/customization.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Customization feature"
                                  w="full"
                                  h="full"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={3} align="start" w="full">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Customization
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Customization allows our patients to optimize their experience with the feature, and also giving them the sense of control.
                                </Text>
                              </VStack>
                            </VStack>

                            {/* Guidance Card - 3-column */}
                            <VStack spacing={6} align="start" w="full">
                              <Box 
                                w="full"
                                borderRadius="3xl" 
                                overflow="hidden"
                                boxShadow="lg"
                                bg="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                aspectRatio="1"
                              >
                                <Image
                                  src={getPublicUrl('IMAGES', 'images/guidelines.png', 'w=600,h=400,fit=cover,format=webp')}
                                  alt="Guidelines feature"
                                  w="full"
                                  h="full"
                                  objectFit="contain"
                                />
                              </Box>
                              <VStack spacing={3} align="start" w="full">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                  Guidelines
                                </Text>
                                <Text fontSize="md" color="gray.700" lineHeight="1.8" fontWeight="normal">
                                  Provide the patient successively with guidance through daily tips on how they can more easily manage their fluid intake.
                                </Text>
                              </VStack>
                            </VStack>
                          </Box>
                        </Box>
                      </VStack>
                </Box>

                    {/* Results Section */}
                <Box
                      ref={resultsRef}
                  data-section="results"
                  opacity={resultsInView || isMobile ? 1 : 0}
                  transform={resultsInView || isMobile ? 'translateY(0)' : 'translateY(20px)'}
                  transition={isMobile ? "none" : "opacity 0.6s ease-out, transform 0.6s ease-out"}
                    >
                      <VStack align="start" spacing={6} pt={8}>
                        <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                          Results
                        </Text>
                        <Box pl={4} mb={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • <Text as="span" fontWeight="semibold">Observation:</Text> Patients often skipped daily logging because it felt repetitive.
                            <br />• <Text as="span" fontWeight="semibold">Decision:</Text> I introduced streak tracking, daily guidance, and quick edit flows to make logging lighter and more rewarding.
                            <br />• <Text as="span" fontWeight="semibold">Impact:</Text> The feature launched as part of the rebranded d.CARE app, was adopted by patients, and described as "fun," "useful," and "super." The design patterns developed here are now influencing other patient-facing features.
                          </Text>
                        </Box>
                      </VStack>
                </Box>


              </>
            ) : project.title === 'Smarter customer portal' ? (
              <>
                {/* TL;DR Section */}
                <Box
                  ref={tlDrRef}
                  data-section="tl-dr"
                  opacity={tlDrInView ? 1 : 0}
                  transform={tlDrInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <Box
                    bg="#F8FAFC"
                    border="1px solid"
                    borderColor="#E2E8F0"
                    borderRadius="xl"
                    p={6}
                    mb={6}
                  >
                    <Text fontSize="lg" fontWeight="bold" color="black" mb={3}>
                      TL;DR
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.7" fontWeight="normal">
                          I created a proof of concept for Alfa Laval's customer portal, My Pages, to centralize product documentation, service, and support. I noticed customers struggled with scattered information and unclear service flows, so I introduced a concept built on prioritized hypotheses, user personas, and prototyped flows. The PoC was well received, adopted internally, and later moved into Alfa Laval's production pipeline.
                    </Text>
                  </Box>
                </Box>

                {/* Background Section */}
                <Box
                  ref={backgroundRef}
                  data-section="background"
                  opacity={backgroundInView ? 1 : 0}
                  transform={backgroundInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Background
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      Alfa Laval is a global leader in heat transfer, separation, and fluid handling. Their products are highly technical and regulated, meaning customers rely heavily on documentation and after-sales support.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I observed that customers often struggled to find relevant information, order spare parts, or book service. Support was fragmented and slow, leading to frustration and inefficiency. Alfa Laval wanted a portal to solve this: giving customers an overview of their products, documentation, and related services in one place.
                    </Text>
                  </VStack>
                </Box>

                {/* My Role Section */}
                <Box
                  ref={roleRef}
                  data-section="role"
                  opacity={roleInView ? 1 : 0}
                  transform={roleInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      My role
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      As the sole designer, I was responsible for:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • Planning and facilitating a shortened design sprint
                        <br />• Collaborating with stakeholders to define needs and scope
                        <br />• Creating user personas and mapping pain points
                        <br />• Developing hypotheses to guide an MVP vision
                        <br />• UX/UI design and prototyping of key portal flows
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Challenge Section */}
                <Box
                  ref={challengeRef}
                  data-section="challenge"
                  opacity={challengeInView ? 1 : 0}
                  transform={challengeInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Challenge
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      There was no unified customer portal. Customers faced:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • Scattered product information
                        <br />• Unclear booking flows for service or spare parts
                        <br />• Limited support availability, often via phone queues
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mt={4}>
                      The challenge was to explore how digitization could improve these areas and strengthen Alfa Laval's relationship with customers.
                    </Text>
                  </VStack>
                </Box>

                {/* Process and solution Section */}
                <Box
                  ref={processRef}
                  data-section="process"
                  opacity={processInView ? 1 : 0}
                  transform={processInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                  style={{ width: '100%' }}
                >
                  <VStack align="start" spacing={6} pt={8} w="full">
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Process and solution
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Research & alignment</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I met with stakeholders to clarify scope and helped facilitate a 3-day design sprint (shortened from the usual 5) to gather insights quickly. During the sprint, I contributed to exercises that shaped the direction and then created user personas to ground our decisions in realistic customer needs.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                      <Text as="span" fontWeight="semibold">Concept & prototyping</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      From the sprint, I identified three main hypotheses:
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • Centralized documentation would make compliance and traceability simpler.
                        <br />• Simplified service booking would reduce friction and errors.
                        <br />• Integrated support would provide faster, more relevant help.
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I decided to prototype these hypotheses into flows directly, focusing on a product overview, registration, and accessory ordering. This made abstract needs tangible and gave stakeholders a clear vision of an MVP.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                      <Text as="span" fontWeight="semibold">Design & systems</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I created conceptual flows in Figma that balanced functional clarity with a scalable structure. Each design mapped back to a user need and a prioritized hypothesis.
                    </Text>
                  </VStack>
                </Box>

                {/* Video Section */}
                <VStack spacing={12} align="center" pt={16} w="full">
                  {/* Webshop Video */}
                  <Box w="full" borderRadius="xl" overflow="hidden" position="relative">
                    <video 
                      controls 
                      preload="metadata" 
                      poster={getPublicUrl('IMAGES', 'images/webshop_thumbnail.png', 'w=800,h=450,fit=cover,format=webp')}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    >
                      <source src={getPublicUrl('VIDEOS', 'movies/webshop_web.mp4', 'quality=80,format=mp4')} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>

                  {/* Register Product Video */}
                  <Box w="full" borderRadius="xl" overflow="hidden" position="relative">
                    <video 
                      controls 
                      preload="metadata" 
                      poster={getPublicUrl('IMAGES', 'images/register_product_thumbnail.png', 'w=800,h=450,fit=cover,format=mp4')}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    >
                      <source src={getPublicUrl('VIDEOS', 'movies/register product_web.mp4', 'quality=80,format=mp4')} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                </VStack>

                {/* Results Section */}
                <Box
                  ref={resultsRef}
                  data-section="results"
                  opacity={resultsInView ? 1 : 0}
                  transform={resultsInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Results
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Observation:</Text> Customers struggled with scattered information and unclear service booking, while Alfa Laval lacked a unified portal.
                        <br />• <Text as="span" fontWeight="semibold">Decision:</Text> I supported the facilitation of a 3-day sprint and took ownership of turning the outcomes into personas and prototyped flows.
                        <br />• <Text as="span" fontWeight="semibold">Impact:</Text> The PoC was well received, adopted internally, and gradually moved into the production pipeline. It set the foundation for a scalable customer portal and was more ambitious than originally expected.
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Conclusion Text */}
                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.6s forwards"}
                >
                  <VStack align="start" spacing={6} pt={8}>

                  </VStack>
                </Box>
              </>
            ) : project.title === 'Tool rentals made digital' ? (
              <>
                {/* TL;DR Section */}
                <Box
                  ref={tlDrRef}
                  data-section="tl-dr"
                  opacity={tlDrInView ? 1 : 0}
                  transform={tlDrInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <Box
                    bg="#F8FAFC"
                    border="1px solid"
                    borderColor="#E2E8F0"
                    borderRadius="xl"
                    p={6}
                    mb={6}
                  >
                    <Text fontSize="lg" fontWeight="bold" color="black" mb={3}>
                      TL;DR
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.7" fontWeight="normal">
                      I designed Clas Ohlson's digital rental experience from the ground up. With no existing online flow, only scattered in-store pilots, I noticed requirements were broad and unclear. To reduce risk, I decided to move directly into hi-fi prototypes in Figma, giving stakeholders something concrete to react to. The service launched in Sweden, Norway, and Finland using nearly all of my delivered designs, showing the impact of fast, collaborative design under pressure.
                    </Text>
                  </Box>
                </Box>

                {/* Clas Collage Image */}
                <Box w="full" borderRadius="3xl" overflow="hidden" mb={8}>
                  <Image
                    src={getPublicUrl('IMAGES', 'images/clascollage.png', 'w=1200,h=800,fit=cover,format=webp')}
                    alt="Clas Ohlson Rental Service Collage"
                    w="full"
                    h="auto"
                    objectFit="contain"
                  />
                </Box>

                {/* Background Section */}
                <Box
                  ref={backgroundRef}
                  data-section="background"
                  opacity={backgroundInView ? 1 : 0}
                  transform={backgroundInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Background
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      Clas Ohlson is one of Scandinavia's largest home improvement chains with more than 230 stores. Since 2016, they had offered tool rentals in a few pilot stores, but the service was in-store only and difficult to scale.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      With growing demand for renting instead of owning — and sustainability as a strategic driver — Clas Ohlson wanted to expand tool rentals into a full digital service. The initiative, Rent at Clas, aimed to let customers book tools online and enable staff to manage bookings efficiently, while supporting business goals like add-on sales (e.g. detergent with a carpet cleaner), satisfaction, and rental volume.
                    </Text>
                  </VStack>
                </Box>

                {/* My Role Section */}
                <Box
                  ref={roleRef}
                  data-section="role"
                  opacity={roleInView ? 1 : 0}
                  transform={roleInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      My role
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      I was the main designer, responsible for:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • Reviewing existing pilots and requirements with product managers
                        <br />• Defining booking and management flows from scratch
                        <br />• Designing and prototyping hi-fi screens in Figma
                        <br />• Iterating quickly with stakeholders under tight timelines
                        <br />• Preparing detailed developer handoff with states and interaction notes
                        <br />• Balancing consistency through a hybrid design system during an ongoing rebrand
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Challenge Section */}
                <Box
                  ref={challengeRef}
                  data-section="challenge"
                  opacity={challengeInView ? 1 : 0}
                  transform={challengeInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Challenge
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      There was no existing digital rental journey to build on — only fragmented store processes and a list of loosely defined requirements. Key challenges were:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • Defining a customer booking flow and staff management tool from scratch
                        <br />• Working with limited time and high expectations for launch
                        <br />• Designing during an ongoing rebrand, where the style guide was not yet finalized
                        <br />• Supporting business KPIs such as rental volume, add-on sales, and satisfaction
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Process and solution Section */}
                <Box
                  ref={processRef}
                  data-section="process"
                  opacity={processInView ? 1 : 0}
                  transform={processInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                  style={{ width: '100%' }}
                >
                  <VStack align="start" spacing={6} pt={8} w="full">
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Process and solution
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Research & alignment</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I started by reviewing pilots and related services like Clas Fixare to identify patterns. My observation was that requirements were scattered, which risked slowing progress. To create focus, I worked with stakeholders to map user stories and prioritize them against KPIs.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                      <Text as="span" fontWeight="semibold">Concept & prototyping</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      Given the deadline, I decided to skip low-fidelity exploration and design directly in hi-fi. This gave stakeholders something tangible within days, enabling fast feedback and alignment. I shared interactive Figma prototypes that covered full booking and staff flows, which helped reveal gaps and refine priorities early.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                      <Text as="span" fontWeight="semibold">Design & systems</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      Because of the rebrand, I built a hybrid system that combined current components with upcoming visual identity. This ensured consistency and allowed the project to move forward without waiting for the new system to finalize.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                      <Text as="span" fontWeight="semibold">Delivery & validation</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I prepared a developer-ready Figma handoff with flows, states, and interaction notes to reduce uncertainty. Validation was limited by the pandemic, so I adapted by combining stakeholder reviews with lightweight remote testing, ensuring the designs were robust enough to launch.
                    </Text>
                  </VStack>
                </Box>

                {/* Video and Image Section */}
                <VStack spacing={12} align="center" pt={16} w="full">
                  {/* Video */}
                  <Box w="full" borderRadius="xl" overflow="hidden" position="relative">
                    <video 
                      controls 
                      preload="metadata" 
                      poster={getPublicUrl('IMAGES', 'images/clasrental_thumbnail.png', 'w=800,h=450,fit=cover,format=webp')}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    >
                      <source src={getPublicUrl('VIDEOS', 'movies/clasrental.mp4', 'quality=80,format=mp4')} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>

                  {/* Store Staff UI Image */}
                  <Box w="full" borderRadius="xl" overflow="hidden" bg="white">
                    <Image
                      src={getPublicUrl('IMAGES', 'images/storestaffui.png', 'w=800,h=600,fit=cover,format=webp')}
                      alt="Store Staff UI Interface"
                      w="full"
                      h="auto"
                      objectFit="contain"
                    />
                  </Box>
                </VStack>

                {/* Results Section */}
                <Box
                  ref={resultsRef}
                  data-section="results"
                  opacity={resultsInView ? 1 : 0}
                  transform={resultsInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Results
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Observation:</Text> There was no existing digital rental journey, and requirements were scattered. Staff also struggled with fragmented processes in the pilots.
                        <br />• <Text as="span" fontWeight="semibold">Decision:</Text> I moved directly to hi-fi prototypes in Figma, designed streamlined flows for both customers and staff, and created a hybrid design system to keep momentum during the rebrand.
                        <br />• <Text as="span" fontWeight="semibold">Impact:</Text> The service launched in September 2020 across Sweden, Norway, and Finland using nearly all of my delivered designs. Customers could book tools online, staff could manage rentals smoothly, and the solution helped Clas Ohlson expand rentals at scale under tight deadlines.
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Conclusion Text */}
                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.6s forwards"}
                >
                  <VStack align="start" spacing={6} pt={8}>

                  </VStack>
                </Box>
              </>
            ) : project.title === 'Simplifying energy reports' ? (
              <>
                {/* TL;DR Section */}
                <Box
                  ref={tlDrRef}
                  data-section="tl-dr"
                  opacity={tlDrInView ? 1 : 0}
                  transform={tlDrInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <Box
                    bg="#F8FAFC"
                    border="1px solid"
                    borderColor="#E2E8F0"
                    borderRadius="xl"
                    p={6}
                    mb={6}
                  >
                    <Text fontSize="lg" fontWeight="bold" color="black" mb={3}>
                      TL;DR
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.7" fontWeight="normal">
                          I designed a new reporting feature for Modity's customer portal to make complex energy trading data clearer and more actionable. I noticed that customers struggled to reconcile invoices with the limited data available, so I created modular portfolio reports with monthly and yearly breakdowns. The feature was implemented in the live portal and praised by both Modity and their customers for turning a highly complex domain into something simple and useful.
                    </Text>
                  </Box>
                </Box>

                {/* Background Section */}
                <Box
                  ref={backgroundRef}
                  data-section="background"
                  opacity={backgroundInView ? 1 : 0}
                  transform={backgroundInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Background
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      Modity is one of Sweden's leading energy traders, helping companies manage their electricity and gas needs.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      They had a customer portal, but it lacked a comprehensive reporting feature. Customers wanted to see their total electricity purchase outcomes, break them down into detailed reports, and compare those reports directly against invoices. Without this, analysis and reconciliation required time-consuming manual work.
                    </Text>
                  </VStack>
                </Box>

                {/* My Role Section */}
                <Box
                  ref={roleRef}
                  data-section="role"
                  opacity={roleInView ? 1 : 0}
                  transform={roleInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      My role
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      I was the sole designer on the project, responsible for:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • Collaborating with business stakeholders, PM, and engineers
                        <br />• Researching the energy trading domain to understand complexity
                        <br />• Facilitating workshops to define requirements
                        <br />• Interviewing customers and translating findings into user stories
                        <br />• UX/UI design, wireframing, and prototyping in Figma
                        <br />• Running user feedback sessions and iterating on designs
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Challenge Section */}
                <Box
                  ref={challengeRef}
                  data-section="challenge"
                  opacity={challengeInView ? 1 : 0}
                  transform={challengeInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Challenge
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      The main challenge was the complexity of the energy trading domain, which was completely new to me. To create value, I had to understand enough of the domain to design reports that customers could actually use without being overwhelmed.
                    </Text>
                  </VStack>
                </Box>

                {/* Process and solution Section */}
                <Box
                  ref={processRef}
                  data-section="process"
                  opacity={processInView ? 1 : 0}
                  transform={processInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                  style={{ width: '100%' }}
                >
                  <VStack align="start" spacing={6} pt={8} w="full">
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Process and solution
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Research & alignment</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I started with stakeholder workshops to clarify requirements and success criteria. I observed that different teams had very different priorities, which risked creating a bloated solution. To avoid this, I focused the design direction around concrete customer tasks like reconciling invoices and tracking purchase outcomes.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                      <Text as="span" fontWeight="semibold">Concept & prototyping</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I interviewed customers to capture how they currently managed reporting and turned those insights into user stories. Rather than jumping straight into polished screens, I decided to begin with low-fidelity wireframes. This allowed me to simplify the structure of reports before layering on visual detail.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3} mt={4}>
                      <Text as="span" fontWeight="semibold">Design & iteration</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      I prototyped flows for modular portfolio reports in Figma, showing both overviews and detailed breakdowns. I scheduled feedback sessions with users and stakeholders, iterating on clarity and reducing jargon. The final design presented data in a clear, scannable format that supported both quick checks and deep dives.
                    </Text>
                  </VStack>
                </Box>

                {/* Video Section */}
                <VStack spacing={12} align="center" pt={16} w="full">
                  <Box w="full" borderRadius="xl" overflow="hidden" position="relative">
                    <video 
                      controls 
                      preload="metadata" 
                      poster={getPublicUrl('IMAGES', 'images/modity_thumbnail.png', 'w=800,h=450,fit=cover,format=webp')}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    >
                      <source src={getPublicUrl('VIDEOS', 'movies/modity_web.mp4', 'quality=80,format=mp4')} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                </VStack>

                {/* Results Section */}
                <Box
                  ref={resultsRef}
                  data-section="results"
                  opacity={resultsInView ? 1 : 0}
                  transform={resultsInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                      Results
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Observation:</Text> Customers struggled to reconcile invoices because the portal lacked clear, detailed reporting.
                        <br />• <Text as="span" fontWeight="semibold">Decision:</Text> I simplified requirements into core tasks, created wireframes to handle domain complexity, and iterated based on direct user feedback.
                        <br />• <Text as="span" fontWeight="semibold">Impact:</Text> The new portfolio reporting feature was implemented in the live portal. Customers could now run their own analyses, compare reports to invoices, and save time on manual work. Modity praised the solution for translating complex requirements into a simple, useful interface delivered in a short timeframe.
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Conclusion Text */}
                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.6s forwards"}
                >
                  <VStack align="start" spacing={6} pt={8}>

                  </VStack>
                </Box>
              </>
            ) : (
              <>
                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.6s forwards"}
                >
                  <Text fontSize="lg" fontWeight="medium" color="black">
                    Project Overview
                  </Text>
                </Box>
                
                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.7s forwards"}
                >
                  <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.600" lineHeight="1.7" fontWeight="light">
                    This project involved extensive user research and iterative design processes. We conducted multiple rounds of user testing to ensure the final solution met both business requirements and user needs. The design system we created has since been adopted across multiple products in the portfolio.
                  </Text>
                </Box>
                
                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.8s forwards"}
                >
                  <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.600" lineHeight="1.7" fontWeight="light">
                    Our approach focused on understanding the user journey from initial discovery to final conversion. We mapped out pain points, created user personas, and developed wireframes that addressed the core user needs. The final design was tested with real users across different devices and screen sizes.
                  </Text>
                </Box>

                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.9s forwards"}
                >
                  <VStack align="start" spacing={4} pt={4}>
                    <Text fontSize="lg" fontWeight="medium" color="black">
                      Project Outcomes
                    </Text>
                    <Text fontSize="md" color="gray.600" lineHeight="1.7">
                      • Improved user engagement through intuitive navigation design
                      <br />• Reduced task completion time with streamlined workflows
                      <br />• Achieved high user satisfaction scores in post-launch surveys
                      <br />• Successfully launched across multiple platforms with consistent experience
                    </Text>
                  </VStack>
                </Box>

                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 1.0s forwards"}
                >
                  <VStack align="start" spacing={4} pt={4}>
                    <Text fontSize="lg" fontWeight="medium" color="black">
                      Technical Implementation
                    </Text>
                    <Text fontSize="md" color="gray.600" lineHeight="1.7">
                      The project was built using modern web technologies including React, TypeScript, and a component-based architecture. We implemented responsive design principles, accessibility features, and performance optimizations to ensure the best user experience across all devices.
                    </Text>
                  </VStack>
                </Box>
              </>
            )}
              </VStack>
            </Container>
        </Box>
    </Box>
  )
}
