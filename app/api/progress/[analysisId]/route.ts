import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// In-memory progress store (in production, use Redis or database)
const progressStore = new Map<string, { stage: number; message: string; completed: boolean }>()

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  const { analysisId } = params

  let progress = progressStore.get(analysisId)
  if (!progress) {
    // Initialize with default progress if none exists
    progress = { stage: 0, message: "Initializing...", completed: false }
    progressStore.set(analysisId, progress)
    console.log("[v0] Initialized progress for:", analysisId)
  }

  console.log("[v0] Returning progress for:", analysisId, progress)

  return Response.json(progress)
}

// Helper function to update progress (called from analysis process)
export function updateProgress(analysisId: string, stage: number, message: string, completed = false) {
  progressStore.set(analysisId, { stage, message, completed })
}

// Helper function to simulate analysis progress
export function simulateAnalysisProgress(analysisId: string) {
  const stages = [
    { stage: 1, message: "Uploading file...", delay: 1000 },
    { stage: 2, message: "Initializing analysis engine...", delay: 2000 },
    { stage: 3, message: "Analyzing media signatures...", delay: 3000 },
    { stage: 4, message: "Cross-referencing consistency markers...", delay: 2500 },
    { stage: 5, message: "Compiling final report...", delay: 1500 },
  ]

  let currentStage = 0

  const processNextStage = () => {
    if (currentStage < stages.length) {
      const stage = stages[currentStage]
      updateProgress(analysisId, stage.stage, stage.message, false)

      setTimeout(() => {
        currentStage++
        if (currentStage >= stages.length) {
          updateProgress(analysisId, 6, "Analysis complete", true)
        } else {
          processNextStage()
        }
      }, stage.delay)
    }
  }

  // Start the simulation
  processNextStage()
}
