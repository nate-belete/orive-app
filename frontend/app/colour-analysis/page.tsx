'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import AppShell from '@/app/components/AppShell'
import Loading from '@/app/components/Loading'
import { useAuth } from '@/lib/auth/AuthContext'
import { useClosetItems } from '@/lib/api/hooks'
import { colourApi } from '@/lib/api/client'
import { API_BASE_URL } from '@/lib/api/client'
import type { ColourAnalysisResult, ColourSwatch } from '@/lib/api/types'
import { matchColourToPalette, getMatchDisplay, type ColourMatch } from '@/lib/colour-match'

export default function ColourAnalysisPage() {
  const { user, refreshUser } = useAuth()
  const [result, setResult] = useState<ColourAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingResults, setLoadingResults] = useState(true)
  const [error, setError] = useState('')
  const [analysisStage, setAnalysisStage] = useState(0) // 0=idle, 1=facial, 2=hair, 3=palette, 4=done
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing results on mount
  useEffect(() => {
    if (user?.colour_season) {
      colourApi
        .getResults()
        .then((data) => setResult(data))
        .catch(() => {})
        .finally(() => setLoadingResults(false))
    } else {
      setLoadingResults(false)
    }
  }, [user?.colour_season])

  const handleUpload = async (file: File) => {
    setError('')
    setLoading(true)
    setAnalysisStage(1)
    const t1 = setTimeout(() => setAnalysisStage(2), 2500)
    const t2 = setTimeout(() => setAnalysisStage(3), 5000)
    try {
      const data = await colourApi.analyse(file)
      clearTimeout(t1)
      clearTimeout(t2)
      setAnalysisStage(4)
      setResult(data)
      await refreshUser()
      setTimeout(() => { setLoading(false); setAnalysisStage(0) }, 1500)
    } catch (err: any) {
      clearTimeout(t1)
      clearTimeout(t2)
      setAnalysisStage(0)
      setError(
        err?.response?.data?.detail || 'Analysis failed. Please try again.'
      )
      setLoading(false)
    }
  }

  const handleRetake = async (file?: File) => {
    setError('')
    setLoading(true)
    setAnalysisStage(1)
    const t1 = setTimeout(() => setAnalysisStage(2), 2500)
    const t2 = setTimeout(() => setAnalysisStage(3), 5000)
    try {
      const data = file
        ? await colourApi.analyse(file)
        : await colourApi.reanalyse()
      clearTimeout(t1)
      clearTimeout(t2)
      setAnalysisStage(4)
      setResult(data)
      await refreshUser()
      setTimeout(() => { setLoading(false); setAnalysisStage(0) }, 1500)
    } catch (err: any) {
      clearTimeout(t1)
      clearTimeout(t2)
      setAnalysisStage(0)
      setError(
        err?.response?.data?.detail || 'Re-analysis failed. Please try again.'
      )
      setLoading(false)
    }
  }

  if (loadingResults) {
    return (
      <AppShell>
        <Loading />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-h1 text-charcoal">
            Colour Analysis
          </h1>
          <p className="font-body text-gray-500 mt-1">
            {result
              ? 'Your personalised colour palette'
              : 'Discover your seasonal colour palette'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card py-16 max-w-lg mx-auto">
            <h2 className="font-heading text-h3 text-charcoal mb-8 text-center">
              Analysing your colouring...
            </h2>
            <div className="space-y-4 mb-8">
              <AnalysisStep stage={1} current={analysisStage} label="Analysing facial features" />
              <AnalysisStep stage={2} current={analysisStage} label="Analysing hair colour" />
              <AnalysisStep stage={3} current={analysisStage} label="Generating your palette" />
              <AnalysisStep stage={4} current={analysisStage} label="Analysis complete" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gold h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(analysisStage / 4) * 100}%` }}
              />
            </div>
            {analysisStage === 4 && (
              <p className="text-center font-body text-sm text-green-600 mt-4 font-medium">
                Your palette is ready!
              </p>
            )}
          </div>
        ) : result ? (
          <ColourResults
            result={result}
            onRetake={() => fileInputRef.current?.click()}
          />
        ) : (
          <UploadPrompt onUpload={handleUpload} />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              result ? handleRetake(file) : handleUpload(file)
            }
            e.target.value = ''
          }}
        />
      </div>
    </AppShell>
  )
}

// --- Analysis Step Indicator ---

function AnalysisStep({ stage, current, label }: { stage: number; current: number; label: string }) {
  const done = current > stage
  const active = current === stage

  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
        done ? 'bg-green-500' : active ? 'bg-gold' : 'bg-gray-200'
      }`}>
        {done ? (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
        ) : (
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
        )}
      </div>
      <span className={`font-body text-sm transition-colors ${
        done ? 'text-green-600 font-medium' : active ? 'text-charcoal font-medium' : 'text-gray-400'
      }`}>
        {label}{active ? '...' : ''}
      </span>
    </div>
  )
}

// --- Upload Prompt ---

function UploadPrompt({ onUpload }: { onUpload: (file: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center py-12">
        <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
            />
          </svg>
        </div>
        <h2 className="font-heading text-h2 text-charcoal mb-3">
          Find Your Perfect Palette
        </h2>
        <p className="font-body text-gray-500 mb-8 max-w-md mx-auto">
          Upload a clear photo of your face and our AI will determine your
          seasonal colour profile — identifying the shades that make you glow.
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-primary-gold text-base px-8 py-3.5"
        >
          Upload Face Photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />

        {/* Privacy notice */}
        <p className="font-body text-xs text-gray-400 mt-4 max-w-sm mx-auto">
          We&apos;ll use your photo to analyse your natural colouring to recommend
          flattering colours. Your photo is securely stored and never shared.
        </p>
      </div>

      {/* Tips */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Natural Light',
            desc: 'Face a window or go outdoors. Avoid overhead fluorescent lighting.',
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            ),
          },
          {
            title: 'No Makeup',
            desc: 'Remove makeup if possible, or keep it minimal and natural.',
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            ),
          },
          {
            title: 'Face Forward',
            desc: 'Look directly at the camera. Include your hair and shoulders.',
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
            ),
          },
        ].map((tip) => (
          <div key={tip.title} className="card p-5 text-center">
            <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-5 h-5 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {tip.icon}
              </svg>
            </div>
            <h3 className="font-body font-semibold text-charcoal text-sm mb-1">
              {tip.title}
            </h3>
            <p className="font-body text-xs text-gray-400">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Results Display ---

function ColourResults({
  result,
  onRetake,
}: {
  result: ColourAnalysisResult
  onRetake: () => void
}) {
  const palette = result.palette
  const faceUrl = result.face_photo_url
    ? `${API_BASE_URL}${result.face_photo_url}`
    : null
  const { data: wardrobeItems } = useClosetItems()

  const wardrobeStats = useMemo(() => {
    if (!wardrobeItems || !palette) return null
    const stats = { great: 0, avoid: 0, neutral: 0, unknown: 0 }
    for (const item of wardrobeItems) {
      const match = matchColourToPalette(item.color, palette)
      stats[match]++
    }
    const total = wardrobeItems.length
    return { ...stats, total }
  }, [wardrobeItems, palette])

  return (
    <div className="space-y-8">
      {/* Season Header */}
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Face photo */}
          {faceUrl && (
            <div className="w-full md:w-48 lg:w-56 bg-grey-bg shrink-0">
              <img
                src={faceUrl}
                alt="Your face photo"
                className="w-full h-full object-cover md:aspect-auto aspect-square"
              />
            </div>
          )}
          {/* Season info */}
          <div className="flex-1 p-6 lg:p-8">
            <p className="overline mb-2">Your Season</p>
            <h2 className="font-heading text-hero text-charcoal mb-3">
              {palette.season}
            </h2>
            <p className="font-body text-gray-600 leading-relaxed mb-4">
              {palette.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-body">
              <div>
                <span className="text-gray-400">Undertone:</span>{' '}
                <span className="text-charcoal font-medium capitalize">
                  {palette.characteristics?.skin_undertone}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Eyes:</span>{' '}
                <span className="text-charcoal font-medium capitalize">
                  {palette.characteristics?.eye_colour}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Hair:</span>{' '}
                <span className="text-charcoal font-medium capitalize">
                  {palette.characteristics?.hair_colour}
                </span>
              </div>
            </div>
            <button
              onClick={onRetake}
              className="btn-outline text-xs mt-5"
            >
              Retake Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Best Colours */}
      <div>
        <h3 className="font-heading text-h3 text-charcoal mb-4">
          Your Best Colours
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
          {palette.best_colours?.map((swatch: ColourSwatch, i: number) => (
            <SwatchCard key={i} swatch={swatch} />
          ))}
        </div>
      </div>

      {/* Best Neutrals */}
      <div>
        <h3 className="font-heading text-h3 text-charcoal mb-4">
          Your Best Neutrals
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
          {palette.best_neutrals?.map((swatch: ColourSwatch, i: number) => (
            <SwatchCard key={i} swatch={swatch} size="lg" />
          ))}
        </div>
      </div>

      {/* Colours to Avoid */}
      <div>
        <h3 className="font-heading text-h3 text-charcoal mb-4">
          Colours to Avoid
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
          {palette.avoid_colours?.map((swatch: ColourSwatch, i: number) => (
            <SwatchCard key={i} swatch={swatch} size="lg" muted />
          ))}
        </div>
      </div>

      {/* Styling Tips */}
      <div className="card">
        <h3 className="font-heading text-h3 text-charcoal mb-5">
          Styling Tips for {palette.season}
        </h3>
        <ul className="space-y-4">
          {palette.styling_tips?.map((tip: string, i: number) => (
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

      {/* Why These Colours Work — Education Module (FR-CA-03) */}
      <ColourEducation season={palette.season} characteristics={palette.characteristics} />

      {/* Wardrobe Harmony */}
      {wardrobeStats && wardrobeStats.total > 0 && (
        <div className="card">
          <h3 className="font-heading text-h3 text-charcoal mb-2">
            Wardrobe Harmony
          </h3>
          <p className="font-body text-sm text-gray-500 mb-6">
            How your current wardrobe aligns with your{' '}
            <span className="font-medium text-charcoal">{palette.season}</span>{' '}
            palette
          </p>

          {/* Stats bar */}
          <div className="flex rounded-full overflow-hidden h-3 mb-4">
            {wardrobeStats.great > 0 && (
              <div
                className="bg-emerald-400 transition-all"
                style={{
                  width: `${(wardrobeStats.great / wardrobeStats.total) * 100}%`,
                }}
              />
            )}
            {wardrobeStats.neutral > 0 && (
              <div
                className="bg-gray-300 transition-all"
                style={{
                  width: `${(wardrobeStats.neutral / wardrobeStats.total) * 100}%`,
                }}
              />
            )}
            {wardrobeStats.unknown > 0 && (
              <div
                className="bg-gray-100 transition-all"
                style={{
                  width: `${(wardrobeStats.unknown / wardrobeStats.total) * 100}%`,
                }}
              />
            )}
            {wardrobeStats.avoid > 0 && (
              <div
                className="bg-red-300 transition-all"
                style={{
                  width: `${(wardrobeStats.avoid / wardrobeStats.total) * 100}%`,
                }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'In Palette',
                count: wardrobeStats.great,
                dot: 'bg-emerald-400',
              },
              {
                label: 'Universal Neutrals',
                count: wardrobeStats.neutral,
                dot: 'bg-gray-400',
              },
              {
                label: 'Unmatched',
                count: wardrobeStats.unknown,
                dot: 'bg-gray-200',
              },
              {
                label: 'Off Palette',
                count: wardrobeStats.avoid,
                dot: 'bg-red-400',
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${stat.dot}`} />
                <div>
                  <span className="font-body text-sm font-semibold text-charcoal">
                    {stat.count}
                  </span>{' '}
                  <span className="font-body text-xs text-gray-500">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Harmony score */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-body text-sm text-gray-500">Harmony Score</p>
              <p className="font-heading text-h2 text-charcoal">
                {Math.round(
                  ((wardrobeStats.great + wardrobeStats.neutral) /
                    wardrobeStats.total) *
                    100
                )}
                %
              </p>
            </div>
            <a
              href="/wardrobe"
              className="btn-outline text-xs"
            >
              View Wardrobe
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Swatch Card ---

function SwatchCard({
  swatch,
  size = 'sm',
  muted = false,
}: {
  swatch: ColourSwatch
  size?: 'sm' | 'lg'
  muted?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(swatch.hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className={`group text-center ${muted ? 'opacity-60' : ''}`}
      title={`${swatch.name} (${swatch.hex}) — click to copy`}
    >
      <div
        className={`rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow ${
          size === 'lg' ? 'aspect-square' : 'aspect-square'
        }`}
        style={{ backgroundColor: swatch.hex }}
      />
      <p className="font-body text-[10px] text-gray-500 mt-1.5 truncate">
        {copied ? 'Copied!' : swatch.name}
      </p>
    </button>
  )
}

const SEASON_EDUCATION: Record<string, { why: string; theory: string; tips: string[] }> = {
  'spring': {
    why: "Spring colouring features warm undertones with a light, fresh quality. Your natural warmth and brightness mean colours that are clear and warm will enhance your natural glow.",
    theory: "Spring is one of the warm seasons in colour theory. Your skin, hair, and eyes share a golden or peachy undertone. Light-to-medium depth colours with warm clarity harmonise with your natural colouring.",
    tips: ["Warm, clear colours make your skin look vibrant", "Muted or very dark colours can make you look washed out", "Gold jewellery tends to flatter more than silver"],
  },
  'summer': {
    why: "Summer colouring has cool, muted undertones. Your natural colouring is soft and gentle, so colours that are cool and slightly greyed will create a harmonious, elegant look.",
    theory: "Summer is a cool season with a soft quality. Your skin has blue or pink undertones, and your overall contrast is low-to-medium. Dusty, muted cool tones complement this natural softness.",
    tips: ["Soft, cool tones enhance your complexion", "Very bright or warm colours can overpower your natural delicacy", "Silver and rose gold jewellery harmonise beautifully"],
  },
  'autumn': {
    why: "Autumn colouring is warm and rich with deep, earthy undertones. Your natural warmth and depth mean colours that are warm, muted, and grounded will bring out the richness in your features.",
    theory: "Autumn is a warm season with a muted, deep quality. Your skin has golden or olive undertones, and your colouring has a natural warmth and earthiness. Rich, warm tones in medium-to-deep depths are your sweet spot.",
    tips: ["Earth tones and warm jewel tones are naturally flattering", "Stark cool colours like icy blue can clash with your warmth", "Bronze, copper, and gold accessories complement beautifully"],
  },
  'winter': {
    why: "Winter colouring is cool and vivid with high contrast. Your natural depth and clarity mean colours that are bold, clear, and cool will create striking, powerful looks.",
    theory: "Winter is a cool season with a bright, high-contrast quality. The contrast between your skin, hair, and eyes is dramatic. Bold, pure colours — either very dark or very bright — match this natural intensity.",
    tips: ["Bold, clear colours create a powerful statement", "Muted or earthy tones can make you look tired", "Silver, platinum, and white gold are your best metal choices"],
  },
}

function ColourEducation({ season, characteristics }: { season: string; characteristics: { skin_undertone: string; eye_colour: string; hair_colour: string } }) {
  const [expanded, setExpanded] = useState(false)
  const baseSeason = season.toLowerCase().split(' ').pop() || 'autumn'
  const edu = SEASON_EDUCATION[baseSeason] || SEASON_EDUCATION['autumn']

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-heading text-h3 text-charcoal">
          Why These Colours Work for You
        </h3>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </button>
      {expanded && (
        <div className="mt-5 space-y-5">
          <div>
            <p className="font-body text-sm text-gray-700 leading-relaxed">{edu.why}</p>
          </div>
          <div className="bg-cream/50 rounded-lg p-4">
            <p className="font-body text-xs font-semibold text-gold uppercase tracking-wider mb-2">Colour Theory</p>
            <p className="font-body text-sm text-gray-600 leading-relaxed">{edu.theory}</p>
          </div>
          <div>
            <p className="font-body text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Your Natural Colouring</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mb-1">Undertone</p>
                <p className="font-body text-sm text-charcoal capitalize">{characteristics.skin_undertone}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mb-1">Eyes</p>
                <p className="font-body text-sm text-charcoal capitalize">{characteristics.eye_colour}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mb-1">Hair</p>
                <p className="font-body text-sm text-charcoal capitalize">{characteristics.hair_colour}</p>
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {edu.tips.map((tip, i) => (
              <li key={i} className="font-body text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gold mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
