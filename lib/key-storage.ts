import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"

const KEYS_FILE_PATH = join(process.cwd(), ".gemini-keys.json")

interface StoredKeys {
  [keyId: string]: string
}

export function loadKeysFromStorage(): StoredKeys {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL

  if (isProduction) {
    // In production (Vercel), use environment variables
    const productionKeys: StoredKeys = {}

    // Load the primary GEMINI_API_KEY first
    if (process.env.GEMINI_API_KEY) {
      productionKeys.key1 = process.env.GEMINI_API_KEY
    }

    // Load all numbered GEMINI_API_KEY_* environment variables
    let keyIndex = 1
    while (process.env[`GEMINI_API_KEY_${keyIndex}`]) {
      const keyNum = keyIndex + 1 // Offset by 1 since we used key1 for primary
      productionKeys[`key${keyNum}`] = process.env[`GEMINI_API_KEY_${keyIndex}`]!
      keyIndex++
    }

    console.log(`[v0] Production mode: Loaded ${Object.keys(productionKeys).length} keys from environment variables`)
    return productionKeys
  }

  // Development mode: use file storage
  try {
    if (existsSync(KEYS_FILE_PATH)) {
      const fileContent = readFileSync(KEYS_FILE_PATH, "utf-8")
      const storedKeys = JSON.parse(fileContent)
      console.log(`[v0] Development mode: Loaded ${Object.keys(storedKeys).length} keys from persistent storage`)
      return storedKeys
    }
  } catch (error) {
    console.log("[v0] Error loading keys from file, using defaults:", error)
  }

  // Fallback to environment variable for key1
  const defaultKeys: StoredKeys = {}
  if (process.env.GEMINI_API_KEY) {
    defaultKeys.key1 = process.env.GEMINI_API_KEY
    console.log("[v0] Using environment variable for key1")
  }

  return defaultKeys
}

export function saveKeysToStorage(keys: StoredKeys): void {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL

  if (isProduction) {
    console.log("[v0] Production mode: Keys are managed via environment variables, skipping file save")
    return
  }

  try {
    writeFileSync(KEYS_FILE_PATH, JSON.stringify(keys, null, 2))
    console.log(`[v0] Development mode: Saved ${Object.keys(keys).length} keys to persistent storage`)
  } catch (error) {
    console.error("[v0] Error saving keys to storage:", error)
    throw new Error("Failed to save keys to persistent storage")
  }
}

export function getWorkingKeysCount(keys: StoredKeys): number {
  return Object.values(keys).filter((key) => key && key.trim().length > 0).length
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL
}
