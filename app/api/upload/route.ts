import { type NextRequest, NextResponse } from "next/server"
import { storeFile } from "@/lib/file-storage"

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB for videos
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB for images
const MAX_AUDIO_SIZE = 25 * 1024 * 1024 // 25MB for audio

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    let maxSize = MAX_FILE_SIZE
    if (file.type.startsWith("image/")) {
      maxSize = MAX_IMAGE_SIZE
    } else if (file.type.startsWith("audio/")) {
      maxSize = MAX_AUDIO_SIZE
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json(
        {
          error: `File size exceeds ${maxSizeMB} MB limit for ${file.type.split("/")[0]} files`,
        },
        { status: 413 },
      )
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload JPG, PNG, MP4, MOV, MP3, WAV, or M4A files." },
        { status: 400 },
      )
    }

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const fileId = timestamp.toString()

    // Store file metadata for analysis
    const fileMetadata = {
      originalName: file.name,
      filename,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }

    storeFile(fileId, buffer, fileMetadata)

    console.log(`[v0] File stored successfully: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    return NextResponse.json({
      success: true,
      fileId,
      metadata: fileMetadata,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to process file upload" }, { status: 500 })
  }
}
