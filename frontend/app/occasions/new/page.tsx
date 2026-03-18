'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/app/components/AppShell'
import { useCreateOccasion } from '@/lib/api/hooks'

const OCCASION_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'interview', label: 'Job Interview' },
  { value: 'date', label: 'Date' },
  { value: 'meeting', label: 'Business Meeting' },
  { value: 'dinner', label: 'Dinner Party' },
  { value: 'party', label: 'Party' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'conference', label: 'Conference' },
  { value: 'funeral', label: 'Funeral' },
  { value: 'holiday', label: 'Holiday Event' },
  { value: 'networking', label: 'Networking' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'photoshoot', label: 'Photoshoot' },
  { value: 'other', label: 'Other' },
]

const DRESS_CODES = [
  'Casual',
  'Smart Casual',
  'Business Casual',
  'Business Formal',
  'Cocktail',
  'Semi-Formal',
  'Black Tie',
  'White Tie',
]

const ROLES = [
  { value: 'guest', label: 'Guest' },
  { value: 'host', label: 'Host' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'interviewee', label: 'Interviewee' },
  { value: 'attendee', label: 'Attendee' },
  { value: 'participant', label: 'Participant' },
  { value: 'other', label: 'Other' },
]

const COMFORT_LEVELS = [
  { value: 'minimal', label: 'Minimal', desc: 'Beauty is pain — I want to look incredible' },
  { value: 'medium', label: 'Balanced', desc: 'Stylish but still comfortable' },
  { value: 'maximum', label: 'Maximum', desc: 'Comfort first — I need to feel at ease' },
]

const DESIRED_OUTCOMES = [
  'Authoritative', 'Warm', 'Elegant', 'Cool / Creative',
  'Understated', 'Confident', 'Professional', 'Approachable',
  'Powerful', 'Relaxed', 'Sophisticated', 'Bold',
]

export default function NewOccasionPage() {
  const router = useRouter()
  const createMutation = useCreateOccasion()
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    name: '',
    occasion_type: '',
    datetime_local: '',
    end_datetime: '',
    location: '',
    venue: '',
    description: '',
    dress_code: '',
    comfort: 'medium',
    desired_outcome: '',
    budget: 0,
    weather_hint: '',
    importance: 3,
    attendees: '',
    role: '',
  })

  const handleSubmit = async () => {
    setError('')
    try {
      const payload: any = {
        ...form,
        datetime_local: new Date(form.datetime_local).toISOString(),
      }
      if (form.end_datetime) {
        payload.end_datetime = new Date(form.end_datetime).toISOString()
      } else {
        delete payload.end_datetime
      }
      if (!form.budget) delete payload.budget
      const occasion = await createMutation.mutateAsync(payload)
      router.push(`/occasions/${occasion.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create occasion')
    }
  }

  const canProceed = () => {
    if (step === 1) return form.occasion_type && form.datetime_local
    if (step === 2) return true
    return true
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="font-heading text-h1 text-charcoal mb-2">
          New Occasion
        </h1>
        <p className="font-body text-gray-500 mb-6">
          Tell us about your event and we&apos;ll create a personalised playbook
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-semibold transition-colors ${
                  s === step
                    ? 'bg-gold text-white'
                    : s < step
                    ? 'bg-gold/20 text-gold cursor-pointer'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </button>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${s < step ? 'bg-gold/30' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
          <span className="ml-2 font-body text-xs text-gray-400">
            {step === 1 ? 'The Basics' : step === 2 ? 'Details' : 'Final Touches'}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="input-label">What&apos;s the occasion? *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OCCASION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, occasion_type: type.value })}
                    className={`py-2.5 px-4 rounded-lg border text-sm font-body transition-colors ${
                      form.occasion_type === type.value
                        ? 'border-gold bg-gold/5 text-charcoal font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Give it a name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Sarah's Wedding, Q3 Review..."
              />
              <p className="font-body text-xs text-gray-400 mt-1">
                Optional — we&apos;ll generate one if you skip this
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">When? *</label>
                <input
                  type="datetime-local"
                  value={form.datetime_local}
                  onChange={(e) => setForm({ ...form, datetime_local: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Ends at</label>
                <input
                  type="datetime-local"
                  value={form.end_datetime}
                  onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g. London, NYC, outdoor garden"
                />
              </div>
              <div>
                <label className="input-label">Venue</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  className="input-field"
                  placeholder="e.g. The Ritz, Central Park"
                />
              </div>
            </div>

            {/* Venue Type */}
            <div>
              <label className="input-label">Venue Type</label>
              <div className="flex gap-3">
                {['Indoor', 'Outdoor', 'Mixed'].map((vt) => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => setForm({ ...form, weather_hint: form.weather_hint?.includes(vt.toLowerCase()) ? form.weather_hint : `${vt.toLowerCase()}${form.weather_hint ? ` — ${form.weather_hint}` : ''}` })}
                    className={`px-4 py-2 rounded-lg border text-sm font-body transition-colors ${
                      form.weather_hint?.toLowerCase().startsWith(vt.toLowerCase())
                        ? 'border-gold bg-gold/5 text-charcoal font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="input-label">Dress code</label>
              <div className="flex flex-wrap gap-2">
                {DRESS_CODES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, dress_code: code.toLowerCase().replace(/ /g, '_') })
                    }
                    className={`py-2 px-4 rounded-pill text-sm font-body transition-colors ${
                      form.dress_code === code.toLowerCase().replace(/ /g, '_')
                        ? 'bg-charcoal text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Your role</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`py-2 px-4 rounded-pill text-sm font-body transition-colors ${
                      form.role === r.value
                        ? 'bg-charcoal text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">
                How important is this? ({form.importance}/5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, importance: n })}
                    className={`w-10 h-10 rounded-lg border text-sm font-body font-semibold transition-colors ${
                      form.importance >= n
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="font-body text-xs text-gray-400 mt-1">
                Higher importance = longer prep timeline in your playbook
              </p>
            </div>

            <div>
              <label className="input-label">Who&apos;ll be there?</label>
              <textarea
                value={form.attendees}
                onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                className="input-field min-h-[60px] resize-none"
                placeholder="e.g. Colleagues, close friends, partner's family..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Outfit budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-body text-sm">$</span>
                  <input
                    type="number"
                    value={form.budget || ''}
                    onChange={(e) => setForm({ ...form, budget: parseInt(e.target.value) || 0 })}
                    className="input-field pl-7"
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Weather hint</label>
                <input
                  type="text"
                  value={form.weather_hint}
                  onChange={(e) => setForm({ ...form, weather_hint: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Hot & humid, rain expected"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Final Touches */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="input-label">How do you want to feel?</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DESIRED_OUTCOMES.map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => {
                      const current = form.desired_outcome
                      const lower = outcome.toLowerCase()
                      if (current.includes(lower)) {
                        setForm({
                          ...form,
                          desired_outcome: current
                            .replace(lower, '')
                            .replace(/,\s*,/, ',')
                            .replace(/^,\s*|,\s*$/g, '')
                            .trim(),
                        })
                      } else {
                        setForm({
                          ...form,
                          desired_outcome: current
                            ? `${current}, ${lower}`
                            : lower,
                        })
                      }
                    }}
                    className={`py-2 px-4 rounded-pill text-sm font-body transition-colors ${
                      form.desired_outcome.includes(outcome.toLowerCase())
                        ? 'bg-gold/10 border border-gold text-gold font-semibold'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
              <textarea
                value={form.desired_outcome
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => !DESIRED_OUTCOMES.map((o) => o.toLowerCase()).includes(s))
                  .join(', ')}
                onChange={(e) => {
                  const chips = form.desired_outcome
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => DESIRED_OUTCOMES.map((o) => o.toLowerCase()).includes(s))
                  const custom = e.target.value
                  const all = custom ? [...chips, custom].join(', ') : chips.join(', ')
                  setForm({ ...form, desired_outcome: all })
                }}
                className="input-field min-h-[60px] resize-none"
                placeholder="Personal goals — e.g. 'Impress investors', 'Feel like myself'..."
              />
            </div>

            <div>
              <label className="input-label">Comfort level</label>
              <div className="space-y-2">
                {COMFORT_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      form.comfort === level.value
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="comfort"
                      value={level.value}
                      checked={form.comfort === level.value}
                      onChange={(e) => setForm({ ...form, comfort: e.target.value })}
                      className="text-gold focus:ring-gold mt-0.5"
                    />
                    <div>
                      <span className="font-body text-sm font-semibold text-charcoal">
                        {level.label}
                      </span>
                      <p className="font-body text-xs text-gray-400 mt-0.5">
                        {level.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Anything else we should know?</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                placeholder="e.g. It's an outdoor event, I'll be standing all day, my ex will be there..."
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-between pt-8 border-t border-gray-100 mt-8">
          <button
            type="button"
            onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
            className="btn-outline"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex gap-3">
            {step < 3 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary-gold disabled:opacity-50"
              >
                Continue
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createMutation.isPending || !form.occasion_type || !form.datetime_local}
                className="btn-primary-gold disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Occasion'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
