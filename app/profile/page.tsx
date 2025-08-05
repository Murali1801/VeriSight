"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Camera, Award, TrendingUp, FileText, ImageIcon, Video, Calendar, Filter } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Image from "next/image"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    joinDate: "January 2024",
  })

  const userStats = {
    karma: 1247,
    totalAnalyses: 156,
    accuracyRate: 94,
    communityVotes: 89,
  }

  const badges = [
    { name: "Truth Seeker", description: "Verified 100+ pieces of content", color: "bg-blue-100 text-blue-800" },
    { name: "Community Helper", description: "Received 50+ helpful votes", color: "bg-green-100 text-green-800" },
    { name: "Early Adopter", description: "Joined in the first month", color: "bg-purple-100 text-purple-800" },
    { name: "Fact Checker", description: "95%+ accuracy rate", color: "bg-yellow-100 text-yellow-800" },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "text",
      content: "Political claim about economic data",
      verdict: "FAKE",
      score: 25,
      date: "2024-01-15",
      votes: 12,
    },
    {
      id: 2,
      type: "image",
      content: "Viral social media image",
      verdict: "REAL",
      score: 89,
      date: "2024-01-14",
      votes: 8,
    },
    {
      id: 3,
      type: "video",
      content: "Celebrity deepfake video",
      verdict: "FAKE",
      score: 15,
      date: "2024-01-13",
      votes: 15,
    },
    { id: 4, type: "text", content: "Breaking news article", verdict: "REAL", score: 92, date: "2024-01-12", votes: 6 },
    {
      id: 5,
      type: "image",
      content: "Historical photo claim",
      verdict: "FAKE",
      score: 34,
      date: "2024-01-11",
      votes: 9,
    },
  ]

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Save profile data
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Info */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <Image
                    src="/placeholder.svg?height=96&width=96&text=Profile"
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                    onClick={() => {
                      /* Handle image upload */
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl dark:text-white">{profileData.name}</CardTitle>
                <CardDescription className="dark:text-gray-300">{profileData.email}</CardDescription>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member since {profileData.joinDate}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Karma Score</span>
                  </div>
                  <span className="font-bold text-lg">{userStats.karma}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Total Analyses</span>
                  </div>
                  <span className="font-semibold">{userStats.totalAnalyses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Accuracy Rate</span>
                  </div>
                  <span className="font-semibold">{userStats.accuracyRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Community Votes</span>
                  </div>
                  <span className="font-semibold">{userStats.communityVotes}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="badges" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="badges">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Badges</CardTitle>
                    <CardDescription>Achievements earned through your contributions to the community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {badges.map((badge, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <Award className="h-6 w-6 text-yellow-500 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{badge.name}</h3>
                              <Badge className={badge.color}>{badge.name}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest content verifications and community interactions</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {activity.type === "text" && <FileText className="h-5 w-5 text-gray-500" />}
                              {activity.type === "image" && <ImageIcon className="h-5 w-5 text-gray-500" />}
                              {activity.type === "video" && <Video className="h-5 w-5 text-gray-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{activity.content}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <Badge
                                  variant={activity.verdict === "REAL" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {activity.verdict}
                                </Badge>
                                <span className="text-xs text-gray-500">Score: {activity.score}%</span>
                                <span className="text-xs text-gray-500">{activity.votes} community votes</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(activity.date).toLocaleDateString()}
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
