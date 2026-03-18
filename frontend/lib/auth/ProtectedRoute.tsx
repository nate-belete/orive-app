'use client'

import { useAuth } from './AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/app/components/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export default function ProtectedRoute({
  children,
  requireOnboarding = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (requireOnboarding && user && !user.onboarding_complete) {
      router.replace('/onboarding')
      return
    }
  }, [isLoading, isAuthenticated, user, requireOnboarding, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireOnboarding && user && !user.onboarding_complete) {
    return null
  }

  return <>{children}</>
}
