import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import DynamicBackground from "@/components/dynamic-background"

export const metadata: Metadata = {
  title: "Pratyaksh.AI - Advanced Deepfake Detection",
  description:
    "Analyze media authenticity with confidence. Upload images, videos, or audio files to detect digital manipulation and deepfakes.",
  generator: "v0.app",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#009688",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="antialiased">
        <DynamicBackground />
        {children}
      </body>
    </html>
  )
}
