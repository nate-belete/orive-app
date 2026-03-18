'use client'

import { useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { useAuth } from '@/lib/auth/AuthContext'
import { authApi } from '@/lib/api/client'
import type { UserUpdate } from '@/lib/api/types'

const BODY_TYPES = [
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'inverted_triangle', label: 'Inverted Triangle' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'round', label: 'Round' },
]

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [activeSection, setActiveSection] = useState<'profile' | 'style' | 'account'>('profile')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    gender: user?.gender || '',
    date_of_birth: user?.date_of_birth || '',
    postcode: user?.postcode || '',
    height_cm: user?.height_cm || '',
    weight_kg: user?.weight_kg || '',
    body_type: user?.body_type || '',
    style_go_tos: user?.style_go_tos || '',
    style_no_goes: user?.style_no_goes || '',
    style_cant_wear: user?.style_cant_wear || '',
  })

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const data: UserUpdate = {
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        full_name: form.first_name && form.last_name ? `${form.first_name} ${form.last_name}` : form.full_name || undefined,
        gender: form.gender || undefined,
        date_of_birth: form.date_of_birth || undefined,
        postcode: form.postcode || undefined,
        height_cm: form.height_cm ? Number(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
        body_type: form.body_type || undefined,
        style_go_tos: form.style_go_tos || undefined,
        style_no_goes: form.style_no_goes || undefined,
        style_cant_wear: form.style_cant_wear || undefined,
      }
      await authApi.updateProfile(data)
      await refreshUser()
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    { key: 'profile' as const, label: 'Profile' },
    { key: 'style' as const, label: 'Style Preferences' },
    { key: 'account' as const, label: 'Account' },
  ]

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-h1 text-charcoal">Settings</h1>
          <p className="font-body text-gray-500 mt-1">
            Manage your profile and preferences
          </p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-card">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-body font-medium transition-colors ${
                activeSection === s.key
                  ? 'bg-charcoal text-white'
                  : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Profile section */}
        {activeSection === 'profile' && (
          <div className="card space-y-5">
            <h2 className="font-heading text-h3 text-charcoal">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="input-field"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="input-field"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="input-label">Date of Birth</label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Postcode / ZIP</label>
                <input
                  type="text"
                  value={form.postcode}
                  onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 10001"
                />
              </div>
            </div>

            <h3 className="font-heading text-h3 text-charcoal pt-4">
              Body Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Height (cm)</label>
                <input
                  type="number"
                  value={form.height_cm}
                  onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                  className="input-field"
                  placeholder="175"
                />
              </div>
              <div>
                <label className="input-label">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                  className="input-field"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="input-label">Body Type</label>
                <select
                  value={form.body_type}
                  onChange={(e) => setForm({ ...form, body_type: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select...</option>
                  {BODY_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colour Season (read-only) */}
            {user?.colour_season && (
              <div className="pt-4">
                <label className="input-label">Colour Season</label>
                <div className="flex items-center gap-3">
                  <span className="font-body text-sm text-charcoal font-medium">
                    {user.colour_season}
                  </span>
                  <a
                    href="/colour-analysis"
                    className="font-body text-xs text-gold hover:underline"
                  >
                    View palette &rarr;
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary-gold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Style Preferences section */}
        {activeSection === 'style' && (
          <div className="card space-y-5">
            <h2 className="font-heading text-h3 text-charcoal">
              Style Preferences
            </h2>
            <p className="font-body text-sm text-gray-500">
              These help our AI make better outfit and styling recommendations.
            </p>
            <div>
              <label className="input-label">Style Go-Tos</label>
              <textarea
                value={form.style_go_tos}
                onChange={(e) => setForm({ ...form, style_go_tos: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                placeholder="What do you always feel great in? e.g. well-fitted blazers, high-waisted trousers, classic white shirts..."
              />
            </div>
            <div>
              <label className="input-label">Style No-Goes</label>
              <textarea
                value={form.style_no_goes}
                onChange={(e) => setForm({ ...form, style_no_goes: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                placeholder="What do you avoid? e.g. skinny jeans, neon colours, overly casual looks..."
              />
            </div>
            <div>
              <label className="input-label">Can&apos;t Wear</label>
              <textarea
                value={form.style_cant_wear}
                onChange={(e) => setForm({ ...form, style_cant_wear: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                placeholder="Physical constraints or preferences? e.g. no heels over 2 inches, nothing too tight around waist..."
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary-gold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Account section */}
        {activeSection === 'account' && (
          <div className="space-y-4">
            <div className="card space-y-3">
              <h2 className="font-heading text-h3 text-charcoal">Account</h2>
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <span className="text-gray-400">Email</span>
                  <p className="text-charcoal">{user?.email}</p>
                </div>
                <div>
                  <span className="text-gray-400">Member since</span>
                  <p className="text-charcoal">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card space-y-3">
              <h2 className="font-heading text-h3 text-charcoal">
                Notifications
              </h2>
              <p className="font-body text-sm text-gray-500">
                Notification preferences will be available in a future update.
                Currently, all important updates are shown in-app.
              </p>
            </div>

            <div className="card space-y-3">
              <h2 className="font-heading text-h3 text-charcoal">Password</h2>
              <p className="font-body text-sm text-gray-500">
                To change your password, use the password reset flow.
              </p>
              <a
                href="/forgot-password"
                className="btn-outline text-sm inline-block"
              >
                Reset Password
              </a>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
