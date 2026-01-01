import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { EducationSection } from "@/components/education-section"
import { ScamDetector } from "@/components/scam-detector"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <EducationSection />
      <ScamDetector />
    </div>
  )
}
