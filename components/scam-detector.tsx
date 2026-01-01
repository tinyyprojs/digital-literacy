"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Shield, Loader2, CreditCard } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AnalysisResult {
  isScam: boolean
  confidence: number
  riskLevel: "low" | "medium" | "high"
  indicators: string[]
  recommendation: string
}

export function ScamDetector() {
  const [message, setMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<{ message: string; setupUrl?: string } | null>(null)

  const handleAnalyze = async () => {
    if (!message.trim()) return

    setIsAnalyzing(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/analyze-scam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (response.status === 429) {
        const errorData = await response.json()
        setError({
          message:
            errorData.error ||
            "API quota exceeded. The free tier has reached its limit. Please wait a few minutes and try again.",
          setupUrl: "https://ai.google.dev/pricing",
        })
        return
      }

      if (response.status === 402) {
        const errorData = await response.json()
        setError({
          message: errorData.error || "AI Gateway setup required",
          setupUrl: errorData.setupUrl,
        })
        return
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data && typeof data === "object") {
        setResult({
          isScam: data.isScam ?? false,
          confidence: data.confidence ?? 0,
          riskLevel: data.riskLevel ?? "low",
          indicators: Array.isArray(data.indicators) ? data.indicators : [],
          recommendation: data.recommendation ?? "Unable to analyze message.",
        })
      }
    } catch (err) {
      console.error("Error analyzing message:", err)
      setError({
        message: "Failed to analyze message. Please check your connection and try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setMessage("")
    setResult(null)
    setError(null)
  }

  return (
    <section id="detect" className="py-20 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">AI Scam Detector</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Paste any suspicious message, email, or text below and let our AI analyze it for potential scam indicators.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Message Analysis
              </CardTitle>
              <CardDescription className="text-foreground">
                Paste the message below. And the AI will analyze it for scam patterns and provide an assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the message here! (e.g., an email, text message, etc)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px] resize-none bg-background"
                disabled={isAnalyzing}
              />

              <div className="flex gap-3">
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !message.trim()} className="flex-1">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Message"
                  )}
                </Button>
                <Button onClick={handleClear} variant="outline" disabled={isAnalyzing}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{error.message}</p>
                {error.setupUrl && (
                  <Button variant="outline" size="sm" asChild className="mt-2 bg-transparent">
                    <a href={error.setupUrl} target="_blank" rel="noopener noreferrer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Setup AI Gateway
                    </a>
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Card
              className={`border-2 ${
                result.riskLevel === "high"
                  ? "border-destructive bg-destructive/5"
                  : result.riskLevel === "medium"
                    ? "border-accent bg-accent/5"
                    : "border-primary bg-primary/5"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.riskLevel === "high" || result.isScam ? (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert
                  variant={result.riskLevel === "high" || result.isScam ? "destructive" : "default"}
                  className={
                    result.riskLevel === "low" && !result.isScam ? "border-primary bg-primary/10 text-foreground" : ""
                  }
                >
                  <AlertTitle className="text-lg font-semibold">
                    {result.isScam ? "⚠️ Likely Scam Detected" : "✓ No Obvious Scam Indicators"}
                  </AlertTitle>
                  <AlertDescription className="mt-2 text-base">
                    Risk Level: <span className="font-semibold capitalize">{result.riskLevel}</span> | Confidence:{" "}
                    {result.confidence}%
                  </AlertDescription>
                </Alert>

                {result.indicators && result.indicators.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Detected Indicators:</h4>
                    <ul className="space-y-2">
                      {result.indicators.map((indicator, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-destructive mt-1">•</span>
                          <span className="leading-relaxed">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold mb-2 text-foreground">Recommendation:</h4>
                  <p className="text-muted-foreground leading-relaxed">{result.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-warning-foreground">Important Note</p>
                  <p className="text-sm text-warning-foreground/80 leading-relaxed">
                    This AI tool help provides guidance, it is not 100% accurate. Always verify
                    suspicious messages through official sources before taking any action.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
