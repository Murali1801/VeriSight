"use client"

import { useState, useEffect } from "react"
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
  X,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { 
  saveAnalysis, 
  subscribeToUserAnalyses, 
  AnalysisResult as FirebaseAnalysisResult, 
  saveUserVote, 
  getUserVote,
  subscribeToUserData,
  UserData,
  subscribeToRecentAnalyses
} from "@/lib/user-service";
import { analyzeContent } from "@/lib/deepfake-api-service";

// Web Speech API TypeScript declarations
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface AnalysisResult {
  id?: string;
  verdict: "Fake" | "Real";
  confidence_score: number;
  analysis_summary: string;
  credibility_proof: {
    claim_verified: string;
    matched_fact: string;
    source_proof_url: string;
  }[];
  evidence: {
    reputation_score: number;
    similarity_score: number;
    source_title: string;
    source_url: string;
    summary: string;
  }[];
  communityVotes?: {
    up: number;
    down: number;
  };
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("text")
  const [textContent, setTextContent] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [pastAnalyses, setPastAnalyses] = useState<FirebaseAnalysisResult[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<FirebaseAnalysisResult[]>([])
  const [todayAnalyses, setTodayAnalyses] = useState(0)
  const [communityVotes, setCommunityVotes] = useState(0)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [transcript, setTranscript] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (fileType === 'image') {
          setImageFile(file)
          setImagePreview(reader.result as string)
        } else {
          setVideoFile(file)
          setVideoPreview(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to analyze content",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      let content: string | File = textContent;
      if (activeTab === 'image' && imageFile) {
        content = imageFile;
      } else if (activeTab === 'video' && videoFile) {
        content = videoFile;
      }

      const result = await analyzeContent(
        activeTab as "text" | "image" | "video",
        content
      );

      // Save to Firebase
      const analysisId = await saveAnalysis({
        userId: user.uid,
        type: activeTab as "text" | "image" | "video",
        content: textContent || "Uploaded content",
        verdict: result.verdict as "REAL" | "FAKE",
        credibilityScore: result.confidence_score,
        summary: result.analysis_summary,
        sources: result.evidence.map(e => e.source_url),
        breakdown: {
          textAnalysis: result.confidence_score,
          imageAnalysis: 0,
          sourceVerification: 0,
          communityFeedback: 0,
        },
      })

      // Update result with ID and initial votes
      setAnalysisResult({
        id: analysisId,
        ...result,
        communityVotes: { up: 0, down: 0 }
      })

      toast({
        title: "Analysis Complete",
        description: "Your analysis has been saved successfully",
      })

      // Clear the form
      setTextContent("")
      setImageFile(null)
      setVideoFile(null)
      setImagePreview(null)
      setVideoPreview(null)

      // Real-time updates will automatically refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save analysis",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleVote = async (analysisId: string, vote: "up" | "down") => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      })
      return
    }

    try {
      await saveUserVote({
        userId: user.uid,
        analysisId,
        vote,
      })

      // Update local state immediately for better UX
      setUserVote(vote)
      
      toast({
        title: "Vote recorded",
        description: "Your vote has been saved",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save vote",
        variant: "destructive",
      })
    }
  }

  // Get user's vote for current analysis and listen for real-time updates
  useEffect(() => {
    if (!user || !analysisResult?.id) {
      setUserVote(null)
      return
    }

    const getUserVoteForAnalysis = async () => {
      try {
        const vote = await getUserVote(user.uid, analysisResult.id!)
        setUserVote(vote?.vote || null)
      } catch (error) {
        console.error("Error getting user vote:", error)
        setUserVote(null)
      }
    }

    getUserVoteForAnalysis()

    // Set up real-time listener for the current analysis
    const unsubscribe = subscribeToUserAnalyses(user.uid, 10, (analyses) => {
      const currentAnalysis = analyses.find(a => a.id === analysisResult.id)
      if (currentAnalysis) {
        setAnalysisResult(prev => prev ? {
          ...prev,
          communityVotes: currentAnalysis.communityVotes
        } : null)
      }
    })

    return () => unsubscribe()
  }, [user, analysisResult?.id])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onstart = () => {
        setIsRecording(true)
        toast({
          title: "Voice Recognition Started",
          description: "Start speaking now...",
        })
      }
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        const fullTranscript = finalTranscript + interimTranscript
        setTranscript(fullTranscript)
        setTextContent(fullTranscript)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        toast({
          title: "Voice Recognition Error",
          description: event.error === 'no-speech' 
            ? "No speech detected. Please try again." 
            : "Voice recognition failed. Please try again.",
          variant: "destructive",
        })
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
        if (transcript.trim()) {
          toast({
            title: "Voice Recognition Complete",
            description: "Your speech has been transcribed.",
          })
        }
      }
      
      setRecognition(recognitionInstance)
    } else {
      console.warn('Speech recognition not supported in this browser')
    }
  }, [toast])

  const handleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    if (isRecording) {
      // Stop recording
      recognition.stop()
    } else {
      // Start recording
      setTranscript("")
      setTextContent("")
      recognition.start()
    }
  }

  useEffect(() => {
    if (!user) return

    // Set up real-time listeners
    const unsubscribers: (() => void)[] = []

    // User data listener
    const userDataUnsubscribe = subscribeToUserData(user.uid, (data) => {
      setUserData(data)
    })
    unsubscribers.push(userDataUnsubscribe)

    // User analyses listener
    const analysesUnsubscribe = subscribeToUserAnalyses(user.uid, 5, (analyses) => {
      setPastAnalyses(analyses)
      
      // Calculate today's analyses
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayCount = analyses.filter(analysis => 
        new Date(analysis.createdAt) >= today
      ).length
      setTodayAnalyses(todayCount)
    })
    unsubscribers.push(analysesUnsubscribe)

    // Recent analyses listener (for community insights)
    const recentAnalysesUnsubscribe = subscribeToRecentAnalyses(20, (analyses) => {
      setRecentAnalyses(analyses)
      
      // Calculate user's community votes
      const userVotes = analyses.reduce((total, analysis) => {
        return total + (analysis.communityVotes?.up || 0) + (analysis.communityVotes?.down || 0)
      }, 0)
      setCommunityVotes(userVotes)
    })
    unsubscribers.push(recentAnalysesUnsubscribe)

    // Cleanup all listeners on unmount or user change
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [user])

  // Simple authentication check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Please sign in to access the dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {userData?.displayName || user?.displayName || "User"}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">Ready to detect some fake content today?</p>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold dark:text-white text-sm sm:text-base">
                    {userData?.karma || 0}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Karma</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-black text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
                {userData?.badges?.[0] || "Truth Seeker"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Analysis Section */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-black dark:border-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Content Analysis</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Upload or paste content to verify its authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 dark:bg-black">
                    <TabsTrigger
                      value="text"
                      className="flex items-center space-x-1 sm:space-x-2 dark:data-[state=active]:bg-slate-700 text-xs sm:text-sm"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Text/URL</span>
                      <span className="sm:hidden">Text</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="flex items-center space-x-1 sm:space-x-2 dark:data-[state=active]:bg-slate-700 text-xs sm:text-sm"
                    >
                      <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Image</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="video"
                      className="flex items-center space-x-1 sm:space-x-2 dark:data-[state=active]:bg-slate-700 text-xs sm:text-sm"
                    >
                      <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Video</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-content" className="dark:text-gray-200 text-sm sm:text-base">
                        Text Content or URL
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="text-content"
                          placeholder="Paste text content or URL here..."
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          className="min-h-[100px] sm:min-h-[120px] pr-12 dark:bg-black dark:border-slate-700 dark:text-white text-sm sm:text-base"
                        />
                        <div className="absolute right-2 top-2 flex items-center space-x-1">
                          {transcript && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 dark:text-gray-400 hover:text-red-500"
                              onClick={() => {
                                setTranscript("")
                                setTextContent("")
                              }}
                              title="Clear transcript"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`${isRecording ? "text-red-500 animate-pulse" : "text-gray-500 dark:text-gray-400"} hover:text-blue-500`}
                            onClick={handleVoiceInput}
                            title={isRecording ? "Stop recording" : "Start voice input"}
                          >
                            {isRecording ? <MicOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Mic className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </Button>
                        </div>
                      </div>
                      {isRecording && (
                        <div className="space-y-2">
                          <div className="text-xs sm:text-sm text-red-500 flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                            Recording... Speak now
                          </div>
                          {transcript && (
                            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                              Live transcript: "{transcript.length > 50 ? transcript.substring(0, 50) + '...' : transcript}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 sm:p-8 text-center hover:border-gray-400 dark:hover:border-slate-600 transition-colors">
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="hidden" id="image-upload" />
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Image preview" className="rounded-lg w-full h-auto" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-red-500"
                            onClick={() => {
                              setImageFile(null)
                              setImagePreview(null)
                            }}
                            title="Clear image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
                          <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Drop your image here</p>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">or click to browse</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 bg-transparent"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Choose Image
                          </Button>
                        </label>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 sm:p-8 text-center hover:border-gray-400 dark:hover:border-slate-600 transition-colors">
                      <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="hidden" id="video-upload" />
                      {videoPreview ? (
                        <div className="relative">
                          <video src={videoPreview} controls className="rounded-lg w-full h-auto" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-red-500"
                            onClick={() => {
                              setVideoFile(null)
                              setVideoPreview(null)
                            }}
                            title="Clear video"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="video-upload" className="cursor-pointer">
                          <Video className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
                          <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Drop your video here</p>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">or click to browse</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 bg-transparent"
                            onClick={() => document.getElementById('video-upload')?.click()}
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Choose Video
                          </Button>
                        </label>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleAnalyze}
                  className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 text-sm sm:text-base"
                  disabled={isAnalyzing || (!textContent && activeTab === "text")}
                >
                  {isAnalyzing ? "Analyzing Content..." : "Analyze Content"}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card className="mt-4 sm:mt-6 dark:bg-slate-900 dark:border-slate-800">
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
                      <Label className="dark:text-gray-200">Confidence Score</Label>
                      <span className="text-2xl font-bold dark:text-white">{analysisResult.confidence_score}/100</span>
                    </div>
                    <Progress value={analysisResult.confidence_score} className="h-3" />
                  </div>

                  {/* Summary */}
                  <div>
                    <Label className="text-base font-semibold dark:text-gray-200">AI Analysis Summary</Label>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{analysisResult.analysis_summary}</p>
                  </div>

                  {/* Credibility Proof */}
                  <div>
                    <Label className="text-base font-semibold dark:text-gray-200">Credibility Proof</Label>
                    <div className="mt-2 space-y-4">
                      {analysisResult.credibility_proof.map((proof, index) => (
                        <div key={index} className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Claim Verified: <span className="font-normal">{proof.claim_verified}</span></p>
                          <p className="mt-2 text-gray-700 dark:text-gray-300">Matched Fact: <span className="font-normal">{proof.matched_fact}</span></p>
                          <a href={proof.source_proof_url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            Source Proof
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence */}
                  <div>
                    <Label className="text-base font-semibold dark:text-gray-200">Evidence</Label>
                    <div className="mt-2 space-y-4">
                      {analysisResult.evidence.map((evidence, index) => (
                        <div key={index} className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                          <a href={evidence.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            {evidence.source_title}
                          </a>
                          <p className="mt-2 text-gray-700 dark:text-gray-300">{evidence.summary}</p>
                          <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Reputation: {evidence.reputation_score}/100</span>
                            <span>Similarity: {evidence.similarity_score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Community Voting */}
                  <div className="border-t dark:border-slate-700 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <Label className="text-base font-semibold dark:text-gray-200">Was this result accurate?</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {analysisResult.communityVotes && analysisResult.communityVotes.up + analysisResult.communityVotes.down > 0 
                            ? `${analysisResult.communityVotes.up} of ${analysisResult.communityVotes.up + analysisResult.communityVotes.down} users agree`
                            : "Be the first to vote!"
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => analysisResult.id && handleVote(analysisResult.id, "up")}
                          className="dark:border-slate-700"
                          disabled={!analysisResult.id}
                        >
                          <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm">{analysisResult.communityVotes?.up || 0}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => analysisResult.id && handleVote(analysisResult.id, "down")}
                          className="dark:border-slate-700"
                          disabled={!analysisResult.id}
                        >
                          <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm">{analysisResult.communityVotes?.down || 0}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="dark:border-slate-700 bg-transparent">
                          <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <Card className="dark:bg-black dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="text-xs sm:text-sm dark:text-gray-300">Analyses Today</span>
                  </div>
                  <span className="font-semibold dark:text-white text-sm sm:text-base">{todayAnalyses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    <span className="text-xs sm:text-sm dark:text-gray-300">Community Votes</span>
                  </div>
                  <span className="font-semibold dark:text-white text-sm sm:text-base">{communityVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span className="text-xs sm:text-sm dark:text-gray-300">Accuracy Rate</span>
                  </div>
                  <span className="font-semibold dark:text-white text-sm sm:text-base">{userData?.accuracyRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card className="dark:bg-black dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Recent Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {pastAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-black rounded-lg"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        {analysis.type === "text" && <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
                        {analysis.type === "image" && (
                          <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        )}
                        {analysis.type === "video" && <Video className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate dark:text-white">
                            {analysis.content}
                          </p>
                          <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                            <Badge
                              variant={analysis.verdict === "REAL" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {analysis.verdict}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{analysis.credibilityScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0 ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                        <span className="sm:hidden">{new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
