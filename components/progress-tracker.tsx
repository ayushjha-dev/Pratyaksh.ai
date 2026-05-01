"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Loader2, Zap, Shield, Eye, Target, BarChart3 } from "lucide-react"

interface ProgressState {
  stage: number
  message: string
  completed: boolean
}

interface ProgressTrackerProps {
  analysisId: string
  onComplete?: () => void
}

export function ProgressTracker({ analysisId, onComplete }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressState>({
    stage: 0,
    message: "Initializing...",
    completed: false,
  })
  const [connectionError, setConnectionError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null
    let isPolling = true

    const pollProgress = async () => {
      if (!isPolling) return

      try {
        console.log("[v0] Polling progress for:", analysisId)
        const response = await fetch(`/api/progress/${analysisId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: ProgressState = await response.json()
        console.log("[v0] Progress update received:", data)

        setProgress(data)
        setConnectionError(false)
        setRetryCount(0)

        if (data.completed && onComplete) {
          console.log("[v0] Analysis completed, calling onComplete")
          isPolling = false
          onComplete()
          return
        }

        // Continue polling if not completed
        if (isPolling && !data.completed) {
          pollInterval = setTimeout(pollProgress, 1000)
        }
      } catch (error) {
        console.error("[v0] Polling error:", error)
        setConnectionError(true)

        if (retryCount < 5 && isPolling) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000)
          console.log(`[v0] Retrying in ${retryDelay}ms (attempt ${retryCount + 1})`)

          setRetryCount((prev) => prev + 1)
          pollInterval = setTimeout(pollProgress, retryDelay)
        } else if (retryCount >= 5) {
          console.error("[v0] Max retry attempts reached")
          setConnectionError(true)
          isPolling = false
        }
      }
    }

    pollProgress()

    return () => {
      isPolling = false
      if (pollInterval) {
        clearTimeout(pollInterval)
      }
    }
  }, [analysisId, onComplete, retryCount])

  const progressPercentage = progress.completed ? 100 : (progress.stage / 5) * 100

  const getStageIcon = (stage: number) => {
    switch (stage) {
      case 1:
        return <Zap className="w-5 h-5 text-blue-500" />
      case 2:
        return <Shield className="w-5 h-5 text-purple-500" />
      case 3:
        return <Eye className="w-5 h-5 text-teal-500" />
      case 4:
        return <Target className="w-5 h-5 text-orange-500" />
      case 5:
        return <BarChart3 className="w-5 h-5 text-green-500" />
      default:
        return <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
    }
  }

  const getStageDescription = (stage: number) => {
    switch (stage) {
      case 1:
        return "Uploading and processing your file"
      case 2:
        return "Initializing AI detection engines"
      case 3:
        return "Scanning for deepfake signatures"
      case 4:
        return "Cross-referencing authenticity markers"
      case 5:
        return "Generating comprehensive report"
      default:
        return "Preparing analysis..."
    }
  }

  return (
    <Card className="glass-strong rounded-2xl border-0 shadow-2xl p-6 sm:p-8">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="relative">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Analyzing Your File
            </h3>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 blur-xl -z-10 animate-pulse-slow" />
          </div>
          <p className="text-sm sm:text-base text-slate-600">
            Our AI is examining your media for authenticity markers...
          </p>
        </div>

        <div className="space-y-6">
          {/* Enhanced Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700">Analysis Progress</span>
              <span className="font-bold text-slate-800">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="relative">
              <Progress value={progressPercentage} className="h-3 bg-slate-200/50" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-teal-500/20 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Current Stage Display */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-center space-x-3">
              {progress.completed ? (
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-white/50 animate-pulse">{getStageIcon(progress.stage)}</div>
              )}
              <div className="text-center">
                <div className="font-semibold text-slate-800">{progress.message}</div>
                <div className="text-sm text-slate-600">{getStageDescription(progress.stage)}</div>
              </div>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((stage) => (
              <div key={stage} className="flex flex-col items-center space-y-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    progress.stage >= stage || progress.completed
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {progress.stage >= stage || progress.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{stage}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 text-center max-w-16">
                  {stage === 1 && "Upload"}
                  {stage === 2 && "Initialize"}
                  {stage === 3 && "Analyze"}
                  {stage === 4 && "Verify"}
                  {stage === 5 && "Report"}
                </div>
              </div>
            ))}
          </div>

          {connectionError && (
            <div className="glass rounded-xl p-4 bg-amber-50/50">
              <div className="text-center text-sm text-amber-700">
                {retryCount < 5 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reconnecting... (attempt {retryCount + 1})</span>
                  </div>
                ) : (
                  "Connection failed - please refresh the page"
                )}
              </div>
            </div>
          )}
        </div>

        {progress.completed && (
          <div className="text-center space-y-3">
            <div className="p-4 glass rounded-xl bg-green-50/50">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Analysis completed successfully!</span>
              </div>
              <p className="text-sm text-green-600 mt-2">Your detailed report is ready for review.</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
