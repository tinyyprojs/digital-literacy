import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAirL0x_BD4M3i6_Gx1XYaiilTDRyy2LVw")

async function analyzeMessageWithRetry(message: string, retries = 3): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  })

  const systemInstruction = `You are an expert cybersecurity analyst specializing in scam and phishing detection. Analyze messages carefully, distinguishing between legitimate communications and actual scams.

LEGITIMATE MESSAGE INDICATORS (NOT scams):
- Official account registration/setup emails from educational institutions, established companies
- Temporary passwords for new account creation with instructions to change them
- Links to legitimate domains matching the organization's official website
- Professional formatting with proper organization headers/footers
- Specific course/service details that match what user signed up for
- No requests for money, gift cards, or sensitive information beyond standard registration

ACTUAL SCAM PATTERNS TO DETECT:

1. **Suspicious Email Addresses**: 
   - Random character combinations from unknown senders (e.g., teuforpoumo1985@libero.it)
   - Personal email addresses (Gmail, Yahoo, Hotmail) for unsolicited business proposals
   - Mismatched sender domains claiming to be from major companies

2. **Unsolicited Business Offers**:
   - Cold outreach from personal emails claiming business opportunities
   - Vague partnership proposals with no legitimate company contact
   - Claims of watching your content without prior relationship
   - Generic collaboration requests from suspicious addresses

3. **Social Engineering Tactics**:
   - Flattery followed by immediate business proposition
   - Creating false familiarity using public information
   - Pressure to respond or take action quickly

4. **Urgency & Threats**:
   - Time-limited offers creating false urgency
   - Threatening language about account closure or legal action
   - Claims of security issues requiring immediate action

5. **Suspicious Requests**:
   - Asking for existing passwords (legitimate services never do this)
   - Requesting gift cards, cryptocurrency, or wire transfers
   - Asking to verify account by clicking suspicious links
   - Requesting personal/financial information via email

6. **Poor Quality & Impersonation**:
   - Significant grammar/spelling errors in supposedly professional communications
   - Generic greetings ("Dear Customer") from companies claiming to know you
   - Misuse of company logos or branding
   - Inconsistent or unprofessional formatting

7. **Too Good to Be True**:
   - Unexpected prizes, inheritance, or lottery winnings
   - Unrealistic job offers with high pay for minimal work
   - Free products requiring shipping fees or personal info

8. **Suspicious Links & Technical Issues**:
   - Links to misspelled domains (amaz0n.com instead of amazon.com)
   - Shortened URLs hiding the real destination
   - Unexpected attachments, especially .exe, .zip files
   - Requests to download software or enable macros

9. **Contextual Red Flags**:
   - Contact about services/accounts you never signed up for
   - Unsolicited business proposals from personal email addresses
   - Messages about problems with accounts you don't have

ANALYSIS APPROACH:
- Legitimate account setup emails are SAFE even with temporary passwords
- Educational institutions and established companies sending registration confirmations are SAFE
- Focus on INTENT: Is this trying to deceive or steal? Or provide legitimate service?
- Context matters: Unsolicited contact from strangers is different from expected confirmations
- Only flag as scam if there are clear malicious indicators

RESPONSE FORMAT (JSON):
{
  "isScam": boolean,
  "confidence": number (0-100),
  "riskLevel": "low" | "medium" | "high",
  "indicators": [list of specific scam indicators found, or empty if safe],
  "recommendation": "Clear advice about whether to trust this message"
}

Be accurate and balanced. Not all emails with passwords or links are scams.`

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

    if (error?.message?.includes("API key expired") || error?.message?.includes("API_KEY_INVALID")) {
      return Response.json(
        {
          error:
            "Your Gemini API key has expired. Please get a new API key from ai.google.dev and update the GEMINI_API_KEY environment variable.",
        },
        { status: 401 },
      )
    }

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
