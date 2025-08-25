'use client'

import { Box, Container, Heading, VStack, SimpleGrid, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useScrollEffect } from '@/lib/hooks/useScrollEffect'
import ProjectCard from './ProjectCard'
import ProjectOverlay from './ProjectOverlay'
import { getPublicUrl } from '@/lib/storage'

export default function ProjectsSection() {
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const { getScrollEffect } = useScrollEffect()
  const projectRefs = useRef<(HTMLDivElement | null)[]>([])
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const projects = [
    {
      dateRange: 'Q3–Q4 2021',
      title: 'Engaging health tracking',
      description: 'Making daily care feel easier for dialysis patients. I designed a fluid intake tracker for the d.CARE app that helps patients log fluid intake consistently in a clear and encouraging way.',
      tags: ['Behavioral design', 'Healthcare UX', 'Gamification', 'Accessibility', 'Remote testing', 'Design systems'],
      imageSrc: getPublicUrl('IMAGES', 'images/diaverum.png', 'w=800,h=600,fit=cover,format=webp'),
      imageAlt: 'Engaging health tracking - Dialysis Patient App'
    },
    {
      dateRange: 'February 2020',
      title: 'Smarter customer portal',
      description: 'I designed a proof of concept for Alfa Laval\'s customer portal, creating flows for documentation, service, and support. The concept was well received and later moved into their production pipeline.',
      tags: ['Design sprint', 'B2B UX', 'Service design', 'Stakeholder workshops', 'Concept design', 'Enterprise UX'],
      imageSrc: getPublicUrl('IMAGES', 'images/alfalaval.png', 'w=800,h=600,fit=cover,format=webp'),
      imageAlt: 'Smarter customer portal - Alfa Laval Customer Portal Design'
    },
    {
      dateRange: 'March 2020 – May 2020',
      title: 'Tool rentals made digital',
      description: 'I worked with Clas Ohlson to create the first full rental journey, including staff tools and customer booking flows. These designs guided the rollout of the service across three markets.',
      tags: ['Rental platform', 'Staff interface', 'Rapid prototyping', 'Multi-stakeholder', 'E-commerce', 'Service design'],
      imageSrc: getPublicUrl('IMAGES', 'images/clasohlson.png', 'w=800,h=600,fit=cover,format=webp'),
      imageAlt: 'Tool rentals made digital - Tool Rental Service Design'
    },
    {
      dateRange: 'December 2019 – January 2020',
      title: 'Simplifying energy reports',
      description: 'I designed a reporting feature for Modity\'s customer portal that turned complex energy trading data into clear portfolio insights. The solution was implemented and well received by both Modity and their customers.',
      tags: ['Data visualization', 'Financial UX', 'Domain research', 'User stories', 'Technical design', 'B2B analytics'],
      imageSrc: getPublicUrl('IMAGES', 'images/modity.png', 'w=800,h=600,fit=cover,format=webp'),
      imageAlt: 'Simplifying energy reports - Energy Portfolio Management Interface'
    }
  ]

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
    <Box py={20} pt={{ base: 24, lg: 48 }} bg="white" id="projects" ref={sectionRef}>
      <Container maxW="container.2xl" px={{ base: 4, lg: 8 }}>
        <VStack spacing={12} align="stretch">
          {/* Section Header */}
          <VStack spacing={6} align="start">
            <Heading
              as="h2"
              size="2xl"
              fontWeight="medium"
              color="black"
              fontSize={{ base: '3xl', md: '3xl', lg: '4xl', xl: '5xl' }}
              opacity={isVisible ? 1 : 0}
              transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
              transition="opacity 0.6s ease-out, transform 0.6s ease-out"
            >
              Selected work & Projects
            </Heading>
          </VStack>

          {/* Featured Project Card */}
          <Box
            opacity={isVisible ? 1 : 0}
            transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
            transition="opacity 0.6s ease-out, transform 0.6s ease-out"
            transitionDelay="0.2s"
          >
            <ProjectCard
              ref={(el) => { projectRefs.current[0] = el }}
              {...projects[0]}
              scrollEffect={getScrollEffect(projectRefs.current[0])}
              onClick={() => setSelectedProject(projects[0])}
            />
          </Box>

          {/* Additional Case Study Cards */}
          <VStack spacing={12} align="stretch">
            {projects.slice(1).map((project, index) => (
              <Box 
                key={index + 1}
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
                transition="opacity 0.6s ease-out, transform 0.6s ease-out"
                transitionDelay={`${0.4 + (index * 0.2)}s`}
              >
                <ProjectCard
                  ref={(el) => { projectRefs.current[index + 1] = el }}
                  {...project}
                  scrollEffect={getScrollEffect(projectRefs.current[index + 1])}
                  onClick={() => setSelectedProject(project)}
                />
              </Box>
            ))}
          </VStack>
        </VStack>
      </Container>
      
      {/* Project Overlay */}
      {selectedProject && (
        <ProjectOverlay
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </Box>
  )
}
