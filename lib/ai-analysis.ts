import { profileData, ProfileData } from './profile-data'

export interface MatchResult {
  overallScore: number
  skillMatch: number
  experienceMatch: number
  projectMatch: number
  industryMatch: number
  summary: string
  strengths: string[]
  areas: string[]
  recommendations: string[]
}

export interface JobRequirement {
  title: string
  description: string
  requiredSkills: string[]
  preferredSkills: string[]
  experience: string
  industry: string
  responsibilities: string[]
}

// Simple scoring algorithm (no external API calls for now)
export function analyzeJobMatch(jobReq: JobRequirement): MatchResult {
  const { skills, projects, experience, industries } = profileData
  
  // Calculate skill match
  const skillMatch = calculateSkillMatch(jobReq.requiredSkills, jobReq.preferredSkills, skills)
  
  // Calculate experience match
  const experienceMatch = calculateExperienceMatch(jobReq.experience, experience)
  
  // Calculate project relevance
  const projectMatch = calculateProjectMatch(jobReq, projects)
  
  // Calculate industry match
  const industryMatch = calculateIndustryMatch(jobReq.industry, industries)
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (skillMatch * 0.4 + experienceMatch * 0.3 + projectMatch * 0.2 + industryMatch * 0.1)
  )
  
  // Generate strengths and areas for improvement
  const strengths = generateStrengths(jobReq, profileData)
  const areas = generateAreasForImprovement(jobReq, profileData)
  const recommendations = generateRecommendations(jobReq, profileData)
  
  // Generate summary
  const summary = generateSummary(jobReq, overallScore, strengths, areas)
  
  return {
    overallScore,
    skillMatch,
    experienceMatch,
    projectMatch,
    industryMatch,
    summary,
    strengths,
    areas,
    recommendations
  }
}

function calculateSkillMatch(required: string[], preferred: string[], profileSkills: ProfileData['skills']): number {
  let score = 0
  let totalWeight = 0
  
  // Check required skills (higher weight)
  required.forEach(skill => {
    const profileSkill = profileSkills.find(s => 
      s.name.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(s.name.toLowerCase())
    )
    
    if (profileSkill) {
      const proficiencyScore = getProficiencyScore(profileSkill.proficiency)
      score += proficiencyScore * 2 // Required skills get double weight
      totalWeight += 2
    }
  })
  
  // Check preferred skills
  preferred.forEach(skill => {
    const profileSkill = profileSkills.find(s => 
      s.name.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(s.name.toLowerCase())
    )
    
    if (profileSkill) {
      const proficiencyScore = getProficiencyScore(profileSkill.proficiency)
      score += proficiencyScore
      totalWeight += 1
    }
  })
  
  return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0
}

function calculateExperienceMatch(requiredExp: string, profileExp: ProfileData['experience']): number {
  const totalYears = profileExp.reduce((sum, exp) => {
    const years = parseInt(exp.duration.split(' ')[0]) || 1
    return sum + years
  }, 0)
  
  const requiredYears = parseInt(requiredExp.match(/\d+/)?.[0] || '0')
  
  if (totalYears >= requiredYears) return 100
  if (totalYears >= requiredYears * 0.8) return 85
  if (totalYears >= requiredYears * 0.6) return 70
  if (totalYears >= requiredYears * 0.4) return 50
  return 30
}

function calculateProjectMatch(jobReq: JobRequirement, projects: ProfileData['projects']): number {
  let totalScore = 0
  
  projects.forEach(project => {
    let projectScore = 0
    
    // Check if project skills match job requirements
    const skillMatches = project.skillsUsed.filter(skill =>
      [...jobReq.requiredSkills, ...jobReq.preferredSkills].some(reqSkill =>
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    ).length
    
    if (skillMatches > 0) {
      projectScore += (skillMatches / Math.max(project.skillsUsed.length, 1)) * 40
    }
    
    // Check industry relevance
    if (project.industry.toLowerCase().includes(jobReq.industry.toLowerCase()) ||
        jobReq.industry.toLowerCase().includes(project.industry.toLowerCase())) {
      projectScore += 30
    }
    
    // Check role relevance
    if (project.role.toLowerCase().includes(jobReq.title.toLowerCase()) ||
        jobReq.title.toLowerCase().includes(project.role.toLowerCase())) {
      projectScore += 30
    }
    
    totalScore += projectScore
  })
  
  return Math.round(totalScore / projects.length)
}

function calculateIndustryMatch(requiredIndustry: string, profileIndustries: string[]): number {
  const match = profileIndustries.find(industry =>
    industry.toLowerCase().includes(requiredIndustry.toLowerCase()) ||
    requiredIndustry.toLowerCase().includes(industry.toLowerCase())
  )
  
  return match ? 100 : 0
}

function getProficiencyScore(proficiency: string): number {
  switch (proficiency) {
    case 'Expert': return 100
    case 'Advanced': return 85
    case 'Intermediate': return 70
    case 'Beginner': return 50
    default: return 60
  }
}

function generateStrengths(jobReq: JobRequirement, profile: ProfileData): string[] {
  const strengths: string[] = []
  
  // Check for strong skill matches
  const strongSkills = profile.skills.filter(skill =>
    [...jobReq.requiredSkills, ...jobReq.preferredSkills].some(reqSkill =>
      skill.name.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(skill.name.toLowerCase())
    ) && skill.proficiency === 'Expert' || skill.proficiency === 'Advanced'
  )
  
  if (strongSkills.length > 0) {
    strengths.push(`Strong expertise in ${strongSkills.slice(0, 3).map(s => s.name).join(', ')}`)
  }
  
  // Check for relevant project experience
  const relevantProjects = profile.projects.filter(project =>
    project.skillsUsed.some(skill =>
      [...jobReq.requiredSkills, ...jobReq.preferredSkills].some(reqSkill =>
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  )
  
  if (relevantProjects.length > 0) {
    strengths.push(`Proven track record with ${relevantProjects.length} relevant project${relevantProjects.length > 1 ? 's' : ''}`)
  }
  
  // Check for industry experience
  if (profile.industries.includes(jobReq.industry)) {
    strengths.push(`Direct experience in ${jobReq.industry} industry`)
  }
  
  return strengths.slice(0, 3)
}

function generateAreasForImprovement(jobReq: JobRequirement, profile: ProfileData): string[] {
  const areas: string[] = []
  
  // Check for missing required skills
  const missingSkills = jobReq.requiredSkills.filter(reqSkill =>
    !profile.skills.some(skill =>
      skill.name.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(skill.name.toLowerCase())
    )
  )
  
  if (missingSkills.length > 0) {
    areas.push(`Could develop expertise in ${missingSkills.slice(0, 2).join(', ')}`)
  }
  
  // Check experience level
  const totalYears = profile.experience.reduce((sum, exp) => {
    const years = parseInt(exp.duration.split(' ')[0]) || 1
    return sum + years
  }, 0)
  
  const requiredYears = parseInt(jobReq.experience.match(/\d+/)?.[0] || '0')
  
  if (totalYears < requiredYears) {
    areas.push(`Could benefit from additional years of experience in the field`)
  }
  
  return areas.slice(0, 2)
}

function generateRecommendations(jobReq: JobRequirement, profile: ProfileData): string[] {
  const recommendations: string[] = []
  
  // Recommend highlighting relevant projects
  const relevantProjects = profile.projects.filter(project =>
    project.skillsUsed.some(skill =>
      [...jobReq.requiredSkills, ...jobReq.preferredSkills].some(reqSkill =>
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  )
  
  if (relevantProjects.length > 0) {
    recommendations.push(`Highlight ${relevantProjects[0].title} project during interviews`)
  }
  
  // Recommend emphasizing specific skills
  const strongSkills = profile.skills.filter(skill =>
    [...jobReq.requiredSkills, ...jobReq.preferredSkills].some(reqSkill =>
      skill.name.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(skill.name.toLowerCase())
    ) && skill.proficiency === 'Expert'
  )
  
  if (strongSkills.length > 0) {
    recommendations.push(`Emphasize expertise in ${strongSkills[0].name} and ${strongSkills[1]?.name || 'related skills'}`)
  }
  
  return recommendations.slice(0, 2)
}

function generateSummary(
  jobReq: JobRequirement, 
  overallScore: number, 
  strengths: string[], 
  areas: string[]
): string {
  if (overallScore >= 85) {
    return `Excellent match! Your profile strongly aligns with the ${jobReq.title} role requirements. ${strengths[0]} and you have proven experience in similar projects. This position would be a great fit for your skill set and career growth.`
  } else if (overallScore >= 70) {
    return `Strong match! You have many of the key skills and experiences needed for this ${jobReq.title} role. ${strengths[0]} and your background shows relevant project work. With some focus on ${areas[0]?.toLowerCase() || 'specific areas'}, you'd be well-positioned for this opportunity.`
  } else if (overallScore >= 50) {
    return `Good potential match! While you have some relevant experience, particularly ${strengths[0]?.toLowerCase() || 'in certain areas'}, this ${jobReq.title} role would require developing additional skills. Consider focusing on ${areas[0]?.toLowerCase() || 'key requirements'} to strengthen your candidacy.`
  } else {
    return `Limited match for this ${jobReq.title} role. Your current skill set and experience don't strongly align with the requirements. Consider roles that better match your expertise in ${profileData.skills.filter(s => s.proficiency === 'Expert').slice(0, 2).map(s => s.name).join(' and ')}.`
  }
}
