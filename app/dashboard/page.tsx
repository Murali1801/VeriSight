"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  ImageIcon,
  Video,
  Mic,
  MicOff,
  ThumbsUp,
  ThumbsDown,
  Flag,
  TrendingUp,
  Users,
  Award,
  Clock,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

interface AnalysisResult {
  verdict: "FAKE" | "REAL"
  credibilityScore: number
  summary: string
  sources: string[]
  breakdown: {
    textAnalysis: number
    imageAnalysis: number
    sourceVerification: number
    communityFeedback: number
  }
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("text")
  const [textContent, setTextContent] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)

    // Simulate analysis
    setTimeout(() => {
      setAnalysisResult({
        verdict: Math.random() > 0.5 ? "REAL" : "FAKE",
        credibilityScore: Math.floor(Math.random() * 100),
        summary:
          "Based on our comprehensive analysis, this content shows several indicators of manipulation. The text patterns suggest automated generation, and cross-referencing with verified sources reveals inconsistencies in the claims made.",
        sources: ["Reuters Fact Check Database", "Associated Press Verification", "Snopes.com", "PolitiFact"],
        breakdown: {
          textAnalysis: 75,
          imageAnalysis: 60,
          sourceVerification: 85,
          communityFeedback: 70,
        },
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    // Implement Web Speech API here
    if (!isRecording) {
      // Start recording
      setTextContent("This is a sample transcript from voice input...")
    }
  }

  const pastAnalyses = [
    {
      id: 1,
      type: "text",
      content: "Breaking: Major political announcement...",
      verdict: "FAKE",
      score: 25,
      date: "2 hours ago",
    },
    { id: 2, type: "image", content: "viral_image_2024.jpg", verdict: "REAL", score: 89, date: "1 day ago" },
    { id: 3, type: "video", content: "celebrity_deepfake.mp4", verdict: "FAKE", score: 15, date: "3 days ago" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Welcome back, John!</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Ready to detect some fake content today?</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold dark:text-white">1,247</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Karma</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-blue-300">
                Truth Seeker
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Analysis Section */}
          <div className="xl:col-span-2">
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Content Analysis</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Upload or paste content to verify its authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 dark:bg-slate-800">
                    <TabsTrigger
                      value="text"
                      className="flex items-center space-x-2 dark:data-[state=active]:bg-slate-700"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Text/URL</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="flex items-center space-x-2 dark:data-[state=active]:bg-slate-700"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>Image</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="video"
                      className="flex items-center space-x-2 dark:data-[state=active]:bg-slate-700"
                    >
                      <Video className="h-4 w-4" />
                      <span>Video</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-content" className="dark:text-gray-200">
                        Text Content or URL
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="text-content"
                          placeholder="Paste text content or URL here..."
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          className="min-h-[120px] pr-12 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`absolute right-2 top-2 ${isRecording ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                          onClick={handleVoiceInput}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      </div>
                      {isRecording && (
                        <p className="text-sm text-red-500 flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                          Recording... Speak now
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-slate-600 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drop your image here</p>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
                      <Button
                        variant="outline"
                        className="dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 bg-transparent"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-slate-600 transition-colors">
                      <Video className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drop your video here</p>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
                      <Button
                        variant="outline"
                        className="dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 bg-transparent"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Video
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleAnalyze}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600"
                  disabled={isAnalyzing || (!textContent && activeTab === "text")}
                >
                  {isAnalyzing ? "Analyzing Content..." : "Analyze Content"}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card className="mt-6 dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="dark:text-white">Analysis Results</CardTitle>
                    <Badge
                      variant={analysisResult.verdict === "REAL" ? "default" : "destructive"}
                      className="text-lg px-3 py-1"
                    >
                      {analysisResult.verdict}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Credibility Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="dark:text-gray-200">Credibility Score</Label>
                      <span className="text-2xl font-bold dark:text-white">{analysisResult.credibilityScore}/100</span>
                    </div>
                    <Progress value={analysisResult.credibilityScore} className="h-3" />
                  </div>

                  {/* Summary */}
                  <div>
                    <Label className="text-base font-semibold dark:text-gray-200">AI Analysis Summary</Label>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{analysisResult.summary}</p>
                  </div>

                  {/* Breakdown Chart */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block dark:text-gray-200">Analysis Breakdown</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                          <span>Text Analysis</span>
                          <span>{analysisResult.breakdown.textAnalysis}%</span>
                        </div>
                        <Progress value={analysisResult.breakdown.textAnalysis} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                          <span>Image Analysis</span>
                          <span>{analysisResult.breakdown.imageAnalysis}%</span>
                        </div>
                        <Progress value={analysisResult.breakdown.imageAnalysis} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                          <span>Source Verification</span>
                          <span>{analysisResult.breakdown.sourceVerification}%</span>
                        </div>
                        <Progress value={analysisResult.breakdown.sourceVerification} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                          <span>Community Feedback</span>
                          <span>{analysisResult.breakdown.communityFeedback}%</span>
                        </div>
                        <Progress value={analysisResult.breakdown.communityFeedback} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Sources */}
                  <div>
                    <Label className="text-base font-semibold dark:text-gray-200">Matching Sources</Label>
                    <div className="mt-2 space-y-2">
                      {analysisResult.sources.map((source, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            {source}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Community Voting */}
                  <div className="border-t dark:border-slate-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold dark:text-gray-200">Was this result accurate?</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">12 of 15 users agree</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={userVote === "up" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUserVote(userVote === "up" ? null : "up")}
                          className="dark:border-slate-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          12
                        </Button>
                        <Button
                          variant={userVote === "down" ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => setUserVote(userVote === "down" ? null : "down")}
                          className="dark:border-slate-700"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />3
                        </Button>
                        <Button variant="outline" size="sm" className="dark:border-slate-700 bg-transparent">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm dark:text-gray-300">Analyses Today</span>
                  </div>
                  <span className="font-semibold dark:text-white">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm dark:text-gray-300">Community Votes</span>
                  </div>
                  <span className="font-semibold dark:text-white">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm dark:text-gray-300">Accuracy Rate</span>
                  </div>
                  <span className="font-semibold dark:text-white">94%</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Recent Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {analysis.type === "text" && <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        {analysis.type === "image" && (
                          <ImageIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                        {analysis.type === "video" && <Video className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium truncate max-w-[120px] dark:text-white">
                            {analysis.content}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={analysis.verdict === "REAL" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {analysis.verdict}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{analysis.score}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {analysis.date}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
