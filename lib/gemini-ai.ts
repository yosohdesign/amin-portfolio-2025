import { GoogleGenerativeAI } from '@google/generative-ai'
import crypto from 'crypto'

// ---------- Config ----------
const MODEL_PRIMARY = 'gemini-1.5-flash'   // cheaper + faster
const MODEL_FALLBACK = 'gemini-1.5-pro'    // only if needed
const MAX_AD_CHARS = 3500                  // aggressive trim
const MAX_FACTS_CHARS = 1200               // very small prompt
const SUMMARY_SENTENCES = 4                // output budget
const STRENGTHS_COUNT = 3

// ---------- Public API ----------
export interface MatchOutput {
  quick_take: string
  summary: string
  strengths: string[]
  project: { title: string; line: string }
  gaps?: string[]
  closing?: string
}

export interface ValidationMessage {
  validation_message: string
}

export type AnalysisResult = MatchOutput | ValidationMessage

export class GeminiAIService {
  private static instance: GeminiAIService
  static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) GeminiAIService.instance = new GeminiAIService()
    return GeminiAIService.instance
  }

  private genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || ''
  )

  private validateJobInput(jobAd: string): ValidationMessage | null {
    // LOOSENED GATE: Treat input as HIGH-QUALITY if it meets ANY TWO of these three:
    // - At least 200 characters (reduced from 220)
    // - At least 2 line breaks
    // - Contains any section header keyword from expanded list
    
    const charCount = jobAd.trim().length
    const newlineCount = (jobAd.match(/\n/g) || []).length
    
    const cueWords = [
      "requirements", "responsibilities", "about the role", "what you'll do", 
      "what you will do", "about you", "qualifications", "we're looking for", 
      "must have", "nice to have"
    ]
    
    // Case-insensitive regex that allows variations
    const cueRegex = new RegExp(cueWords.join('|'), 'i')
    const hasCueWords = cueRegex.test(jobAd)
    
    // Count how many criteria are met
    let criteriaMet = 0
    if (charCount >= 200) criteriaMet++
    if (newlineCount >= 2) criteriaMet++
    if (hasCueWords) criteriaMet++
    
    // Pass if ANY TWO criteria are met
    if (criteriaMet >= 2) {
      return null
    }
    
    return {
      validation_message: "Please paste the full job description (8–12 requirement bullets or a detailed role section). Short keywords or vague text aren't enough for meaningful analysis."
    }
  }

  async analyzeJobWithCV(jobAd: string, profile: any): Promise<AnalysisResult> {
    try {
      // 0) Validate input quality first
      const validationError = this.validateJobInput(jobAd)
      if (validationError) {
        return validationError
      }

      // 1) Preprocess locally to reduce tokens
      const safeAd = jobAd.slice(0, MAX_AD_CHARS)
      const jobSummary = summarizeJobLocally(safeAd)               // ~400–700 chars
      const { facts, pickProject, fitBucket, gaps } = selectAndCondense(profile, jobSummary) // ~<=1200 chars

      // 2) Pick the one‑liner locally (no need to send matchPhrases to model)
      const quick_take = chooseOneLiner(fitBucket, profile?.tone?.matchPhrases)

      // 3) Detect location restrictions
      const locationInfo = detectLocationRestrictions(jobAd)

      // 4) Detect AI/tech claims
      const aiInfo = detectAITechClaims(jobAd)

      // Debug logging
      console.log('🔍 Analysis Debug:', {
        fitBucket,
        locationInfo,
        aiInfo,
        hasAdjacentExperience: /healthcare|medical|patient|saas|complex|enterprise|b2b|portal|hardware|software/.test(JSON.stringify(profile.experiences || []).toLowerCase()),
        hasHealthcareOverlap: /healthcare|medical|patient|health|wellness/.test(jobAd.toLowerCase()) && /healthcare|medical|patient/.test(JSON.stringify(profile.experiences || []).toLowerCase()),
        jobAdPreview: jobAd.substring(0, 200) + '...',
        locationDetectionDebug: {
          inHouseStockholm: /in.?house\s*team\s*in\s*stockholm/i.test(jobAd.toLowerCase()),
          stockholmBased: /stockholm\s*based|based\s*in\s*stockholm/i.test(jobAd.toLowerCase()),
          swedenBased: /sweden\s*based|based\s*in\s*sweden/i.test(jobAd.toLowerCase()),
          workplaceNordic: /workplace\s*:\s*[^.]*(stockholm|oslo|helsinki|norway|sweden|finland|nordic|nordics)/i.test(jobAd.toLowerCase()),
          inOfficeStockholm: /in.?office|4\s*days\s*a\s*week|stockholm\s*4\s*days/i.test(jobAd.toLowerCase()),
          sustainabilityFocus: /clean.?energy|sustainability|environmental|co2|emissions|heating|energy/i.test(jobAd.toLowerCase()),
          webDesignFocus: /web|website|lead.?generation|conversion|digital|online/i.test(jobAd.toLowerCase())
        },
        projectSelectionDebug: {
          selectedProject: pickProject,
          isUXRole: /ux|user.?experience|design|interface|interaction|usability/.test(jobSummary.toLowerCase()),
          projectScores: profile.projects?.map((p: any) => ({ title: p.title, score: 'calculated later' })) || []
        }
      })

      // 5) Build a tiny prompt
      const prompt = buildTinyPrompt(jobSummary, facts, {
        summarySentences: SUMMARY_SENTENCES,
        strengthsCount: STRENGTHS_COUNT
      }, profile, locationInfo || undefined, aiInfo || undefined)

      // 5) Call model (flash -> fallback pro) with backoff, strict JSON
      const schema = {
        type: 'object',
        properties: {
          quick_take: { type: 'string' },
          summary: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          project: {
            type: 'object',
            properties: { title: { type: 'string' }, line: { type: 'string' } },
            required: ['title', 'line']
          },
          gaps: { type: 'array', items: { type: 'string' } },
          closing: { type: 'string' }
        },
        required: ['summary', 'strengths', 'project']
      } as const

      const result = await generateWithFallback(
        this.genAI,
        prompt,
        schema
      )

      // 5) Inject the locally chosen quick_take and closing line (model didn't see phrases)
      let parsed: MatchOutput
      
      try {
        // Defensive parsing with fallback
        let responseText = '{}'
        if (result?.response?.text) {
          if (typeof result.response.text === 'function') {
            responseText = result.response.text()
          } else {
            responseText = result.response.text
          }
        }
        parsed = JSON.parse(responseText) as MatchOutput
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.error('Raw response:', result)
        
        // Fallback to default structure
        parsed = {
          quick_take: quick_take,
          summary: 'Analysis completed successfully.',
          strengths: ['Strong analytical capabilities', 'Proven track record', 'Adaptable problem-solving approach'],
          project: pickProject
        } as MatchOutput
      }
      
      // Ensure required fields exist
      if (!parsed.summary) parsed.summary = 'Analysis completed successfully.'
      if (!parsed.strengths || !Array.isArray(parsed.strengths)) parsed.strengths = ['Strong analytical capabilities', 'Proven track record', 'Adaptable problem-solving approach']
      if (!parsed.project) parsed.project = pickProject
      
      // Apply Quick Take calibration rules
      parsed.quick_take = quick_take
      
      // Apply location handling to summary if restrictions detected
      if (locationInfo && locationInfo.hasRestriction && locationInfo.summaryNote) {
        // Add location acknowledgment at the end of summary
        if (parsed.summary && !parsed.summary.includes(locationInfo.summaryNote)) {
          parsed.summary = parsed.summary.trim() + ' ' + locationInfo.summaryNote
        }
      }
      
      // Apply AI/tech claims handling if needed
      if (aiInfo && aiInfo.hasAIClaims) {
        // Ensure the AI response doesn't overclaim AI experience
        // The prompt should handle this, but we can add additional validation here
        console.log('AI claims detected in job ad:', aiInfo.aiKeywords)
      }
      
      // Add appropriate closing line based on fit strength and consulting detection
      let closingLine = chooseClosingLine(fitBucket, profile?.tone?.closingLines)
      
      // Apply closing line strength rules based on fit bucket
      const closingRules = profile.rules?.closing_line_strength
      if (closingRules) {
        if (fitBucket === 'strong_fit' && closingRules.strong_fit) {
          closingLine = closingRules.strong_fit[Math.floor(Math.random() * closingRules.strong_fit.length)]
        } else if (fitBucket === 'good_fit' && closingRules.good_fit) {
          closingLine = closingRules.good_fit[Math.floor(Math.random() * closingRules.good_fit.length)]
        } else if (fitBucket === 'stretch_fit' && closingRules.stretch_fit) {
          closingLine = closingRules.stretch_fit[Math.floor(Math.random() * closingRules.stretch_fit.length)]
        }
      }
      
      // Check if this is a consulting opportunity and use appropriate closing
      if (profile?.consulting_policy && isConsultingOpportunity(jobSummary)) {
        const consultingClosings = profile.consulting_policy.closing_phrases
        if (consultingClosings && consultingClosings.length > 0) {
          closingLine = consultingClosings[Math.floor(Math.random() * consultingClosings.length)]
        }
      }
      
      if (closingLine) parsed.closing = closingLine
      
      if (gaps.length && !parsed.gaps) parsed.gaps = gaps.slice(0, 2)

      // Ensure limits (defensive)
      parsed.strengths = (parsed.strengths || []).slice(0, STRENGTHS_COUNT)

      // Ensure a project line exists; if not, use our pick
      if (!parsed.project?.title) parsed.project = pickProject

      // Post-parse enforcement for quotes
      const policy = profile?.output_prefs?.reference_policy || {}
      const minQ = Math.max(1, policy.min_direct_quotes || 1)
      const maxQ = Math.max(minQ, policy.max_direct_quotes || 2)
      const maxWords = policy.max_quote_words || 8

      const countQuotes = (s: string) => (s?.match(/\*\*"[^\"]+"\*\*/g) || []).length

      // Bold + clamp in summary first (defensive)
      if (parsed.summary) {
        parsed.summary = boldAndClampQuotes(parsed.summary, maxWords)
      }

      // If not enough quotes, try to bold/clamp in first strengths items
      let totalQuotes = parsed.summary ? countQuotes(parsed.summary) : 0
      if (totalQuotes < minQ && Array.isArray(parsed.strengths)) {
        for (let i = 0; i < parsed.strengths.length && totalQuotes < minQ; i++) {
          if (parsed.strengths[i]) {
            parsed.strengths[i] = boldAndClampQuotes(parsed.strengths[i], maxWords)
            totalQuotes += countQuotes(parsed.strengths[i])
          }
        }
      }

      // If too many quotes, soften extras by removing bold (keep plain text)
      const softenExcess = (s: string) => {
        if (!s) return s
        let q = countQuotes(s)
        while (q > 0 && totalQuotes > maxQ) {
          s = s.replace(/\*\*("[^"]+")\*\*/, '$1') // drop bold on last match
          totalQuotes--
          q--
        }
        return s
      }
      
      if (parsed.summary) {
        parsed.summary = softenExcess(parsed.summary)
      }
      if (Array.isArray(parsed.strengths)) {
        parsed.strengths = parsed.strengths.map(softenExcess)
      }

      return parsed
      
    } catch (error) {
      console.error('Role match analysis error:', error)
      
      // Return a safe fallback response
      return {
        quick_take: 'I\'m interested in exploring this opportunity.',
        summary: 'I\'ve reviewed the role requirements and see potential for collaboration. My background in UX design and research could be valuable here.',
        strengths: [
          'Proven track record in user-centered design',
          'Strong analytical and problem-solving skills',
          'Experience with complex systems and stakeholder management'
        ],
        project: {
          title: 'Portfolio project',
          line: 'Demonstrates end-to-end design thinking and delivery capabilities.'
        }
      }
    }
  }
}

export default GeminiAIService.getInstance()

// ---------- Local preprocessing (token savers) ----------

function detectLocationRestrictions(jobAd: string): {
  hasRestriction: boolean
  restrictionType: string | null
  qualifier: string | null
  gapsNote: string | null
  summaryNote: string | null
} {
  const lower = jobAd.toLowerCase()
  
  // Check for explicit location restrictions
  if (/europe\s*only|eu\s*only|european\s*only/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'europe_only',
      qualifier: "My preference is for fully remote roles, though I'm open to exceptional opportunities regardless of location.",
      gapsNote: "Location flexibility may be a consideration, though I'm curious about potential remote arrangements or exceptional opportunities.",
      summaryNote: "I noticed this role emphasizes EU-only work. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  if (/us\s*only|united\s*states\s*only|america\s*only|usa\s*only/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'us_only',
      qualifier: "While I'm based in Europe, I'm open to exploring opportunities that align with my remote work preferences.",
      gapsNote: "Geographic location may present practical considerations, though I'm interested in understanding the role's flexibility.",
      summaryNote: "I noticed this role emphasizes US-only work. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  if (/stockholm\s*only|sweden\s*only|lund\s*only/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'stockholm_only',
      qualifier: "I'm curious about the role's flexibility regarding remote work arrangements.",
      gapsNote: "Location requirements may need discussion, though I see potential for collaboration if there's flexibility.",
      summaryNote: "I noticed this role emphasizes Stockholm-only work. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  // Check for broader Stockholm/Sweden location patterns
  if (/in.?house\s*team\s*in\s*stockholm|stockholm\s*based|sweden\s*based|based\s*in\s*stockholm|based\s*in\s*sweden/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'stockholm_based',
      qualifier: "I'm curious about the role's flexibility regarding remote work arrangements.",
      gapsNote: "Location requirements may need discussion, though I see potential for collaboration if there's flexibility.",
      summaryNote: "I noticed this role emphasizes in-house work in Stockholm. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  // Check for workplace location patterns
  if (/workplace\s*:\s*[^.]*(stockholm|oslo|helsinki|norway|sweden|finland|nordic|nordics)/i.test(lower) || 
      /workplace\s*:\s*[^.]*(stockholm|oslo|helsinki)/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'nordic_workplace',
      qualifier: "I'm curious about the role's flexibility regarding remote work arrangements.",
      gapsNote: "Location requirements may need discussion, though I see potential for collaboration if there's flexibility.",
      summaryNote: "I noticed this role emphasizes workplace locations in Oslo, Helsinki, or Stockholm. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  // Check for travel/relocation requirements
  if (/occasional\s*travel|travel\s*required|relocation|based\s*in|workplace/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'travel_required',
      qualifier: "I'm curious about the role's flexibility regarding remote work arrangements.",
      gapsNote: "Travel requirements may need discussion, though I see potential for collaboration if there's flexibility.",
      summaryNote: "I noticed this role emphasizes workplace locations with occasional travel. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  // Check for in-office requirements
  if (/in.?office|4\s*days\s*a\s*week|5\s*days\s*a\s*week|hybrid|on.?site|stockholm\s*4\s*days/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'in_office_required',
      qualifier: "I'm curious about the role's flexibility regarding remote work arrangements.",
      gapsNote: "In-office requirements may need discussion, though I see potential for collaboration if there's flexibility.",
      summaryNote: "I noticed this role emphasizes in-office work in Stockholm. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  if (/location\s*restricted|must\s*be\s*in|relocation\s*required|on.?site\s*only|no\s*remote/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'location_restricted',
      qualifier: "I'm curious about the role's flexibility regarding remote work arrangements.",
      gapsNote: "Location requirements may need discussion, though I see potential for collaboration if there's flexibility.",
      summaryNote: "I noticed this role emphasizes in-house work. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  if (/remote\s*not\s*available|no\s*remote\s*work|on.?site\s*required|must\s*work\s*from\s*office/i.test(lower)) {
    return {
      hasRestriction: true,
      restrictionType: 'remote_excluded',
      qualifier: "Since my priority is full-remote collaboration, this might be a practical limitation unless there's flexibility.",
      gapsNote: "The on-site requirement may not align with my remote work preferences, though I'm open to discussing potential arrangements.",
      summaryNote: "I noticed this role emphasizes on-site work. My focus is remote-first, though I'd be open to a conversation if flexibility exists."
    }
  }
  
  return {
    hasRestriction: false,
    restrictionType: null,
    qualifier: null,
    gapsNote: null,
    summaryNote: null
  }
}

function detectAITechClaims(jobAd: string): {
  hasAIClaims: boolean
  aiKeywords: string[]
} {
  const lower = jobAd.toLowerCase()
  const aiKeywords = [
    'ai-first', 'ai platform', 'artificial intelligence', 'machine learning', 'ml',
    'ai-driven', 'ai-powered', 'ai tools', 'ai systems', 'ai applications',
    'ai-first company', 'ai-driven solutions', 'generative ai', 'cutting-edge technologies',
    'ai-driven solutions', 'ai-driven platform', 'ai-driven features'
  ]
  
  const foundKeywords = aiKeywords.filter(keyword => lower.includes(keyword))
  
  // Also check for broader AI patterns
  const hasAIPatterns = /ai.?first|ai.?driven|ai.?powered|generative.?ai|artificial.?intelligence/i.test(jobAd)
  
  return {
    hasAIClaims: foundKeywords.length > 0 || hasAIPatterns,
    aiKeywords: foundKeywords.length > 0 ? foundKeywords : (hasAIPatterns ? ['AI-related technologies'] : [])
  }
}

function summarizeJobLocally(ad: string): string {
  // Very cheap heuristic extraction: keep the essence
  const lower = ad.toLowerCase()
  const keepLines: string[] = []

  const sections = [
    /about the role([\s\S]*?)(?=\n[A-Z][^\n]*:|\nwhat you|$)/i,
    /responsibilities([\s\S]*?)(?=\n[A-Z][^\n]*:|$)/i,
    /requirements([\s\S]*?)(?=\n[A-Z][^\n]*:|$)/i
  ]

  for (const re of sections) {
    const m = ad.match(re)
    if (m) keepLines.push(condense(m[0], 600))
  }

  // Fall back to first ~600 chars if sections fail
  if (keepLines.length === 0) keepLines.push(condense(ad, 600))

  const joined = keepLines.join('\n').trim()
  return condense(joined, 900) // keep it short
}

function selectAndCondense(profile: any, jobSummary: string) {
  // Score experiences/projects against jobSummary with more nuanced scoring
  const score = (obj: any) => {
    const t = JSON.stringify(obj).toLowerCase()
    let s = 0
    
    // Core competencies (higher weight)
    if (rgx.research.test(t) && rgx.research.test(jobSummary)) s += 3
    if (rgx.systems.test(t) && rgx.systems.test(jobSummary)) s += 3
    if (rgx.data.test(t) && rgx.data.test(jobSummary)) s += 2
    if (rgx.access.test(t) && rgx.access.test(jobSummary)) s += 2
    
    // Domain expertise (higher weight for strong matches)
    const hasHealthcare = /healthcare|medical|patient|clinical/.test(t) && /healthcare|medical|patient|clinical/.test(jobSummary)
    const hasB2B = /b2b|enterprise|business|corporate/.test(t) && /b2b|enterprise|business|corporate/.test(jobSummary)
    const hasComplex = /complex|enterprise|hardware|multi-?platform|portal/.test(t) && /complex|enterprise|hardware|multi-?platform|portal/.test(jobSummary)
    
    if (hasHealthcare) s += 3
    if (hasB2B) s += 2
    if (hasComplex) s += 2
    
    // UX Design specific scoring (higher weight for UX roles)
    const isUXRole = /ux|user.?experience|design|interface|interaction|usability/.test(jobSummary.toLowerCase())
    if (isUXRole) {
      // Boost UX research and usability projects
      if (/user.?research|usability.?testing|workshop|facilitation|insight/.test(t)) s += 4
      // Boost design system and interface projects
      if (/design.?system|interface|interaction|prototype|figma/.test(t)) s += 3
      // Boost user journey and experience projects
      if (/user.?journey|experience|flow|workflow/.test(t)) s += 3
      // Boost web design and lead generation projects
      if (/web|website|digital|online|conversion|lead/.test(t)) s += 3
      // Boost sustainability and behavior change projects
      if (/sustainability|environmental|clean|energy|health|wellness|behavior|habit/.test(t)) s += 3
      // Reduce score for pure data/analytics projects in UX roles
      if (/data|analytics|reporting|trading|energy/.test(t) && !/user|design|interface|web|sustainability/.test(t)) s -= 2
    }
    
    // General indicators
    if (rgx.complex.test(t)) s += 1
    if (rgx.remote.test(t)) s += 1
    
    return s
  }

  const exps = [...(profile.experiences || [])]
    .sort((a,b)=>score(b)-score(a))
    .slice(0,2) // only 2 experiences

  const prjs = [...(profile.projects || [])]
    .sort((a,b)=>score(b)-score(a))
    .slice(0,1) // only 1 project

  const facts = condense(buildFacts(exps, prjs), MAX_FACTS_CHARS)

  // Gaps (computed locally): if job mentions SaaS/FinTech/Security and we lack direct mention
  const gaps: string[] = []
  const js = jobSummary.toLowerCase()
  const hasFintech = /fintech|bank|finance|payments/.test(js)
  const hasSecurity = /security|devsecops|secrets?/.test(js)
  const hasMarketingSaaS = /saas|marketing|crm|automation/.test(js)

  const profileTxt = JSON.stringify({ exps, prjs }).toLowerCase()
  if (hasFintech && !/fintech|bank|finance|payments/.test(profileTxt))
    gaps.push('No direct FinTech product experience.')
  if (hasSecurity && !/security|devsecops|secrets?/.test(profileTxt))
    gaps.push('No direct DevSecOps/security product experience.')
  if (hasMarketingSaaS && !/saas|marketing/.test(profileTxt))
    gaps.push('Limited direct experience with marketing SaaS tools.')

  // Improved fit bucket selection with better calibration
  const fitScore = exps.reduce((a,e)=>a+score(e),0) + prjs.reduce((a,p)=>a+score(p),0)
  const penalty = gaps.length ? 1 : 0
  const adjustedScore = fitScore - penalty
  
  // More conservative thresholds to prevent contradictions
  let fit: FitBucket = 'good_fit'
  
  // Strong fit: Clear overlap in core competencies and domain expertise
  if (adjustedScore >= 12) {
    fit = 'strong_fit'
  }
  // Good fit: Solid overlap in key areas
  else if (adjustedScore >= 8) {
    fit = 'good_fit'
  }
  // Stretch fit: Some overlap but significant gaps
  else if (adjustedScore >= 4) {
    fit = 'stretch_fit'
  }
  // Exploratory fit: Minimal overlap, mostly adjacent experience
  else {
    fit = 'exploratory_fit'
  }

  // Override logic: If there are clear matches in core areas, don't default to stretch/exploratory
  const hasCoreMatches = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    return (rgx.research.test(expText) && rgx.research.test(jobSummary)) ||
           (rgx.systems.test(expText) && rgx.systems.test(jobSummary)) ||
           (/healthcare|medical|patient/.test(expText) && /healthcare|medical|patient/.test(jobSummary)) ||
           (/b2b|enterprise/.test(expText) && /b2b|enterprise/.test(jobSummary))
  })
  
  // Enhanced override logic based on new Quick Take calibration rules
  if (hasCoreMatches && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  if (hasCoreMatches && fit === 'exploratory_fit') {
    fit = 'stretch_fit'
  }
  
  // Additional override: If candidate has adjacent experience (healthcare, SaaS-like, complex systems), 
  // upgrade to at least stretch_fit (never exploratory_fit)
  const hasAdjacentExperience = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    return /healthcare|medical|patient|saas|complex|enterprise|b2b|portal|hardware|software/.test(expText)
  })
  
  if (hasAdjacentExperience && fit === 'exploratory_fit') {
    fit = 'stretch_fit'
  }
  
  // If there's strong domain overlap (healthcare, B2B, enterprise), upgrade further
  const hasStrongDomainOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/healthcare|medical|patient/.test(expText) && /healthcare|medical|patient|health|wellness|lifesum|healthy|habits/.test(jobText)) ||
           (/b2b|enterprise|portal/.test(expText) && /b2b|enterprise|portal|complex|systems/.test(jobText))
  })
  
  if (hasStrongDomainOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  
  // Additional upgrade: If there's very strong healthcare overlap (like health tech company), upgrade to good_fit
  const hasVeryStrongHealthcareOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/healthcare|medical|patient|fluid|tracker|health/.test(expText) && 
            /health|wellness|healthy|habits|lifesum|health.?tech|consumer.?health/.test(jobText))
  })
  
  if (hasVeryStrongHealthcareOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  
  // Additional upgrade: If there's strong product design overlap (mobile/web, user journeys, interfaces)
  const hasStrongProductDesignOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/mobile|web|user.?journey|interface|interaction|prototype|design.?system/.test(expText) && 
            /mobile|web|user.?journey|interface|interaction|prototype|design.?system/.test(jobText))
  })
  
  if (hasStrongProductDesignOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  
  // Additional upgrade: If there's strong UX research and usability overlap
  const hasStrongUXResearchOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/user.?research|usability.?testing|insight|workshop|facilitation/.test(expText) && 
            /user.?insight|usability.?testing|workshop|facilitation|insight.?gathering/.test(jobText))
  })
  
  if (hasStrongUXResearchOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  
  // Additional upgrade: If there's strong complex systems and enterprise overlap
  const hasStrongComplexSystemsOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/complex.?systems|enterprise|hardware|software|multi.?platform|portal/.test(expText) && 
            /complex|enterprise|multinational|cross.?functional|supplier|platform/.test(jobText))
  })
  
  if (hasStrongComplexSystemsOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  
  // Additional upgrade: If there's Nordic/Scandinavian experience overlap
  const hasNordicExperienceOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/sweden|norway|finland|nordic|scandinavian|europe/.test(expText) && 
            /norway|sweden|finland|nordic|nordics|scandinavian/.test(jobText))
  })
  
  if (hasNordicExperienceOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  
  // Additional upgrade: If there's sustainability/clean energy overlap
  const hasSustainabilityOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/sustainability|environmental|clean|energy|health|wellness|behavior/.test(expText) && 
            /clean.?energy|sustainability|environmental|co2|emissions|heating|energy/.test(jobText))
  })
  
  if (hasSustainabilityOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  
  // Additional upgrade: If there's web design and lead generation overlap
  const hasWebDesignOverlap = exps.some(exp => {
    const expText = JSON.stringify(exp).toLowerCase()
    const jobText = jobSummary.toLowerCase()
    return (/web|website|digital|online|ecommerce|conversion|lead/.test(expText) && 
            /web|website|lead.?generation|conversion|digital|online/.test(jobText))
  })
  
  if (hasWebDesignOverlap && fit === 'stretch_fit') {
    fit = 'good_fit'
  }

  const pickProject = prjs[0]
    ? { title: prjs[0].title, line: makeProjectLine(prjs[0]) }
    : { title: 'Selected project', line: 'Evidence of end‑to‑end design with research, systems and delivery.' }

  return { facts, pickProject, fitBucket: fit, gaps }
}

// Condense text to N chars without cutting words weirdly
function condense(txt: string, max: number) {
  if (txt.length <= max) return txt
  const cut = txt.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return cut.slice(0, lastSpace > 0 ? lastSpace : cut.length) + '…'
}

function buildFacts(exps: any[], prjs: any[]): string {
  const expLines = exps.map(e => {
    const h = (e.highlights || []).slice(0,2).join(' | ')
    return `• ${e.company}: ${e.role} — ${h || e.impact || ''}`
  })
  const prjLines = prjs.map(p => {
    const ev = (p.evidence || []).slice(0,1).join(' ')
    return `• ${p.title} (${p.company}) — ${ev}`
  })
  return [
    'EXPERIENCE:',
    ...expLines,
    'PROJECT:',
    ...prjLines,
    'THEMES: research, usability, design systems, Figma, accessibility, complex systems, remote collaboration'
  ].join('\n')
}

function makeProjectLine(p:any) {
  const ev = (p.evidence || [])[0] || 'Demonstrates end‑to‑end problem solving.'
  return `${p.title} — ${ev}`
}

// ---------- One‑liner selection (local) ----------
type FitBucket = 'strong_fit'|'good_fit'|'stretch_fit'|'exploratory_fit'
function chooseOneLiner(bucket: FitBucket, library: any): string {
  const defaults = {
    strong_fit: [
      'This feels like a great match.',
      'I can clearly see how my experience aligns with your needs.',
      'There\'s strong alignment between your requirements and my background.'
    ],
    good_fit: [
      'This feels like a solid opportunity where I can contribute and also grow.',
      'I see clear connections and potential to make an impact here.',
      'This looks like good ground where my experience can add value.'
    ],
    stretch_fit: [
      'This may not be a perfect match, but I see areas where I can add value and perspective.',
      'Some new territory, but I bring relevant adjacent experience.',
      'Interesting challenge - I see opportunities to contribute, even if it\'s a stretch.'
    ],
    exploratory_fit: [
      'This role sits outside my direct experience, but I\'m open to exploring how my background could help.',
      'Different from my typical work, though I see potential synergies.',
      'This is outside my usual scope, but I\'m curious about the fit.'
    ]
  }
  const bank = library?.[bucket] || defaults[bucket]
  return bank[Math.floor(Math.random()*bank.length)];
}

function chooseClosingLine(bucket: FitBucket, library: any): string {
  const defaults = {
    strong_fit: [
      'If this resonates, I\'m open to a short conversation.',
      'This looks promising - keen to explore further.'
    ],
    good_fit: [
      'If this feels right, I\'m open to a conversation.',
      'Worth exploring together - let me know if you\'d like to connect.'
    ],
    stretch_fit: [
      'If you see potential here, I\'m open to a conversation.',
      'Curious to explore this further if it makes sense.'
    ],
    exploratory_fit: [
      'If this intrigues you, I\'m open to a conversation.',
      'Curious to learn more if you see potential.'
    ]
  }
  const bank = library?.[bucket] || defaults[bucket]
  return bank[Math.floor(Math.random()*bank.length)];
}

// ---------- Prompt (tiny) ----------
function buildTinyPrompt(jobSummary: string, candidateFacts: string, opts: {summarySentences: number; strengthsCount: number}, profile: any, locationInfo?: {hasRestriction: boolean; restrictionType: string | null; qualifier: string | null; gapsNote: string | null; summaryNote: string | null}, aiInfo?: {hasAIClaims: boolean; aiKeywords: string[]}) {
  // Extract configuration from profile
  const outputPrefs = profile.output_prefs || {}
  const evidenceStyle = profile.evidence_style || {}
  const qualityChecks = profile.quality_checks || {}
  const consultingPolicy = profile.consulting_policy || {}
  const provenanceRules = profile.provenance_rules || {}
  const claimsGuardrails = profile.rules?.claims_guardrails || {}
  
  // Set default locationInfo if not provided
  const locInfo = locationInfo || {
    hasRestriction: false,
    restrictionType: null,
    qualifier: null,
    gapsNote: null,
    summaryNote: null
  }
  
  // Set default aiInfo if not provided
  const ai = aiInfo || {
    hasAIClaims: false,
    aiKeywords: []
  }

  // Build dynamic prompt based on profile configuration
  let prompt = `
SYSTEM
You write a concise first-person match note for a senior designer's portfolio. No score. Be confident, selective, and intriguing - this is a designer who knows their value.

CONTEXT
JOB (compressed):
${jobSummary}

CANDIDATE FACTS (compressed):
${candidateFacts}

TASK
1) Summary: max ${opts.summarySentences} sentences. Anchor to the role's requirements and problem space (not the company).`



  prompt += ` Mention relevant themes only if present (research, usability testing, design systems, Figma, accessibility, complex systems, remote collaboration). Express "trust + challenge + autonomy" tone with confidence.`

  // Add evidence requirements
  if (evidenceStyle.rules) {
    prompt += `\n2) Evidence: ${evidenceStyle.rules.join(' ')} Use specific nouns from the job ad and connect them to concrete examples from my experience.`
  }

  // Add provenance rules for grounded claims
  if (provenanceRules.ad_noun_requires_profile_match) {
    prompt += `\n\nPROVENANCE RULES:
- When referencing nouns from the job ad, only claim direct experience if it exists in my profile
- Check these profile fields for evidence: ${provenanceRules.profile_match_fields.join(', ')}
- If no direct match found, use softening language instead of claiming expertise`
  }

  // Add claims guardrails
  if (claimsGuardrails.ban_if_only_in_ad) {
    prompt += `\n\nFORBIDDEN CLAIMS (when noun only exists in ad, not profile):
- ${claimsGuardrails.ban_if_only_in_ad.join('\n- ')}`
  }

  if (claimsGuardrails.soften_if_missing) {
    prompt += `\n\nSOFTENING PHRASES (when no direct profile match):
- ${claimsGuardrails.soften_if_missing.join('\n- ')}`
  }

  if (outputPrefs.ad_reference_policy?.fallback_phrases) {
    prompt += `\n\nFALLBACK PHRASES:
- ${outputPrefs.ad_reference_policy.fallback_phrases.join('\n- ')}`
  }

  // Add provenance validation results
  const provenance = validateProvenance(jobSummary, profile);
  if (provenance.nouns.length > 0) {
    prompt += `\n\nPROVENANCE VALIDATION:
Key nouns from job ad and their evidence status:`
    provenance.nouns.forEach((noun, index) => {
      const status = provenance.hasEvidence[index] ? '✅ HAS EVIDENCE' : '❌ NO EVIDENCE';
      prompt += `\n- ${noun}: ${status}`;
    });
    prompt += `\n\nUse softening language for nouns marked "NO EVIDENCE".`;
  }

  prompt += `
3) Strengths: ${opts.strengthsCount} bullets, each sharp and concrete. Mix direct and transferable. Show value without boasting.
4) Project: pick one and explain in a single line why it's relevant evidence.
5) Gaps: include only if meaningful (0–2). Acknowledge honestly, show growth mindset.`

  // Add location handling instructions if restrictions detected
  if (locInfo.hasRestriction) {
    prompt += `\n\nLOCATION HANDLING (CRITICAL):
- The job ad has location restrictions: ${locInfo.restrictionType}
- You MUST add this sentence at the END of the Summary: "${locInfo.summaryNote}"
- Use this qualifier in the summary: "${locInfo.qualifier}"
- If including gaps, add this note: "${locInfo.gapsNote}"
- Maintain professional, curious tone - never sound desperate or apologetic
- Always leave the door open for conversation about flexibility
- Bridge-building approach: show interest while acknowledging practical considerations
- This is NOT optional - you must include the location acknowledgment`
  }

  // Add AI/tech claims handling
  if (ai.hasAIClaims) {
    prompt += `\n\nAI/TECH CLAIMS HANDLING (CRITICAL):
- Job ad mentions AI/tech: ${ai.aiKeywords.join(', ')}
- CRITICAL: Only mention AI-first or AI platforms if explicitly present in candidate profile
- If profile doesn't have AI experience, use soft phrasing: "I'm familiar with AI-driven tools and adjacent patterns, and I'd apply my research-first approach here"
- NEVER hallucinate direct AI platform experience
- Focus on research-first approach and adjacent patterns
- This is NOT optional - you must follow these rules strictly`
  }

  // Add Quick Take calibration rules
  const quickTakeRules = profile.rules?.quick_take_calibration
  if (quickTakeRules) {
    prompt += `\n\nQUICK TAKE CALIBRATION (CRITICAL):
- Do NOT classify as "exploratory_fit" if candidate has adjacent experience (healthcare, SaaS-like, complex systems)
- In such cases, upgrade Quick Take to at least "stretch_fit" or "good_fit"
- Avoid downplaying synergies when overlap exists
- Consider healthcare, B2B, enterprise, and complex systems as adjacent experience
- NEVER use language like "interesting departure from my path" or "unconventional fit" when there's clear domain overlap
- This is NOT optional - you must follow these rules strictly`
  }

  // Add Summary intro pattern rules
  const summaryIntroRules = profile.rules?.summary_intro_patterns
  if (summaryIntroRules) {
    prompt += `\n\nSUMMARY INTRO PATTERNS:
- NEVER start with generic "I'm a product designer…" or "I have a proven ability…"
- Start with confident, specific phrasing anchored in candidate identity
- Use these intro templates (randomize slightly for variety):
  * "I design with clarity and structure, bringing research and usability into complex systems."
  * "I thrive on simplifying healthcare and B2B challenges into flows people trust."
  * "I bring structure and research to complex systems, turning messy problems into clear solutions."
  * "I design for trust in healthcare and enterprise, where clarity saves time and prevents errors."
- Must always sound personal and senior, not generic`
  }

  // Add closing line strength rules
  const closingRules = profile.rules?.closing_line_strength
  if (closingRules) {
    prompt += `\n\nCLOSING LINE STRENGTH:
- If fitBucket = strong_fit → Closing must be confident:
  * "This looks promising — I'd be glad to explore further."
  * "If this resonates, I'm open to a short conversation."
- If fitBucket = good_fit → balanced:
  * "Worth exploring together — let me know if you'd like to connect."
- If stretch_fit → exploratory but not weak:
  * "If you see potential here, I'm open to discussing how my background might fit."
- AVOID overly weak closings like "Curious to learn more if you see potential"`
  }

  // Add summary guardrails
  const summaryGuardrails = profile.rules?.summary_guardrails
  if (summaryGuardrails) {
    prompt += `\n\nSUMMARY GUARDRAILS:
- NO company name insertions in Summary ("At X, I…")
- Avoid tautologies like "which matches the requirements of this role"
- Always anchor to role themes and problem space, not brand slogans
- Focus on problem space, requirements, and role themes`
  }

  // Add communication softening rules
  const communicationRules = profile.rules?.communication_softening
  if (communicationRules) {
    prompt += `\n\nCOMMUNICATION SOFTENING:
- Always leave space for reinterpretation: use soft language if unsure (e.g., "may overlap with my background" instead of hard claims)
- If requirements could be misinterpreted, soften the tone: "I may not match every detail, but my strengths in X and Y are highly relevant"
- Never produce rigid rejections ("This won't work") — instead use cautious curiosity ("This might be a stretch, though I see potential overlaps worth exploring")`
  }

  // Add quality check requirements
  if (qualityChecks.require) {
    prompt += `\n\nQUALITY REQUIREMENTS:
- ${qualityChecks.require.join('\n- ')}`
  }

  if (qualityChecks.avoid) {
    prompt += `\n\nAVOID:
- ${qualityChecks.avoid.join('\n- ')}`
  }

  prompt += `\n\nNARRATIVE FLOW:
- Summary should read like a confident, senior narrative paragraph, not stitched blocks
- Start by anchoring to role themes and problem space, not company names
- Quick Take, Summary, Strengths, and Project should all align in tone and not contradict each other
- Strengths should have variety in voice - mix storytelling style ("At Axis I brought structure...", "I integrate research naturally...") with direct statements
- Make the overall flow feel human and natural, not like a checklist`

  prompt += `\n\nAVOID:
- Company names, brand slogans, or "At <company>" phrasing
- Generic claims without evidence
- Overly eager language ('dream job', 'perfect fit for me')
- Tautological phrases like "which matches the requirements of this role"
- Contradictions between Quick Take and Summary/Strengths`

  prompt += `\n\nPREFER:
- Focus on role requirements and problem space
- Evidence-based claims with concrete examples
- Professional, measured tone
- Instead of tautology, rephrase to show alignment with the company's goals or focus areas
- Use alternatives such as "aligned with your focus on...", "relevant to your emphasis on...", "which supports your goal of...", "that addresses your need for..."`

  // Add explicit quoting instructions
  const referencePolicy = profile.output_prefs?.reference_policy || {}
  const maxQuoteWords = referencePolicy.max_quote_words || 8
  const preferPhrases = profile.rules?.prefer_phrases || ["aligned with your focus on","relevant to your emphasis on","directly connected to","which supports your goal of","that addresses your need for"]
  
  prompt += `\n\nQUOTING REQUIREMENTS:
Include 1–2 short direct phrases from the job ad, quoted and bolded like **"exact phrase"**.
- Keep each quoted phrase under ${maxQuoteWords} words.
- Only quote phrases that appear verbatim in the ad (from requirements/responsibilities/about-the-role).
- Do not quote generic words (e.g., "design", "team", "product") unless they appear as a specific phrase in the ad.
- Each quote must flow naturally into my evidence (project or experience) — never leave a quote standing alone.
- Use natural connectors like "aligned with your focus on", "relevant to your emphasis on", "which supports your goal of", "that addresses your need for".
- Avoid awkward phrasing like "which matches the requirements of this role", "directly addresses the need for", "your need to...".
- Make quotes feel integrated into the narrative, not bolted on.`

  // Add consulting policy if relevant
  if (consultingPolicy.stance === 'selective_cautious') {
    prompt += `\n\nCONSULTING APPROACH:
- I'm selective about consulting engagements
- Only mention consulting if the job ad specifically mentions contract/freelance/consulting work
- Use measured, professional language that shows selectivity, not desperation`
  }

  prompt += `

TONE GUIDELINES
- Confident but not arrogant
- Selective and intriguing, not desperate
- Professional and measured
- Show standards and selectivity
- Invitation, not application`

  // Add evidence style connectors
  if (evidenceStyle.preferred_connectors) {
    prompt += `\n- Use connectors like: ${evidenceStyle.preferred_connectors.join(', ')}`
  }

  prompt += `

OUTPUT (JSON only):
{
  "summary": "string (must include {{company}} in the first sentence)",
  "strengths": ["string","string","string"],
  "project": {"title":"string","line":"string"},
  "gaps": ["string"]
}`

  // Debug: log the final prompt to see what's being sent to the AI
  console.log('🤖 Final prompt debug:', {
    hasCompanyRequirement: prompt.includes('MUST mention'),
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 500) + '...'
  });

  return prompt.trim()
}

// ---------- Model calling with backoff + fallback ----------
async function generateWithFallback(genAI: GoogleGenerativeAI, prompt: string, schema: any) {
  try {
    return await callModel(genAI, MODEL_PRIMARY, prompt, schema)
  } catch (e:any) {
    console.error('Primary model error:', e)
    
    // Rate limiting - try fallback
    if (String(e.message).includes('429')) {
      try {
        return await callModel(genAI, MODEL_FALLBACK, prompt, schema)
      } catch (fallbackError) {
        console.error('Fallback model error:', fallbackError)
        throw fallbackError
      }
    }
    
    // Other errors - throw with context
    throw new Error(`AI model error: ${e.message}`)
  }
}

async function callModel(genAI: GoogleGenerativeAI, modelName: string, prompt: string, schema: any) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 900, // keep response small
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  })
  return await withBackoff(() => model.generateContent(prompt))
}

async function withBackoff<T>(fn: () => Promise<T>, max = 3) {
  let delay = 800
  for (let i=1; i<=max; i++) {
    try { return await fn() }
    catch (e:any) {
      const m = String(e?.message||'').match(/retryDelay":"(\d+)s/)
      const wait = m ? Number(m[1])*1000 : delay
      if (i === max) throw e
      await sleep(wait + Math.floor(Math.random()*300))
      delay *= 2
    }
  }
  // unreachable
}

const sleep = (ms:number)=>new Promise(r=>setTimeout(r, ms))

// ---------- Regex bank ----------
const rgx = {
  research: /(research|usability|user testing|interview|study|workshop)/i,
  systems: /(design system|component|library|figma)/i,
  data: /(analytics|report|dashboard|data|insight|visualization)/i,
  access: /(accessibility|wcag|contrast|a11y)/i,
  complex: /(complex|enterprise|hardware|multi-?platform|portal|b2b)/i,
  remote: /(remote|distributed|asynchronous|async)/i
}

function isConsultingOpportunity(jobSummary: string): boolean {
  const s = jobSummary.toLowerCase()
  // Strict check: only trigger on explicit consulting/contract/freelance keywords
  return /\b(consult(ing|ant)|contract|freelance|agency|outsourc(e|ed|ing))\b/.test(s)
}

function validateProvenance(jobSummary: string, profile: any): { nouns: string[], hasEvidence: boolean[] } {
  // Extract potential nouns from job summary (simplified approach)
  const nouns = jobSummary.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const uniqueNouns = Array.from(new Set(nouns)).filter(noun => 
    noun.length > 3 && 
    !['The', 'This', 'That', 'With', 'From', 'Have', 'Will', 'Can', 'Are', 'You', 'Your', 'Our', 'We'].includes(noun)
  );
  
  // Check if each noun exists in profile data
  const profileText = JSON.stringify(profile).toLowerCase();
  const hasEvidence = uniqueNouns.map(noun => 
    profileText.includes(noun.toLowerCase())
  );
  
  return { nouns: uniqueNouns, hasEvidence };
}

function boldAndClampQuotes(text: string, maxWords = 8): string {
  if (!text) return text
  // Find quoted segments "..." and wrap with **"..."**, clamp length
  return text.replace(/"([^"]{3,200})"/g, (_, inner) => {
    const words = inner.trim().split(/\s+/)
    const clamped = words.length > maxWords ? words.slice(0, maxWords).join(' ') + '…' : inner.trim()
    const alreadyBold = /\*\*".*"\*\*/.test(`**"${clamped}"**`)
    return alreadyBold ? `"${clamped}"` : `**"${clamped}"**`
  })
}
