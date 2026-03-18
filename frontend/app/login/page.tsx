'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OriveLogo from '@/app/components/OriveLogo'
import { useAuth } from '@/lib/auth/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already logged in
  if (!isLoading && isAuthenticated) {
    router.replace('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login({ email, password })
      router.push('/dashboard')
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || 'Invalid email or password'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-cream">
        <div className="max-w-form mx-auto w-full">
          <OriveLogo size="lg" className="mb-12 block" />

          <h1 className="font-heading text-h1 text-charcoal mb-2">
            Welcome back
          </h1>
          <p className="font-body text-gray-500 mb-8">
            Sign in to continue your style journey
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="font-body text-sm text-gray-600">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="font-body text-sm text-gold hover:text-gold-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-dark w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="font-body text-sm text-gray-500 text-center mt-8">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-gold hover:text-gold-light font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Inspiration Panel (dark panel — only exception to no-dark-mode rule) */}
      <div className="hidden lg:flex flex-1 bg-charcoal items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-12 h-12 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
          </div>
          <p className="font-heading text-2xl text-white mb-3 italic">
            &ldquo;Style is a way to say who you are without having to
            speak.&rdquo;
          </p>
          <p className="font-body text-sm text-gray-400">— Rachel Zoe</p>
        </div>
      </div>
    </div>
  )
}
