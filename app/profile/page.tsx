"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Camera, Award, TrendingUp, FileText, ImageIcon, Video, Calendar, Filter, Upload } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { subscribeToUserData, subscribeToUserAnalyses, AnalysisResult, updateUserData } from "@/lib/user-service"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    joinDate: "January 2024",
    photoURL: "",
  })
  const [userStats, setUserStats] = useState({
    karma: 0,
    totalAnalyses: 0,
    accuracyRate: 0,
    communityVotes: 0,
  })
  const [recentActivity, setRecentActivity] = useState<AnalysisResult[]>([])
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [badges, setBadges] = useState([
    {
      name: "Truth Seeker",
      description: "Verified 100+ pieces of content",
      icon: "🔍",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      borderColor: "border-blue-200 dark:border-blue-800",
      progress: 0,
      earned: false,
      target: 100,
      currentValue: 0
    },
    {
      name: "Community Helper",
      description: "Received 50+ helpful votes",
      icon: "🤝",
      color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      borderColor: "border-green-200 dark:border-green-800",
      progress: 0,
      earned: false,
      target: 50,
      currentValue: 0
    },
    {
      name: "Fact Checker",
      description: "Achieved 95%+ accuracy rate",
      icon: "✅",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      progress: 0,
      earned: false,
      target: 95,
      currentValue: 0
    },
    {
      name: "Karma Master",
      description: "Reached 1000+ karma points",
      icon: "⭐",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      borderColor: "border-purple-200 dark:border-purple-800",
      progress: 0,
      earned: false,
      target: 1000,
      currentValue: 0
    },
    {
      name: "Early Adopter",
      description: "Joined in the first month",
      icon: "🚀",
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      borderColor: "border-orange-200 dark:border-orange-800",
      progress: 100,
      earned: true,
      target: 1,
      currentValue: 1
    },
    {
      name: "Consistency Champion",
      description: "Analyzed content for 7 consecutive days",
      icon: "📅",
      color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      progress: 0,
      earned: false,
      target: 7,
      currentValue: 0
    }
  ])

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return

    // Listen to user data changes
    const userDataUnsubscribe = subscribeToUserData(user.uid, (userData) => {
      if (userData) {
        setProfileData({
          name: userData.displayName,
          email: userData.email || "",
          joinDate: new Date(userData.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }),
          photoURL: userData.photoURL || "",
        })
        setUserStats({
          karma: userData.karma,
          totalAnalyses: userData.totalAnalyses,
          accuracyRate: userData.accuracyRate,
          communityVotes: userData.communityVotes,
        })

        // Update badges with real-time data
        setBadges(prevBadges => prevBadges.map(badge => {
          let currentValue = 0
          let progress = 0
          let earned = false

          switch (badge.name) {
            case "Truth Seeker":
              currentValue = userData.totalAnalyses
              progress = Math.min((currentValue / badge.target) * 100, 100)
              earned = currentValue >= badge.target
              break
            case "Community Helper":
              currentValue = userData.communityVotes
              progress = Math.min((currentValue / badge.target) * 100, 100)
              earned = currentValue >= badge.target
              break
            case "Fact Checker":
              currentValue = userData.accuracyRate
              progress = Math.min(currentValue, 100)
              earned = currentValue >= badge.target
              break
            case "Karma Master":
              currentValue = userData.karma
              progress = Math.min((currentValue / badge.target) * 100, 100)
              earned = currentValue >= badge.target
              break
            case "Early Adopter":
              // Check if user joined in the first month (always earned for now)
              currentValue = 1
              progress = 100
              earned = true
              break
            case "Consistency Champion":
              // This would need additional tracking for consecutive days
              // For now, using a placeholder calculation
              currentValue = Math.min(userData.totalAnalyses, badge.target)
              progress = Math.min((currentValue / badge.target) * 100, 100)
              earned = currentValue >= badge.target
              break
            default:
              break
          }

          return {
            ...badge,
            currentValue,
            progress,
            earned
          }
        }))
      }
    })

    // Listen to user analyses changes
    const analysesUnsubscribe = subscribeToUserAnalyses(user.uid, 10, (analyses) => {
      setRecentActivity(analyses)
    })

    // Cleanup listeners
    return () => {
      userDataUnsubscribe()
      analysesUnsubscribe()
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    
    try {
      // Update user data in Firestore
      await updateUserData(user.uid, {
        displayName: profileData.name,
      })
      
      setIsEditing(false)
      toast({
        title: "Name Updated Successfully",
        description: `Your name has been updated to "${profileData.name}"`,
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your name. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Convert file to base64 for storage
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64String = e.target?.result as string
        
        // Update user data with new photo URL
        await updateUserData(user.uid, {
          photoURL: base64String,
        })

        // Update local state
        setProfileData(prev => ({
          ...prev,
          photoURL: base64String,
        }))

        setIsUploading(false)
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully",
        })
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      setIsUploading(false)
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Manage your profile and view your achievements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4">
                  <Image
                    src={profileData.photoURL || user?.photoURL || "/placeholder.svg?height=96&width=96&text=Profile"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full border-4 border-white dark:border-slate-700 shadow-lg"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <CardTitle className="text-lg sm:text-xl dark:text-white">{profileData.name}</CardTitle>
                <CardDescription className="dark:text-gray-300 text-sm sm:text-base">{profileData.email}</CardDescription>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Member since {profileData.joinDate}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled={true}
                        className="text-sm sm:text-base bg-gray-100 dark:bg-slate-800 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email address cannot be changed
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} className="flex-1 text-sm sm:text-base">
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 text-sm sm:text-base">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="w-full text-sm sm:text-base">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-4 sm:mt-6">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg dark:text-white">Your Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span className="text-xs sm:text-sm dark:text-gray-300">Karma Score</span>
                  </div>
                  <span className="font-bold text-base sm:text-lg dark:text-white">{userStats.karma}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    <span className="text-xs sm:text-sm dark:text-gray-300">Total Analyses</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base dark:text-white">{userStats.totalAnalyses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="text-xs sm:text-sm dark:text-gray-300">Accuracy Rate</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base dark:text-white">{userStats.accuracyRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                    <span className="text-xs sm:text-sm dark:text-gray-300">Community Votes</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base dark:text-white">{userStats.communityVotes}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="badges" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="badges" className="text-xs sm:text-sm">Badges & Achievements</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="badges">
                <div className="space-y-6">
                  {/* Badges Overview */}
                  <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="dark:text-white flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                            Badges & Achievements
                          </CardTitle>
                          <CardDescription className="dark:text-gray-300 text-sm sm:text-base">
                            Track your progress and unlock achievements through your contributions
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                            {badges.filter(b => b.earned).length}/{badges.length}
                          </div>
                          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Badges Earned</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {badges.filter(b => b.progress > 0 && !b.earned).length} in progress
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {badges.map((badge, index) => (
                      <Card 
                        key={index} 
                        className={`dark:bg-slate-900 dark:border-slate-800 transition-all duration-200 hover:shadow-lg ${
                          badge.earned 
                            ? 'ring-2 ring-yellow-400/20 dark:ring-yellow-400/30' 
                            : 'opacity-75'
                        }`}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start space-x-4">
                            {/* Badge Icon */}
                            <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl ${
                              badge.earned 
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
                                : 'bg-gray-200 dark:bg-slate-700'
                            }`}>
                              {badge.icon}
                            </div>
                            
                            {/* Badge Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className={`font-bold text-base sm:text-lg lg:text-xl ${
                                  badge.earned 
                                    ? 'dark:text-white' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {badge.name}
                                </h3>
                                <Badge 
                                  className={`text-xs sm:text-sm font-medium px-2 py-1 ${
                                    badge.earned 
                                      ? badge.color 
                                      : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
                                  }`}
                                >
                                  {badge.earned ? 'Earned' : 'In Progress'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                                {badge.description}
                              </p>
                              
                              {/* Progress Bar */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                    {Math.round(badge.progress)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                                  <div 
                                    className={`h-3 rounded-full transition-all duration-300 ${
                                      badge.earned 
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                                        : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${badge.progress}%` }}
                                  ></div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>{badge.currentValue} / {badge.target}</span>
                                  <span>{badge.earned ? '✅ Earned' : 'In Progress'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Achievement Stats */}
                  <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="dark:text-white text-lg sm:text-xl lg:text-2xl">Achievement Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400">
                            {userStats.totalAnalyses}
                          </div>
                          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">Total Analyses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 dark:text-green-400">
                            {userStats.communityVotes}
                          </div>
                          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">Community Votes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                            {userStats.accuracyRate}%
                          </div>
                          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">Accuracy Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 dark:text-purple-400">
                            {userStats.karma}
                          </div>
                          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">Karma Points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="dark:text-white">Recent Activity</CardTitle>
                        <CardDescription className="dark:text-gray-300">Your latest content verifications and community interactions</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              {activity.type === "text" && <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />}
                              {activity.type === "image" && <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />}
                              {activity.type === "video" && <Video className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{activity.content}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                <Badge
                                  variant={activity.verdict === "REAL" ? "default" : "destructive"}
                                  className="text-xs w-fit"
                                >
                                  {activity.verdict}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Score: {activity.credibilityScore}%</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {activity.communityVotes.up + activity.communityVotes.down} community votes
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">{new Date(activity.createdAt).toLocaleDateString()}</span>
                            <span className="sm:hidden">{new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
