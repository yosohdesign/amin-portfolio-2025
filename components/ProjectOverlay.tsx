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
  const cardBg = useColorModeValue('white', 'white')
  const tlDrRef = useRef(null)
  const backgroundRef = useRef(null)
  const roleRef = useRef(null)
  const toolsRef = useRef(null)
  const challengeRef = useRef(null)
  const processRef = useRef(null)
  const resultsRef = useRef(null)
  const conclusionRef = useRef(null)
  
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
    if (project.title === 'd.CARE: Health monitoring app') {
      const loadAnimations = async () => {
        try {
          console.log('Loading Lottie animations...')
          const [fluid1Res, fluid2Res, fluid3Res] = await Promise.all([
            fetch('/animations/fluid1.json?v=' + Date.now()),
            fetch('/animations/fluid2.json?v=' + Date.now()),
            fetch('/animations/fluid3.json?v=' + Date.now())
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

  // Setup Intersection Observers for content sections
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    
    const createObserver = (ref: React.RefObject<HTMLElement>, setter: (value: boolean) => void) => {
      if (ref.current) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setter(true)
            }
          },
          { threshold: 0.1, rootMargin: '-50px' }
        )
        observer.observe(ref.current)
        observers.push(observer)
      }
    }

    // Create observers for each section
    createObserver(tlDrRef, setTlDrInView)
    createObserver(backgroundRef, setBackgroundInView)
    createObserver(roleRef, setRoleInView)
    createObserver(toolsRef, setToolsInView)
    createObserver(challengeRef, setChallengeInView)
    createObserver(processRef, setProcessInView)
    createObserver(resultsRef, setResultsInView)
    createObserver(conclusionRef, setConclusionInView)

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
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
        sx={{
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
                {project.title === 'd.CARE: Health monitoring app' ? (
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
                          I designed and delivered a <Text as="span" fontWeight="semibold" color="gray.900">fluid intake tracker</Text> for the d.CARE patient app, enabling dialysis patients to monitor their daily intake in a <Text as="span" fontWeight="semibold" color="gray.900">motivating, user-friendly way</Text>. Using Figma, design systems, and remote-first collaboration, I worked closely with engineers, stakeholders, and healthcare professionals to co-create the solution. Despite pandemic restrictions, we managed remote user testing with nurses and patients, and the feature launched with <Text as="span" fontWeight="semibold" color="gray.900">highly positive feedback</Text>.
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
                          The client provides life-enhancing renal care to <Text as="span" fontWeight="semibold" color="gray.900">38,000 patients across 23 countries</Text>. Their digital ecosystem, the d.CARE patient app, had mainly been used to view lab results and treatment values. Internally, it was clear the app had potential to become a more active companion in patients' daily health routines.
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          One of the most pressing needs was helping patients on dialysis monitor and manage fluid intake. For patients unable to produce urine, accurate tracking is <Text as="span" fontWeight="semibold" color="gray.900">critical but challenging to maintain</Text>.
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
                          I was the <Text as="span" fontWeight="semibold" color="gray.900">lead designer</Text> on this project, responsible for:
                        </Text>
                        <Box pl={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • <Text as="span" fontWeight="semibold">User research and analysis</Text>
                            <br />• <Text as="span" fontWeight="semibold">Ideation and concept development</Text>
                            <br />• <Text as="span" fontWeight="semibold">UX/UI design and prototyping</Text>
                            <br />• <Text as="span" fontWeight="semibold">Contributing to how branding and illustration were best integrated into the product</Text>
                            <br />• <Text as="span" fontWeight="semibold">Collaborating closely with engineers to ensure designs were feasible and practical</Text>
                            <br />• <Text as="span" fontWeight="semibold">Documenting and scaling designs into a Figma-based design system for consistency and reuse</Text>
                          </Text>
                        </Box>
                      </VStack>
                </Box>

                    {/* Tools and ways of working Section */}
                <Box
                      ref={toolsRef}
                  data-section="tools"
                  opacity={toolsInView ? 1 : 0}
                  transform={toolsInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
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
                  opacity={challengeInView ? 1 : 0}
                  transform={challengeInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                    >
                      <VStack align="start" spacing={6} pt={8}>
                        <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontWeight="medium" color="#3575D9" lineHeight="1.2">
                          Challenge
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          Changing patient behavior around fluid intake is <Text as="span" fontWeight="semibold" color="gray.900">difficult</Text>. Hemodialysis patients often struggle to stay within recommended limits. Our challenge was to design a solution that:
                        </Text>
                        <Box pl={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • <Text as="span" fontWeight="semibold">Encouraged patients to log their daily intake</Text>
                            <br />• <Text as="span" fontWeight="semibold">Made the experience motivating and easy</Text>
                            <br />• <Text as="span" fontWeight="semibold">Provided actionable guidance without overwhelming users</Text>
                            <br />• <Text as="span" fontWeight="semibold">Ensured accessibility and inclusivity for elderly patients</Text>
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
                          <Text as="span" fontWeight="semibold">Research and insights</Text>
                        </Text>
                        <Box pl={4} mb={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • <Text as="span" fontWeight="semibold">Stakeholder workshops</Text> to align on goals
                            <br />• <Text as="span" fontWeight="semibold">Leveraged prior internal research</Text> and interviews with healthcare staff
                            <br />• <Text as="span" fontWeight="semibold">Translated findings into user stories</Text> to anchor design in patient needs
                          </Text>
                        </Box>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          <Text as="span" fontWeight="semibold">Design approach</Text>
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                          We designed iteratively, keeping patient experience at the center:
                        </Text>
                        <Box pl={4}>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                            • <Text as="span" fontWeight="semibold">Onboarding</Text> – to introduce the tracker clearly and build trust
                            <br />• <Text as="span" fontWeight="semibold">Fluid logging</Text> – streamlined interactions to add, edit, and review intakes
                            <br />• <Text as="span" fontWeight="semibold">Gamification</Text> – streaks and achievement cards to drive consistency
                            <br />• <Text as="span" fontWeight="semibold">Customization</Text> – allowing patients to tailor the feature to their routines
                            <br />• <Text as="span" fontWeight="semibold">Guidance</Text> – daily "thirst tips" offering practical, bite-sized advice
                          </Text>
                        </Box>
                      </VStack>

                      {/* Lottie Animations */}
                  <VStack spacing={6} align="center" pt={12} w="full" ref={animationsRef} data-section="animations">
                        <HStack 
                          spacing={{ base: 6, md: 12, lg: 32 }} 
                          align="center" 
                          justify="space-between" 
                          w="full"
                          direction={{ base: 'column', lg: 'row' }}
                        >
                          {/* Animation 1 */}
                          <Box 
                            w="full"
                            h={{ base: "300px", md: "500px" }}
                            borderRadius="3xl" 
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
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
                            w="full"
                            h={{ base: "300px", md: "500px" }}
                            borderRadius="3xl" 
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
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
                            w="full"
                            h={{ base: "300px", md: "500px" }}
                            borderRadius="3xl" 
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
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
                        </HStack>
                      </VStack>

                      {/* Feature Cards Section */}
                      <VStack spacing={8} align="center" pt={16} w="full">
                        <HStack 
                          spacing={{ base: 6, md: 12, lg: 32 }} 
                          align="start" 
                          justify="space-between" 
                          w="full"
                          direction={{ base: 'column', lg: 'row' }}
                        >
                          {/* Gamification Card */}
                          <VStack spacing={4} align="start" w="full">
                            <Box 
                              w="full"
                              borderRadius="3xl" 
                              overflow="hidden"
                              boxShadow="lg"
                              bg="white"
                            >
                              <Image
                                src={getPublicUrl('IMAGES', 'images/gamification.png', 'w=600,h=400,fit=cover,format=webp')}
                                alt="Gamification feature"
                                w="full"
                                h="auto"
                                objectFit="contain"
                              />
                            </Box>
                            <VStack spacing={2} align="start" w="full">
                              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                Gamification
                              </Text>
                              <Text fontSize="md" color="gray.700" lineHeight="1.6" fontWeight="normal">
                                Use of patient-centric gamification to improve patient engagement by making their experience more personalized.
                              </Text>
                            </VStack>
                          </VStack>

                          {/* Customization Card */}
                          <VStack spacing={4} align="start" w="full">
                            <Box 
                              w="full"
                              borderRadius="3xl" 
                              overflow="hidden"
                              boxShadow="lg"
                              bg="white"
                            >
                              <Image
                                src={getPublicUrl('IMAGES', 'images/customization.png', 'w=600,h=400,fit=cover,format=webp')}
                                alt="Customization feature"
                                w="full"
                                h="auto"
                                objectFit="contain"
                              />
                            </Box>
                            <VStack spacing={2} align="start" w="full">
                              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                Customization
                              </Text>
                              <Text fontSize="md" color="gray.700" lineHeight="1.6" fontWeight="normal">
                                Customization allows our patients to optimize their experience with the feature, and also giving them the sense of control.
                              </Text>
                            </VStack>
                          </VStack>

                          {/* Guidance Card */}
                          <VStack spacing={4} align="start" w="full">
                            <Box 
                              w="full"
                              borderRadius="3xl" 
                              overflow="hidden"
                              boxShadow="lg"
                              bg="white"
                            >
                              <Image
                                src={getPublicUrl('IMAGES', 'images/guidelines.png', 'w=600,h=400,fit=cover,format=webp')}
                                alt="Guidelines feature"
                                w="full"
                                h="auto"
                                objectFit="contain"
                              />
                            </Box>
                            <VStack spacing={2} align="start" w="full">
                              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                Guidelines
                              </Text>
                              <Text fontSize="md" color="gray.700" lineHeight="1.6" fontWeight="normal">
                                Provide the patient successively with guidance through daily tips on how they can more easily manage their fluid intake.
                              </Text>
                            </VStack>
                          </VStack>
                        </HStack>
                      </VStack>
                </Box>

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
                            • <Text as="span" fontWeight="semibold">Successfully launched</Text> as part of the newly rebranded d.CARE app
                            <br />• <Text as="span" fontWeight="semibold">Maintained consistency</Text> across design system despite distributed collaboration
                            <br />• <Text as="span" fontWeight="semibold">Designed with accessibility in mind</Text>, compensating for limited in-person testing
                            <br />• <Text as="span" fontWeight="semibold">Conducted remote feedback sessions</Text> via nurses, with patients reporting the feature as <Text as="span" fontWeight="semibold" color="gray.900">"fun", "useful", "super"</Text>
                          </Text>
                        </Box>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          The tracker improved patient engagement and care team visibility, meeting both user needs and business goals.
                        </Text>
                      </VStack>
                </Box>

                    {/* Conclusion Section */}
                <Box
                      ref={conclusionRef}
                  data-section="conclusion"
                  opacity={conclusionInView ? 1 : 0}
                  transform={conclusionInView ? 'translateY(0)' : 'translateY(20px)'}
                  transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                    >
                      <VStack align="start" spacing={6} pt={8}>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                          👉 This case shows my ability to lead design in remote-first conditions, using tools, systems, and communication to deliver a patient-centered solution that balances clinical needs with engaging UX.
                        </Text>
                      </VStack>
                      </Box>
              </>
            ) : project.title === 'My Pages: Customer portal' ? (
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
                      I designed a proof of concept for Alfa Laval's customer portal, My Pages, to give customers an easy overview of their products, documentation, and service options. Using a <Text as="span" fontWeight="semibold" color="gray.900">shortened design sprint, user personas, and rapid prototyping</Text>, I created flows that addressed pain points like scattered product information, unclear service booking, and limited support availability. The concept was <Text as="span" fontWeight="semibold" color="gray.900">well received internally</Text> and is now in the pipeline for production.
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
                      Alfa Laval is a global leader in heat transfer, separation, and fluid handling. Their products are often evaluated not only on technical quality but also on how <Text as="span" fontWeight="semibold" color="gray.900">accessible and supportive they are as a supplier</Text>.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      Customers frequently needed quick access to product information, documentation, and after-sales service. Without a structured digital platform, this often meant frustration for both customers and support staff.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      The proposed customer portal, My Pages, aimed to centralize this experience by giving customers an overview of their products, documentation, and service options in one place.
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
                      I was the <Text as="span" fontWeight="semibold" color="gray.900">only designer</Text> on this proof of concept. My responsibilities included:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Planning and running a shortened design sprint</Text>
                        <br />• <Text as="span" fontWeight="semibold">Research and stakeholder collaboration</Text>
                        <br />• <Text as="span" fontWeight="semibold">Defining user personas and needs</Text>
                        <br />• <Text as="span" fontWeight="semibold">Concept development and UX/UI design</Text>
                        <br />• <Text as="span" fontWeight="semibold">Prototyping and creating product flows</Text> for key use cases
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
                      Alfa Laval wanted to strengthen its customer relationships beyond just delivering products.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      Key challenges included:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Scattered information</Text> – product documentation was difficult to access, making compliance and traceability harder than it needed to be
                        <br />• <Text as="span" fontWeight="semibold">Service management</Text> – processes like ordering spare parts or booking installation were unclear and time-consuming
                        <br />• <Text as="span" fontWeight="semibold">Support availability</Text> – customer support relied heavily on phone queues and fragmented processes, leading to inefficiency
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mt={4}>
                      The goal was to explore how a customer portal could make these experiences easier, more consistent, and more valuable for customers.
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
                      <Text as="span" fontWeight="semibold">Kickoff and research</Text>
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Initial meetings with stakeholders</Text> to understand needs and align on scope
                        <br />• <Text as="span" fontWeight="semibold">Ran a 3-day design sprint</Text> (shortened from the standard 5 days) with business stakeholders to generate ideas and insights
                        <br />• <Text as="span" fontWeight="semibold">Defined user personas</Text> to represent different types of customers and their needs
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Hypotheses and priorities</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      We developed hypotheses for what the portal should solve:
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Centralized documentation</Text> – customers get all compliance and traceability documents in one place
                        <br />• <Text as="span" fontWeight="semibold">Simplified service booking</Text> – flows for ordering spare parts and scheduling service are streamlined and intuitive
                        <br />• <Text as="span" fontWeight="semibold">Integrated support</Text> – digitized support tied to the customer's registered products for faster, more accurate help
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      These hypotheses were prioritized and mapped toward an MVP scope.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Design and prototyping</Text>
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Created conceptual flows in Figma</Text>, showing both product overviews and accessory ordering flows
                        <br />• <Text as="span" fontWeight="semibold">Designed interactions</Text> that made it easy to register products and immediately access related documents and parts
                        <br />• <Text as="span" fontWeight="semibold">Balanced a functional, straightforward UI</Text> with flexibility for future scale-up
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Video Section */}
                <VStack spacing={12} align="center" pt={16} w="full">
                  {/* Webshop Video */}
                  <Box w="full" borderRadius="xl" overflow="hidden" position="relative">
                    <video
                      controls
                      preload="metadata"
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
                        • <Text as="span" fontWeight="semibold">Delivered a full proof of concept</Text> that was well received by stakeholders and initial clients
                        <br />• <Text as="span" fontWeight="semibold">Designs were considered more ambitious</Text> than expected, in a positive way, but also highlighted the scale of effort required
                        <br />• <Text as="span" fontWeight="semibold">Although the pandemic slowed implementation</Text>, the designs were gradually shared internally and are now in the production pipeline
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      The long-term goal of My Pages is to strengthen Alfa Laval's customer relationships by making product ownership and service effortless. Success will be measured both quantitatively (active and returning users) and qualitatively (customer satisfaction and usability feedback).
                    </Text>
                  </VStack>
                </Box>

                {/* Conclusion Text */}
                <Box
                  opacity={isClosing ? 1 : 0}
                  transform={isClosing ? "translateY(0)" : "translateY(20px)"}
                  animation={isClosing ? "contentSlideOut 0.3s ease-in forwards" : "contentSlideIn 0.6s ease-out 0.6s forwards"}
                >
                  <VStack align="start" spacing={6} pt={8}>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      👉 This case shows my ability to work independently as the sole designer, structure a design sprint, and translate complex customer needs into a clear digital concept.
                    </Text>
                  </VStack>
                </Box>
              </>
            ) : project.title === 'Rent at Clas: Tool rental' ? (
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
                      I designed the digital experience for Clas Ohlson's rental service, enabling customers to rent tools online instead of buying them. Working with product managers and engineers, I delivered <Text as="span" fontWeight="semibold" color="gray.900">high-fidelity prototypes and flows</Text> for both customers and store staff in just a few weeks. Despite tight timelines and a rebranding process, the service launched successfully across Sweden, Norway, and Finland in September 2020, using <Text as="span" fontWeight="semibold" color="gray.900">nearly all of our design work</Text>.
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
                      Clas Ohlson is one of the largest home improvement chains in Scandinavia with <Text as="span" fontWeight="semibold" color="gray.900">over 230 stores</Text>. In 2016, they began experimenting with tool rentals in a few locations. By 2020, with more people looking to rent instead of own and the environmental benefits that come with it, the company decided to expand the concept digitally.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      The new initiative, Rent at Clas, aimed to make tool rentals available online, accessible in all stores, and integrated into their commerce platform.
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
                      I was the <Text as="span" fontWeight="semibold" color="gray.900">main designer</Text> on this project, responsible for:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">User research and analysis</Text> of existing services
                        <br />• <Text as="span" fontWeight="semibold">Concept ideation and defining user flows</Text>
                        <br />• <Text as="span" fontWeight="semibold">Visual design and prototyping</Text> in Figma
                        <br />• <Text as="span" fontWeight="semibold">Running user testing and validating flows</Text>
                        <br />• <Text as="span" fontWeight="semibold">Aligning stakeholders</Text> on goals and priorities
                        <br />• <Text as="span" fontWeight="semibold">Preparing developer handoff</Text> with annotations and interaction notes
                        <br />• <Text as="span" fontWeight="semibold">Ensuring consistency</Text> while balancing old and upcoming design systems during rebrand
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
                      The client wanted to expand an in-store only rental service into a <Text as="span" fontWeight="semibold" color="gray.900">seamless online experience</Text>. This meant:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Designing a clear booking flow</Text> for customers
                        <br />• <Text as="span" fontWeight="semibold">Creating a platform for store staff</Text> to manage rentals and bookings
                        <br />• <Text as="span" fontWeight="semibold">Working under significant time pressure</Text> while the company was mid-rebrand
                        <br />• <Text as="span" fontWeight="semibold">Meeting business goals</Text> around sustainability, add-on sales (e.g. detergent for carpet cleaner rentals), and customer satisfaction
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
                      <Text as="span" fontWeight="semibold">Research and kickoff</Text>
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Reviewed existing research</Text> and materials from earlier pilots
                        <br />• <Text as="span" fontWeight="semibold">Looked at Clas Ohlson's related services</Text> (like Clas Fixare) to ensure consistency
                        <br />• <Text as="span" fontWeight="semibold">Met with stakeholders</Text> to clarify priorities and turn them into user stories
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">User stories and requirements</Text>
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      We defined what customers needed from the rental experience and what staff required to run it smoothly:
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Translated these into requirements</Text> and prioritized them (high, medium, low)
                        <br />• <Text as="span" fontWeight="semibold">Aligned design work with KPIs</Text> such as rental volume, add-on sales, and satisfaction
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Design and prototyping</Text>
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Used Figma to create high-fidelity prototypes</Text> for both web and desktop flows
                        <br />• <Text as="span" fontWeight="semibold">Built screens step by step</Text> against user stories to stay focused on actual needs
                        <br />• <Text as="span" fontWeight="semibold">Involved stakeholders early</Text>, sharing prototypes to get feedback and adjust quickly
                        <br />• <Text as="span" fontWeight="semibold">Balanced design between existing and upcoming systems</Text>, creating a hybrid style that worked for launch
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Developer handoff</Text>
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Structured all flows clearly</Text> in Figma
                        <br />• <Text as="span" fontWeight="semibold">Added notes, interactions, and alternative states</Text> to reduce uncertainty
                        <br />• <Text as="span" fontWeight="semibold">Collaborated closely with engineers</Text> to make sure everything was clear and feasible
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Video and Image Section */}
                <VStack spacing={12} align="center" pt={16} w="full">
                  {/* Video */}
                  <Box w="full" borderRadius="xl" overflow="hidden" position="relative">
                    <video
                      controls
                      preload="metadata"
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
                        • <Text as="span" fontWeight="semibold">Rent at Clas launched</Text> in September 2020 across Sweden, Norway, and Finland
                        <br />• <Text as="span" fontWeight="semibold">The final product closely followed</Text> the designs we delivered, both for customer booking and staff management
                        <br />• <Text as="span" fontWeight="semibold">Customers could now rent tools online</Text> without issues, while staff had a smooth system to manage rentals
                        <br />• <Text as="span" fontWeight="semibold">Although limited time meant less user testing</Text> than I'd have liked, the project showed how fast, collaborative design can enable a major service rollout within months
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
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      👉 This project highlights my ability to move quickly under pressure, deliver production-ready designs, and balance user needs with business goals, even in the middle of a rebrand and remote collaboration.
                    </Text>
                  </VStack>
                </Box>
              </>
            ) : project.title === 'Modity: Portfolio reports' ? (
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
                      I designed a new portfolio reporting feature for Modity's customer portal, making complex energy trading data easier to understand and act on. As the sole designer, I worked closely with business stakeholders, PM, engineers, and end users to translate high-level energy requirements into clear, usable reports. The concept was <Text as="span" fontWeight="semibold" color="gray.900">well received by both the client and their customers</Text>, who praised the simplicity of the final solution.
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
                      Modity is one of Sweden's leading energy traders and balance service providers for electricity and gas. Their main focus is helping energy companies and large consumers <Text as="span" fontWeight="semibold" color="gray.900">manage and optimize their energy needs</Text>.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      They already had a customer portal, but it lacked a key feature: the ability for customers to get a comprehensive overview of electricity purchase costs and outcomes in a portfolio report.
                    </Text>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      Customers needed this not only for transparency, but also to run their own monthly and yearly analyses, compare results against invoices, and create structured follow-ups.
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
                      I was the <Text as="span" fontWeight="semibold" color="gray.900">sole designer</Text> on this project, responsible for:
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Research and domain understanding</Text>
                        <br />• <Text as="span" fontWeight="semibold">Running workshops with PM, engineers, and stakeholders</Text>
                        <br />• <Text as="span" fontWeight="semibold">Translating insights into user stories</Text>
                        <br />• <Text as="span" fontWeight="semibold">UX/UI design and prototyping</Text>
                        <br />• <Text as="span" fontWeight="semibold">User testing and iteration</Text>
                        <br />• <Text as="span" fontWeight="semibold">Delivering clear specifications to engineering</Text>
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
                      The biggest challenge was the <Text as="span" fontWeight="semibold" color="gray.900">complexity of the energy trading domain</Text>. I had to get up to speed quickly on terminology, workflows, and customer needs in order to design something intuitive for users who needed detailed yet clear reporting.
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
                      <Text as="span" fontWeight="semibold">Research and workshops</Text>
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Started with introductory meetings</Text> to understand the scope and terminology
                        <br />• <Text as="span" fontWeight="semibold">Ran collaborative workshops</Text> with engineers, PM, and stakeholders to align on requirements and success criteria
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">User stories and insights</Text>
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Conducted interviews with actual portal users</Text> to uncover how they currently tracked costs and outcomes
                        <br />• <Text as="span" fontWeight="semibold">Translated insights into user stories</Text> that guided the design priorities
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Wireframes and testing</Text>
                    </Text>
                    <Box pl={4} mb={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Created low-fidelity wireframes</Text> (instead of starting directly with high-fidelity) to keep the focus on structure and clarity in a very complex domain
                        <br />• <Text as="span" fontWeight="semibold">Conducted feedback sessions</Text> with users and stakeholders, iterating based on what was unclear or overly detailed
                      </Text>
                    </Box>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal" mb={3}>
                      <Text as="span" fontWeight="semibold">Design</Text>
                    </Text>
                    <Box pl={4}>
                      <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                        • <Text as="span" fontWeight="semibold">Finalized the reporting interface</Text> with a clean, modular design
                        <br />• <Text as="span" fontWeight="semibold">Focused on presenting complex data</Text> in a way that was scannable and actionable
                        <br />• <Text as="span" fontWeight="semibold">Prototyped user flows in Figma</Text> to demonstrate how customers could move from overview to detailed breakdowns
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Video Section */}
                <VStack spacing={12} align="center" pt={16} w="full">
                  <Box w="full" borderRadius="xl" overflow="hidden" position="relative">
                    <video controls preload="metadata" style={{ width: '100%', height: 'auto', display: 'block' }}>
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
                        • <Text as="span" fontWeight="semibold">The portfolio reporting feature was implemented</Text> in Modity's customer portal and rolled out to their users
                        <br />• <Text as="span" fontWeight="semibold">Both the client and their customers responded positively</Text>, highlighting how the design made complex reporting much easier to understand and act on
                        <br />• <Text as="span" fontWeight="semibold">Customers valued the ability to run their own analyses</Text> and compare results with invoices directly in the portal, reducing time spent on manual work
                        <br />• <Text as="span" fontWeight="semibold">The client praised the project</Text> for translating a highly complex domain into a simple interface within a short timeframe
                        <br />• <Text as="span" fontWeight="semibold">For me, the project was rewarding</Text> as it proved my ability to step into a completely new domain and deliver a solution that was adopted and appreciated in real use
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
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.700" lineHeight="1.8" fontWeight="normal">
                      👉 This case highlights my ability to simplify complex, technical information into user-friendly designs, work independently as the sole designer, and drive alignment between business, engineering, and end users.
                    </Text>
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
