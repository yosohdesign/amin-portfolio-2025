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
  useColorModeValue,
} from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { forwardRef } from 'react'

interface ProjectCardProps {
  dateRange: string
  title: string
  description: string
  tags: string[]
  imageSrc: string
  imageAlt: string
  scrollEffect: {
    scale: number
    translateY: number
    opacity: number
  }
  onClick?: () => void
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ dateRange, title, description, tags, imageSrc, imageAlt, scrollEffect, onClick }, ref) => {
    const cardBg = useColorModeValue('white', 'white')

    const handleClick = () => {
      console.log('ProjectCard clicked:', title)
      if (onClick) {
        onClick()
      }
    }

    return (
      <Box
        onClick={handleClick}
        className="project-card-clickable"
        style={{
          transform: `scale(${scrollEffect.scale}) translateY(${scrollEffect.translateY}px)`,
          opacity: scrollEffect.opacity,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          transformOrigin: 'center top',
          width: '100%',
          cursor: 'pointer',
        }}
        sx={{
          cursor: 'pointer !important',
          '&:hover': {
            cursor: 'pointer !important'
          },
          '& *': {
            cursor: 'inherit !important'
          }
        }}
      >
        <Box
          ref={ref}
          bg={cardBg}
          p={{ base: 0, lg: 8 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.200"
          position="relative"
          overflow="hidden"
          cursor="inherit"
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          _hover={{
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            transform: "translateY(-2px)"
          }}
          role="group"
          sx={{
            '&:hover .project-image': {
              transform: "scale(1.05)"
            }
          }}
        >
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 0, lg: 10 }}
            alignItems="stretch"
            h="full"
          >
            {/* Left Panel - Project Content */}
            <GridItem order={{ base: 1, lg: 1 }}>
              <VStack 
                align="start" 
                spacing={6} 
                h={{ base: 'auto', lg: 'full' }}
                justify="space-between"
                pt={8}
                pb={{ base: 2, lg: 4 }}
                px={{ base: 4, lg: 0 }}
                w="full"
                maxW={{ base: '100%', lg: '680px' }}
              >
                {/* Content Section */}
                <VStack 
                  align="start" 
                  spacing={{ base: 5, lg: 6 }}
                  style={{
                    transformOrigin: 'top left',
                  }}
                  flex={1}
                >
                  {/* Project Title */}
                  <Heading
                    as="h3"
                    size="xl"
                    fontWeight="medium"
                    color="black"
                    fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                    lineHeight="1.2"
                  >
                    {title}
                  </Heading>
                  
                  {/* Date Range */}
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="gray.500"
                    fontWeight="medium"
                  >
                    {dateRange}
                  </Text>
                    
                  {/* Project Description */}
                  <Text
                    fontSize={{ base: 'md', lg: 'lg' }}
                    color="gray.600"
                    lineHeight="1.7"
                    fontWeight="light"
                  >
                    {description}
                  </Text>
                    
                  {/* Project Tags */}
                  <HStack spacing={3} flexWrap="wrap" gap={3} mb={{ base: 2, lg: 6 }} align="flex-start">
                    {tags.map((tag, index) => (
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
                        _hover={{
                          bg: '#E1F0FE',
                          color: '#5A7A9A'
                        }}
                        transition="all 0.2s ease"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                </VStack>
              
                {/* View project Button - Hidden on mobile */}
                <Box display={{ base: 'none', lg: 'block' }} style={{ marginTop: 'auto' }}>
                  <Button
                    variant="link"
                    color="gray.600"
                    fontSize={{ base: 'md', lg: 'lg' }}
                    fontWeight="medium"
                    rightIcon={<ArrowForwardIcon />}
                    _hover={{ 
                      color: '#3575D9',
                      textDecoration: 'none'
                    }}
                    transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    alignSelf="start"
                    px={0}
                    py={2}
                    sx={{
                      '& svg': {
                        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      },
                      '&:hover svg': {
                        transform: 'translateX(8px)'
                      }
                    }}
                  >
                    View project
                  </Button>
                </Box>
              </VStack>
            </GridItem>

            {/* Right Panel - Project Image */}
            <GridItem order={{ base: 2, lg: 2 }}>
              <Box
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h={{ base: 'auto', lg: 'full' }}
                py={{ base: 4, lg: 0 }}
                px={{ base: 4, lg: 0 }}
              >
                {/* Project Image */}
                <Box
                  className="project-image"
                  w="full"
                  h={{ base: "280px", md: "320px", lg: "full" }}
                  borderRadius="xl"
                  overflow="hidden"
                  style={{ transformOrigin: 'center' }}
                  transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                >
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                  />
                </Box>
              </Box>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    )
  }
)

ProjectCard.displayName = 'ProjectCard'

export default ProjectCard
