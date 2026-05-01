"use client"

import { useEffect, useRef } from "react"

export default function DynamicBackground() {
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const createParticles = () => {
      if (!particlesRef.current) return

      // Clear existing particles
      particlesRef.current.innerHTML = ""

      // Create 30 particles
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div")
        particle.className = "particle animate-particle-float"

        // Random positioning and timing
        particle.style.left = Math.random() * 100 + "%"
        particle.style.animationDelay = Math.random() * 20 + "s"
        particle.style.animationDuration = 15 + Math.random() * 10 + "s"

        // Random size variation
        const size = 2 + Math.random() * 3
        particle.style.width = size + "px"
        particle.style.height = size + "px"

        particlesRef.current.appendChild(particle)
      }
    }

    createParticles()

    // Recreate particles periodically for variety
    const interval = setInterval(createParticles, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Wave Background Layers */}
      <div className="wave-bg">
        <div className="wave-layer animate-wave animate-morph"></div>
        <div className="wave-layer animate-wave-reverse animate-morph"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        {/* Large morphing shape */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full animate-float animate-glow blur-3xl"></div>

        {/* Medium floating shapes */}
        <div
          className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-br from-secondary/8 to-accent/8 animate-float animate-glow blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>

        <div
          className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-accent/6 to-primary/6 animate-float blur-xl"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Small accent shapes */}
        <div className="absolute top-1/6 right-1/6 w-32 h-32 bg-gradient-to-br from-primary/12 to-secondary/12 rounded-full animate-pulse-slow blur-lg"></div>

        <div
          className="absolute bottom-1/4 left-1/6 w-40 h-40 bg-gradient-to-br from-secondary/10 to-accent/10 animate-float blur-lg"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Particle System */}
      <div ref={particlesRef} className="particles"></div>

      {/* Subtle Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(5, 150, 105, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(5, 150, 105, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>
    </>
  )
}
