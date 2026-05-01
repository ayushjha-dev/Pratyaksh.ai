interface StoredFile {
  buffer: Buffer
  metadata: {
    originalName: string
    filename: string
    size: number
    type: string
    uploadedAt: string
  }
}

// Simple in-memory storage for uploaded files
const fileStore = new Map<string, StoredFile>()

export function storeFile(fileId: string, buffer: Buffer, metadata: any): void {
  fileStore.set(fileId, { buffer, metadata })

  // Clean up old files after 1 hour to prevent memory leaks
  setTimeout(
    () => {
      fileStore.delete(fileId)
    },
    60 * 60 * 1000,
  )
}

export function getFile(fileId: string): StoredFile | null {
  return fileStore.get(fileId) || null
}

export function deleteFile(fileId: string): void {
  fileStore.delete(fileId)
}
