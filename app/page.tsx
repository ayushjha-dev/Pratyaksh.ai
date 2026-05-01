"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { AdminPanel } from "@/components/admin-panel"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Settings, Lock, Shield, Zap, Eye } from "lucide-react"

export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const handleAdminLogin = () => {
    if (adminPassword === "pratyaksh2024") {
      setIsAdminAuthenticated(true)
      setShowAdminLogin(false)
      setLoginError("")
    } else {
      setLoginError("Invalid password")
    }
  }

  const handleBackToMain = () => {
    setIsAdminAuthenticated(false)
  }

  if (isAdminAuthenticated) {
    return (
      <main className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-4xl mx-auto">
            <Card className="glass-strong rounded-2xl border-0 shadow-2xl">
              <div className="p-6 sm:p-8">
                <AdminPanel onBack={handleBackToMain} />
              </div>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-10 p-4 sm:p-6 lg:p-8">
        <div className="absolute top-4 right-4">
          <Button
            onClick={() => setShowAdminLogin(true)}
            variant="outline"
            size="sm"
            className="glass rounded-xl border-0 hover:glass-strong transition-all duration-300 text-slate-700 hover:text-slate-900"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md glass-strong rounded-2xl border-0 shadow-2xl">
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-2 text-center justify-center">
                  <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Admin Access</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 glass rounded-xl border-0 focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-500"
                  />
                  {loginError && <p className="text-sm text-red-500 font-medium">{loginError}</p>}
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAdminLogin}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAdminLogin(false)
                      setAdminPassword("")
                      setLoginError("")
                    }}
                    variant="outline"
                    className="flex-1 glass rounded-xl border-0 hover:glass-strong transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent tracking-tight leading-tight animate-gradient">
                Pratyaksh.AI
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 blur-3xl -z-10 animate-pulse-slow" />
            </div>

            <div className="flex items-center justify-center space-x-3 glass rounded-full px-6 py-3 mx-auto w-fit">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
              <span className="font-semibold text-slate-700 text-lg">Advanced Deepfake Detection</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xl sm:text-2xl md:text-3xl text-slate-700 font-semibold">
              Analyze Media Authenticity with AI-Powered Precision
            </p>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Upload images, videos, or audio files to detect digital manipulation and deepfakes using cutting-edge AI
              technology
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center space-x-3 glass rounded-2xl px-6 py-3 hover:glass-strong transition-all duration-300 group">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-700 font-semibold">Multi-AI Analysis</span>
            </div>
            <div className="flex items-center space-x-3 glass rounded-2xl px-6 py-3 hover:glass-strong transition-all duration-300 group">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-700 font-semibold">Real-time Processing</span>
            </div>
            <div className="flex items-center space-x-3 glass rounded-2xl px-6 py-3 hover:glass-strong transition-all duration-300 group">
              <div className="p-2 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-700 font-semibold">Secure & Private</span>
            </div>
          </div>
        </div>

        <div className="max-w-full sm:max-w-2xl mx-auto relative">
          <div className="glass-strong rounded-3xl p-1">
            <FileUpload />
          </div>
        </div>
      </div>
    </main>
  )
}
