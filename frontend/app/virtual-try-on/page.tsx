'use client'

import AppShell from '@/app/components/AppShell'

export default function VirtualTryOnPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-h1 text-charcoal">
            Virtual Try-On
          </h1>
          <p className="font-body text-gray-500 mt-1">
            See how outfits look on you before you commit
          </p>
        </div>

        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h2 className="font-heading text-h2 text-charcoal mb-3">
            Virtual Try-On
          </h2>
          <p className="font-body text-gray-500 mb-6 max-w-md mx-auto">
            Upload a full-body photo and see how recommended outfits look on
            you, powered by Fashn.ai virtual try-on technology.
          </p>
          <button className="btn-primary-gold" disabled>
            Coming Soon
          </button>
          <p className="font-body text-xs text-gray-400 mt-3">
            Virtual try-on will be available in a future update
          </p>
        </div>
      </div>
    </AppShell>
  )
}
