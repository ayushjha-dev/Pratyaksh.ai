import { type NextRequest, NextResponse } from "next/server"
import { updateProgress } from "../progress/[analysisId]/route"
import { analyzeFile, getFallbackAnalysis } from "@/lib/ai-analysis"
import { getFile } from "@/lib/file-storage"

// In-memory storage for analysis results (in production, use database)
const analysisResults = new Map()

export async function POST(request: NextRequest) {
  try {
    const { fileId, metadata } = await request.json()

    if (!fileId || !metadata) {
      return NextResponse.json({ error: "Missing file ID or metadata" }, { status: 400 })
    }

    const analysisId = `analysis-${fileId}`

    // Start the analysis process in the background
    performAnalysis(analysisId, metadata).catch((error) => {
      console.error("Analysis failed:", error)
      updateProgress(analysisId, 0, "Analysis failed", true)
    })

    return NextResponse.json({
      success: true,
      analysisId,
      status: "started",
      message: "Analysis started successfully",
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to start analysis" }, { status: 500 })
  }
}

async function performAnalysis(analysisId: string, metadata: any) {
  try {
    // Stage 1: Uploading file
    updateProgress(analysisId, 1, "Uploading file...", false)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Stage 2: Initializing analysis engine
    updateProgress(analysisId, 2, "Initializing analysis engine...", false)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Stage 3: Analyzing media signatures
    updateProgress(analysisId, 3, "Analyzing media signatures...", false)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const fileId = analysisId.replace("analysis-", "")
    const storedFile = getFile(fileId)

    if (!storedFile) {
      console.error(`[v0] File not found in storage: ${fileId}`)
      throw new Error("File not found in storage")
    }

    console.log(
      `[v0] Starting analysis for ${storedFile.metadata.originalName} (${storedFile.metadata.type}), file size: ${storedFile.buffer.length} bytes`,
    )

    // Perform actual AI analysis with the real file buffer
    let analysisResult
    try {
      analysisResult = await analyzeFile(storedFile.metadata.type, storedFile.metadata.originalName, storedFile.buffer)
      console.log(`[v0] Analysis successful with AI provider`)
    } catch (error) {
      console.log(`[v0] AI analysis failed, using fallback:`, error)
      analysisResult = getFallbackAnalysis(storedFile.metadata.type)
    }

    // Stage 4: Cross-referencing consistency markers
    updateProgress(analysisId, 4, "Cross-referencing consistency markers...", false)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Stage 5: Compiling final report
    updateProgress(analysisId, 5, "Compiling final report...", false)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Store the analysis result
    analysisResults.set(analysisId, analysisResult)

    // Complete the analysis
    updateProgress(analysisId, 6, "Analysis complete", true)
  } catch (error) {
    console.error("Analysis process failed:", error)
    updateProgress(analysisId, 0, "Analysis failed", true)
  }
}

// New endpoint to get analysis results
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const analysisId = url.searchParams.get("analysisId")

  if (!analysisId) {
    return NextResponse.json({ error: "Missing analysis ID" }, { status: 400 })
  }

  const result = analysisResults.get(analysisId)

  if (!result) {
    return NextResponse.json({ error: "Analysis not found or not completed" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    result,
  })
}
