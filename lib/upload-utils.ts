export interface FileMetadata {
  originalName: string
  filename: string
  size: number
  type: string
  uploadedAt: string
}

export interface UploadResponse {
  success: boolean
  fileId?: string
  metadata?: FileMetadata
  message: string
  error?: string
}

export interface AnalysisResponse {
  success: boolean
  analysisId?: string
  status?: string
  message: string
  error?: string
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Upload failed")
    }

    return result
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      message: "Upload failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export const startAnalysis = async (fileId: string, metadata: FileMetadata): Promise<AnalysisResponse> => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId, metadata }),
      signal: AbortSignal.timeout(120000), // 2 minute timeout
    })

    let result
    try {
      result = await response.json()
    } catch (parseError) {
      const textResponse = await response.text()
      console.error("Failed to parse JSON response:", textResponse)
      throw new Error(`Server returned invalid response: ${textResponse.substring(0, 100)}...`)
    }

    if (!response.ok) {
      throw new Error(result.error || "Analysis failed to start")
    }

    return result
  } catch (error) {
    console.error("Analysis error:", error)

    let errorMessage = "Failed to start analysis"
    if (error.name === "TimeoutError") {
      errorMessage = "Analysis request timed out - file may be too large"
    } else if (error.message.includes("invalid response")) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export const getAnalysisResult = async (analysisId: string) => {
  try {
    const response = await fetch(`/api/analyze?analysisId=${analysisId}`)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to get analysis result")
    }

    return result
  } catch (error) {
    console.error("Get analysis result error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
