'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OriveLogo from '@/app/components/OriveLogo'
import { useAuth } from '@/lib/auth/AuthContext'

function getPasswordStrength(pw: string): { label: string; score: number; color: string } {
  if (!pw) return { label: '', score: 0, color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (pw.length >= 12) score++
  if (score <= 2) return { label: 'Weak', score, color: 'bg-red-400' }
  if (score <= 3) return { label: 'Medium', score, color: 'bg-yellow-400' }
  return { label: 'Strong', score, color: 'bg-emerald-400' }
}

function getPasswordErrors(pw: string): string[] {
  if (!pw) return []
  const errs: string[] = []
  if (pw.length < 8) errs.push('At least 8 characters')
  if (!/[A-Z]/.test(pw)) errs.push('One uppercase letter (A-Z)')
  if (!/[a-z]/.test(pw)) errs.push('One lowercase letter (a-z)')
  if (!/[0-9]/.test(pw)) errs.push('One number (0-9)')
  return errs
}

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const passwordErrors = useMemo(() => getPasswordErrors(password), [password])

  if (!isLoading && isAuthenticated) {
    router.replace('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (passwordErrors.length > 0) {
      setError('Please fix the password requirements below')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await register({ email, password, first_name: firstName, last_name: lastName })
      router.push('/onboarding')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: any) => d.msg || d).join('. ')
            : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="card max-w-form w-full p-8 lg:p-10">
        <div className="text-center mb-8">
          <OriveLogo size="lg" className="mb-6 inline-block" />
          <h1 className="font-heading text-h2 text-charcoal mb-2">
            Create your account
          </h1>
          <p className="font-body text-sm text-gray-500">
            Start your personalised style journey
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="input-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="input-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                placeholder="Last name"
                required
              />
            </div>
          </div>

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
              placeholder="Min 8 chars, uppercase, lowercase, number"
              required
              minLength={8}
            />
            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`font-body text-xs font-medium ${
                    strength.label === 'Weak' ? 'text-red-500' :
                    strength.label === 'Medium' ? 'text-yellow-600' : 'text-emerald-600'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                {passwordErrors.length > 0 && (
                  <ul className="space-y-0.5">
                    {['At least 8 characters', 'One uppercase letter (A-Z)', 'One lowercase letter (a-z)', 'One number (0-9)'].map((rule) => {
                      const met = !passwordErrors.includes(rule)
                      return (
                        <li key={rule} className={`font-body text-xs flex items-center gap-1.5 ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {met ? (
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
                          )}
                          {rule}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="input-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm your password"
              required
              minLength={8}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="font-body text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || passwordErrors.length > 0}
            className="btn-primary-dark w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="font-body text-sm text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-gold hover:text-gold-light font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>

        <p className="font-body text-xs text-gray-400 text-center mt-4">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </div>
  )
}
