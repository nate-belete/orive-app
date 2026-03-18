'use client'

import Link from 'next/link'
import AppShell from '@/app/components/AppShell'
import Loading from '@/app/components/Loading'
import ErrorState from '@/app/components/ErrorState'
import { useOccasions } from '@/lib/api/hooks'

export default function PlaybooksPage() {
  const { data: occasions, isLoading, error, refetch } = useOccasions()

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-h1 text-charcoal">Playbooks</h1>
          <p className="font-body text-gray-500 mt-1">
            Your personalised preparation guides
          </p>
        </div>

        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message="Failed to load playbooks" onRetry={() => refetch()} />
        ) : occasions && occasions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="font-body text-gray-500 mb-4">
              No playbooks yet. Create an occasion to generate your first playbook!
            </p>
            <Link href="/occasions/new" className="btn-primary-gold">
              Create Occasion
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {occasions?.map((occasion) => (
              <Link
                key={occasion.id}
                href={`/playbooks/${occasion.id}`}
                className="card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="overline">{occasion.dress_code?.replace(/_/g, ' ') || 'Playbook'}</p>
                  {occasion.playbook_generated && (
                    <span className="text-[10px] font-body font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-h3 text-charcoal mb-2 group-hover:text-gold transition-colors">
                  {occasion.name || occasion.occasion_type}
                </h3>
                <p className="font-body text-sm text-gray-400">
                  {new Date(occasion.datetime_local).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {occasion.location ? ` — ${occasion.location}` : ''}
                </p>
                <div className="flex items-center gap-1 mt-3 text-gold font-body text-xs font-medium">
                  View playbook
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
