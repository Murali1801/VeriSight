"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Shield, Home, User, Settings, LogOut, Award, Menu, X, Search } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { subscribeToUserData, UserData } from "@/lib/user-service"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)

  // Set up real-time listener for user data
  useEffect(() => {
    if (!user) {
      setUserData(null)
      return
    }

    const unsubscribe = subscribeToUserData(user.uid, (data) => {
      setUserData(data)
    })

    return () => unsubscribe()
  }, [user])

  const navigation = [
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  const router = useRouter()

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      })
      router.push("/signin")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  return (
    <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/20 dark:border-slate-800/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">VeriSight</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Karma Score */}
            <div className="hidden sm:flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold dark:text-white">
                {userData?.karma || 0}
              </span>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-black text-blue-800 dark:text-blue-300">
                {userData?.badges?.[0] || "Truth Seeker"}
              </Badge>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Image
                    src={userData?.photoURL || user?.photoURL || "/placeholder.svg?height=32&width=32&text=User"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userData?.displayName || user?.displayName || "User"}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{userData?.email || user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2" ref={menuRef}>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 h-auto w-auto">
                {isMobileMenuOpen ? <X className="h-5 w-5 text-gray-900 dark:text-white" /> : <Menu className="h-5 w-5 text-gray-900 dark:text-white" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Popup */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 right-2 w-32 bg-white dark:bg-black border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-40" ref={menuRef}>
            <div className="p-1 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button 
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-sm h-8 px-2 ${
                        isActive(item.href)
                          ? "bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300"
                          : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
              
              <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
              
              {/* Mobile Karma Display */}
              <div className="px-2 py-1">
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Award className="h-3 w-3 text-yellow-500" />
                  <span className="font-semibold">{userData?.karma || 0} Karma</span>
                </div>
                <Badge variant="secondary" className="mt-1 text-xs bg-blue-100 dark:bg-black text-blue-800 dark:text-blue-300">
                  {userData?.badges?.[0] || "Truth Seeker"}
                </Badge>
              </div>
              
              <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>

              {/* Mobile Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm h-8 px-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
