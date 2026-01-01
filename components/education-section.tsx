import { Mail, LinkIcon, CreditCard, User, FileText, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const scamIndicators = [
  {
    icon: Mail,
    title: "Suspicious Email Addresses",
    description: "Check for misspellings, unusual domains, or addresses that don't match the supposed sender.",
    examples: [
      "support@amaz0n-security.com instead of amazon.com",
      "paypa1-verify@secure-login.net",
      "Random letters: xk23j@company.com",
    ],
  },
  {
    icon: LinkIcon,
    title: "Malicious Links",
    description: "Hover over links before clicking. Look for mismatched URLs, shortened links, or suspicious domains.",
    examples: [
      "Links that don't match the display text",
      "Bit.ly or other URL shorteners from unknown sources",
      "Misspelled domains: faceb00k.com, g00gle.com",
    ],
  },
  {
    icon: AlertCircle,
    title: "Urgent or Threatening Language",
    description: "Scammers create panic to make you act quickly without thinking.",
    examples: [
      '"Your account will be closed in 24 hours!"',
      '"Immediate action required to avoid prosecution"',
      '"You\'ve won a prize! Claim now or lose it!"',
    ],
  },
  {
    icon: CreditCard,
    title: "Requests for Personal Information",
    description: "Legitimate companies never ask for sensitive data via email or text.",
    examples: ["Password requests", "Social Security Number", "Credit card details or CVV", "Bank account numbers"],
  },
  {
    icon: FileText,
    title: "Poor Grammar and Spelling",
    description: "Professional companies proofread their communications. Multiple errors are red flags.",
    examples: [
      "Obvious typos and grammatical mistakes",
      "Awkward phrasing or unnatural language",
      "Inconsistent formatting",
    ],
  },
  {
    icon: User,
    title: "Impersonation Tactics",
    description: "Scammers pretend to be trusted entities like banks, government agencies, or tech support.",
    examples: [
      "Fake IRS or tax authority messages",
      "Phony tech support warnings",
      "Impostor emails from your boss or coworker",
    ],
  },
]

const bestPractices = [
  {
    category: "Email Security",
    tips: [
      "Enable two-factor authentication on all important accounts",
      "Never click links in unexpected emails",
      "Verify sender identity through official channels",
      "Use email filters and spam protection",
    ],
  },
  {
    category: "Password Protection",
    tips: [
      "Use unique passwords for each account",
      "Enable a password manager",
      "Create passwords with 12+ characters",
      "Never share passwords via email or text",
    ],
  },
  {
    category: "Safe Browsing",
    tips: [
      "Look for HTTPS and padlock icon in browser",
      "Keep software and browsers updated",
      "Use trusted antivirus software",
      "Avoid public Wi-Fi for sensitive transactions",
    ],
  },
  {
    category: "Social Media Safety",
    tips: [
      "Review privacy settings regularly",
      "Be cautious about what you share publicly",
      "Verify friend requests from people you know",
      "Report suspicious accounts and messages",
    ],
  },
]

export function EducationSection() {
  return (
    <section id="learn" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Learn to Spot the Signs</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understanding common scam tactics is your first line of defense. Here are the key warning signs to watch
            for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scamIndicators.map((indicator, index) => {
            const Icon = indicator.icon
            return (
              <Card key={index} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{indicator.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{indicator.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Examples:</p>
                    <ul className="space-y-1.5">
                      {indicator.examples.map((example, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="pt-12" id="resources">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Best Practices</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow these proven strategies to protect yourself and your data online.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {bestPractices.map((practice, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    {practice.category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pt-2">
                      {practice.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-primary mt-1">✓</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
