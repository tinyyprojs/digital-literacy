import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg">Digital Defense Hub</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#learn"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Learn
          </Link>
          <Link
            href="#detect"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Scam Detector
          </Link>
          <Link
            href="#resources"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Resources
          </Link>
        </div>

        <Button asChild>
          <Link href="#detect">Try AI Detector</Link>
        </Button>
      </div>
    </nav>
  )
}
