'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/app/components/AppShell'
import Loading from '@/app/components/Loading'
import {
  usePlaybookByOccasion,
  useGeneratePlaybook,
  useOccasion,
} from '@/lib/api/hooks'
import { API_BASE_URL } from '@/lib/api/client'
import type { Playbook, Outfit, UpgradeSuggestion } from '@/lib/api/types'

const TABS = [
  { key: 'look', label: 'Look', icon: '👗' },
  { key: 'prep', label: 'Prep Timeline', icon: '📋' },
  { key: 'presence', label: 'Presence', icon: '✨' },
  { key: 'beauty', label: 'Beauty', icon: '💅' },
] as const
type TabKey = (typeof TABS)[number]['key']

export default function PlaybookDetailPage() {
  const params = useParams()
  const occasionId = parseInt(params.occasionId as string)
  const [activeTab, setActiveTab] = useState<TabKey>('look')

  const { data: occasion } = useOccasion(occasionId)
  const {
    data: playbook,
    isLoading,
    error,
    refetch,
  } = usePlaybookByOccasion(occasionId)
  const generateMutation = useGeneratePlaybook()

  const [regenMenuOpen, setRegenMenuOpen] = useState(false)

  const handleGenerate = async (force = false, module = '') => {
    try {
      await generateMutation.mutateAsync({ occasionId, force, module })
      refetch()
      setRegenMenuOpen(false)
    } catch (err) {
      console.error('Failed to generate playbook:', err)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back + Header */}
        <Link
          href={`/occasions/${occasionId}`}
          className="inline-flex items-center gap-1 font-body text-sm text-gray-500 hover:text-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Occasion
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <p className="overline mb-1">Playbook</p>
            <h1 className="font-heading text-h1 text-charcoal">
              {occasion?.name || occasion?.occasion_type || 'Playbook'}
            </h1>
            {occasion && (
              <p className="font-body text-gray-500 mt-1">
                {new Date(occasion.datetime_local).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                {occasion.location ? ` — ${occasion.location}` : ''}
              </p>
            )}
          </div>
          {playbook && (
            <div className="relative">
              <button
                onClick={() => setRegenMenuOpen(!regenMenuOpen)}
                disabled={generateMutation.isPending}
                className="btn-outline text-sm disabled:opacity-50 flex items-center gap-1"
              >
                {generateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {regenMenuOpen && !generateMutation.isPending && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  <button
                    onClick={() => handleGenerate(true)}
                    className="w-full text-left px-4 py-2 text-sm font-body text-charcoal hover:bg-gray-50"
                  >
                    Full Regeneration
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => handleGenerate(false, 'look')}
                    className="w-full text-left px-4 py-2 text-sm font-body text-gray-600 hover:bg-gray-50"
                  >
                    Regenerate Outfits Only
                  </button>
                  <button
                    onClick={() => handleGenerate(false, 'prep')}
                    className="w-full text-left px-4 py-2 text-sm font-body text-gray-600 hover:bg-gray-50"
                  >
                    Regenerate Timeline Only
                  </button>
                  <button
                    onClick={() => handleGenerate(false, 'presence')}
                    className="w-full text-left px-4 py-2 text-sm font-body text-gray-600 hover:bg-gray-50"
                  >
                    Regenerate Coaching Only
                  </button>
                  <button
                    onClick={() => handleGenerate(false, 'beauty')}
                    className="w-full text-left px-4 py-2 text-sm font-body text-gray-600 hover:bg-gray-50"
                  >
                    Regenerate Beauty Only
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading || generateMutation.isPending ? (
          <div className="card text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gold mx-auto mb-6" />
            <h2 className="font-heading text-h3 text-charcoal mb-2">
              {generateMutation.isPending
                ? 'Building your playbook...'
                : 'Loading...'}
            </h2>
            {generateMutation.isPending && (
              <p className="font-body text-sm text-gray-500 max-w-sm mx-auto">
                Analysing your wardrobe, occasion details, and style
                preferences to create a personalised plan.
              </p>
            )}
          </div>
        ) : error && !playbook ? (
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
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <h2 className="font-heading text-h3 text-charcoal mb-3">
              Ready to Build Your Playbook
            </h2>
            <p className="font-body text-sm text-gray-500 mb-6 max-w-md mx-auto">
              We&apos;ll create personalised outfit recommendations, a prep
              timeline, beauty tips, and presence coaching — all tailored to
              your occasion.
            </p>
            <button
              onClick={() => handleGenerate()}
              disabled={generateMutation.isPending}
              className="btn-primary-gold disabled:opacity-50"
            >
              Generate Playbook
            </button>
          </div>
        ) : playbook ? (
          <>
            {/* Tab bar */}
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-card">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-body font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-charcoal text-white'
                      : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'look' && <LookTab playbook={playbook} />}
            {activeTab === 'prep' && <PrepTab playbook={playbook} />}
            {activeTab === 'presence' && <PresenceTab playbook={playbook} />}
            {activeTab === 'beauty' && <BeautyTab playbook={playbook} />}
          </>
        ) : null}
      </div>
    </AppShell>
  )
}

// ─── LOOK TAB ───

function LookTab({ playbook }: { playbook: Playbook }) {
  const [selectedOutfit, setSelectedOutfit] = useState(0)

  if (playbook.look.message) {
    return (
      <div className="card text-center py-12">
        <p className="font-body text-gray-500">{playbook.look.message}</p>
        <Link href="/wardrobe" className="btn-primary-gold mt-4 inline-block">
          Add Wardrobe Items
        </Link>
      </div>
    )
  }

  const outfits = playbook.look.outfits || []
  const upgrades = playbook.look.upgrade_suggestions || []

  return (
    <div className="space-y-6">
      {/* Outfit selector pills */}
      {outfits.length > 1 && (
        <div className="flex gap-2">
          {outfits.map((outfit, i) => (
            <button
              key={i}
              onClick={() => setSelectedOutfit(i)}
              className={`px-4 py-2 rounded-pill text-sm font-body transition-colors ${
                selectedOutfit === i
                  ? 'bg-gold text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gold'
              }`}
            >
              Option {String.fromCharCode(65 + i)}
            </button>
          ))}
        </div>
      )}

      {/* Selected outfit */}
      {outfits[selectedOutfit] && (
        <OutfitCard outfit={outfits[selectedOutfit]} />
      )}

      {/* Upgrade suggestions */}
      {upgrades.length > 0 && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Wardrobe Upgrade Suggestions
          </h3>
          <div className="space-y-3">
            {upgrades.map((upgrade: UpgradeSuggestion, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-cream rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    upgrade.priority === 'high'
                      ? 'bg-gold'
                      : upgrade.priority === 'medium'
                      ? 'bg-amber-400'
                      : 'bg-gray-400'
                  }`}
                />
                <div>
                  <p className="font-body text-sm font-semibold text-charcoal">
                    {upgrade.item}
                  </p>
                  <p className="font-body text-xs text-gray-500 mt-0.5">
                    {upgrade.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OutfitCard({ outfit }: { outfit: Outfit }) {
  return (
    <div className="card">
      <h3 className="font-heading text-h2 text-charcoal mb-4">
        {outfit.title}
      </h3>

      {/* Items */}
      <div className="mb-4">
        <p className="overline mb-2">Outfit Pieces</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {outfit.items?.map((item) => (
            <div
              key={item.id}
              className="bg-cream rounded-lg p-3 text-center group hover:bg-gold/5 transition-colors cursor-pointer relative"
              onClick={() => window.open(`/wardrobe?search=${encodeURIComponent(item.name)}`, '_self')}
              title={`View ${item.name} in wardrobe`}
            >
              <p className="font-body text-sm font-medium text-charcoal truncate">
                {item.name}
              </p>
              {item.category && (
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                  {item.category}
                </p>
              )}
              <p className="font-body text-[9px] text-gold opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                View in wardrobe
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-4">
        <p className="overline mb-1">Why This Works</p>
        <p className="font-body text-sm text-gray-600 leading-relaxed">
          {outfit.reasoning}
        </p>
      </div>

      {/* Styling notes */}
      {outfit.styling_notes && (
        <div className="mb-4">
          <p className="overline mb-1">Styling Notes</p>
          <p className="font-body text-sm text-gray-600 leading-relaxed">
            {outfit.styling_notes}
          </p>
        </div>
      )}

      {/* Accessories */}
      {outfit.accessories && (
        <div className="mb-4">
          <p className="overline mb-1">Accessories</p>
          <p className="font-body text-sm text-gray-600">
            {outfit.accessories}
          </p>
        </div>
      )}

      {/* Risk flags */}
      {outfit.risk_flags && outfit.risk_flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="font-body text-sm text-amber-800">
            <span className="font-semibold">Heads up:</span>{' '}
            {outfit.risk_flags.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── PREP TIMELINE TAB ───

function PrepTab({ playbook }: { playbook: Playbook }) {
  const buildInitialSections = () => [
    { key: 'week_before', label: '1 Week Before', icon: '📅', items: [...(playbook.prep.week_before || [])] },
    { key: 'three_days_before', label: '3 Days Before', icon: '📅', items: [...(playbook.prep.three_days_before || [])] },
    { key: 'day_before', label: 'Day Before', icon: '🌙', items: [...(playbook.prep.day_before || [])] },
    { key: 'morning_of', label: 'Morning Of', icon: '☀️', items: [...(playbook.prep.morning_of || [])] },
    { key: 'just_before', label: 'Just Before', icon: '🚀', items: [...(playbook.prep.just_before || [])] },
    { key: 'pack_list', label: 'Pack List', icon: '🎒', items: [...(playbook.prep.pack_list || playbook.prep.pack || [])] },
  ].filter((s) => s.items.length > 0)

  const [sections, setSections] = useState(buildInitialSections)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newTask, setNewTask] = useState('')

  const handleAddTask = (sectionKey: string) => {
    if (!newTask.trim()) return
    setSections((prev) =>
      prev.map((s) => s.key === sectionKey ? { ...s, items: [...s.items, newTask.trim()] } : s)
    )
    setNewTask('')
    setAddingTo(null)
  }

  const handleDeleteTask = (sectionKey: string, taskIdx: number) => {
    setSections((prev) =>
      prev.map((s) => s.key === sectionKey ? { ...s, items: s.items.filter((_, i) => i !== taskIdx) } : s)
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {sections.map((section, sIdx) => (
          <div key={section.key} className="relative flex gap-4 pb-6 last:pb-0">
            {sIdx < sections.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gray-200" />
            )}
            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center shrink-0 z-10">
              <span className="text-sm">{section.icon}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-body font-semibold text-charcoal text-sm mb-3">
                {section.label}
              </h4>
              <div className="space-y-2">
                {section.items?.map((task: string, tIdx: number) => (
                  <div key={tIdx} className="group flex items-start gap-1">
                    <div className="flex-1">
                      <ChecklistItem label={task} />
                    </div>
                    <button
                      onClick={() => handleDeleteTask(section.key, tIdx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 p-1 text-gray-300 hover:text-red-400"
                      title="Remove task"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {addingTo === section.key ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(section.key)}
                      placeholder="New task..."
                      className="input-field text-sm flex-1 py-1.5"
                      autoFocus
                    />
                    <button onClick={() => handleAddTask(section.key)} className="text-gold text-sm font-semibold">Add</button>
                    <button onClick={() => { setAddingTo(null); setNewTask('') }} className="text-gray-400 text-sm">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(section.key)}
                    className="font-body text-xs text-gray-400 hover:text-gold transition-colors mt-1 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add task
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChecklistItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold accent-gold"
      />
      <span
        className={`font-body text-sm leading-relaxed transition-colors ${
          checked ? 'text-gray-400 line-through' : 'text-gray-600'
        }`}
      >
        {label}
      </span>
    </label>
  )
}

// ─── PRESENCE TAB ───

function PresenceTab({ playbook }: { playbook: Playbook }) {
  const p = playbook.presence

  return (
    <div className="space-y-6">
      {/* Pep Talk (highlight) */}
      {p.pep_talk && (
        <div className="card bg-gradient-to-br from-gold/5 to-cream border-gold/20">
          <p className="overline mb-2 text-gold">Your Pep Talk</p>
          <p className="font-body text-base text-charcoal leading-relaxed italic">
            &ldquo;{p.pep_talk}&rdquo;
          </p>
        </div>
      )}

      {/* Mindset */}
      {p.mindset && p.mindset.length > 0 && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Mindset
          </h3>
          <ul className="space-y-3">
            {p.mindset.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-body font-bold text-gold">
                    {i + 1}
                  </span>
                </div>
                <p className="font-body text-sm text-gray-600 leading-relaxed">
                  {tip}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Body Language */}
      {p.body_language && p.body_language.length > 0 && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Body Language
          </h3>
          <ul className="space-y-3">
            {p.body_language.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2 shrink-0" />
                <p className="font-body text-sm text-gray-600 leading-relaxed">
                  {tip}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conversation */}
      {p.conversation && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Conversation Guide
          </h3>
          <div className="space-y-5">
            {p.conversation.openers && p.conversation.openers.length > 0 && (
              <div>
                <p className="overline mb-2">Openers</p>
                <div className="space-y-2">
                  {p.conversation.openers.map((line: string, i: number) => (
                    <p
                      key={i}
                      className="font-body text-sm text-gray-600 italic bg-cream rounded-lg p-3"
                    >
                      &ldquo;{line}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            )}

            {p.conversation.topics_to_discuss &&
              p.conversation.topics_to_discuss.length > 0 && (
                <div>
                  <p className="overline mb-2">Topics to Explore</p>
                  <ul className="space-y-1">
                    {p.conversation.topics_to_discuss.map(
                      (topic: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 font-body text-sm text-gray-600"
                        >
                          <span className="text-gold mt-0.5">•</span>
                          {topic}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {p.conversation.graceful_exits &&
              p.conversation.graceful_exits.length > 0 && (
                <div>
                  <p className="overline mb-2">Graceful Exits</p>
                  <div className="space-y-2">
                    {p.conversation.graceful_exits.map(
                      (line: string, i: number) => (
                        <p
                          key={i}
                          className="font-body text-sm text-gray-600 italic bg-cream rounded-lg p-3"
                        >
                          &ldquo;{line}&rdquo;
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Fallback for old format */}
      {p.tips && p.tips.length > 0 && !p.mindset && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Confidence Tips
          </h3>
          <ul className="space-y-3">
            {p.tips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2 shrink-0" />
                <span className="font-body text-sm text-gray-600">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── BEAUTY TAB ───

function BeautyTab({ playbook }: { playbook: Playbook }) {
  const b = playbook.beauty

  return (
    <div className="space-y-6">
      {/* Skin Prep */}
      {b.skin_prep && b.skin_prep.length > 0 && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Skin Prep
          </h3>
          <ol className="space-y-3">
            {b.skin_prep.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-body font-bold text-gold">
                    {i + 1}
                  </span>
                </div>
                <p className="font-body text-sm text-gray-600 leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Hair & Fragrance side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {b.hair && (
          <div className="card">
            <h3 className="font-heading text-h3 text-charcoal mb-3">Hair</h3>
            <p className="font-body text-sm text-gray-600 leading-relaxed">
              {b.hair}
            </p>
          </div>
        )}
        {b.fragrance && (
          <div className="card">
            <h3 className="font-heading text-h3 text-charcoal mb-3">
              Fragrance
            </h3>
            <p className="font-body text-sm text-gray-600 leading-relaxed">
              {b.fragrance}
            </p>
          </div>
        )}
      </div>

      {/* Grooming Notes */}
      {b.grooming_notes && b.grooming_notes.length > 0 && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Grooming Checklist
          </h3>
          <ul className="space-y-2">
            {b.grooming_notes.map((note: string, i: number) => (
              <ChecklistItem key={i} label={note} />
            ))}
          </ul>
        </div>
      )}

      {/* Fallback for old format */}
      {b.notes && b.notes.length > 0 && !b.skin_prep && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-4">
            Beauty Notes
          </h3>
          <ul className="space-y-3">
            {b.notes.map((note: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2 shrink-0" />
                <span className="font-body text-sm text-gray-600">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
