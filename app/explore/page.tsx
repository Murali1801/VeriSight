"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  FileText,
  ImageIcon,
  Video,
  TrendingUp,
  Clock,
  User,
  Filter,
  Eye,
  MessageCircle,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { 
  getRecentAnalyses, 
  saveUserVote, 
  getUserVote,
  AnalysisResult as FirebaseAnalysisResult 
} from "@/lib/user-service"

interface AnalysisWithUser extends FirebaseAnalysisResult {
  userDisplayName?: string
  userPhotoURL?: string
}

export default function ExplorePage() {
  const [analyses, setAnalyses] = useState<AnalysisWithUser[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({})
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch recent analyses from all users
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const recentAnalyses = await getRecentAnalyses(50) // Get more analyses for explore
        setAnalyses(recentAnalyses)
        setFilteredAnalyses(recentAnalyses)
      } catch (error) {
        console.error("Error fetching analyses:", error)
        toast({
          title: "Error",
          description: "Failed to load community analyses",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [toast])

  // Filter and sort analyses
  useEffect(() => {
    let filtered = [...analyses]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(analysis => 
        analysis.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(analysis => analysis.type === filterType)
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "votes":
        filtered.sort((a, b) => {
          const aVotes = (a.communityVotes?.up || 0) + (a.communityVotes?.down || 0)
          const bVotes = (b.communityVotes?.up || 0) + (b.communityVotes?.down || 0)
          return bVotes - aVotes
        })
        break
      case "credibility":
        filtered.sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0))
        break
    }

    setFilteredAnalyses(filtered)
  }, [analyses, searchQuery, filterType, sortBy])

  // Handle voting
  const handleVote = async (analysisId: string, vote: "up" | "down") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on analyses",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if user already voted
      const existingVote = await getUserVote(user.uid, analysisId)
      
      if (existingVote === vote) {
        // Remove vote if clicking same button
        await saveUserVote(user.uid, analysisId, null)
        setUserVotes(prev => ({ ...prev, [analysisId]: null }))
        
        // Update local analysis data
        setAnalyses(prev => prev.map(analysis => {
          if (analysis.id === analysisId) {
            const currentVotes = analysis.communityVotes || { up: 0, down: 0 }
            return {
              ...analysis,
              communityVotes: {
                up: vote === "up" ? Math.max(0, currentVotes.up - 1) : currentVotes.up,
                down: vote === "down" ? Math.max(0, currentVotes.down - 1) : currentVotes.down,
              }
            }
          }
          return analysis
        }))
      } else {
        // Add or change vote
        await saveUserVote(user.uid, analysisId, vote)
        setUserVotes(prev => ({ ...prev, [analysisId]: vote }))
        
        // Update local analysis data
        setAnalyses(prev => prev.map(analysis => {
          if (analysis.id === analysisId) {
            const currentVotes = analysis.communityVotes || { up: 0, down: 0 }
            const existingVote = userVotes[analysisId]
            
            return {
              ...analysis,
              communityVotes: {
                up: currentVotes.up + (vote === "up" ? 1 : 0) - (existingVote === "up" ? 1 : 0),
                down: currentVotes.down + (vote === "down" ? 1 : 0) - (existingVote === "down" ? 1 : 0),
              }
            }
          }
          return analysis
        }))
      }

      toast({
        title: "Vote Recorded",
        description: "Your vote has been recorded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to record your vote",
        variant: "destructive",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />
      case "image": return <ImageIcon className="h-4 w-4" />
      case "video": return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getVerdictColor = (verdict: string) => {
    return verdict === "REAL" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Community
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Discover and vote on content verifications from the community
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6 dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search analyses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="credibility">Highest Credibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analyses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredAnalyses.map((analysis) => (
            <Card key={analysis.id} className="dark:bg-slate-900 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      {analysis.userPhotoURL ? (
                        <img 
                          src={analysis.userPhotoURL} 
                          alt="User" 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm dark:text-white">
                        {analysis.userDisplayName || "Anonymous User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(analysis.type)}
                    <Badge className={getVerdictColor(analysis.verdict)}>
                      {analysis.verdict}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Content Preview */}
                <div>
                  <p className="text-sm dark:text-gray-300 line-clamp-3">
                    {analysis.content.length > 200 
                      ? `${analysis.content.substring(0, 200)}...` 
                      : analysis.content
                    }
                  </p>
                </div>

                {/* Analysis Summary */}
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs dark:text-gray-400 mb-2">Analysis Summary</p>
                  <p className="text-sm dark:text-gray-300 line-clamp-2">
                    {analysis.summary}
                  </p>
                </div>

                {/* Credibility Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium dark:text-white">
                      Credibility: {analysis.credibilityScore}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Eye className="h-3 w-3" />
                    <span>{analysis.communityVotes?.up + analysis.communityVotes?.down || 0} votes</span>
                  </div>
                </div>

                {/* Voting Section */}
                <div className="flex items-center justify-between pt-2 border-t dark:border-slate-700">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(analysis.id!, "up")}
                      className={`flex items-center space-x-1 ${
                        userVotes[analysis.id!] === "up" 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{analysis.communityVotes?.up || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(analysis.id!, "down")}
                      className={`flex items-center space-x-1 ${
                        userVotes[analysis.id!] === "down" 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{analysis.communityVotes?.down || 0}</span>
                    </Button>
                  </div>
                  
                  <Button variant="outline" size="sm" className="text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnalyses.length === 0 && (
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No analyses found</h3>
                <p className="text-sm">
                  {searchQuery || filterType !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Be the first to analyze some content!"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 