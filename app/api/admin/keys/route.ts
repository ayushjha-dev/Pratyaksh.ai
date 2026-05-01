import { type NextRequest, NextResponse } from "next/server"
import { loadKeysFromStorage, saveKeysToStorage, getWorkingKeysCount } from "@/lib/key-storage"

// Load keys from persistent storage on startup
let storedGeminiKeys = loadKeysFromStorage()

export function getStoredGeminiKeys() {
  return storedGeminiKeys
}

export async function GET() {
  try {
    storedGeminiKeys = loadKeysFromStorage()

    const maskKey = (key: string) => (key ? `${key.slice(0, 8)}${"*".repeat(Math.max(0, key.length - 8))}` : "")

    const maskedKeys: Record<string, string> = {}
    Object.entries(storedGeminiKeys).forEach(([keyId, keyValue]) => {
      maskedKeys[keyId] = maskKey(keyValue)
    })

    const workingKeysCount = getWorkingKeysCount(storedGeminiKeys)
    console.log(`[v0] Admin panel loaded ${Object.keys(storedGeminiKeys).length} keys, ${workingKeysCount} have values`)

    return NextResponse.json({
      keys: maskedKeys,
      totalKeys: Object.keys(storedGeminiKeys).length,
      workingKeys: workingKeysCount,
    })
  } catch (error) {
    console.error("[v0] Error loading keys for admin panel:", error)
    return NextResponse.json({ error: "Failed to load keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keys } = await request.json()

    Object.entries(keys).forEach(([keyId, keyValue]) => {
      if (typeof keyValue === "string") {
        storedGeminiKeys[keyId] = keyValue
        console.log(`[v0] Updated Gemini API key ${keyId}`)

        // Update environment variable for the first key for backward compatibility
        if (keyId === "key1") {
          process.env.GEMINI_API_KEY = keyValue
        }
      }
    })

    saveKeysToStorage(storedGeminiKeys)

    const workingKeysCount = getWorkingKeysCount(storedGeminiKeys)
    console.log(`[v0] Saved ${Object.keys(storedGeminiKeys).length} keys to storage, ${workingKeysCount} have values`)

    return NextResponse.json({
      success: true,
      totalKeys: Object.keys(storedGeminiKeys).length,
      workingKeys: workingKeysCount,
    })
  } catch (error) {
    console.error("[v0] Error saving keys:", error)
    return NextResponse.json({ error: "Failed to save keys" }, { status: 500 })
  }
}
