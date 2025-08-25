import { JobRequirement } from './ai-analysis'

export const demoJobs: JobRequirement[] = [
  {
    title: 'Senior UX Designer',
    description: 'We are looking for a Senior UX Designer to join our healthcare technology team. You will be responsible for designing user experiences for patient-facing applications and healthcare provider tools.',
    requiredSkills: ['User Research', 'UX Design', 'Figma', 'Prototyping'],
    preferredSkills: ['Healthcare UX', 'Design Systems', 'Accessibility'],
    experience: '3+ years',
    industry: 'Healthcare',
    responsibilities: [
      'Lead user research and design for healthcare applications',
      'Create wireframes, prototypes, and user flows',
      'Collaborate with medical teams and stakeholders',
      'Ensure accessibility compliance and usability'
    ]
  },
  {
    title: 'Product Designer',
    description: 'Join our B2B SaaS company as a Product Designer. You will work on complex enterprise interfaces, design systems, and service experiences for business customers.',
    requiredSkills: ['UI Design', 'Design Systems', 'B2B UX', 'Prototyping'],
    preferredSkills: ['Service Design', 'Stakeholder Management', 'Figma'],
    experience: '2+ years',
    industry: 'Technology',
    responsibilities: [
      'Design enterprise B2B interfaces and workflows',
      'Build and maintain design systems',
      'Conduct user research with business users',
      'Work with cross-functional teams'
    ]
  },
  {
    title: 'UX Researcher',
    description: 'We need a UX Researcher to help us understand user needs and validate design decisions. You will conduct various research methods and translate insights into actionable recommendations.',
    requiredSkills: ['User Research', 'Usability Testing', 'Data Analysis'],
    preferredSkills: ['Healthcare UX', 'Remote Testing', 'Stakeholder Workshops'],
    experience: '2+ years',
    industry: 'Healthcare',
    responsibilities: [
      'Plan and conduct user research studies',
      'Analyze research data and create insights',
      'Present findings to stakeholders',
      'Collaborate with design and product teams'
    ]
  },
  {
    title: 'Service Designer',
    description: 'Join our retail innovation team as a Service Designer. You will design end-to-end customer experiences across multiple touchpoints and channels.',
    requiredSkills: ['Service Design', 'User Journey Mapping', 'Workshop Facilitation'],
    preferredSkills: ['Retail UX', 'Multi-stakeholder Design', 'Rapid Prototyping'],
    experience: '3+ years',
    industry: 'Retail',
    responsibilities: [
      'Design service experiences across channels',
      'Facilitate design workshops with stakeholders',
      'Create journey maps and service blueprints',
      'Prototype and test service concepts'
    ]
  }
]

export const getRandomDemoJob = (): JobRequirement => {
  const randomIndex = Math.floor(Math.random() * demoJobs.length)
  return demoJobs[randomIndex]
}
