"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TestTube, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function FallbackTest() {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const runFallbackTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Test failed to run",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-green-600" />
            <h5 className="font-semibold text-green-800">Test Fallback System</h5>
          </div>
          <Button onClick={runFallbackTest} disabled={testing} variant="outline" size="sm" className="bg-white/50">
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-green-700">
          Test the complete API fallback mechanism to ensure it works properly with your configured providers.
        </p>

        {testResult && (
          <div className="mt-4 p-4 bg-white/70 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="font-medium text-sm">{testResult.success ? "Test Passed" : "Test Failed"}</span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>Message:</strong> {testResult.message}
              </p>
              {testResult.results?.finalResult && (
                <p>
                  <strong>Authenticity Score:</strong> {testResult.results.finalResult.authenticityScore}%
                </p>
              )}
              {testResult.results?.fallbackUsed && (
                <p className="text-orange-600">
                  <strong>Fallback Used:</strong> Yes (All AI providers unavailable)
                </p>
              )}
              {testResult.error && (
                <p className="text-red-600">
                  <strong>Error:</strong> {testResult.error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
