'use client'

import AppShell from '@/app/components/AppShell'
import { useAuth } from '@/lib/auth/AuthContext'
import { useClosetItems, useOccasions } from '@/lib/api/hooks'
import Link from 'next/link'
import type { Occasion } from '@/lib/api/types'

function getCountdown(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr)
  const diff = d.getTime() - now.getTime()
  if (diff < 0) return 'Past'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days === 0 && hours === 0) return 'Very soon'
  if (days === 0) return `In ${hours}h`
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  if (days < 30) return `In ${Math.ceil(days / 7)} weeks`
  return `In ${Math.ceil(days / 30)} months`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function NextOccasionCard({ occasion }: { occasion: Occasion }) {
  return (
    <Link href={`/occasions/${occasion.id}`} className="block">
      <div className="card bg-gradient-to-br from-white to-gold/5 border border-gold/20 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="overline">Next Occasion</p>
            <h3 className="font-heading text-h2 text-charcoal">
              {occasion.name || occasion.occasion_type}
            </h3>
            <p className="font-body text-sm text-gray-500">
              {formatDate(occasion.datetime_local)}
              {occasion.location ? ` — ${occasion.location}` : ''}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-gold/10 text-gold px-3 py-1.5 rounded-full text-sm font-body font-semibold">
              {getCountdown(occasion.datetime_local)}
            </span>
            {occasion.playbook_generated ? (
              <p className="mt-2 text-xs text-emerald-600 font-body font-medium">
                Playbook ready
              </p>
            ) : (
              <Link
                href={`/playbooks/${occasion.id}`}
                className="mt-2 block text-xs text-gold font-body font-medium hover:underline"
              >
                Generate playbook &rarr;
              </Link>
            )}
          </div>
        </div>
        {occasion.importance > 0 && (
          <div className="flex items-center gap-1 mt-3" aria-label={`Importance: ${occasion.importance} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < occasion.importance ? 'bg-gold' : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="ml-1 font-body text-xs text-gray-400">importance</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: closetItems } = useClosetItems()
  const { data: occasions } = useOccasions()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const wardrobeCount = closetItems?.length ?? 0

  // Find today's occasions
  const todayOccasions = occasions?.filter((o) => {
    const d = new Date(o.datetime_local)
    const now = new Date()
    return d.toDateString() === now.toDateString() && o.status !== 'cancelled'
  }).sort((a, b) => new Date(a.datetime_local).getTime() - new Date(b.datetime_local).getTime()) ?? []

  // Find past occasions that ended recently (for feedback prompt)
  const recentPastOccasions = occasions?.filter((o) => {
    const d = new Date(o.datetime_local)
    const now = new Date()
    const hoursSince = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
    return hoursSince > 0 && hoursSince < 48 && o.playbook_generated
  }) ?? []

  const upcomingOccasions = occasions
    ?.filter((o) => {
      const d = new Date(o.datetime_local)
      return d.getTime() > Date.now() && o.status !== 'cancelled'
    })
    .sort((a, b) => new Date(a.datetime_local).getTime() - new Date(b.datetime_local).getTime()) ?? []
  const nextOccasion = upcomingOccasions[0] ?? null
  const playbookCount = occasions?.filter((o) => o.playbook_generated).length ?? 0

  const recentItems = closetItems?.slice(-5).reverse() ?? []
  const recentOccasions = occasions?.slice(-5).reverse() ?? []

  type ActivityItem = { type: 'wardrobe' | 'occasion'; date: string; label: string; href: string }
  const activityFeed: ActivityItem[] = [
    ...recentItems.map((item) => ({
      type: 'wardrobe' as const,
      date: item.created_at,
      label: `Added "${item.name}" to wardrobe`,
      href: '/wardrobe',
    })),
    ...recentOccasions.map((o) => ({
      type: 'occasion' as const,
      date: o.created_at,
      label: `Created occasion "${o.name || o.occasion_type}"`,
      href: `/occasions/${o.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="font-heading text-h1 text-charcoal">
            {greeting()}, {user?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="font-body text-gray-500 mt-1">
            Here&apos;s your style overview
          </p>
        </div>

        {/* Today's the Day card */}
        {todayOccasions.length > 0 && todayOccasions.map((occ) => (
          <Link key={occ.id} href={`/day-of/${occ.id}`} className="block">
            <div className="card bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold/30 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-widest text-gold mb-1">
                    Today&apos;s the day!
                  </p>
                  <h3 className="font-heading text-h2 text-charcoal mb-1">
                    {occ.name || occ.occasion_type}
                  </h3>
                  <p className="font-body text-sm text-gray-500">
                    {new Date(occ.datetime_local).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {occ.location ? ` — ${occ.location}` : ''}
                  </p>
                </div>
                <span className="btn-primary-gold text-sm whitespace-nowrap">
                  View day-of checklist &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Post-event feedback prompt */}
        {recentPastOccasions.length > 0 && recentPastOccasions.map((occ) => (
          <Link key={occ.id} href={`/feedback/${occ.id}/${occ.id}`} className="block">
            <div className="card bg-gradient-to-br from-blue-50 to-white border border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
                    How did it go?
                  </p>
                  <p className="font-body text-sm text-charcoal">
                    Share your feedback on <span className="font-semibold">{occ.name || occ.occasion_type}</span>
                  </p>
                </div>
                <span className="btn-outline text-sm text-blue-600 border-blue-200 hover:bg-blue-50 whitespace-nowrap">
                  Give feedback &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Next Occasion spotlight */}
        {nextOccasion && <NextOccasionCard occasion={nextOccasion} />}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/wardrobe" className="card hover:shadow-md transition-shadow group">
            <p className="overline mb-2">Wardrobe Items</p>
            <p className="font-heading text-h2 text-gold mb-1">
              {wardrobeCount || '—'}
            </p>
            <p className="font-body text-xs text-gray-400 group-hover:text-gold transition-colors">
              {wardrobeCount > 0 ? 'Browse wardrobe' : 'Add your first item'} &rarr;
            </p>
          </Link>

          <Link href="/occasions" className="card hover:shadow-md transition-shadow group">
            <p className="overline mb-2">Upcoming</p>
            <p className="font-heading text-h2 text-gold mb-1">
              {upcomingOccasions.length || '0'}
            </p>
            <p className="font-body text-xs text-gray-400 group-hover:text-gold transition-colors">
              {upcomingOccasions.length > 0 ? 'View occasions' : 'Plan an occasion'} &rarr;
            </p>
          </Link>

          <Link href="/playbooks" className="card hover:shadow-md transition-shadow group">
            <p className="overline mb-2">Playbooks</p>
            <p className="font-heading text-h2 text-gold mb-1">
              {playbookCount || '0'}
            </p>
            <p className="font-body text-xs text-gray-400 group-hover:text-gold transition-colors">
              {playbookCount > 0 ? 'View playbooks' : 'Generate your first'} &rarr;
            </p>
          </Link>

          <Link href="/colour-analysis" className="card hover:shadow-md transition-shadow group">
            <p className="overline mb-2">Colour Season</p>
            <p className="font-heading text-h2 text-gold mb-1 truncate">
              {user?.colour_season || 'Not yet'}
            </p>
            <p className="font-body text-xs text-gray-400 group-hover:text-gold transition-colors">
              {user?.colour_season ? 'View palette' : 'Take the analysis'} &rarr;
            </p>
          </Link>
        </div>

        {/* Tip of the Day */}
        <TipOfTheDay />

        {/* Quick Actions */}
        <div>
          <h2 className="font-heading text-h3 text-charcoal mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/wardrobe"
              className="card flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-charcoal">Add to Wardrobe</p>
                <p className="font-body text-xs text-gray-400">Upload garment photos</p>
              </div>
            </Link>

            <Link
              href="/occasions/new"
              className="card flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-charcoal">Plan an Occasion</p>
                <p className="font-body text-xs text-gray-400">Create a new event</p>
              </div>
            </Link>

            <Link
              href="/colour-analysis"
              className="card flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-charcoal">Colour Analysis</p>
                <p className="font-body text-xs text-gray-400">Find your season</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Upcoming Occasions list */}
        {upcomingOccasions.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-h3 text-charcoal">
                Upcoming Occasions
              </h2>
              <Link href="/occasions" className="font-body text-sm text-gold hover:underline">
                View all &rarr;
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingOccasions.slice(1, 4).map((occasion) => (
                <Link
                  key={occasion.id}
                  href={`/occasions/${occasion.id}`}
                  className="card flex items-center justify-between hover:shadow-md transition-shadow py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="font-heading text-sm text-gold">
                        {new Date(occasion.datetime_local).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-charcoal">
                        {occasion.name || occasion.occasion_type}
                      </p>
                      <p className="font-body text-xs text-gray-400">
                        {formatDate(occasion.datetime_local)}
                      </p>
                    </div>
                  </div>
                  <span className="font-body text-xs text-gray-400">
                    {getCountdown(occasion.datetime_local)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="font-heading text-h3 text-charcoal mb-4">
            Recent Activity
          </h2>
          {activityFeed.length > 0 ? (
            <div className="card divide-y divide-gray-100">
              {activityFeed.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-gray-50/50 -mx-6 px-6 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.type === 'wardrobe' ? 'bg-gold/10' : 'bg-blue-50'
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      className={`w-4 h-4 ${item.type === 'wardrobe' ? 'text-gold' : 'text-blue-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {item.type === 'wardrobe' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-charcoal truncate">
                      {item.label}
                    </p>
                    <p className="font-body text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-3" aria-hidden="true">
                  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <p className="font-body text-gray-500 text-sm mb-1">
                  No activity yet
                </p>
                <p className="font-body text-xs text-gray-400">
                  Start by adding items to your wardrobe or planning an occasion.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

const STYLING_TIPS = [
  "Invest in a well-fitted blazer — it instantly elevates any outfit from casual to polished.",
  "When in doubt, monochrome always works. Choose different textures to add depth.",
  "The rule of thirds: balance your outfit with one-third top, two-thirds bottom (or vice versa).",
  "Accessories can transform a basic outfit. A statement watch or scarf goes a long way.",
  "Ensure your shoes match the formality of your outfit — it's the first thing people notice.",
  "Colour blocking with complementary colours creates a confident, put-together look.",
  "Layer strategically: a visible collar, a rolled sleeve, or an unbuttoned jacket adds dimension.",
  "Fit is king — a well-tailored inexpensive item will always outperform an ill-fitting luxury piece.",
  "Neutral base + one accent colour = effortlessly stylish every time.",
  "Don't underestimate the power of ironed clothes — crisp fabric signals attention to detail.",
  "Match your metals: gold jewellery with warm tones, silver with cool tones.",
  "A great belt ties an outfit together. Match it to your shoes for a polished finish.",
  "When packing for an event, plan your outfit the night before to avoid last-minute stress.",
  "Confidence is the best accessory. Wear what makes you feel powerful.",
]

function TipOfTheDay() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % STYLING_TIPS.length
  const tip = STYLING_TIPS[dayIndex]

  return (
    <div className="card bg-gradient-to-r from-gold/5 to-transparent border border-gold/10">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div>
          <p className="font-body text-xs font-semibold text-gold uppercase tracking-wider mb-1">Style Tip of the Day</p>
          <p className="font-body text-sm text-gray-700">{tip}</p>
        </div>
      </div>
    </div>
  )
}
