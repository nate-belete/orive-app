'use client'

import Link from 'next/link'
import Image from 'next/image'
import OriveLogo from './components/OriveLogo'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 sm:px-8 lg:px-12 py-5 max-w-content mx-auto">
        <OriveLogo size="lg" />
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/login"
            className="font-body text-sm text-charcoal hover:text-gold transition-colors"
          >
            Sign In
          </Link>
          <Link href="/register" className="btn-primary-dark">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-content mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-24 lg:pt-20 lg:pb-32">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Text — left column */}
          <div className="flex-1 max-w-xl pt-4 lg:pt-12">
            <p className="overline mb-5">AI-Powered Occasion Preparation</p>
            <h1 className="font-heading text-[44px] sm:text-hero text-charcoal mb-6 leading-[1.15]">
              Show up{' '}
              <br className="hidden sm:block" />
              <span className="italic text-gold">unmistakably you.</span>
            </h1>
            <p className="font-body text-lg text-gray-500 mb-10 leading-relaxed max-w-md">
              Your wardrobe, your style, your confidence &mdash; orchestrated
              for life&apos;s biggest and every day moments.
            </p>
            <Link
              href="/register"
              className="btn-primary-dark text-base px-8 py-4 inline-flex items-center gap-2"
            >
              Start Your Journey
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {/* Image — right column */}
          <div className="flex-1 w-full lg:max-w-[480px]">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="/images/hero.png"
                alt="Man in a tailored cream overcoat and trousers — Orivé style inspiration"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20 lg:py-28">
        <div className="max-w-content mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="overline mb-3">How It Works</p>
            <h2 className="font-heading text-h1 text-charcoal">
              Preparation, <span className="italic">perfected.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Smart Wardrobe',
                desc: 'Upload your closet. AI tags, categorises, and understands every piece you own.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                ),
              },
              {
                title: 'Colour Analysis',
                desc: 'AI maps your unique colouring to build a personalised palette, then uses it to recommend outfits that let you show up as your best.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
                  />
                ),
              },
              {
                title: 'AI Playbooks',
                desc: 'Complete occasion guides with outfit, timeline, and presence coaching in one place.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                ),
              },
              {
                title: 'Virtual Try-On',
                desc: 'See yourself in recommended outfits before the big day. No guesswork.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                ),
                iconExtra: (
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  />
                ),
              },
            ].map((item) => (
              <div key={item.title} className="card text-center p-8">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <svg
                    className="w-6 h-6 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {item.icon}
                    {'iconExtra' in item && item.iconExtra}
                  </svg>
                </div>
                <h3 className="font-heading text-h3 text-charcoal mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F5F3F0] py-20 lg:py-24">
        <div className="max-w-content mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="font-heading text-h1 text-charcoal mb-4">
            Ready to own <span className="italic">every room</span> you walk
            into?
          </h2>
          <p className="font-body text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Join ORIVÉ and transform how you prepare and show up for
            life&apos;s moments.
          </p>
          <Link
            href="/register"
            className="btn-primary-dark text-base px-10 py-4 inline-flex items-center gap-2"
          >
            Create Your Profile
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream py-10 border-t border-gray-200">
        <div className="max-w-content mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <OriveLogo size="sm" />
          <p className="font-body text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Orivé. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
