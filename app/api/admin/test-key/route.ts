import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { keyId, key } = await request.json()

    if (!key) {
      return NextResponse.json({ success: false, error: "No API key provided" })
    }

    const testResult = await testGeminiKey(key)

    return NextResponse.json({ success: testResult })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Test failed" })
  }
}

async function testGeminiKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      method: "GET",
    })
    return response.ok
  } catch {
    return false
  }
}
