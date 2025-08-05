"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { updateUserData, subscribeToUserData, UserData } from "@/lib/user-service"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Camera } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SettingsIcon, Mail, Shield, Trash2, Bell, Eye, Save } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [settings, setSettings] = useState({
    email: "john.doe@example.com",
    emailNotifications: true,
    communityNotifications: false,
    securityAlerts: true,
    defaultAnalysisMode: "text",
    autoSave: true,
    darkMode: theme === "dark",
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set up real-time listener for user data
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserData(user.uid, (data) => {
      setUserData(data)
      if (data) {
        setSettings(prev => ({
          ...prev,
          email: data.email || prev.email,
        }))
      }
    })

    return () => unsubscribe()
  }, [user])

  // Update settings when theme changes
  useEffect(() => {
    if (mounted) {
      setSettings((prev) => ({
        ...prev,
        darkMode: theme === "dark",
      }))
    }
  }, [theme, mounted])

  // Initialize dark mode setting when component mounts
  useEffect(() => {
    if (mounted && theme) {
      setSettings((prev) => ({
        ...prev,
        darkMode: theme === "dark",
      }))
    }
  }, [mounted, theme])

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Handle dark mode toggle
    if (key === "darkMode") {
      setTheme(value ? "dark" : "light")
    }
  }

  const handlePasswordChange = (key: string, value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveSettings = async () => {
    if (!user) return
    
    try {
      await updateUserData(user.uid, {
        // Add any settings that need to be saved to user data
        // For now, we'll just show a success message
      })
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
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

  const handleChangePassword = () => {
    // Change password logic
    console.log("Changing password")
    setPasswords({ current: "", new: "", confirm: "" })
  }

  const handleDeleteAccount = () => {
    // Delete account logic
    console.log("Deleting account")
    setShowDeleteDialog(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account preferences and security settings</p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Settings */}
          <Card className="dark:bg-black dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Camera className="h-5 w-5 mr-2" />
                Profile Picture
              </CardTitle>
              <CardDescription className="dark:text-gray-300">Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Image
                    src={userData?.photoURL || user?.photoURL || "/placeholder.svg?height=64&width=64&text=Profile"}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-gray-200 dark:border-slate-700"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Upload a new profile picture. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                  </p>
                  <Button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    variant="outline"
                    size="sm"
                  >
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="dark:bg-black dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Mail className="h-5 w-5 mr-2" />
                Account Settings
              </CardTitle>
              <CardDescription className="dark:text-gray-300">Update your email and basic account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis-mode">Default Analysis Mode</Label>
                <Select
                  value={settings.defaultAnalysisMode}
                  onValueChange={(value) => handleSettingChange("defaultAnalysisMode", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text/URL</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save Analysis Results</Label>
                  <p className="text-sm text-gray-500">Automatically save your analysis results</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="dark:bg-black dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="dark:text-gray-300">Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates about your analyses via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Community Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified when others vote on your content</p>
                </div>
                <Switch
                  checked={settings.communityNotifications}
                  onCheckedChange={(checked) => handleSettingChange("communityNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-gray-500">Important security and account notifications</p>
                </div>
                <Switch
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => handleSettingChange("securityAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="dark:bg-black dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Eye className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription className="dark:text-gray-300">Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
                <Switch
                  checked={mounted && theme ? theme === "dark" : false}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                  disabled={!mounted}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="dark:bg-black dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription className="dark:text-gray-300">Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => handlePasswordChange("current", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => handlePasswordChange("new", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:bg-black dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>

                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove your data
                          from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
