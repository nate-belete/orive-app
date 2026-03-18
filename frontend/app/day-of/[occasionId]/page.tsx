'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/app/components/AppShell'
import Loading from '@/app/components/Loading'
import ErrorState from '@/app/components/ErrorState'
import { useOccasion, usePlaybookByOccasion } from '@/lib/api/hooks'

export default function DayOfPage() {
  const params = useParams()
  const occasionId = Number(params.occasionId)
  const { data: occasion, isLoading, error, refetch } = useOccasion(occasionId)
  const { data: playbook } = usePlaybookByOccasion(occasionId)

  if (isLoading) {
    return (
      <AppShell>
        <Loading />
      </AppShell>
    )
  }

  if (error || !occasion) {
    return (
      <AppShell>
        <ErrorState message="Occasion not found" onRetry={() => refetch()} />
      </AppShell>
    )
  }

  const eventTime = new Date(occasion.datetime_local).toLocaleTimeString(
    'en-US',
    { hour: 'numeric', minute: '2-digit' }
  )

  const look = playbook?.look
  const prep = playbook?.prep
  const presence = playbook?.presence

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 font-body text-sm text-gray-500 hover:text-gold transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Dashboard
        </Link>

        {/* Hero */}
        <div className="card bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold/30 text-center py-10">
          <p className="font-body text-xs font-bold uppercase tracking-widest text-gold mb-3">
            Today&apos;s the day
          </p>
          <h1 className="font-heading text-hero text-charcoal mb-2">
            {occasion.name || occasion.occasion_type}
          </h1>
          <p className="font-body text-gray-500">
            {eventTime}
            {occasion.location ? ` — ${occasion.location}` : ''}
            {occasion.venue ? ` (${occasion.venue})` : ''}
          </p>
        </div>

        {/* Outfit Reminder */}
        {look && look.outfits && look.outfits.length > 0 && (
          <div className="card">
            <h2 className="font-heading text-h3 text-charcoal mb-4">
              Your Outfit
            </h2>
            <div className="bg-cream rounded-lg p-5">
              <p className="font-body font-semibold text-charcoal mb-3">
                {look.outfits[0].title}
              </p>
              <ul className="space-y-2">
                {look.outfits[0].items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 font-body text-sm text-gray-600"
                  >
                    <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                    {item.name}
                    {item.category && (
                      <span className="text-xs text-gray-400 capitalize">
                        ({item.category})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {look.outfits[0].accessories && (
                <p className="font-body text-sm text-gray-500 mt-3 italic">
                  Accessories: {look.outfits[0].accessories}
                </p>
              )}
            </div>
            <Link
              href={`/playbooks/${occasion.id}`}
              className="inline-block mt-4 font-body text-sm text-gold hover:underline"
            >
              View full playbook &rarr;
            </Link>
          </div>
        )}

        {/* Last-Minute Tips */}
        <div className="card">
          <h2 className="font-heading text-h3 text-charcoal mb-4">
            Last-Minute Tips
          </h2>
          <div className="space-y-3">
            {occasion.weather_hint && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
                <svg
                  className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                  />
                </svg>
                <div>
                  <p className="font-body text-sm font-semibold text-blue-700">Weather</p>
                  <p className="font-body text-sm text-blue-600">{occasion.weather_hint}</p>
                </div>
              </div>
            )}

            {occasion.location && (
              <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4">
                <svg
                  className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <div>
                  <p className="font-body text-sm font-semibold text-green-700">Location</p>
                  <p className="font-body text-sm text-green-600">
                    {occasion.venue ? `${occasion.venue}, ` : ''}{occasion.location}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${occasion.venue ? occasion.venue + ', ' : ''}${occasion.location}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs text-green-500 hover:underline mt-1 inline-block"
                  >
                    Open in Google Maps &rarr;
                  </a>
                </div>
              </div>
            )}

            {occasion.dress_code && (
              <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-4">
                <svg
                  className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                <div>
                  <p className="font-body text-sm font-semibold text-amber-700">Dress Code</p>
                  <p className="font-body text-sm text-amber-600 capitalize">
                    {occasion.dress_code.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            )}

            {/* Morning-of tasks from prep timeline */}
            {prep?.morning_of && prep.morning_of.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-body text-sm font-semibold text-charcoal mb-3">
                  Morning checklist
                </p>
                <ul className="space-y-2">
                  {prep.morning_of.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1 text-gold focus:ring-gold rounded" />
                      <span className="font-body text-sm text-gray-600">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Just-before tasks */}
            {prep?.just_before && prep.just_before.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-body text-sm font-semibold text-charcoal mb-3">
                  Just before you leave
                </p>
                <ul className="space-y-2">
                  {prep.just_before.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1 text-gold focus:ring-gold rounded" />
                      <span className="font-body text-sm text-gray-600">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pack list */}
            {(prep?.pack_list || prep?.pack) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-body text-sm font-semibold text-charcoal mb-3">
                  Don&apos;t forget to pack
                </p>
                <ul className="space-y-2">
                  {(prep?.pack_list || prep?.pack || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1 text-gold focus:ring-gold rounded" />
                      <span className="font-body text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Pep Talk */}
        {presence?.pep_talk && (
          <div className="card bg-gradient-to-br from-gold/5 to-amber-50/50 border border-gold/20">
            <h2 className="font-heading text-h3 text-charcoal mb-4">
              Your Pep Talk
            </h2>
            <blockquote className="font-body text-gray-700 italic leading-relaxed text-lg border-l-4 border-gold pl-4">
              &ldquo;{presence.pep_talk}&rdquo;
            </blockquote>
          </div>
        )}

        {/* Quick Mindset Tips */}
        {presence?.mindset && presence.mindset.length > 0 && (
          <div className="card">
            <h2 className="font-heading text-h3 text-charcoal mb-4">
              Mindset
            </h2>
            <ul className="space-y-3">
              {presence.mindset.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-body font-bold text-gold">
                      {i + 1}
                    </span>
                  </div>
                  <p className="font-body text-sm text-gray-600">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-between pt-4">
          <Link href={`/occasions/${occasion.id}`} className="btn-outline text-sm">
            View occasion details
          </Link>
          {playbook && (
            <Link href={`/playbooks/${occasion.id}`} className="btn-primary-gold text-sm">
              View full playbook
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  )
}
