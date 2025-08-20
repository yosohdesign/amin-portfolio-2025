'use client'

import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Tag,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'

export default function BenefitsSection() {
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const cardBg = useColorModeValue('white', 'gray.800')

  const services = [
    'WEB DESIGN',
    'LANDING PAGES',
    'INTERFACE DESIGN',
    'VISUAL IDENTITY',
    'DESIGN SYSTEMS',
    'AUTOMATIC BACKUPS',
    'CMS',
  ]

  return (
    <Box py={20} bg="gray.50" id="benefits">
      <Container maxW="container.2xl" px={{ base: 4, lg: 8 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={12}
          alignItems="start"
        >
          {/* Left Column - Value Proposition */}
          <GridItem>
            <VStack align="start" spacing={6}>
              <Heading
                as="h2"
                size="xl"
                fontWeight="bold"
                color="gray.800"
                lineHeight="1.2"
              >
                A smart decision
              </Heading>
              <Text
                fontSize="lg"
                color={textColor}
                lineHeight="1.6"
                maxW="md"
              >
                Webflow is a visual website builder that gives you complete control over your website. 
                You can design, build, and launch websites in a single platform without writing code.
              </Text>
            </VStack>
          </GridItem>

          {/* Right Column - Service Cards */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Main Service Card */}
              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                boxShadow="md"
                border="1px solid"
                borderColor="gray.300"
              >
                <Text fontWeight="semibold" fontSize="lg" color="gray.800" mb={4}>
                  Design that inspires and sets you apart from the competition.
                </Text>
              </Box>

              {/* Service Tags */}
              <Box>
                <HStack spacing={2} flexWrap="wrap" gap={2}>
                  {services.map((service, index) => (
                    <Tag
                      key={index}
                      size="md"
                      variant="outline"
                      colorScheme="gray"
                      borderRadius="lg"
                      fontWeight="medium"
                      fontSize="sm"
                    >
                      {service}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
