async function analyzeMessageWithRetry(message: string, retries = 3): Promise<any> {
  const apiKey = process.env.TYPHOON_API_KEY || "sk-dugg5PMwyI3cWNQ7353l3Q2Xvcaf4e9PEJBsMJSJ8XJDVZ03"
  const apiUrl = "https://api.opentyphoon.ai/v1/chat/completions"

  const systemInstruction = `You are an expert cybersecurity analyst specializing in scam and phishing detection. Be STRICT and SUSPICIOUS of unsolicited messages.

**CRITICAL SCAM INDICATORS - FLAG IMMEDIATELY:**

1. **Suspicious Email Addresses (HIGH RISK)**:
   - Random character combinations: karpowiczleonorezn5@seznam.cz, teuforpoumo1985@libero.it
   - Eastern European free email domains (seznam.cz, gazeta.pl, libero.it) for business
   - Personal Gmail/Yahoo/Hotmail claiming to be from corporations
   - Company name in email but wrong domain (TeamDJIPR@telenet.be is NOT DJI official)
   - ISP domains (telenet.be, comcast.net) pretending to be companies
   
2. **Impersonation Red Flags (HIGH RISK)**:
   - Misspelled company names: "DJÍ" with accent instead of "DJI"
   - Generic business email from personal/ISP domains
   - Claims to be from major companies but wrong email domain
   - No legitimate corporate domain (@dji.com, @microsoft.com, etc.)

3. **Unsolicited Business Outreach (MEDIUM-HIGH RISK)**:
   - Cold messages from strangers offering business deals
   - "I watched your content" from suspicious email addresses
   - Partnership/collaboration offers from non-corporate emails
   - Offering free products in exchange for promotion
   - Generic marketing speak without specific details
   - Using flattery then immediately asking for something

4. **Context Violations**:
   - Business proposals from personal emails
   - Professional offers from free email services
   - Company representatives using wrong domains

**LEGITIMATE MESSAGE INDICATORS (SAFE):**
- Official domains matching organization (@omnicampus.edu, @university.edu, @company.com)
- Expected account registration from services you signed up for
- Proper institutional headers and contact information
- Temporary passwords for new accounts with change instructions
- No requests for money, personal info, or immediate action

**DETECTION RULES:**
- Personal/ISP email + business proposal = SCAM
- Misspelled company name = SCAM  
- Eastern European free email + English business = SCAM
- "I watched your video" from random email = SCAM
- Free product offer from suspicious email = SCAM
- Any message from: seznam.cz, gazeta.pl emails claiming business = HIGH RISK

**RESPONSE FORMAT (JSON):**
{
  "isScam": boolean,
  "confidence": number (0-100),
  "riskLevel": "low" | "medium" | "high",
  "indicators": [specific red flags found],
  "recommendation": "Clear warning about why this is suspicious"
}

Be HIGHLY SUSPICIOUS of unsolicited business messages from personal emails. When in doubt, flag it.`

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[v0] Attempt ${i + 1} to analyze message with Typhoon AI`)

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "typhoon-v2.5-30b-a3b-instruct",
          messages: [
            {
              role: "system",
              content: systemInstruction,
            },
            {
              role: "user",
              content: `Message to analyze:\n"""\n${message}\n"""`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 2500,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Typhoon API error:", response.status, errorData)
        throw new Error(`Typhoon API error: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const text = data.choices[0]?.message?.content

      if (!text) {
        throw new Error("No content in Typhoon API response")
      }

      console.log("[v0] Typhoon AI response received:", text.substring(0, 200))
      return text
    } catch (error: any) {
      const isQuotaError =
        error?.message?.includes("quota") || error?.message?.includes("429") || error?.message?.includes("rate limit")

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
      let cleanedText = text.trim()

      // Remove \`\`\`json and \`\`\` wrapper if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*\n?/, "").replace(/\n?```\s*$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*\n?/, "").replace(/\n?```\s*$/, "")
      }

      analysis = JSON.parse(cleanedText.trim())
    } catch (parseError) {
      console.error("[v0] Failed to parse Typhoon AI response:", text)
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

    if (error?.message?.includes("API key") || error?.message?.includes("401")) {
      return Response.json(
        {
          error:
            "Your Typhoon API key is invalid or expired. Please update the TYPHOON_API_KEY environment variable with a valid key.",
        },
        { status: 401 },
      )
    }

    if (
      error?.message?.includes("quota") ||
      error?.message?.includes("429") ||
      error?.message?.includes("rate limit")
    ) {
      return Response.json(
        {
          error: "Typhoon API rate limit exceeded. Please wait a few minutes before trying again.",
        },
        { status: 429 },
      )
    }

    return Response.json({ error: "Failed to analyze message. Please try again." }, { status: 500 })
  }
}
