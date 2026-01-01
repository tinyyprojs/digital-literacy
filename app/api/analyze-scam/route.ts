import { generateObject } from "ai"
import { z } from "zod"

const scamAnalysisSchema = z.object({
  isScam: z.boolean().describe("Whether the message appears to be a scam"),
  confidence: z.number().min(0).max(100).describe("Confidence level of the analysis as a percentage (0-100)"),
  riskLevel: z.enum(["low", "medium", "high"]).describe("Overall risk level assessment"),
  indicators: z
    .array(z.string())
    .describe(
      "List of specific scam indicators found in the message (e.g., urgent language, requests for personal info, suspicious links)",
    ),
  recommendation: z
    .string()
    .describe("Actionable recommendation for the user on how to handle this message (2-3 sentences)"),
})

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message provided" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      schema: scamAnalysisSchema,
      prompt: `You are an expert cybersecurity analyst specializing in scam and phishing detection. Analyze this message with a CRITICAL and SUSPICIOUS mindset.

CRITICAL SCAM PATTERNS TO DETECT:

1. **Suspicious Email Addresses**: 
   - Random character combinations (e.g., teuforpoumo1985@libero.it)
   - Free email providers for business (Gmail, Yahoo, Hotmail, Libero, etc. for "company" emails)
   - Mismatched sender domains

2. **Unsolicited Business Offers**:
   - Cold outreach claiming to have watched your content
   - Vague partnership proposals with no specific details
   - Requests to integrate products or services
   - Claims of being from a company without company email domain

3. **Social Engineering Tactics**:
   - Personalization using publicly available info (username, video titles)
   - Creating false sense of connection or familiarity
   - Offers that seem convenient but weren't requested
   - Flattery followed by business proposition

4. **Urgency & Pressure**:
   - Time-limited offers or immediate action required
   - Threatening language or consequences
   - Fear-based messaging

5. **Information Requests**:
   - Requests for passwords, credentials, or personal data
   - Asking to click links or download files
   - Requesting financial information

6. **Red Flag Language**:
   - Poor grammar, spelling errors, or awkward phrasing
   - Generic greetings instead of proper names
   - Inconsistent formatting or unprofessional tone

7. **Impersonation & Deception**:
   - Claims to represent legitimate companies
   - Logo or branding misuse
   - Mimicking official communications

8. **Too Good to Be True**:
   - Unexpected prizes, money, or opportunities
   - Unrealistic promises or guarantees
   - Free products requiring "small fees"

9. **Suspicious Links & Attachments**:
   - Shortened URLs or mismatched link text
   - Unexpected file attachments
   - Requests to visit external sites

10. **Contextual Red Flags**:
    - Unsolicited contact from unknown parties
    - Business proposals from personal emails
    - Vague job offers or collaboration requests

ANALYSIS REQUIREMENTS:
- Be STRICT: Unsolicited business emails from suspicious addresses should be flagged as HIGH RISK
- Cold outreach with personal email addresses is a MAJOR red flag
- Generic business proposals targeting content creators are common phishing attempts
- If multiple indicators are present, mark as high confidence scam
- Provide specific, actionable warnings about what makes this suspicious

Message to analyze:
"""
${message}
"""

Remember: It's better to be overly cautious than to miss a scam. If it feels off, it probably is.`,
      maxOutputTokens: 1000,
    })

    return Response.json(object)
  } catch (error) {
    console.error("[v0] Error in scam analysis:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("credit card")) {
      return Response.json(
        {
          error: "AI Gateway setup required. Please add a credit card to your Vercel account to enable scam detection.",
          setupUrl: "https://vercel.com/account/billing",
        },
        { status: 402 },
      )
    }

    return Response.json({ error: "Failed to analyze message. Please try again." }, { status: 500 })
  }
}
