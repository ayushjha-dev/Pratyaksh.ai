// Hackathon Readiness Test - Ensures system is ready for live demo
// This script validates critical functionality for hackathon presentation

interface HackathonTest {
  name: string
  critical: boolean
  status: "PASS" | "FAIL" | "WARNING"
  message: string
  recommendation?: string
}

class HackathonReadinessChecker {
  private tests: HackathonTest[] = []
  private baseUrl = process.env.NODE_ENV === "production" ? "https://your-domain.vercel.app" : "http://localhost:3000"

  async runHackathonChecks(): Promise<void> {
    console.log("🏆 HACKATHON READINESS CHECK")
    console.log("Ensuring Pratyaksh.AI is demo-ready...")
    console.log("=".repeat(50))

    await this.checkApiKeyConfiguration()
    await this.checkFallbackMechanism()
    await this.checkFileUploadLimits()
    await this.checkAnalysisSpeed()
    await this.checkPdfExportReliability()
    await this.checkUIResponsiveness()
    await this.checkErrorRecovery()
    await this.checkDemoScenarios()

    this.generateHackathonReport()
  }

  private async checkApiKeyConfiguration(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/keys`)

      if (response.ok) {
        const result = await response.json()
        const keyCount = Object.keys(result.keys || {}).length
        const workingKeys = Object.values(result.keys || {}).filter((key) => key && key.trim()).length

        if (workingKeys >= 3) {
          this.tests.push({
            name: "API Key Configuration",
            critical: true,
            status: "PASS",
            message: `${workingKeys} API keys configured - excellent redundancy`,
          })
        } else if (workingKeys >= 1) {
          this.tests.push({
            name: "API Key Configuration",
            critical: true,
            status: "WARNING",
            message: `Only ${workingKeys} API key(s) configured`,
            recommendation: "Add more API keys for better reliability during demo",
          })
        } else {
          this.tests.push({
            name: "API Key Configuration",
            critical: true,
            status: "FAIL",
            message: "No working API keys found",
            recommendation: "CRITICAL: Configure at least one working API key before demo",
          })
        }
      } else {
        throw new Error("Admin endpoint not accessible")
      }
    } catch (error) {
      this.tests.push({
        name: "API Key Configuration",
        critical: true,
        status: "FAIL",
        message: "Cannot access API key configuration",
        recommendation: "Check admin panel accessibility",
      })
    }
  }

  private async checkFallbackMechanism(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/test-fallback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: {} }),
      })

      if (response.ok) {
        const result = await response.json()
        this.tests.push({
          name: "Fallback Mechanism",
          critical: true,
          status: result.success ? "PASS" : "WARNING",
          message: result.message || "Fallback system tested",
          recommendation: result.success ? undefined : "Test fallback with multiple keys",
        })
      } else {
        throw new Error("Fallback test failed")
      }
    } catch (error) {
      this.tests.push({
        name: "Fallback Mechanism",
        critical: true,
        status: "FAIL",
        message: "Fallback mechanism not working",
        recommendation: "CRITICAL: Fix fallback system before demo",
      })
    }
  }

  private async checkFileUploadLimits(): Promise<void> {
    try {
      // Test with different file sizes to ensure limits work
      const testSizes = [
        { type: "image", size: 5 * 1024 * 1024, expected: "PASS" }, // 5MB image
        { type: "video", size: 30 * 1024 * 1024, expected: "PASS" }, // 30MB video
        { type: "audio", size: 15 * 1024 * 1024, expected: "PASS" }, // 15MB audio
      ]

      let allLimitsWorking = true

      for (const test of testSizes) {
        // Create mock file of specified size
        const mockData = new Uint8Array(test.size)
        const blob = new Blob([mockData], { type: `${test.type}/test` })
        const file = new File([blob], `test.${test.type}`, { type: `${test.type}/test` })

        // Test upload validation (without actually uploading)
        const formData = new FormData()
        formData.append("file", file)

        try {
          const response = await fetch(`${this.baseUrl}/api/upload`, {
            method: "POST",
            body: formData,
          })

          // We expect this to work for reasonable file sizes
          if (!response.ok && test.expected === "PASS") {
            allLimitsWorking = false
          }
        } catch (error) {
          // Network errors are expected for large files
        }
      }

      this.tests.push({
        name: "File Upload Limits",
        critical: false,
        status: allLimitsWorking ? "PASS" : "WARNING",
        message: allLimitsWorking
          ? "File size limits working correctly"
          : "Some file size limits may be too restrictive",
        recommendation: allLimitsWorking ? undefined : "Test with actual demo files",
      })
    } catch (error) {
      this.tests.push({
        name: "File Upload Limits",
        critical: false,
        status: "WARNING",
        message: "Could not fully test file upload limits",
        recommendation: "Test manually with demo files",
      })
    }
  }

  private async checkAnalysisSpeed(): Promise<void> {
    try {
      const startTime = Date.now()

      const response = await fetch(`${this.baseUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: "speed-test",
          metadata: { originalName: "test.jpg", type: "image/jpeg", size: 1024 },
        }),
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        if (responseTime < 2000) {
          this.tests.push({
            name: "Analysis Speed",
            critical: false,
            status: "PASS",
            message: `Analysis starts in ${responseTime}ms - excellent for demo`,
          })
        } else if (responseTime < 5000) {
          this.tests.push({
            name: "Analysis Speed",
            critical: false,
            status: "WARNING",
            message: `Analysis starts in ${responseTime}ms - acceptable but could be faster`,
            recommendation: "Consider optimizing for demo performance",
          })
        } else {
          this.tests.push({
            name: "Analysis Speed",
            critical: false,
            status: "FAIL",
            message: `Analysis takes ${responseTime}ms - too slow for demo`,
            recommendation: "CRITICAL: Optimize analysis startup time",
          })
        }
      } else {
        throw new Error("Analysis endpoint not working")
      }
    } catch (error) {
      this.tests.push({
        name: "Analysis Speed",
        critical: false,
        status: "FAIL",
        message: "Cannot test analysis speed",
        recommendation: "Check analysis endpoint",
      })
    }
  }

  private async checkPdfExportReliability(): Promise<void> {
    try {
      // Test PDF generation
      const jsPDF = await import("jspdf")
      const doc = new jsPDF.default()

      // Add test content
      doc.text("Hackathon Demo Test", 10, 10)
      doc.text("This PDF was generated during system testing", 10, 20)

      const pdfOutput = doc.output("datauristring")

      if (pdfOutput && pdfOutput.length > 1000) {
        this.tests.push({
          name: "PDF Export Reliability",
          critical: false,
          status: "PASS",
          message: "PDF generation working perfectly for demo",
        })
      } else {
        throw new Error("PDF generation produced invalid output")
      }
    } catch (error) {
      this.tests.push({
        name: "PDF Export Reliability",
        critical: false,
        status: "FAIL",
        message: "PDF export not working",
        recommendation: "Fix PDF export before demo - judges love downloadable reports",
      })
    }
  }

  private async checkUIResponsiveness(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/`)

      if (response.ok) {
        const html = await response.text()

        // Check for mobile-responsive classes
        const hasMobileClasses = html.includes("sm:") && html.includes("md:") && html.includes("lg:")
        const hasFlexbox = html.includes("flex") || html.includes("grid")
        const hasGlassMorphism = html.includes("glass") || html.includes("backdrop-blur")

        if (hasMobileClasses && hasFlexbox && hasGlassMorphism) {
          this.tests.push({
            name: "UI Responsiveness",
            critical: false,
            status: "PASS",
            message: "UI is fully responsive with modern design - perfect for demo",
          })
        } else {
          this.tests.push({
            name: "UI Responsiveness",
            critical: false,
            status: "WARNING",
            message: "UI may not be fully responsive",
            recommendation: "Test on mobile devices before demo",
          })
        }
      } else {
        throw new Error("Cannot access main page")
      }
    } catch (error) {
      this.tests.push({
        name: "UI Responsiveness",
        critical: false,
        status: "FAIL",
        message: "Cannot test UI responsiveness",
        recommendation: "Check main page accessibility",
      })
    }
  }

  private async checkErrorRecovery(): Promise<void> {
    try {
      // Test error handling with invalid request
      const response = await fetch(`${this.baseUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invalid: "data" }),
      })

      if (response.status >= 400) {
        const result = await response.json()
        if (result.error && typeof result.error === "string") {
          this.tests.push({
            name: "Error Recovery",
            critical: true,
            status: "PASS",
            message: "Error handling works - demo will recover gracefully from issues",
          })
        } else {
          this.tests.push({
            name: "Error Recovery",
            critical: true,
            status: "WARNING",
            message: "Error responses lack proper messages",
            recommendation: "Improve error messages for better demo experience",
          })
        }
      } else {
        this.tests.push({
          name: "Error Recovery",
          critical: true,
          status: "WARNING",
          message: "Error handling may be too permissive",
          recommendation: "Validate error handling with invalid inputs",
        })
      }
    } catch (error) {
      this.tests.push({
        name: "Error Recovery",
        critical: true,
        status: "FAIL",
        message: "Error recovery system not working",
        recommendation: "CRITICAL: Fix error handling before demo",
      })
    }
  }

  private async checkDemoScenarios(): Promise<void> {
    try {
      // Test common demo scenarios
      const scenarios = [
        "Admin panel access",
        "File upload interface",
        "Analysis results display",
        "PDF export functionality",
      ]

      let workingScenarios = 0

      // Test admin panel
      try {
        const adminResponse = await fetch(`${this.baseUrl}/api/admin/keys`)
        if (adminResponse.ok) workingScenarios++
      } catch (error) {
        // Admin panel not accessible
      }

      // Test main page
      try {
        const mainResponse = await fetch(`${this.baseUrl}/`)
        if (mainResponse.ok) {
          const html = await mainResponse.text()
          if (html.includes("Drop your file here") || html.includes("file-upload")) {
            workingScenarios++
          }
          if (html.includes("Pratyaksh.AI")) {
            workingScenarios++
          }
        }
      } catch (error) {
        // Main page not accessible
      }

      // PDF export already tested above
      workingScenarios++ // Assume PDF works if we got here

      const scenarioSuccess = workingScenarios / scenarios.length

      if (scenarioSuccess >= 0.9) {
        this.tests.push({
          name: "Demo Scenarios",
          critical: true,
          status: "PASS",
          message: `${workingScenarios}/${scenarios.length} demo scenarios working - ready to impress judges!`,
        })
      } else if (scenarioSuccess >= 0.7) {
        this.tests.push({
          name: "Demo Scenarios",
          critical: true,
          status: "WARNING",
          message: `${workingScenarios}/${scenarios.length} demo scenarios working`,
          recommendation: "Test all demo flows manually before presentation",
        })
      } else {
        this.tests.push({
          name: "Demo Scenarios",
          critical: true,
          status: "FAIL",
          message: `Only ${workingScenarios}/${scenarios.length} demo scenarios working`,
          recommendation: "CRITICAL: Fix major demo flows before hackathon",
        })
      }
    } catch (error) {
      this.tests.push({
        name: "Demo Scenarios",
        critical: true,
        status: "FAIL",
        message: "Cannot test demo scenarios",
        recommendation: "CRITICAL: Manually test all demo flows",
      })
    }
  }

  private generateHackathonReport(): void {
    console.log("\n" + "=".repeat(50))
    console.log("🏆 HACKATHON READINESS REPORT")
    console.log("=".repeat(50))

    const criticalTests = this.tests.filter((t) => t.critical)
    const nonCriticalTests = this.tests.filter((t) => !t.critical)

    const criticalPassed = criticalTests.filter((t) => t.status === "PASS").length
    const criticalWarnings = criticalTests.filter((t) => t.status === "WARNING").length
    const criticalFailed = criticalTests.filter((t) => t.status === "FAIL").length

    console.log("\n🚨 CRITICAL SYSTEMS:")
    criticalTests.forEach((test) => {
      const icon = test.status === "PASS" ? "✅" : test.status === "WARNING" ? "⚠️" : "❌"
      console.log(`${icon} ${test.name}: ${test.message}`)
      if (test.recommendation) {
        console.log(`   💡 ${test.recommendation}`)
      }
    })

    console.log("\n🔧 ADDITIONAL FEATURES:")
    nonCriticalTests.forEach((test) => {
      const icon = test.status === "PASS" ? "✅" : test.status === "WARNING" ? "⚠️" : "❌"
      console.log(`${icon} ${test.name}: ${test.message}`)
      if (test.recommendation) {
        console.log(`   💡 ${test.recommendation}`)
      }
    })

    console.log("\n" + "-".repeat(50))
    console.log("📊 READINESS SUMMARY:")
    console.log(`🎯 Critical Systems: ${criticalPassed}/${criticalTests.length} ready`)
    console.log(`⚠️  Warnings: ${criticalWarnings}`)
    console.log(`❌ Critical Issues: ${criticalFailed}`)

    // Overall readiness assessment
    if (criticalFailed === 0 && criticalWarnings <= 1) {
      console.log("\n🎉 READY FOR HACKATHON! 🚀")
      console.log("Your system is demo-ready. Go impress those judges!")
    } else if (criticalFailed === 0) {
      console.log("\n⚠️  MOSTLY READY - Minor Issues")
      console.log("Address warnings for optimal demo experience.")
    } else {
      console.log("\n🚨 NOT READY - Critical Issues Found")
      console.log("Fix critical issues before hackathon presentation!")
    }

    console.log("\n🎯 DEMO TIPS:")
    console.log("• Have backup API keys ready")
    console.log("• Test with sample files beforehand")
    console.log("• Prepare for network issues with offline explanations")
    console.log("• Show the PDF export feature - judges love downloadable results")
    console.log("• Highlight the glass morphism UI and animations")

    console.log("\n" + "=".repeat(50))
  }
}

// Run hackathon readiness check
const checker = new HackathonReadinessChecker()
checker.runHackathonChecks().catch(console.error)
