'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { authApi } from '@/lib/api/client'
import type { User, RegisterRequest, LoginRequest } from '@/lib/api/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('orive_token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }
      const userData = await authApi.getMe()
      setUser(userData)
    } catch {
      localStorage.removeItem('orive_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data)
    localStorage.setItem('orive_token', response.access_token)
    setUser(response.user)
  }

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    localStorage.setItem('orive_token', response.access_token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem('orive_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
