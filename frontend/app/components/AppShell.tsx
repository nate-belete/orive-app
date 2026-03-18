'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import OriveLogo from './OriveLogo'
import { useAuth } from '@/lib/auth/AuthContext'
import ProtectedRoute from '@/lib/auth/ProtectedRoute'

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    ),
  },
  {
    path: '/wardrobe',
    label: 'Wardrobe',
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
    path: '/occasions',
    label: 'Occasions',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    ),
  },
  {
    path: '/playbooks',
    label: 'Playbooks',
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
    path: '/colour-analysis',
    label: 'Colours',
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
    path: '/settings',
    label: 'Settings',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
    ),
    iconExtra: (
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    ),
  },
]

const mobileNavItems = navItems.filter((_, i) => i < 5)

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ProtectedRoute requireOnboarding>
      <div className="min-h-screen bg-cream flex flex-col md:flex-row">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
          <OriveLogo size="sm" href="/dashboard" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </header>

        {/* Mobile slide-out menu overlay */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-charcoal/30"
            onClick={() => setMobileMenuOpen(false)}
            role="presentation"
          >
            <nav
              className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-6 space-y-2"
              onClick={(e) => e.stopPropagation()}
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between mb-6">
                <OriveLogo size="sm" href="/dashboard" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
                      isActive
                        ? 'bg-nav-active text-charcoal font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 shrink-0 ${isActive ? 'text-gold' : 'text-gray-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {item.icon}
                      {'iconExtra' in item && item.iconExtra}
                    </svg>
                    {item.label}
                  </Link>
                )
              })}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2 mb-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold font-heading text-sm">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'O'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm text-charcoal font-medium truncate">
                      {user?.full_name || 'User'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0 sticky top-0 h-screen">
          <div className="px-6 py-6 border-b border-gray-100">
            <OriveLogo size="md" href="/dashboard" />
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
                    isActive
                      ? 'bg-nav-active text-charcoal font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <svg
                    className={`w-5 h-5 shrink-0 ${isActive ? 'text-gold' : 'text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {item.icon}
                    {'iconExtra' in item && item.iconExtra}
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold font-heading text-sm" aria-hidden="true">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'O'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-charcoal font-medium truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="font-body text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0" id="main-content" role="main">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom"
          role="navigation"
          aria-label="Quick navigation"
        >
          <div className="flex items-center justify-around py-2">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[48px] min-h-[48px] justify-center rounded-lg transition-colors ${
                    isActive ? 'text-gold' : 'text-gray-400'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {item.icon}
                    {'iconExtra' in item && item.iconExtra}
                  </svg>
                  <span className="text-[10px] font-body font-medium leading-tight">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  )
}
