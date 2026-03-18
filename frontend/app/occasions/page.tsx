'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/app/components/AppShell'
import Loading from '@/app/components/Loading'
import ErrorState from '@/app/components/ErrorState'
import { useOccasions, useDeleteOccasion } from '@/lib/api/hooks'
import type { Occasion } from '@/lib/api/types'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'past', label: 'Past' },
]

function getCountdown(dateStr: string): string {
  const now = new Date()
  const target = new Date(dateStr)
  const diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) {
    const daysAgo = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    if (daysAgo === 0) return 'Earlier today'
    if (daysAgo === 1) return 'Yesterday'
    return `${daysAgo} days ago`
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days === 0 && hours === 0) return 'Starting soon'
  if (days === 0) return `In ${hours}h`
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  if (days < 30) return `In ${Math.floor(days / 7)} weeks`
  return `In ${Math.floor(days / 30)} months`
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    upcoming: 'bg-blue-50 text-blue-600',
    today: 'bg-gold/10 text-gold',
    past: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-50 text-red-500',
  }
  return (
    <span
      className={`text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        styles[status] || styles.upcoming
      }`}
    >
      {status}
    </span>
  )
}

function ImportanceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`w-1.5 h-1.5 rounded-full ${
            n <= level ? 'bg-gold' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function OccasionsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: occasions, isLoading, error, refetch } = useOccasions(
    statusFilter ? { status: statusFilter } : undefined
  )
  const deleteMutation = useDeleteOccasion()

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Delete this occasion? This cannot be undone.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const filtered = occasions?.filter((o) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      o.name.toLowerCase().includes(q) ||
      o.location.toLowerCase().includes(q) ||
      o.venue.toLowerCase().includes(q) ||
      o.occasion_type.toLowerCase().includes(q)
    )
  })

  const sortedOccasions = filtered?.slice().sort((a, b) => {
    // Upcoming first, then today, then past
    const order: Record<string, number> = { today: 0, upcoming: 1, past: 2, cancelled: 3 }
    const diff = (order[a.status] ?? 1) - (order[b.status] ?? 1)
    if (diff !== 0) return diff
    return new Date(a.datetime_local).getTime() - new Date(b.datetime_local).getTime()
  })

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-h1 text-charcoal">Occasions</h1>
            <p className="font-body text-gray-500 mt-1">
              Plan and manage your upcoming events
            </p>
          </div>
          <Link href="/occasions/new" className="btn-primary-gold">
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Occasion
          </Link>
        </div>

        {/* Search + Status filter tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search occasions..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-pill text-sm font-body transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-charcoal text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState
            message="Failed to load occasions"
            onRetry={() => refetch()}
          />
        ) : sortedOccasions && sortedOccasions.length === 0 ? (
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
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <h2 className="font-heading text-h3 text-charcoal mb-2">
              {statusFilter ? 'No matching occasions' : 'No occasions planned yet'}
            </h2>
            <p className="font-body text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {statusFilter
                ? 'Try a different filter.'
                : 'Create your first occasion and we\'ll build a personalised playbook to help you prepare.'}
            </p>
            {!statusFilter && (
              <Link href="/occasions/new" className="btn-primary-gold">
                Create Occasion
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOccasions?.map((occasion) => (
              <OccasionCard
                key={occasion.id}
                occasion={occasion}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function OccasionCard({
  occasion,
  onDelete,
}: {
  occasion: Occasion
  onDelete: (id: number, e: React.MouseEvent) => void
}) {
  const countdown = getCountdown(occasion.datetime_local)
  const isPast = occasion.status === 'past'
  const isToday = occasion.status === 'today'

  return (
    <Link
      href={`/occasions/${occasion.id}`}
      className={`card hover:shadow-md transition-shadow group block ${
        isPast ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={occasion.status} />
            <ImportanceDots level={occasion.importance} />
            {occasion.playbook_generated && (
              <span className="text-[10px] font-body font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Playbook Ready
              </span>
            )}
          </div>

          <h3 className="font-heading text-h3 text-charcoal mb-1 group-hover:text-gold transition-colors truncate">
            {occasion.name || occasion.occasion_type}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {new Date(occasion.datetime_local).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              {' at '}
              {new Date(occasion.datetime_local).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>

            {occasion.location && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {occasion.venue ? `${occasion.venue}, ${occasion.location}` : occasion.location}
              </span>
            )}

            {occasion.dress_code && (
              <span className="capitalize">
                {occasion.dress_code.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p
            className={`font-body text-sm font-semibold ${
              isToday ? 'text-gold' : isPast ? 'text-gray-400' : 'text-charcoal'
            }`}
          >
            {countdown}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={(e) => onDelete(occasion.id, e)}
              className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              title="Delete occasion"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-400 hover:text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
            <svg
              className="w-5 h-5 text-gray-300 group-hover:text-gold transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
