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

export class GeminiAIService {
  private static instance: GeminiAIService
  static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) GeminiAIService.instance = new GeminiAIService()
    return GeminiAIService.instance
  }

  private genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || ''
  )

  async analyzeJobWithCV(jobAd: string, profile: any): Promise<MatchOutput> {
    try {
      // 1) Preprocess locally to reduce tokens
      const safeAd = jobAd.slice(0, MAX_AD_CHARS)
      const jobSummary = summarizeJobLocally(safeAd)               // ~400–700 chars
      const { facts, pickProject, fitBucket, gaps } = selectAndCondense(profile, jobSummary) // ~<=1200 chars

      // 2) Pick the one‑liner locally (no need to send matchPhrases to model)
      const quick_take = chooseOneLiner(fitBucket, profile?.tone?.matchPhrases)

      // 3) Build a tiny prompt
      const prompt = buildTinyPrompt(jobSummary, facts, {
        summarySentences: SUMMARY_SENTENCES,
        strengthsCount: STRENGTHS_COUNT
      }, profile)

      // 4) Call model (flash -> fallback pro) with backoff, strict JSON
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
      
      parsed.quick_take = quick_take
      
      // Add appropriate closing line based on fit strength and consulting detection
      let closingLine = chooseClosingLine(fitBucket, profile?.tone?.closingLines)
      
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
  
  if (hasCoreMatches && fit === 'stretch_fit') {
    fit = 'good_fit'
  }
  if (hasCoreMatches && fit === 'exploratory_fit') {
    fit = 'stretch_fit'
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
function buildTinyPrompt(jobSummary: string, candidateFacts: string, opts: {summarySentences: number; strengthsCount: number}, profile: any) {
  // Extract configuration from profile
  const outputPrefs = profile.output_prefs || {}
  const evidenceStyle = profile.evidence_style || {}
  const qualityChecks = profile.quality_checks || {}
  const consultingPolicy = profile.consulting_policy || {}
  const provenanceRules = profile.provenance_rules || {}
  const claimsGuardrails = profile.rules?.claims_guardrails || {}
  
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
