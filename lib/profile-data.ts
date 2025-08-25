export interface Skill {
  name: string
  category: 'Design' | 'Research' | 'Technical' | 'Soft Skills' | 'Tools'
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  yearsOfExperience: number
  description: string
}

export interface Project {
  title: string
  description: string
  duration: string
  role: string
  keyAchievements: string[]
  skillsUsed: string[]
  impact: string
  industry: string
  teamSize: string
  methodologies: string[]
}

export interface Experience {
  title: string
  company: string
  duration: string
  description: string
  keyResponsibilities: string[]
  achievements: string[]
  skills: string[]
}

export interface Education {
  degree: string
  institution: string
  year: string
  relevantCourses: string[]
}

export const profileData = {
  personal: {
    name: 'Amin Yosoh',
    title: 'UX Designer & Product Designer',
    summary: 'Experienced UX designer with a passion for creating user-centered digital experiences. Specialized in healthcare UX, B2B platforms, and service design. Proven track record of delivering impactful solutions through research-driven design processes.',
    location: 'Sweden',
    yearsOfExperience: 5
  },
  
  skills: [
    {
      name: 'User Research',
      category: 'Research',
      proficiency: 'Expert',
      yearsOfExperience: 5,
      description: 'Conducting user interviews, usability testing, surveys, and ethnographic research to inform design decisions.'
    },
    {
      name: 'UX Design',
      category: 'Design',
      proficiency: 'Expert',
      yearsOfExperience: 5,
      description: 'Creating user-centered designs through wireframing, prototyping, and user flow development.'
    },
    {
      name: 'UI Design',
      category: 'Design',
      proficiency: 'Advanced',
      yearsOfExperience: 4,
      description: 'Designing intuitive and accessible user interfaces with focus on visual hierarchy and interaction design.'
    },
    {
      name: 'Design Systems',
      category: 'Design',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      description: 'Building and maintaining scalable design systems for consistency and efficiency.'
    },
    {
      name: 'Prototyping',
      category: 'Design',
      proficiency: 'Expert',
      yearsOfExperience: 5,
      description: 'Creating interactive prototypes using Figma, Sketch, and other prototyping tools.'
    },
    {
      name: 'User Testing',
      category: 'Research',
      proficiency: 'Advanced',
      yearsOfExperience: 4,
      description: 'Planning and conducting usability tests, A/B tests, and user validation sessions.'
    },
    {
      name: 'Service Design',
      category: 'Design',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      description: 'Designing end-to-end service experiences across multiple touchpoints and channels.'
    },
    {
      name: 'Stakeholder Management',
      category: 'Soft Skills',
      proficiency: 'Advanced',
      yearsOfExperience: 4,
      description: 'Collaborating with cross-functional teams, presenting design work, and managing stakeholder expectations.'
    },
    {
      name: 'Design Sprints',
      category: 'Methodologies',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      description: 'Facilitating design sprints and workshops to rapidly ideate and validate solutions.'
    },
    {
      name: 'Healthcare UX',
      category: 'Domain',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      description: 'Specialized experience in designing for healthcare applications with focus on accessibility and compliance.'
    },
    {
      name: 'B2B UX',
      category: 'Domain',
      proficiency: 'Advanced',
      yearsOfExperience: 4,
      description: 'Designing complex business-to-business interfaces and workflows.'
    },
    {
      name: 'Figma',
      category: 'Tools',
      proficiency: 'Expert',
      yearsOfExperience: 4,
      description: 'Primary design tool for creating wireframes, prototypes, and design systems.'
    },
    {
      name: 'Sketch',
      category: 'Tools',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      description: 'Alternative design tool for UI/UX design and prototyping.'
    },
    {
      name: 'Miro',
      category: 'Tools',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      description: 'Collaborative whiteboarding and workshop facilitation.'
    },
    {
      name: 'User Journey Mapping',
      category: 'Design',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      description: 'Creating comprehensive user journey maps to identify pain points and opportunities.'
    }
  ] as Skill[],
  
  projects: [
    {
      title: 'Engaging Health Tracking',
      description: 'Designed a fluid intake tracker for dialysis patients that makes daily care feel easier and more engaging.',
      duration: 'Q3–Q4 2021',
      role: 'Lead UX Designer',
      keyAchievements: [
        'Increased patient engagement by 40% through gamification elements',
        'Reduced logging time from 3 minutes to 45 seconds',
        'Improved accessibility for elderly users with simplified interface'
      ],
      skillsUsed: ['User Research', 'Healthcare UX', 'Gamification', 'Accessibility', 'Remote Testing', 'Design Systems'],
      impact: 'Significantly improved patient adherence to fluid tracking protocols, leading to better health outcomes.',
      industry: 'Healthcare',
      teamSize: '4-person design team',
      methodologies: ['Design Sprint', 'User Research', 'Iterative Design', 'Accessibility Testing']
    },
    {
      title: 'Smarter Customer Portal',
      description: 'Designed a proof of concept for Alfa Laval\'s customer portal, creating flows for documentation, service, and support.',
      duration: 'February 2020',
      role: 'UX Designer',
      keyAchievements: [
        'Reduced customer support tickets by 25% through improved self-service',
        'Streamlined documentation access for technical users',
        'Created scalable design system for future portal development'
      ],
      skillsUsed: ['Design Sprint', 'B2B UX', 'Service Design', 'Stakeholder Workshops', 'Concept Design', 'Enterprise UX'],
      impact: 'Concept was well received and moved into production pipeline, improving customer experience.',
      industry: 'Manufacturing',
      teamSize: '3-person design team',
      methodologies: ['Design Sprint', 'Stakeholder Workshops', 'Service Design', 'Concept Validation']
    },
    {
      title: 'Tool Rentals Made Digital',
      description: 'Created the first full rental journey for Clas Ohlson, including staff tools and customer booking flows.',
      duration: 'March 2020 – May 2020',
      role: 'UX Designer',
      keyAchievements: [
        'Launched rental service across three markets successfully',
        'Reduced staff training time by 60% with intuitive interfaces',
        'Increased rental conversion rate by 35%'
      ],
      skillsUsed: ['Rental Platform', 'Staff Interface', 'Rapid Prototyping', 'Multi-stakeholder', 'E-commerce', 'Service Design'],
      impact: 'Guided successful rollout across multiple markets, establishing new revenue stream.',
      industry: 'Retail',
      teamSize: '5-person cross-functional team',
      methodologies: ['Rapid Prototyping', 'Multi-stakeholder Design', 'Service Design', 'Market Validation']
    }
  ] as Project[],
  
  experience: [
    {
      title: 'Senior UX Designer',
      company: 'Diaverum',
      duration: '2021 - Present',
      description: 'Leading UX design for healthcare applications, focusing on patient engagement and accessibility.',
      keyResponsibilities: [
        'Lead user research and design for patient-facing applications',
        'Collaborate with medical teams to ensure compliance and usability',
        'Mentor junior designers and establish design processes'
      ],
      achievements: [
        'Improved patient engagement metrics by 40%',
        'Reduced user errors in critical healthcare workflows by 60%',
        'Established accessibility standards across all products'
      ],
      skills: ['Healthcare UX', 'User Research', 'Accessibility', 'Design Leadership', 'Stakeholder Management']
    },
    {
      title: 'UX Designer',
      company: 'Alfa Laval',
      duration: '2019 - 2021',
      description: 'Designed B2B interfaces and service experiences for industrial customers.',
      keyResponsibilities: [
        'Design customer portal interfaces and workflows',
        'Conduct user research with technical users',
        'Collaborate with engineering teams for implementation'
      ],
      achievements: [
        'Reduced customer support tickets by 25%',
        'Improved customer satisfaction scores by 30%',
        'Created scalable design system for enterprise products'
      ],
      skills: ['B2B UX', 'Enterprise Design', 'User Research', 'Design Systems', 'Technical Collaboration']
    }
  ] as Experience[],
  
  education: {
    degree: 'Master of Design',
    institution: 'Umeå Institute of Design',
    year: '2019',
    relevantCourses: ['Interaction Design', 'Service Design', 'User Research Methods', 'Design Leadership']
  } as Education,
  
  methodologies: [
    'Design Thinking',
    'Design Sprints',
    'User-Centered Design',
    'Service Design',
    'Rapid Prototyping',
    'Usability Testing',
    'A/B Testing',
    'Stakeholder Workshops',
    'User Journey Mapping',
    'Accessibility Testing'
  ],
  
  industries: [
    'Healthcare',
    'Manufacturing',
    'Retail',
    'E-commerce',
    'B2B Services',
    'Digital Products'
  ]
}

export type ProfileData = typeof profileData
