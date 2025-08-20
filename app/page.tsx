import HeroSection from '@/components/HeroSection'
import ProjectsSection from '@/components/ProjectsSection'
import ProcessSection from '@/components/ProcessSection'
import AboutSection from '@/components/AboutSection'
import CompanyLogosSection from '@/components/CompanyLogosSection'
import ContactSection from '@/components/ContactSection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProjectsSection />
      <ProcessSection />
      <AboutSection />
      <CompanyLogosSection />
      <ContactSection />
    </main>
  )
}
