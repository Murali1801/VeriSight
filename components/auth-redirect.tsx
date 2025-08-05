"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "./loading-spinner"

interface AuthRedirectProps {
  children: React.ReactNode
}

function AuthRedirect({ children }: AuthRedirectProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />
  }

  if (user) {
    return null
  }

  return <>{children}</>
}

export { AuthRedirect } 