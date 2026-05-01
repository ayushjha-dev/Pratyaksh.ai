"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileImage, FileVideo, FileAudio, AlertCircle, Loader2, Info, Shield, Zap } from "lucide-react"
import { uploadFile, startAnalysis } from "@/lib/upload-utils"
import { ProgressTracker } from "./progress-tracker"
import { AnalysisResults } from "./analysis-results"

type FileUploadProps = {}

type UploadState = "idle" | "uploading" | "analyzing" | "completed" | "error"

export function FileUpload({}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const validateFile = (file: File): string | null => {
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
    const MAX_AUDIO_SIZE = 25 * 1024 * 1024 // 25MB

    const ACCEPTED_TYPES = {
      "image/jpeg": { ext: ".jpg", maxSize: MAX_IMAGE_SIZE },
      "image/png": { ext: ".png", maxSize: MAX_IMAGE_SIZE },
      "video/mp4": { ext: ".mp4", maxSize: MAX_VIDEO_SIZE },
      "video/quicktime": { ext: ".mov", maxSize: MAX_VIDEO_SIZE },
      "audio/mpeg": { ext: ".mp3", maxSize: MAX_AUDIO_SIZE },
      "audio/wav": { ext: ".wav", maxSize: MAX_AUDIO_SIZE },
      "audio/mp4": { ext: ".m4a", maxSize: MAX_AUDIO_SIZE },
    }

    if (file.size === 0) {
      return "File appears to be empty. Please select a valid file."
    }

    const fileTypeInfo = ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES]
    if (!fileTypeInfo) {
      return `Unsupported file type: ${file.type}. Please upload JPG, PNG, MP4, MOV, MP3, WAV, or M4A files only.`
    }

    if (file.size > fileTypeInfo.maxSize) {
      const maxSizeMB = Math.round(fileTypeInfo.maxSize / (1024 * 1024))
      return `File size (${formatFileSize(file.size)}) exceeds the ${maxSizeMB} MB limit for ${file.type.split("/")[0]} files.`
    }

    const fileExtension = file.name.toLowerCase().split(".").pop()
    const expectedExtensions = Object.values(ACCEPTED_TYPES).map((typeInfo) => typeInfo.ext.substring(1))

    if (!fileExtension || !expectedExtensions.includes(fileExtension)) {
      return `Invalid file extension. Please ensure your file has the correct extension: ${expectedExtensions.join(", ")}.`
    }

    if (file.name.length > 255) {
      return "File name is too long. Please rename your file to be shorter than 255 characters."
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  const handleAnalyze = async () => {
    if (!selectedFile || isProcessing) return

    setIsProcessing(true)
    setUploadState("uploading")
    setError(null)

    try {
      const uploadResult = await uploadFile(selectedFile)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Upload failed")
      }

      if (uploadResult.fileId && uploadResult.metadata) {
        const analysisResult = await startAnalysis(uploadResult.fileId, uploadResult.metadata)

        if (!analysisResult.success) {
          throw new Error(analysisResult.error || "Failed to start analysis")
        }

        setAnalysisId(analysisResult.analysisId || null)
        setUploadState("analyzing")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setError(error instanceof Error ? error.message : "Failed to analyze file")
      setUploadState("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalysisComplete = () => {
    setUploadState("completed")
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setError(null)
    setUploadState("idle")
    setAnalysisId(null)
    setIsProcessing(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="w-6 h-6 sm:w-8 sm:h-8" />
    if (type.startsWith("video/")) return <FileVideo className="w-6 h-6 sm:w-8 sm:h-8" />
    if (type.startsWith("audio/")) return <FileAudio className="w-6 h-6 sm:w-8 sm:h-8" />
    return <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (uploadState === "analyzing" && analysisId) {
    return (
      <div className="space-y-6">
        <ProgressTracker analysisId={analysisId} onComplete={handleAnalysisComplete} />
      </div>
    )
  }

  if (uploadState === "completed" && analysisId && selectedFile) {
    return (
      <div className="space-y-6">
        <AnalysisResults
          analysisId={analysisId}
          fileType={selectedFile.type}
          fileName={selectedFile.name}
          onAnalyzeAnother={resetUpload}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <Card className="glass rounded-2xl border-0 shadow-xl p-6 sm:p-8">
        <div className="flex items-start space-x-4">
          <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-800">Advanced AI Detection Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-slate-700 font-medium">Multi-AI Analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-slate-700 font-medium">Secure Processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-teal-100">
                  <FileImage className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-slate-700 font-medium">Multiple Formats</span>
              </div>
            </div>
            <p className="text-sm text-blue-600 leading-relaxed">
              Upload your media files for comprehensive deepfake detection using state-of-the-art AI models.
            </p>
          </div>
        </div>
      </Card>

      <Card className="glass-strong rounded-2xl border-0 shadow-2xl p-8 sm:p-10 lg:p-12 transition-all duration-300 hover:shadow-3xl">
        <div
          className={`relative ${
            isDragOver
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.02]"
              : "border-slate-300/50 hover:border-blue-400/50"
          } border-2 border-dashed rounded-2xl p-12 sm:p-16 lg:p-20 text-center transition-all duration-300 min-h-[280px] flex flex-col justify-center group`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!selectedFile && (
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={".jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav,.m4a"}
              onChange={handleFileInputChange}
              disabled={uploadState === "uploading" || isProcessing}
            />
          )}

          {selectedFile ? (
            <div className="space-y-8">
              <div className="relative">
                <div className="flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {getFileIcon(selectedFile.type)}
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="space-y-4">
                <p className="text-lg sm:text-xl font-semibold text-slate-800 break-words px-4">{selectedFile.name}</p>
                <div className="flex items-center justify-center space-x-6 text-base text-slate-600">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedFile.type.split("/")[0]} File</span>
                </div>
              </div>

              <Button
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white px-12 py-4 text-lg font-semibold min-h-[56px] touch-manipulation shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl animate-gradient group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAnalyze}
                disabled={uploadState === "uploading" || isProcessing}
              >
                {uploadState === "uploading" || isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Uploading & Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative">
                <div className="flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
                  <Upload className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="space-y-4">
                <p className="text-xl sm:text-2xl font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                  Drop your file here or click to browse
                </p>
                <p className="text-base text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
                  Drag and drop a file or click anywhere to select
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass rounded-xl border-0 shadow-lg p-6">
          <div className="space-y-4">
            <h5 className="text-lg font-semibold text-slate-800 flex items-center">
              <FileImage className="w-5 h-5 mr-3 text-blue-600" />
              Supported Formats
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Images:</span>
                <span className="font-medium text-slate-800">JPG, PNG (10 MB max)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Videos:</span>
                <span className="font-medium text-slate-800">MP4, MOV (50 MB max)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Audio:</span>
                <span className="font-medium text-slate-800">MP3, WAV, M4A (25 MB max)</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass rounded-xl border-0 shadow-lg p-6">
          <div className="space-y-4">
            <h5 className="text-lg font-semibold text-slate-800 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-green-600" />
              Privacy & Security
            </h5>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Files processed securely</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Auto-deleted after analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>No data stored permanently</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <Card className="glass rounded-xl border-0 shadow-lg p-6 bg-red-50/50">
          <div className="flex items-start space-x-4 text-red-700">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <p className="font-medium text-lg">Upload Error</p>
              <p className="text-base leading-relaxed">{error}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
