"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Key,
  CheckCircle,
  AlertCircle,
  TestTube,
  Plus,
  Trash2,
  Info,
  Shield,
  Zap,
  Target,
} from "lucide-react"

interface AdminPanelProps {
  onBack: () => void
}

interface GeminiKeys {
  [key: string]: string // key1, key2, key3, etc.
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [geminiKeys, setGeminiKeys] = useState<GeminiKeys>({
    key1: "",
    key2: "",
    key3: "",
  })
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({})
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [fallbackTestResult, setFallbackTestResult] = useState<any>(null)
  const [testingFallback, setTestingFallback] = useState(false)
  const [isProduction, setIsProduction] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingAll, setIsTestingAll] = useState(false)

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const response = await fetch("/api/admin/keys")
        if (response.ok) {
          const data = await response.json()
          setGeminiKeys(data.keys || { key1: "", key2: "", key3: "" })
          setIsProduction(data.isProduction || false)
        }
      } catch (error) {
        console.error("Failed to load API keys:", error)
      }
    }
    loadApiKeys()
  }, [])

  const handleSaveKeys = async () => {
    if (isProduction || isSaving) {
      if (isProduction) {
        alert("In production mode, API keys are managed via Vercel environment variables. Changes here won't persist.")
      }
      return
    }

    setIsSaving(true)
    setSaveStatus("saving")
    try {
      const response = await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: geminiKeys }),
      })

      if (response.ok) {
        setSaveStatus("success")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 2000)
      }
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const testApiKey = async (keyId: string) => {
    if (!geminiKeys[keyId]?.trim() || testingKey) {
      setTestResults((prev) => ({ ...prev, [keyId]: false }))
      return
    }

    setTestingKey(keyId)
    try {
      const response = await fetch("/api/admin/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, key: geminiKeys[keyId] }),
      })

      const result = await response.json()
      setTestResults((prev) => ({ ...prev, [keyId]: result.success }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [keyId]: false }))
    } finally {
      setTestingKey(null)
    }
  }

  const testAllKeys = async () => {
    if (isTestingAll) return

    setIsTestingAll(true)
    for (const keyId of Object.keys(geminiKeys)) {
      if (geminiKeys[keyId]?.trim()) {
        await testApiKey(keyId)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    setIsTestingAll(false)
  }

  const testFallbackMechanism = async () => {
    if (testingFallback) return

    setTestingFallback(true)
    try {
      const response = await fetch("/api/test-fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: geminiKeys }),
      })

      const result = await response.json()
      setFallbackTestResult(result)
    } catch (error) {
      setFallbackTestResult({ success: false, error: "Failed to test fallback mechanism" })
    } finally {
      setTestingFallback(false)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const updateApiKey = (keyId: string, value: string) => {
    setGeminiKeys((prev) => ({ ...prev, [keyId]: value }))
    setTestResults((prev) => ({ ...prev, [keyId]: null }))
  }

  const addNewKey = () => {
    const keyIds = Object.keys(geminiKeys)
    const nextKeyNumber = keyIds.length + 1
    const newKeyId = `key${nextKeyNumber}`
    setGeminiKeys((prev) => ({ ...prev, [newKeyId]: "" }))
  }

  const removeKey = (keyId: string) => {
    if (Object.keys(geminiKeys).length <= 1) return
    const newKeys = { ...geminiKeys }
    delete newKeys[keyId]
    setGeminiKeys(newKeys)

    const newShowKeys = { ...showKeys }
    delete newShowKeys[keyId]
    setShowKeys(newShowKeys)

    const newTestResults = { ...testResults }
    delete newTestResults[keyId]
    setTestResults(newTestResults)
  }

  const hasAnyKeys = Object.values(geminiKeys).some((key) => key?.trim())
  const workingKeysCount = Object.values(testResults).filter((result) => result === true).length

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="glass hover:glass-strong border-0 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-300 bg-transparent min-h-[44px] px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analysis
        </Button>
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            API Keys Management
          </h4>
        </div>
      </div>

      {isProduction && (
        <Card className="glass rounded-2xl border-0 shadow-xl p-8 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-amber-100">
              <Info className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-amber-800">Production Mode - Environment Variables</h5>
              <p className="text-base text-amber-700">
                You're running in production mode. API keys are loaded from Vercel environment variables:
              </p>
              <div className="glass rounded-lg p-4 bg-amber-100/50">
                <code className="text-sm text-amber-800 font-mono">
                  GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.
                </code>
              </div>
              <p className="text-sm text-amber-600">
                To add/modify keys, update your environment variables in Vercel Project Settings.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="glass-strong rounded-2xl border-0 shadow-2xl p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-teal-600">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <h5 className="text-xl font-semibold text-slate-800">Multiple Gemini Keys Fallback System</h5>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`w-4 h-4 rounded-full ${workingKeysCount > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              ></div>
              <span className="text-base font-medium text-slate-700">
                {workingKeysCount > 0 ? "System Active" : "System Inactive"}
              </span>
            </div>
          </div>

          <p className="text-base text-slate-600 leading-relaxed">
            Configure multiple Gemini API keys for maximum reliability. When one key hits rate limits, the system
            automatically switches to the next available key.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{Object.keys(geminiKeys).length}</div>
              <div className="text-sm text-slate-600">Total Keys</div>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-green-100">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">{workingKeysCount}</div>
              <div className="text-sm text-slate-600">Working Keys</div>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-purple-100">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {workingKeysCount > 0 ? Math.round((workingKeysCount / Object.keys(geminiKeys).length) * 100) : 0}%
              </div>
              <div className="text-sm text-slate-600">Reliability</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={testAllKeys}
              variant="outline"
              size="sm"
              className="glass hover:glass-strong border-0 text-slate-700 rounded-xl bg-transparent min-h-[44px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTestingAll}
            >
              {isTestingAll ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                  Testing All...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test All Keys
                </>
              )}
            </Button>
            <Button
              onClick={testFallbackMechanism}
              variant="outline"
              size="sm"
              className="glass hover:glass-strong border-0 text-slate-700 rounded-xl bg-transparent min-h-[44px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={testingFallback}
            >
              {testingFallback ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Test Fallback
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {fallbackTestResult && (
        <Card
          className={`glass-strong rounded-2xl border-0 shadow-xl p-6 ${fallbackTestResult.success ? "bg-green-50/50" : "bg-red-50/50"}`}
        >
          <div className="space-y-3">
            <h5
              className={`font-semibold flex items-center ${fallbackTestResult.success ? "text-green-800" : "text-red-800"}`}
            >
              <div className={`p-2 rounded-full mr-3 ${fallbackTestResult.success ? "bg-green-100" : "bg-red-100"}`}>
                {fallbackTestResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              Fallback Test Results
            </h5>
            <p className={`text-sm ${fallbackTestResult.success ? "text-green-700" : "text-red-700"}`}>
              {fallbackTestResult.message}
            </p>
            {fallbackTestResult.details && (
              <div className="glass rounded-xl p-3">
                <div className="text-xs space-y-1">
                  {fallbackTestResult.details.map((detail: string, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 ${fallbackTestResult.success ? "text-green-600" : "text-red-600"}`}
                    >
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {Object.entries(geminiKeys).map(([keyId, keyValue]) => (
        <Card key={keyId} className="glass-strong rounded-2xl border-0 shadow-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${testResults[keyId] === true ? "bg-green-100" : testResults[keyId] === false ? "bg-red-100" : "bg-slate-100"}`}
                >
                  <Key
                    className={`w-4 h-4 ${testResults[keyId] === true ? "text-green-600" : testResults[keyId] === false ? "text-red-600" : "text-slate-600"}`}
                  />
                </div>
                <label className="text-sm font-semibold text-slate-800">
                  Gemini API Key #{keyId.replace("key", "")}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                {testResults[keyId] !== null && (
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      testResults[keyId] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {testResults[keyId] ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Working</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Failed</span>
                      </>
                    )}
                  </div>
                )}
                <Button
                  onClick={() => testApiKey(keyId)}
                  variant="outline"
                  size="sm"
                  className="glass hover:glass-strong border-0 text-xs rounded-xl"
                  disabled={testingKey === keyId}
                >
                  {testingKey === keyId ? (
                    <>
                      <div className="w-3 h-3 mr-1 animate-spin rounded-full border border-slate-400 border-t-transparent"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-3 h-3 mr-1" />
                      Test
                    </>
                  )}
                </Button>
                {Object.keys(geminiKeys).length > 1 && !isProduction && (
                  <Button
                    onClick={() => removeKey(keyId)}
                    variant="outline"
                    size="sm"
                    className="glass hover:glass-strong border-0 text-xs text-red-600 hover:text-red-700 rounded-xl"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type={showKeys[keyId] ? "text" : "password"}
                value={keyValue}
                onChange={(e) => updateApiKey(keyId, e.target.value)}
                className="w-full px-4 py-3 pr-12 glass rounded-xl border-0 focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-500 text-sm"
                placeholder="Enter your Gemini API key (AIza...)"
                readOnly={isProduction}
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility(keyId)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                {showKeys[keyId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {keyId === "key1" && !isProduction && (
              <div className="glass rounded-xl p-4 bg-blue-50/50">
                <div className="text-xs text-slate-700 space-y-2">
                  <p className="font-semibold flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    How to get your Gemini API key:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>
                      Visit{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Google AI Studio
                      </a>
                    </li>
                    <li>Sign in with your Google account</li>
                    <li>Click 'Create API Key' and select a project</li>
                    <li>Copy the generated key (starts with 'AIza...')</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {!isProduction && (
        <Button
          onClick={addNewKey}
          variant="outline"
          className="w-full glass hover:glass-strong border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-2xl py-6 transition-all duration-300 bg-transparent"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Another Gemini API Key
        </Button>
      )}

      <Button
        onClick={handleSaveKeys}
        disabled={saveStatus === "saving" || !hasAnyKeys || isProduction || isSaving}
        className={`w-full min-h-[56px] rounded-xl font-semibold transition-all duration-300 ${
          saveStatus === "success"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : saveStatus === "error"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
        } ${isProduction || isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Save className="w-5 h-5 mr-2" />
        {isProduction
          ? "Production Mode - Use Environment Variables"
          : saveStatus === "saving" || isSaving
            ? "Saving Configuration..."
            : saveStatus === "success"
              ? "Configuration Saved Successfully!"
              : saveStatus === "error"
                ? "Save Failed - Please Try Again"
                : "Save API Configuration"}
      </Button>

      <div className="glass rounded-xl p-6 bg-slate-50/50">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>{isProduction ? "Production Deployment:" : "Multiple Keys Strategy:"}</strong>{" "}
          {isProduction
            ? "Your API keys are loaded from Vercel environment variables (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.). The fallback system works automatically with your configured environment variables."
            : "Your Gemini API keys are stored securely and used in sequence. When one key hits rate limits, the system automatically switches to the next available key. Add multiple free Gemini keys to ensure uninterrupted service during your hackathon presentation."}
        </p>
      </div>
    </div>
  )
}
