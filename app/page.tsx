"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Upload, Brain, Users, CheckCircle, FileText, Video, ImageIcon, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-black dark:to-black">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50 border-gray-200/20 dark:border-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">VeriSight</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-sm px-4">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="sm:hidden flex items-center space-x-2" ref={menuRef}>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="p-2 h-auto w-auto"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-gray-900 dark:text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-900 dark:text-white" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Popup */}
          {isMenuOpen && (
            <div className="sm:hidden absolute top-16 right-2 w-28 bg-white dark:bg-black border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-40" ref={menuRef}>
              <div className="p-1 space-y-1">
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 text-sm h-8 px-2"
                  >
                    Sign Up
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:from-blue-700 hover:to-purple-700 text-sm h-8 px-2"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              AI Fake News &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                {" "}
                Deepfake Detection
              </span>{" "}
              System
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Verify Text, Images, and Videos Instantly with AI
            </p>
          </div>

          <div className="flex justify-center mb-12 sm:mb-16 px-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Feature Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4">
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-slate-700/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 dark:text-white">Text Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Advanced NLP algorithms detect patterns in fake news articles and misleading claims.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-slate-700/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 dark:text-white">Image Verification</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Detect manipulated images, deepfakes, and AI-generated content with precision.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-slate-700/30 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 dark:text-white">Video Detection</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Identify deepfake videos and manipulated media using cutting-edge AI technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Our advanced AI system analyzes content across multiple dimensions to provide accurate detection results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow dark:bg-black dark:border-slate-700">
              <CardContent className="pt-4 sm:pt-6">
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-xl font-semibold mb-2 dark:text-white">Upload Any Content</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Support for text, images, videos, and URLs with drag & drop interface
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow dark:bg-black dark:border-slate-700">
              <CardContent className="pt-4 sm:pt-6">
                <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600 dark:text-purple-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-xl font-semibold mb-2 dark:text-white">AI-Powered Detection</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Advanced machine learning algorithms analyze content patterns and authenticity
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow dark:bg-black dark:border-slate-700">
              <CardContent className="pt-4 sm:pt-6">
                <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 dark:text-green-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-xl font-semibold mb-2 dark:text-white">Evidence-Based Verdict</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Get detailed explanations and credibility scores with supporting evidence
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow dark:bg-black dark:border-slate-700">
              <CardContent className="pt-4 sm:pt-6">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-orange-600 dark:text-orange-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-xl font-semibold mb-2 dark:text-white">Community Trust Layer</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Community verification and feedback system for enhanced accuracy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Trusted by Millions</h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
              Join a community of truth-seekers fighting misinformation worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">99.2%</div>
              <div className="text-base sm:text-xl opacity-90">Detection Accuracy</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">1M+</div>
              <div className="text-base sm:text-xl opacity-90">Content Analyzed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
              <div className="text-base sm:text-xl opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">24/7</div>
              <div className="text-base sm:text-xl opacity-90">Real-time Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our cutting-edge machine learning models analyze content across multiple dimensions to provide accurate and reliable results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow dark:bg-black dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">Deep Learning Models</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  State-of-the-art neural networks trained on millions of verified and fake content samples
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow dark:bg-black dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">Multi-Modal Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive analysis of text, images, and videos using advanced computer vision and NLP
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow dark:bg-black dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">Community Verification</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Human-in-the-loop verification system that combines AI insights with community expertise
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 sm:py-20 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Who Uses VeriSight?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From journalists to educators, everyone can benefit from our AI-powered verification tools
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Journalists</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verify sources and fact-check information before publishing
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Educators</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Teach students critical thinking and media literacy skills
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Researchers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validate data sources and ensure research integrity
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">General Public</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Make informed decisions and avoid falling for misinformation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-black dark:to-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Ready to Fight Misinformation?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
            Join thousands of users who trust our AI to verify content authenticity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600"
            >
              Start Detecting Now
            </Button>
          </Link>
            <Link href="/signin" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-base sm:text-lg font-semibold">VeriSight</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base text-center sm:text-left">Fighting misinformation with AI technology</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
