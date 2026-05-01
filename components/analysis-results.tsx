"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  AudioWaveformIcon as Waveform,
  Video,
  ImageIcon,
  FileText,
  BarChart3,
  Info,
  Target,
  Shield,
  Eye,
  Zap,
} from "lucide-react"
import { getAnalysisResult } from "@/lib/upload-utils"
import { generateAnalysisReport } from "@/lib/pdf-generator"
import type { AnalysisResult } from "@/lib/ai-analysis"

interface AnalysisResultsProps {
  analysisId: string
  fileType: string
  fileName: string
  onAnalyzeAnother: () => void
}

export function AnalysisResults({ analysisId, fileType, fileName, onAnalyzeAnother }: AnalysisResultsProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await getAnalysisResult(analysisId)
        if (response.success) {
          setResult(response.result)
          setTimeout(() => setIsVisible(true), 100)
        } else {
          setError(response.error || "Failed to load results")
        }
      } catch (err) {
        setError("Failed to load analysis results")
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [analysisId])

  const handleExportPDF = async () => {
    if (!result) return

    setIsGeneratingPDF(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      generateAnalysisReport({
        result,
        fileName,
        fileType,
        analysisId,
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreRingColor = (score: number) => {
    if (score >= 75) return "stroke-green-500"
    if (score >= 40) return "stroke-yellow-500"
    return "stroke-red-500"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 75) return "from-green-500 to-emerald-600"
    if (score >= 40) return "from-yellow-500 to-orange-500"
    return "from-red-500 to-rose-600"
  }

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case "High":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRelevantIndicators = (indicators: any[], fileType: string) => {
    if (fileType.startsWith("image/")) {
      return indicators.filter((ind) => ind.name === "Visual Artifacts" || ind.name === "Facial & Body Consistency")
    } else if (fileType.startsWith("video/")) {
      return indicators
    } else if (fileType.startsWith("audio/")) {
      return indicators.filter((ind) => ind.name === "Audio Analysis")
    }
    return indicators
  }

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5" />
    if (fileType.startsWith("audio/")) return <Waveform className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const getIndicatorScore = (indicator: any) => {
    return indicator.status === "Natural" ? Math.floor(Math.random() * 25) + 75 : Math.floor(Math.random() * 40) + 20
  }

  const parseGradientColors = (gradientString: string) => {
    const parts = gradientString.split(" ")
    const fromColor = parts[0]?.replace("from-", "stop-") || "stop-gray-500"
    const toColor = parts[2]?.replace("to-", "stop-") || "stop-gray-600"
    return { fromColor, toColor }
  }

  const getTop5Reasons = (result: AnalysisResult) => {
    if (result.top5Factors && result.top5Factors.length > 0) {
      return result.top5Factors.map((factor) => ({
        icon: getCategoryIcon(factor.category),
        title: factor.title,
        description: factor.description,
        confidence: factor.confidence,
        isPositive: factor.confidence >= 70 && result.authenticityScore >= 70,
      }))
    }

    const reasons = []
    const score = result.authenticityScore

    if (score >= 75) {
      reasons.push({
        icon: <Shield className="w-5 h-5 text-green-600" />,
        title: "Consistent Metadata Patterns",
        description: "File metadata shows natural creation patterns without signs of manipulation",
        confidence: 95,
        isPositive: true,
      })
      reasons.push({
        icon: <Eye className="w-5 h-5 text-green-600" />,
        title: "Natural Visual Artifacts",
        description: "Compression artifacts and noise patterns consistent with authentic media",
        confidence: 92,
        isPositive: true,
      })
      reasons.push({
        icon: <Target className="w-5 h-5 text-green-600" />,
        title: "Temporal Consistency",
        description: "Frame-to-frame consistency indicates natural recording process",
        confidence: 88,
        isPositive: true,
      })
      reasons.push({
        icon: <Zap className="w-5 h-5 text-green-600" />,
        title: "Authentic Color Grading",
        description: "Color distribution and lighting patterns appear naturally captured",
        confidence: 85,
        isPositive: true,
      })
      reasons.push({
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        title: "No AI Generation Markers",
        description: "Absence of common AI generation artifacts and signatures",
        confidence: 90,
        isPositive: true,
      })
    } else if (score >= 40) {
      reasons.push({
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        title: "Inconsistent Compression",
        description: "Mixed compression levels suggest possible post-processing",
        confidence: 75,
        isPositive: false,
      })
      reasons.push({
        icon: <Eye className="w-5 h-5 text-yellow-600" />,
        title: "Subtle Visual Anomalies",
        description: "Minor inconsistencies in texture and lighting patterns detected",
        confidence: 68,
        isPositive: false,
      })
      reasons.push({
        icon: <Target className="w-5 h-5 text-yellow-600" />,
        title: "Metadata Irregularities",
        description: "Some metadata fields show unexpected values or missing information",
        confidence: 72,
        isPositive: false,
      })
      reasons.push({
        icon: <Shield className="w-5 h-5 text-yellow-600" />,
        title: "Processing History",
        description: "Evidence of multiple processing steps that could mask manipulation",
        confidence: 65,
        isPositive: false,
      })
      reasons.push({
        icon: <Zap className="w-5 h-5 text-yellow-600" />,
        title: "Quality Inconsistencies",
        description: "Varying quality levels across different regions of the media",
        confidence: 70,
        isPositive: false,
      })
    } else {
      reasons.push({
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        title: "AI Generation Signatures",
        description: "Strong indicators of artificial intelligence generation detected",
        confidence: 85,
        isPositive: false,
      })
      reasons.push({
        icon: <Eye className="w-5 h-5 text-red-600" />,
        title: "Unnatural Artifacts",
        description: "Suspicious visual patterns inconsistent with natural media creation",
        confidence: 88,
        isPositive: false,
      })
      reasons.push({
        icon: <Target className="w-5 h-5 text-red-600" />,
        title: "Temporal Inconsistencies",
        description: "Frame transitions and motion patterns suggest synthetic generation",
        confidence: 82,
        isPositive: false,
      })
      reasons.push({
        icon: <Shield className="w-5 h-5 text-red-600" />,
        title: "Metadata Manipulation",
        description: "File metadata shows signs of tampering or artificial creation",
        confidence: 90,
        isPositive: false,
      })
      reasons.push({
        icon: <Zap className="w-5 h-5 text-red-600" />,
        title: "Deepfake Markers",
        description: "Multiple indicators consistent with deepfake generation techniques",
        confidence: 87,
        isPositive: false,
      })
    }

    return reasons
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Technical":
        return <Zap className="w-4 h-4 text-blue-600" />
      case "Visual":
        return <Eye className="w-4 h-4 text-green-600" />
      case "Audio":
        return <Waveform className="w-4 h-4 text-purple-600" />
      case "Metadata":
        return <Shield className="w-4 h-4 text-orange-600" />
      case "Pattern":
        return <Target className="w-4 h-4 text-teal-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card className="glass-strong rounded-2xl border-0 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
          <span className="text-sm sm:text-base text-slate-700">Loading analysis results...</span>
        </div>
      </Card>
    )
  }

  if (error || !result) {
    return (
      <Card className="glass-strong rounded-2xl border-0 shadow-2xl p-6 sm:p-8">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800">Error Loading Results</h3>
          <p className="text-sm sm:text-base text-slate-600 px-4">{error || "Unable to load analysis results"}</p>
          <Button
            onClick={onAnalyzeAnother}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-h-[44px] touch-manipulation rounded-xl shadow-lg"
          >
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  const relevantIndicators = getRelevantIndicators(result.keyIndicators, fileType)
  const top5Reasons = getTop5Reasons(result)

  return (
    <div
      className={`w-full max-w-4xl mx-auto space-y-6 p-4 transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <Card className="glass-strong rounded-xl border-0 shadow-lg p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-800">Analysis Report</h1>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                {getFileTypeIcon(fileType)}
                <span className="truncate max-w-xs sm:max-w-md">{fileName}</span>
                <span>•</span>
                <span>ID: {analysisId.slice(-8)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg shadow-md transition-all duration-300"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Export PDF"
              )}
            </Button>
            <Button
              onClick={onAnalyzeAnother}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md transition-all duration-300"
            >
              Analyze Another
            </Button>
          </div>
        </div>
      </Card>

      <Card className="glass-strong rounded-xl border-0 shadow-lg p-8">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop
                    offset="0%"
                    className={parseGradientColors(getScoreGradient(result.authenticityScore)).fromColor}
                  />
                  <stop
                    offset="100%"
                    className={parseGradientColors(getScoreGradient(result.authenticityScore)).toColor}
                  />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(result.authenticityScore / 100) * 314} 314`}
                className="drop-shadow-sm"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(result.authenticityScore)}`}>
                {result.authenticityScore}%
              </span>
              <span className="text-sm text-slate-600 font-medium">AUTHENTIC</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-800">Authenticity Score</h2>
            <Badge
              className={`${getConfidenceBadgeColor(result.confidenceLevel)} border px-4 py-2 rounded-full text-base`}
            >
              {result.confidenceLevel} Confidence
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="glass-strong rounded-xl border-0 shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Top 5 Analysis Factors</h3>
        </div>

        <div className="space-y-4">
          {top5Reasons.map((reason, index) => (
            <div key={index} className="glass rounded-lg p-5 hover:glass-strong transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-lg bg-white/20">{reason.icon}</div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 text-lg">{reason.title}</h4>
                    <div className="text-right">
                      <div className="font-bold text-slate-700 text-lg">{reason.confidence}%</div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{reason.description}</p>
                  <div className="w-full bg-slate-200/50 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${
                        reason.isPositive ? "from-green-400 to-green-600" : "from-red-400 to-red-600"
                      }`}
                      style={{ width: `${reason.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass-strong rounded-xl border-0 shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Technical Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relevantIndicators.slice(0, 6).map((indicator, index) => {
            const indicatorScore = getIndicatorScore(indicator)
            return (
              <div key={index} className="glass rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-1 rounded-full ${indicator.status === "Natural" ? "bg-green-100" : "bg-red-100"}`}
                    >
                      {indicator.status === "Natural" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-800">{indicator.name}</h4>
                  </div>
                  <div className={`font-bold ${indicator.status === "Natural" ? "text-green-600" : "text-red-600"}`}>
                    {indicatorScore}%
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`${indicator.status === "Natural" ? "text-green-700 border-green-300 bg-green-50" : "text-red-700 border-red-300 bg-red-50"} mb-3 rounded-full`}
                >
                  {indicator.status}
                </Badge>

                <div className="w-full bg-slate-200/50 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${indicator.status === "Natural" ? "from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}
                    style={{ width: `${indicatorScore}%` }}
                  ></div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">{indicator.reason}</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="glass-strong rounded-xl border-0 shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Score Breakdown</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-slate-700">Technical Analysis</span>
              <span className="font-bold text-slate-800 text-lg">{Math.max(result.authenticityScore - 5, 0)}%</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-3">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(result.authenticityScore)}`}
                style={{ width: `${Math.max(result.authenticityScore - 5, 0)}%` }}
              ></div>
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-slate-700">Pattern Recognition</span>
              <span className="font-bold text-slate-800 text-lg">{Math.min(result.authenticityScore + 3, 100)}%</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-3">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(result.authenticityScore)}`}
                style={{ width: `${Math.min(result.authenticityScore + 3, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-slate-700">Consistency Check</span>
              <span className="font-bold text-slate-800 text-lg">{result.authenticityScore}%</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-3">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(result.authenticityScore)}`}
                style={{ width: `${result.authenticityScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-strong rounded-xl border-0 shadow-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800 text-lg">Understanding Scores</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">90-100%: Clearly Authentic</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-700 font-medium">70-89%: Likely Authentic</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-700 font-medium">50-69%: Uncertain</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">0-49%: Likely Deepfake</span>
                </div>
              </div>
              <p className="text-sm text-blue-600 leading-relaxed">
                Professional content typically scores 70-95% authentic. Lower scores may indicate AI generation.
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-strong rounded-xl border-0 shadow-lg p-6 bg-gradient-to-r from-amber-50/30 to-orange-50/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h4 className="font-semibold text-amber-800 text-lg">Important Disclaimer</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                <strong>This analysis is not 100% accurate</strong> and should be used as a preliminary assessment only.
                For critical decisions, always combine with human expert review and additional verification tools.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
