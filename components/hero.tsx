import { Shield, AlertTriangle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-block">
            <span className="text-sm font-medium text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              Digital Literacy, Awareness & Defense Project
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            Avoiding Scams in the Digital World
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            {
              "Learn how to identify threats, avoid scams, and protect your digital identity with AI-powered defense tools."
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="text-base">
              <Link href="#detect">Try AI Scam Detector</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
              <Link href="#learn">Start Learning</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center p-6 rounded-lg bg-card border border-border">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Learn</h3>
              <p className="text-sm text-muted-foreground text-center">
                Learn cybersecurity concepts and practices
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-lg bg-card border border-border">
              <AlertTriangle className="w-10 h-10 text-accent mb-4" />
              <h3 className="font-semibold mb-2">Detect</h3>
              <p className="text-sm text-muted-foreground text-center">
                Use AI to identify suspicious messages and potential scams
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-lg bg-card border border-border">
              <Lock className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Defend</h3>
              <p className="text-sm text-muted-foreground text-center">
                Apply knowledge to protect yourself online
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
