import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBXGbLeXjDpNDlU1x--KRohhxBURQlAu3c")

async function analyzeMessageWithRetry(message: string, retries = 3): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  })

  const systemInstruction = `You are an expert cybersecurity analyst specializing in scam and phishing detection. Analyze messages with a CRITICAL and SUSPICIOUS mindset.

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

RESPONSE FORMAT (JSON):
{
  "isScam": boolean,
  "confidence": number (0-100),
  "riskLevel": "low" | "medium" | "high",
  "indicators": [list of specific scam indicators found],
  "recommendation": "Actionable advice (2-3 sentences)"
}

Remember: It's better to be overly cautious than to miss a scam. If it feels off, it probably is.`

  const prompt = `${systemInstruction}

Message to analyze:
"""
${message}
"""`

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[v0] Attempt ${i + 1} to analyze message`)
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()
      console.log("[v0] Gemini response received:", text.substring(0, 200))
      return text
    } catch (error: any) {
      const isQuotaError =
        error?.message?.includes("quota") ||
        error?.message?.includes("429") ||
        error?.message?.includes("RESOURCE_EXHAUSTED")

      if (isQuotaError && i < retries - 1) {
        const waitTime = Math.pow(2, i) + 1 // 2s, 5s, 9s
        console.log(`[v0] Quota hit. Retrying in ${waitTime}s...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000))
      } else {
        throw error
      }
    }
  }

  throw new Error("Max retries reached")
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message provided" }, { status: 400 })
    }

    const text = await analyzeMessageWithRetry(message)

    let analysis
    try {
      analysis = JSON.parse(text)
    } catch (parseError) {
      console.error("[v0] Failed to parse Gemini response:", text)
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    if (!analysis || typeof analysis.isScam !== "boolean") {
      console.error("[v0] Invalid analysis structure:", analysis)
      return Response.json({ error: "Invalid AI response format" }, { status: 500 })
    }

    if (!Array.isArray(analysis.indicators)) {
      analysis.indicators = []
    }

    console.log("[v0] Analysis complete:", analysis.riskLevel, "confidence:", analysis.confidence)
    return Response.json(analysis)
  } catch (error: any) {
    console.error("[v0] Error in scam analysis:", error)

    if (
      error?.message?.includes("quota") ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return Response.json(
        {
          error:
            "Gemini API quota exceeded. The free tier has reached its limit. Please wait a few minutes or upgrade your API key at ai.google.dev.",
        },
        { status: 429 },
      )
    }

    return Response.json({ error: "Failed to analyze message. Please try again." }, { status: 500 })
  }
}
