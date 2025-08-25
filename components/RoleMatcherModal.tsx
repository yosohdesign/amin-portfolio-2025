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
  Input,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { MatchOutput } from '@/lib/gemini-ai'
import profileData from '@/profile.json'
import { FiUpload, FiX } from 'react-icons/fi'
import Tesseract from 'tesseract.js'

// Simple markdown renderer for bold quotes
const MarkdownText = ({ children }: { children: string }) => {
  if (!children) return null
  
  // Split by bold markers and render accordingly
  const parts = children.split(/(\*\*[^*]+\*\*)/g)
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Bold text - remove the ** markers and render as bold
          const boldText = part.slice(2, -2)
          return (
            <Text as="span" key={index} fontWeight="bold" color="gray.800">
              {boldText}
            </Text>
          )
        } else {
          // Regular text
          return <Text as="span" key={index}>{part}</Text>
        }
      })}
    </>
  )
}

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Use drawer on mobile, modal on desktop
  const isMobile = useBreakpointValue({ base: true, lg: false })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      setValidationMessage('Please upload a valid file type: JPG, PNG, PDF, or TXT')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationMessage('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
    setValidationMessage('')
    setIsProcessingFile(true)

    try {
      let text = ''
      
      if (file.type === 'text/plain') {
        // Handle text files
        text = await file.text()
        console.log('Text file processed:', text.substring(0, 100))
      } else if (file.type.startsWith('image/')) {
        // Extract text from images using OCR
        try {
          const result = await Tesseract.recognize(file, 'eng', {
            logger: m => console.log(m)
          })
          text = result.data.text.trim()
          console.log('Image OCR completed, extracted text length:', text.length)
          
          if (!text || text.trim().length === 0) {
            text = `[Image uploaded: ${file.name}]\n\nNo text could be extracted from this image. Please describe the job requirements manually.`
          }
        } catch (ocrError) {
          console.error('OCR processing error:', ocrError)
          text = `[Image uploaded: ${file.name}]\n\nOCR processing failed. Please describe the job requirements manually.`
        }
      } else if (file.type === 'application/pdf') {
        try {
          // For PDFs, we'll extract text using browser APIs
          const arrayBuffer = await file.arrayBuffer()
          const pdfjsLib = await import('pdfjs-dist')
          
          // Set up PDF.js worker
          if (typeof window !== 'undefined' && 'Worker' in window) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
          }
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let fullText = ''
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(' ')
            fullText += pageText + '\n'
          }
          
          text = fullText.trim()
          console.log('PDF processed, pages:', pdf.numPages, 'text length:', text.length)
          
          if (!text || text.trim().length === 0) {
            text = `[PDF uploaded: ${file.name}]\n\nNo text could be extracted from this PDF. Please copy and paste the job requirements manually.`
          }
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError)
          text = `[PDF uploaded: ${file.name}]\n\nPDF processing failed. Please copy and paste the job requirements manually.`
        }
      }

      console.log('Final extracted text:', text.substring(0, 200))
      setExtractedText(text)
      setJobRequirements(text)
      setIsProcessingFile(false)
    } catch (error) {
      console.error('File processing error:', error)
      setValidationMessage('Error processing file. Please try again or paste the text manually.')
      setIsProcessingFile(false)
      setUploadedFile(null)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setExtractedText('')
    setJobRequirements('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
    setUploadedFile(null)
    setExtractedText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
                  <VStack spacing={6} justify="center" align="stretch" flex="1">
                    {/* Comprehensive loading skeleton */}
                    <VStack spacing={6} align="stretch" w="full">
                      {/* Quick take section */}
                      <Box>
                        <Skeleton height="24px" width="120px" borderRadius="md" mb={4} />
                        <VStack spacing={3} align="stretch">
                          <Skeleton height="16px" width="100%" borderRadius="md" />
                          <Skeleton height="16px" width="90%" borderRadius="md" />
                          <Skeleton height="16px" width="75%" borderRadius="md" />
                        </VStack>
                      </Box>
                      
                      {/* Summary section */}
                      <Box>
                        <Skeleton height="24px" width="80px" borderRadius="md" mb={4} />
                        <VStack spacing={3} align="stretch">
                          <Skeleton height="16px" width="100%" borderRadius="md" />
                          <Skeleton height="16px" width="95%" borderRadius="md" />
                          <Skeleton height="16px" width="85%" borderRadius="md" />
                          <Skeleton height="16px" width="70%" borderRadius="md" />
                        </VStack>
                      </Box>
                      
                      {/* Strengths section */}
                      <Box>
                        <Skeleton height="24px" width="140px" borderRadius="md" mb={4} />
                        <VStack spacing={3} align="stretch">
                          <Skeleton height="16px" width="80%" borderRadius="md" />
                          <Skeleton height="16px" width="90%" borderRadius="md" />
                          <Skeleton height="16px" width="65%" borderRadius="md" />
                        </VStack>
                      </Box>
                      
                      {/* Project section */}
                      <Box>
                        <Skeleton height="24px" width="130px" borderRadius="md" mb={4} />
                        <VStack spacing={3} align="stretch">
                          <Skeleton height="20px" width="60%" borderRadius="md" />
                          <Skeleton height="16px" width="85%" borderRadius="md" />
                        </VStack>
                      </Box>
                    </VStack>
                  </VStack>
                ) : (
                  <>
                    <VStack spacing={4} align="stretch" w="full" flex="1">
                      {uploadedFile && (
                        <Box
                          bg="gray.50"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          p={4}
                        >
                          <HStack spacing={3} align="center" justify="space-between">
                            <HStack spacing={2} align="center">
                              <Icon as={FiUpload} color="gray.600" boxSize={5} />
                              <Text fontSize="sm" color="gray.700" fontWeight="medium">
                                File uploaded: {uploadedFile.name}
                                {isProcessingFile && (
                                  <Text as="span" color="gray.500" ml={2}>
                                    {uploadedFile.type.startsWith('image/') ? '(Extracting text with OCR...)' : '(Processing...)'}
                                  </Text>
                                )}
                              </Text>
                            </HStack>
                            {!isProcessingFile && (
                              <HStack spacing={2}>
                                <Tooltip label="Remove file" placement="top">
                                  <IconButton
                                    aria-label="Remove file"
                                    onClick={handleRemoveFile}
                                    variant="ghost"
                                    size="md"
                                    color="gray.500"
                                    _hover={{ color: 'red.500' }}
                                    icon={<FiX />}
                                  />
                                </Tooltip>
                              </HStack>
                            )}
                          </HStack>
                        </Box>
                      )}
                      <Textarea
                        placeholder={
                          isProcessingFile 
                            ? "Processing file... Please wait"
                            : uploadedFile 
                              ? "Text extracted from file (you can edit this)"
                              : "Paste your job requirements here..."
                        }
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
                        isDisabled={isProcessingFile}
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
                    </VStack>
                  </>
                )}
              </VStack>
            </Box>
          )}
          {isMobile && (
            <VStack spacing={6} align="stretch" flex="1" justify="center">
              {isAnalyzing ? (
                <VStack spacing={6} justify="center" align="stretch" flex="1">
                  {/* Comprehensive loading skeleton */}
                  <VStack spacing={6} align="stretch" w="full">
                    {/* Quick take section */}
                    <Box>
                      <Skeleton height="24px" width="120px" borderRadius="md" mb={4} />
                      <VStack spacing={3} align="stretch">
                        <Skeleton height="16px" width="100%" borderRadius="md" />
                        <Skeleton height="16px" width="90%" borderRadius="md" />
                        <Skeleton height="16px" width="75%" borderRadius="md" />
                      </VStack>
                    </Box>
                    
                    {/* Summary section */}
                    <Box>
                      <Skeleton height="24px" width="80px" borderRadius="md" mb={4} />
                      <VStack spacing={3} align="stretch">
                        <Skeleton height="16px" width="100%" borderRadius="md" />
                        <Skeleton height="16px" width="95%" borderRadius="md" />
                        <Skeleton height="16px" width="85%" borderRadius="md" />
                        <Skeleton height="16px" width="70%" borderRadius="md" />
                      </VStack>
                    </Box>
                    
                    {/* Strengths section */}
                    <Box>
                      <Skeleton height="24px" width="140px" borderRadius="md" mb={4} />
                      <VStack spacing={3} align="stretch">
                        <Skeleton height="16px" width="80%" borderRadius="md" />
                        <Skeleton height="16px" width="90%" borderRadius="md" />
                        <Skeleton height="16px" width="65%" borderRadius="md" />
                        <Skeleton height="16px" width="75%" borderRadius="md" />
                      </VStack>
                    </Box>
                    
                    {/* Project section */}
                    <Box>
                      <Skeleton height="24px" width="130px" borderRadius="md" mb={4} />
                      <VStack spacing={3} align="stretch">
                        <Skeleton height="20px" width="60%" borderRadius="md" />
                        <Skeleton height="16px" width="85%" borderRadius="md" />
                      </VStack>
                    </Box>
                  </VStack>
                </VStack>
              ) : (
                <>
                  <VStack spacing={4} align="stretch" w="full" flex="1">
                    {uploadedFile && (
                      <Box
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={4}
                      >
                        <HStack spacing={3} align="center" justify="space-between">
                          <HStack spacing={2} align="center">
                            <Icon as={FiUpload} color="gray.600" boxSize={5} />
                            <Text fontSize="sm" color="gray.700" fontWeight="medium">
                              File uploaded: {uploadedFile.name}
                              {isProcessingFile && (
                                <Text as="span" color="gray.500" ml={2}>
                                  {uploadedFile.type.startsWith('image/') ? '(Extracting text with OCR...)' : '(Processing...)'}
                                </Text>
                              )}
                            </Text>
                          </HStack>
                          {!isProcessingFile && (
                            <HStack spacing={2}>
                              <Tooltip label="Remove file" placement="top">
                                <IconButton
                                  aria-label="Remove file"
                                  onClick={handleRemoveFile}
                                  variant="ghost"
                                  size="md"
                                  color="gray.500"
                                  _hover={{ color: 'red.500' }}
                                  icon={<FiX />}
                                />
                              </Tooltip>
                            </HStack>
                          )}
                        </HStack>
                      </Box>
                    )}
                    <Textarea
                      placeholder={
                        isProcessingFile 
                          ? "Processing file... Please wait"
                          : uploadedFile 
                            ? "Text extracted from file (you can edit this)"
                            : "Paste your job requirements here..."
                      }
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
                      isDisabled={isProcessingFile}
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
                  </VStack>
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
                    <MarkdownText>{matchResult!.summary}</MarkdownText>
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
                          • <MarkdownText>{strength}</MarkdownText>
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
                  <MarkdownText>{matchResult!.summary}</MarkdownText>
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
                        • <MarkdownText>{strength}</MarkdownText>
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
        /* File Upload and Analyze Buttons */
        <HStack spacing={4} w="full">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            variant="outline"
            colorScheme="gray"
            borderColor="gray.300"
            color="gray.700"
            _hover={{ 
              bg: 'gray.50',
              borderColor: 'gray.400'
            }}
            transition="all 0.2s"
            borderRadius="lg"
            px={8}
            py={4}
            fontSize="lg"
            fontWeight="medium"
            flex={1}
            leftIcon={<FiUpload />}
            isDisabled={isProcessingFile}
          >
            {uploadedFile ? 'Change file' : 'Upload file'}
          </Button>
          <Button
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            loadingText="Analyzing match"
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
            isDisabled={isAnalyzing}
          >
            Analyze match
          </Button>
        </HStack>
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
      {/* Hidden file input */}
      <Input
        type="file"
        accept=".jpg, .jpeg, .png, .pdf, .txt"
        onChange={handleFileUpload}
        ref={fileInputRef}
        display="none"
      />
      
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
            transition={isOpen ? "all 0.3s ease-out" : "all 0.5s ease-out"}
            transform={isOpen ? "translateY(0)" : "translateY(100%)"}
            opacity={isOpen ? 1 : 0}
            maxH="85vh"
            mt="15vh"
            sx={{
              '&[data-state="closed"]': {
                transform: 'translateY(100%)',
                opacity: 0
              }
            }}
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
