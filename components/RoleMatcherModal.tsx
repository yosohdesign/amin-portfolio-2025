'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Textarea,
  Button,
  VStack,
  Text,
  Spinner,
  HStack,
  Box,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  Skeleton,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { MatchOutput } from '@/lib/gemini-ai'
import profileData from '@/profile.json'

interface RoleMatcherModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RoleMatcherModal({ isOpen, onClose }: RoleMatcherModalProps) {
  const [jobRequirements, setJobRequirements] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchOutput | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  // Use drawer on mobile, modal on desktop
  const isMobile = useBreakpointValue({ base: true, lg: false })

  const handleAnalyze = async () => {
    if (!jobRequirements.trim()) {
      setValidationMessage('Please enter job requirements to analyze.')
      return
    }

    setValidationMessage('')
    setIsAnalyzing(true)
    setShowResults(false)

    try {
      // Import the Gemini service dynamically to avoid build issues
      const { default: geminiService } = await import('@/lib/gemini-ai')
      const result = await geminiService.analyzeJobWithCV(jobRequirements, profileData)
      setMatchResult(result)
      setShowResults(true)
    } catch (error) {
      console.error('Analysis error:', error)
      
      // Enhanced error handling with specific messages
      const errorMessage = getErrorMessage(error)
      setValidationMessage(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClose = () => {
    setJobRequirements('')
    setMatchResult(null)
    setShowResults(false)
    setValidationMessage('')
    onClose()
  }

  // Enhanced error message handling
  const getErrorMessage = (error: any): string => {
    const errorStr = String(error?.message || error || '')
    
    // Rate limiting and quota issues
    if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('Quota')) {
      return 'Daily AI analysis limit reached. Please try again tomorrow or contact me directly for a manual analysis.'
    }
    
    // API key issues
    if (errorStr.includes('API_KEY') || errorStr.includes('authentication') || errorStr.includes('unauthorized')) {
      return 'Service temporarily unavailable. Please try again later or contact me directly.'
    }
    
    // Model/service unavailable
    if (errorStr.includes('model') || errorStr.includes('unavailable') || errorStr.includes('not found')) {
      return 'AI service temporarily unavailable. I\'ll analyze manually - please contact me directly!'
    }
    
    // Network/connection issues
    if (errorStr.includes('network') || errorStr.includes('fetch') || errorStr.includes('connection')) {
      return 'Connection problem. Please check your internet and try again.'
    }
    
    // JSON parsing issues
    if (errorStr.includes('JSON') || errorStr.includes('parse')) {
      return 'AI response format error. Please try again or contact me for manual analysis.'
    }
    
    // Default fallback
    return 'Something went wrong with the AI analysis. Please try again or contact me directly for a manual review.'
  }

  // Determine error alert status based on message content
  const getErrorStatus = (message: string): 'warning' | 'error' | 'info' => {
    if (message.includes('Daily AI analysis limit reached') || message.includes('AI service temporarily unavailable')) {
      return 'error'
    }
    if (message.includes('Connection problem') || message.includes('Service temporarily unavailable')) {
      return 'warning'
    }
    return 'info'
  }



    // Shared content component to avoid duplication
  const renderContent = () => (
    <>
      {!showResults ? (
        /* Input State */
        <VStack spacing={6} align="stretch" flex="1" justify="center">
          {!isMobile && (
                         <Box 
               minH="400px"
               display="flex" 
               flexDirection="column"
             >
              <VStack spacing={6} align="stretch" flex="1" justify="center">
                {isAnalyzing ? (
                  <VStack spacing={6} justify="center" align="center" flex="1">
                    <Spinner size="lg" color="blue.500" thickness="3px" />
                    <Text fontSize="lg" color="gray.700" fontWeight="medium">
                      Analyzing your requirements...
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Matching against my experience and projects
                    </Text>
                    
                    {/* Subtle loading skeleton */}
                    <VStack spacing={3} align="center" w="full" maxW="400px">
                      <Skeleton height="20px" width="80%" borderRadius="md" />
                      <Skeleton height="16px" width="60%" borderRadius="md" />
                      <Skeleton height="16px" width="70%" borderRadius="md" />
                    </VStack>
                  </VStack>
                ) : (
                  <>
                    <Textarea
                      placeholder="Paste your job requirements here..."
                      value={jobRequirements}
                      onChange={(e) => setJobRequirements(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      rows={12}
                      fontSize="md"
                      resize="vertical"
                      border="1px solid"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                      }}
                      flex="1"
                      minH="200px"
                    />
                    
                    {/* Validation Message */}
                    {validationMessage && (
                      <VStack spacing={3} align="stretch">
                        <Alert 
                          status={getErrorStatus(validationMessage)} 
                          borderRadius="lg"
                          variant="left-accent"
                        >
                          <AlertIcon />
                          <AlertDescription>
                            {validationMessage}
                          </AlertDescription>
                        </Alert>
                        
                        {/* Action button for critical errors */}
                        {(validationMessage.includes('Daily AI analysis limit reached') || 
                          validationMessage.includes('AI service temporarily unavailable')) && (
                          <Button
                            onClick={() => {
                              const subject = 'Manual Role Analysis Request'
                              const body = `Hi Amin,\n\nI tried to use your AI role matcher but it's currently unavailable.\n\nJob requirements: ${jobRequirements.slice(0, 300)}...\n\nCould you analyze this manually for me?`
                              const mailtoLink = `mailto:yosoh.amin@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                              window.open(mailtoLink)
                            }}
                            size="md"
                            variant="outline"
                            colorScheme="blue"

                          >
                            Contact me for manual analysis
                          </Button>
                        )}
                      </VStack>
                    )}
                  </>
                )}
              </VStack>
            </Box>
          )}
                    {isMobile && (
            <VStack spacing={6} align="stretch" flex="1" justify="center">
              {isAnalyzing ? (
                <VStack spacing={6} justify="center" align="center" flex="1">
                  <Spinner size="lg" color="blue.500" thickness="3px" />
                  <Text fontSize="lg" color="gray.700" fontWeight="medium">
                    Analyzing your requirements...
                  </Text>
                  <Text fontSize="md" color="gray.500" textAlign="center">
                    Matching against my experience and projects
                  </Text>
                  
                  {/* Subtle loading skeleton */}
                  <VStack spacing={3} align="center" w="full" maxW="400px">
                    <Skeleton height="20px" width="80%" borderRadius="md" />
                    <Skeleton height="16px" width="60%" borderRadius="md" />
                    <Skeleton height="16px" width="70%" borderRadius="md" />
                  </VStack>
                </VStack>
              ) : (
                <>
                  <Textarea
                    placeholder="Paste your job requirements here..."
                    value={jobRequirements}
                    onChange={(e) => setJobRequirements(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    rows={12}
                    fontSize="md"
                    resize="vertical"
                    border="1px solid"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                    }}
                    flex="1"
                    minH="200px"
                  />
                  
                  {/* Validation Message */}
                  {validationMessage && (
                    <VStack spacing={3} align="stretch">
                      <Alert 
                        status={getErrorStatus(validationMessage)} 
                        borderRadius="lg"
                        variant="left-accent"
                      >
                        <AlertIcon />
                        <AlertDescription>
                          {validationMessage}
                        </AlertDescription>
                      </Alert>
                      
                      {/* Action button for critical errors */}
                      {(validationMessage.includes('Daily AI analysis limit reached') || 
                        validationMessage.includes('AI service temporarily unavailable')) && (
                        <Button
                          onClick={() => {
                            const subject = 'Manual Role Analysis Request'
                            const body = `Hi Amin,\n\nI tried to use your AI role matcher but it's currently unavailable.\n\nJob requirements: ${jobRequirements.slice(0, 300)}...\n\nCould you analyze this manually for me?`
                            const mailtoLink = `mailto:yosoh.amin@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                            window.open(mailtoLink)
                          }}
                          size="md"
                          variant="outline"
                          colorScheme="blue"

                        >
                          Contact me for manual analysis
                        </Button>
                      )}
                    </VStack>
                  )}
                </>
              )}
            </VStack>
          )}
      </VStack>
      ) : (
          /* Results State */
          <VStack spacing={7} align="stretch" flex="1" justify="start">
            {!isMobile ? (
                             <Box 
                 minH="400px"
                 overflow="auto"
               >
                                 <VStack spacing={7} align="stretch" py={6}>
                  {/* Quick Take */}
                  <Box>
                    <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                      Quick take
                    </Text>
                    <Text fontSize="md" color="gray.700" lineHeight="1.6">
                      {matchResult!.quick_take}
                    </Text>
                  </Box>

                  {/* Summary */}
                  <Box>
                    <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                      Summary
                    </Text>
                    <Text fontSize="md" color="gray.700" lineHeight="1.6">
                      {matchResult!.summary}
                    </Text>
                  </Box>

                  {/* Strengths */}
                  {matchResult!.strengths.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                        Matching strengths
                      </Text>
                      <VStack spacing={2} align="start">
                        {matchResult!.strengths.map((strength, index) => (
                          <Text key={index} color="gray.700" fontSize="md">
                            • {strength}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Project */}
                  {matchResult!.project && (
                    <Box>
                      <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                        Reference project
                      </Text>
                      <Box>
                        <Text fontWeight="medium" color="gray.800" fontSize="md" mb={1}>
                          {matchResult!.project.title}
                        </Text>
                        <Text color="gray.700" fontSize="md">
                          {matchResult!.project.line}
                        </Text>
                      </Box>
                    </Box>
                  )}

                  {/* Gaps - Where I'd Grow */}
                  {matchResult!.gaps && matchResult!.gaps.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                        Where I'd Grow
                      </Text>
                      <VStack spacing={2} align="start">
                        {matchResult!.gaps.map((gap, index) => (
                          <Text key={index} color="gray.700" fontSize="md">
                            • {gap}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Closing Line */}
                  {matchResult!.closing && (
                    <Box>
                      <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                        Next steps
                      </Text>
                      <Text fontSize="md" color="gray.700" lineHeight="1.6">
                        {matchResult!.closing}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            ) : (
              <VStack spacing={7} align="stretch" py={6}>
                {/* Quick Take */}
                <Box>
                  <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                    Quick take
                  </Text>
                  <Text fontSize="md" color="gray.700" lineHeight="1.6">
                    {matchResult!.quick_take}
                  </Text>
                </Box>

                {/* Summary */}
                <Box>
                  <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                    Summary
                  </Text>
                  <Text fontSize="md" color="gray.700" lineHeight="1.6">
                    {matchResult!.summary}
                  </Text>
                </Box>

                {/* Strengths */}
                {matchResult!.strengths.length > 0 && (
                  <Box>
                    <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                      Matching strengths
                    </Text>
                    <VStack spacing={2} align="start">
                      {matchResult!.strengths.map((strength, index) => (
                        <Text key={index} color="gray.700" fontSize="md">
                          • {strength}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Project */}
                {matchResult!.project && (
                  <Box>
                    <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                      Reference project
                    </Text>
                    <Box>
                      <Text fontWeight="medium" color="gray.800" fontSize="md" mb={1}>
                        {matchResult!.project.title}
                      </Text>
                      <Text color="gray.700" fontSize="md">
                        {matchResult!.project.line}
                      </Text>
                      </Box>
                    </Box>
                  )}

                  {/* Gaps - Where I'd Grow */}
                  {matchResult!.gaps && matchResult!.gaps.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                        Where I'd Grow
                      </Text>
                      <VStack spacing={2} align="start">
                        {matchResult!.gaps.map((gap, index) => (
                          <Text key={index} color="gray.700" fontSize="md">
                            • {gap}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Closing Line */}
                  {matchResult!.closing && (
                    <Box>
                      <Text fontWeight="semibold" color="blue.600" fontSize="lg" mb={3}>
                        Next steps
                      </Text>
                      <Text fontSize="md" color="gray.700" lineHeight="1.6">
                        {matchResult!.closing}
                      </Text>
                    </Box>
                  )}
                </VStack>
              )}
            </VStack>
          )}
        </>
      )

  // Shared footer component
  const renderFooter = () => (
    <VStack spacing={3} w="full">
      {!showResults ? (
        /* Analyze Button */
        <Button
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          loadingText="Analyzing..."
          size="lg"
          variant="solid"
          bg="gray.900"
          color="white"
          _hover={{ bg: 'gray.800', transform: 'translateY(-1px)' }}
          transition="all 0.2s"
          borderRadius="lg"
          px={10}
          py={4}
          fontSize="lg"
          fontWeight="medium"
          w="full"
          isDisabled={isAnalyzing}
        >
          Analyze match
        </Button>
      ) : (
        /* Action Buttons for Results */
        <HStack spacing={4} w="full">
          <Button
            onClick={() => {
              setShowResults(false)
              setMatchResult(null)
              setValidationMessage('')
            }}
            size="lg"
            variant="outline"
            colorScheme="gray"
            borderColor="gray.400"
            color="gray.800"
            borderRadius="lg"
            px={8}
            py={4}
            fontSize="lg"
            fontWeight="medium"
            flex={1}
            _hover={{ 
              bg: 'gray.50',
              borderColor: 'gray.500'
            }}
          >
            Try another role
          </Button>
          <Button
            onClick={() => {
              const subject = 'Role Match Inquiry'
              const body = `Hi Amin,\n\nI analyzed a role with your portfolio and would like to get in touch.\n\nJob requirements: ${jobRequirements.slice(0, 200)}...`
              const mailtoLink = `mailto:yosoh.amin@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
              window.open(mailtoLink)
            }}
            size="lg"
            variant="solid"
            bg="gray.900"
            color="white"
            _hover={{ bg: 'gray.800', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
            borderRadius="lg"
            px={8}
            py={4}
            fontSize="lg"
            fontWeight="medium"
            flex={1}
          >
            Contact me
          </Button>
        </HStack>
      )}
    </VStack>
  )

  // Shared header component
  const renderHeader = () => (
    <>
      <Heading size="lg" color="gray.800" fontWeight="normal">
        Role match analysis
      </Heading>
      {!showResults && (
        <Text fontSize="md" color="gray.600" fontWeight="normal" mt={2}>
          Paste your job requirements below and I'll analyze how well my profile matches your needs.
        </Text>
      )}
    </>
  )

  return (
    <>
      {/* Desktop Modal */}
      {!isMobile && (
        <Modal 
          isOpen={isOpen} 
          onClose={handleClose} 
          size="4xl" 
          scrollBehavior="inside"
          motionPreset="slideInBottom"
          isCentered
        >
          <ModalOverlay 
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
            transition="all 0.3s ease-out"
          />
          <ModalContent 
            borderRadius="xl" 
            mx={4} 
            maxH="90vh"
            transition="all 0.3s ease-out"
            transform={isOpen ? "scale(1)" : "scale(0.95)"}
            opacity={isOpen ? 1 : 0}
          >
            <ModalHeader borderBottomWidth={showResults ? "1px" : "0px"} borderColor="gray.200">
              {renderHeader()}
            </ModalHeader>
            <ModalCloseButton size="lg" />
            
            <ModalBody display="flex" flexDirection="column" px={6}>
              {renderContent()}
            </ModalBody>

            <ModalFooter borderTopWidth={showResults ? "1px" : "0px"} borderColor="gray.200">
              {renderFooter()}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          isOpen={isOpen}
          onClose={handleClose}
          placement="bottom"
          size="md"
        >
          <DrawerOverlay 
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
            transition="all 0.3s ease-out"
          />
          <DrawerContent 
            borderTopRadius="xl"
            transition="all 0.3s ease-out"
            transform={isOpen ? "translateY(0)" : "translateY(100%)"}
            maxH="90vh"
          >
            <DrawerHeader borderBottomWidth={showResults ? "1px" : "0px"} borderColor="gray.200">
              {renderHeader()}
            </DrawerHeader>
            <DrawerCloseButton size="lg" />
            
            <DrawerBody display="flex" flexDirection="column" px={6}>
              {renderContent()}
            </DrawerBody>

            <DrawerFooter borderTopWidth={showResults ? "1px" : "0px"} borderColor="gray.200">
              {renderFooter()}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
