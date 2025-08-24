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
    })

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
    const parsed = JSON.parse(result?.response?.text() || '{}') as MatchOutput
    parsed.quick_take = quick_take
    
    // Add appropriate closing line based on fit strength
    const closingLine = chooseClosingLine(fitBucket, profile?.tone?.closingLines)
    if (closingLine) parsed.closing = closingLine
    
    if (gaps.length && !parsed.gaps) parsed.gaps = gaps.slice(0, 2)

    // Ensure limits (defensive)
    parsed.strengths = (parsed.strengths || []).slice(0, STRENGTHS_COUNT)

    // Ensure a project line exists; if not, use our pick
    if (!parsed.project?.title) parsed.project = pickProject

    return parsed
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
    /what (we'|we'|we a)re looking for([\s\S]*?)(?=\n[A-Z][^\n]*:|$)/i,
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
  // Score experiences/projects against jobSummary
  const score = (obj: any) => {
    const t = JSON.stringify(obj).toLowerCase()
    let s = 0
    if (rgx.research.test(t) && rgx.research.test(jobSummary)) s += 2
    if (rgx.systems.test(t) && rgx.systems.test(jobSummary)) s += 2
    if (rgx.data.test(t) && rgx.data.test(jobSummary)) s += 2
    if (rgx.access.test(t) && rgx.access.test(jobSummary)) s += 2
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

  // Choose fit bucket locally
  let fit: FitBucket = 'good_fit'
  const fitScore = exps.reduce((a,e)=>a+score(e),0) + prjs.reduce((a,p)=>a+score(p),0)
  // rough thresholds based on our scoring (+penalize if big gap)
  const penalty = gaps.length ? 1 : 0
  if (fitScore - penalty >= 10) fit = 'strong_fit'
  else if (fitScore - penalty >= 7) fit = 'good_fit'
  else if (fitScore - penalty >= 4) fit = 'stretch_fit'
  else fit = 'exploratory_fit'

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
      'I can clearly see how my experience aligns with your needs.'
    ],
    good_fit: [
      'This feels like a solid opportunity where I can contribute and also grow.',
      'I see clear connections and potential to make an impact here.'
    ],
    stretch_fit: [
      'This may not be a perfect match, but I see areas where I can add value and perspective.'
    ],
    exploratory_fit: [
      'This role sits outside my direct experience, but I\'m open to exploring how my background could help.'
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
function buildTinyPrompt(jobSummary: string, candidateFacts: string, opts: {summarySentences: number; strengthsCount: number}) {
  return `
SYSTEM
You write a concise first-person match note for a senior designer's portfolio. No score. Be confident, selective, and intriguing - this is a designer who knows their value.

CONTEXT
JOB (compressed):
${jobSummary}

CANDIDATE FACTS (compressed):
${candidateFacts}

TASK
1) Summary: max ${opts.summarySentences} sentences. Mention relevant themes only if present (research, usability testing, design systems, Figma, accessibility, complex systems, remote collaboration). Express "trust + challenge + autonomy" tone with confidence.
2) Strengths: ${opts.strengthsCount} bullets, each sharp and concrete. Mix direct and transferable. Show value without boasting.
3) Project: pick one and explain in a single line why it's relevant evidence.
4) Gaps: include only if meaningful (0–2). Acknowledge honestly, show growth mindset.

TONE GUIDELINES
- Confident but not arrogant
- Selective and intriguing, not desperate
- Professional and measured
- Show standards and selectivity
- Invitation, not application

OUTPUT (JSON only):
{
  "summary": "string",
  "strengths": ["string","string","string"],
  "project": {"title":"string","line":"string"},
  "gaps": ["string"]
}
`.trim()
}

// ---------- Model calling with backoff + fallback ----------
async function generateWithFallback(genAI: GoogleGenerativeAI, prompt: string, schema: any) {
  try {
    return await callModel(genAI, MODEL_PRIMARY, prompt, schema)
  } catch (e:any) {
    if (String(e.message).includes('429')) {
      return await callModel(genAI, MODEL_FALLBACK, prompt, schema)
    }
    throw e
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
