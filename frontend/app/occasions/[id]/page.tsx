'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/app/components/AppShell'
import Loading from '@/app/components/Loading'
import ErrorState from '@/app/components/ErrorState'
import {
  useOccasion,
  useUpdateOccasion,
  useDeleteOccasion,
  usePlaybookByOccasion,
  useGeneratePlaybook,
} from '@/lib/api/hooks'
import type { OccasionUpdate } from '@/lib/api/types'

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
  if (days === 0) return `In ${hours} hours`
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  if (days < 30) return `In ${Math.floor(days / 7)} weeks`
  return `In ${Math.floor(days / 30)} months`
}

export default function OccasionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const occasionId = Number(params.id)
  const { data: occasion, isLoading, error, refetch } = useOccasion(occasionId)
  const { data: playbook } = usePlaybookByOccasion(occasionId)
  const updateMutation = useUpdateOccasion()
  const deleteMutation = useDeleteOccasion()
  const generatePlaybook = useGeneratePlaybook()
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<OccasionUpdate>({})
  const [showRegenPrompt, setShowRegenPrompt] = useState(false)

  const startEditing = () => {
    if (!occasion) return
    setEditForm({
      name: occasion.name,
      occasion_type: occasion.occasion_type,
      location: occasion.location,
      venue: occasion.venue,
      dress_code: occasion.dress_code,
      description: occasion.description,
      desired_outcome: occasion.desired_outcome,
      attendees: occasion.attendees,
      role: occasion.role,
      weather_hint: occasion.weather_hint,
    })
    setEditing(true)
  }

  const handleSave = async () => {
    await updateMutation.mutateAsync({ id: occasionId, data: editForm })
    setEditing(false)
    refetch()
    if (occasion?.playbook_generated) {
      setShowRegenPrompt(true)
    }
  }

  const handleDelete = async () => {
    const msg = occasion?.playbook_generated
      ? 'Delete this occasion? This will also delete the associated playbook. This cannot be undone.'
      : 'Delete this occasion? This cannot be undone.'
    if (confirm(msg)) {
      await deleteMutation.mutateAsync(occasionId)
      router.push('/occasions')
    }
  }

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
        <ErrorState
          message="Occasion not found"
          onRetry={() => refetch()}
        />
      </AppShell>
    )
  }

  const isPast = occasion.status === 'past'

  return (
    <AppShell>
      {/* Playbook regeneration prompt after editing */}
      {showRegenPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-heading text-lg text-charcoal">Update Playbook?</h3>
            <p className="font-body text-sm text-gray-600">
              You&apos;ve updated the occasion details. Would you like to regenerate the playbook with the new information?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRegenPrompt(false)}
                className="btn-outline text-sm px-4 py-2"
              >
                Not Now
              </button>
              <button
                onClick={async () => {
                  setShowRegenPrompt(false)
                  await generatePlaybook.mutateAsync({ occasionId, force: true })
                  router.push(`/playbooks/${occasionId}`)
                }}
                className="btn-primary-gold text-sm px-4 py-2"
                disabled={generatePlaybook.isPending}
              >
                {generatePlaybook.isPending ? 'Regenerating...' : 'Regenerate Playbook'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-3xl">
        {/* Back link */}
        <Link
          href="/occasions"
          className="inline-flex items-center gap-1 font-body text-sm text-gray-500 hover:text-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          All Occasions
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  occasion.status === 'today'
                    ? 'bg-gold/10 text-gold'
                    : occasion.status === 'past'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {occasion.status}
              </span>
              <span className="font-body text-sm font-semibold text-charcoal">
                {getCountdown(occasion.datetime_local)}
              </span>
            </div>
            {!editing ? (
              <h1 className="font-heading text-hero text-charcoal">
                {occasion.name || occasion.occasion_type}
              </h1>
            ) : (
              <input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field text-2xl font-heading"
              />
            )}
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button onClick={startEditing} className="btn-outline text-sm">
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-outline text-sm text-red-500 border-red-200 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="card">
          {!editing ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <DetailItem label="Type" value={occasion.occasion_type.replace(/_/g, ' ')} />
              <DetailItem
                label="Date & Time"
                value={new Date(occasion.datetime_local).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }) +
                  ' at ' +
                  new Date(occasion.datetime_local).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
              />
              {occasion.end_datetime && (
                <DetailItem
                  label="Ends"
                  value={new Date(occasion.end_datetime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                />
              )}
              <div>
                <p className="font-body text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                  Location
                </p>
                {occasion.location ? (
                  <div>
                    <p className="font-body text-sm text-charcoal capitalize">{occasion.location}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${occasion.venue ? occasion.venue + ', ' : ''}${occasion.location}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs text-gold hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      Open in Maps
                    </a>
                  </div>
                ) : (
                  <p className="font-body text-sm text-charcoal">—</p>
                )}
              </div>
              <DetailItem label="Venue" value={occasion.venue || '—'} />
              <DetailItem label="Dress Code" value={occasion.dress_code?.replace(/_/g, ' ') || '—'} />
              <DetailItem label="Your Role" value={occasion.role || '—'} />
              <DetailItem label="Comfort" value={occasion.comfort} />
              <div>
                <p className="font-body text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                  Importance
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`w-2 h-5 rounded-sm ${
                        n <= occasion.importance ? 'bg-gold' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <DetailItem label="Budget" value={occasion.budget ? `$${occasion.budget}` : '—'} />
              <DetailItem label="Weather" value={occasion.weather_hint || '—'} />
              <div className="col-span-2 sm:col-span-3">
                <p className="font-body text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                  Desired Outcome
                </p>
                {occasion.desired_outcome ? (
                  <div className="flex flex-wrap gap-1.5">
                    {occasion.desired_outcome.split(',').map((o: string) => o.trim()).filter(Boolean).map((outcome: string) => (
                      <span
                        key={outcome}
                        className="inline-block py-1 px-3 rounded-full text-xs font-body bg-gold/10 text-gold border border-gold/20 capitalize"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-sm text-charcoal">—</p>
                )}
              </div>
              {occasion.attendees && (
                <div className="col-span-2 sm:col-span-3">
                  <DetailItem label="Attendees" value={occasion.attendees} />
                </div>
              )}
              {occasion.description && (
                <div className="col-span-2 sm:col-span-3">
                  <DetailItem label="Notes" value={occasion.description} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label text-xs">Location</label>
                  <input
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Venue</label>
                  <input
                    value={editForm.venue || ''}
                    onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Dress Code</label>
                  <input
                    value={editForm.dress_code || ''}
                    onChange={(e) => setEditForm({ ...editForm, dress_code: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Role</label>
                  <input
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="input-label text-xs">Desired Outcome</label>
                <input
                  value={editForm.desired_outcome || ''}
                  onChange={(e) => setEditForm({ ...editForm, desired_outcome: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="input-label text-xs">Attendees</label>
                <textarea
                  value={editForm.attendees || ''}
                  onChange={(e) => setEditForm({ ...editForm, attendees: e.target.value })}
                  className="input-field text-sm min-h-[60px] resize-none"
                />
              </div>
              <div>
                <label className="input-label text-xs">Notes</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input-field text-sm min-h-[60px] resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="btn-outline text-xs">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="btn-primary-gold text-xs disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Playbook CTA */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-h3 text-charcoal mb-1">
                {playbook ? 'Your Playbook' : 'Generate a Playbook'}
              </h3>
              <p className="font-body text-sm text-gray-500">
                {playbook
                  ? 'Your personalised preparation plan is ready'
                  : 'Get outfit recommendations, a prep timeline, and presence coaching'}
              </p>
            </div>
            <Link
              href={`/playbooks/${occasion.id}`}
              className="btn-primary-gold"
            >
              {playbook ? 'View Playbook' : 'Generate Playbook'}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-body text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="font-body text-sm text-charcoal capitalize">{value}</p>
    </div>
  )
}
