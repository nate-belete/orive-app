'use client'

import { useState } from 'react'
import Link from 'next/link'
import OriveLogo from '@/app/components/OriveLogo'
import { authApi } from '@/lib/api/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await authApi.requestPasswordReset(email)
      setSubmitted(true)
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
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
            Reset your password
          </h1>
          <p className="font-body text-sm text-gray-500">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-body text-gray-700 mb-2">Check your email</p>
            <p className="font-body text-sm text-gray-500 mb-6">
              If an account with <strong>{email}</strong> exists, we&apos;ve
              sent a password reset link.
            </p>
            <Link
              href="/login"
              className="text-gold hover:text-gold-light font-semibold text-sm transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
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

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary-dark w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="font-body text-sm text-gray-500 text-center mt-6">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-gold hover:text-gold-light font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
