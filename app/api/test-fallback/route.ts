import { type NextRequest, NextResponse } from "next/server"
import { analyzeFile, getFallbackAnalysis } from "@/lib/ai-analysis"
import { loadKeysFromStorage } from "@/lib/key-storage"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting comprehensive fallback mechanism test")

    const geminiKeys = loadKeysFromStorage()
    const workingKeys = Object.entries(geminiKeys).filter(([_, key]) => key?.trim())

    console.log(`[v0] Found ${Object.keys(geminiKeys).length} total keys in storage`)
    console.log(`[v0] Testing ${workingKeys.length} configured Gemini keys`)

    // Create a test file buffer (small image data)
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64",
    )

    const testResults = {
      timestamp: new Date().toISOString(),
      geminiKeys: [] as any[],
      totalKeys: workingKeys.length,
      workingKeys: 0,
      fallbackUsed: false,
      finalResult: null as any,
      errors: [] as string[],
      details: [] as string[],
    }

    for (const [keyId, apiKey] of workingKeys) {
      try {
        console.log(`[v0] Testing Gemini key: ${keyId}`)

        // Test the key by making a simple API call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
          method: "GET",
        })

        const keyResult = {
          keyId,
          working: response.ok,
          status: response.status,
          error: response.ok ? null : `HTTP ${response.status}`,
        }

        testResults.geminiKeys.push(keyResult)

        if (response.ok) {
          testResults.workingKeys++
          testResults.details.push(`✓ ${keyId}: Working`)
        } else {
          testResults.details.push(`✗ ${keyId}: Failed (${response.status})`)
          testResults.errors.push(`${keyId} failed with status ${response.status}`)
        }
      } catch (error) {
        const keyResult = {
          keyId,
          working: false,
          status: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        }

        testResults.geminiKeys.push(keyResult)
        testResults.details.push(`✗ ${keyId}: Error - ${keyResult.error}`)
        testResults.errors.push(`${keyId}: ${keyResult.error}`)
      }
    }

    try {
      // Test the full analysis pipeline
      console.log("[v0] Testing full analysis pipeline with fallback mechanism")
      const result = await analyzeFile("image/png", "test-fallback.png", testImageBuffer)
      testResults.finalResult = result

      console.log("[v0] Fallback test completed successfully")
      console.log(`[v0] Final authenticity score: ${result.authenticityScore}%`)

      return NextResponse.json({
        success: true,
        message: `Fallback mechanism working! ${testResults.workingKeys}/${testResults.totalKeys} keys operational`,
        details: testResults.details,
        results: testResults,
      })
    } catch (error) {
      console.log("[v0] All Gemini keys failed, testing fallback analysis")
      testResults.fallbackUsed = true

      const fallbackResult = getFallbackAnalysis("image/png")
      testResults.finalResult = fallbackResult
      testResults.errors.push(error instanceof Error ? error.message : "Unknown error")
      testResults.details.push("→ Using basic fallback analysis")

      return NextResponse.json({
        success: testResults.workingKeys > 0, // Success if at least one key works
        message:
          testResults.workingKeys > 0
            ? `${testResults.workingKeys}/${testResults.totalKeys} keys working, but analysis failed - check key quotas`
            : "All keys failed - using fallback analysis",
        details: testResults.details,
        results: testResults,
      })
    }
  } catch (error) {
    console.error("[v0] Fallback test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Fallback test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
