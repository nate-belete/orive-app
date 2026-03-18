'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import OriveLogo from '@/app/components/OriveLogo'
import { useAuth } from '@/lib/auth/AuthContext'
import { authApi, closetApi, colourApi } from '@/lib/api/client'
import ProtectedRoute from '@/lib/auth/ProtectedRoute'

const BODY_TYPES = [
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'triangle', label: 'Triangle (Pear)' },
  { value: 'inverted_triangle', label: 'Inverted Triangle' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'round', label: 'Round (Apple)' },
]

const OCCASION_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'interview', label: 'Job Interview' },
  { value: 'date', label: 'Date' },
  { value: 'meeting', label: 'Business Meeting' },
  { value: 'dinner', label: 'Dinner Party' },
  { value: 'party', label: 'Party' },
  { value: 'conference', label: 'Conference' },
  { value: 'networking', label: 'Networking' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'other', label: 'Other' },
]

const TOTAL_STEPS = 7

const STEP_LABELS = [
  'The Basics',
  'Body Profile',
  'Style Preferences',
  'Full Body Photo',
  'Your Wardrobe',
  'Colour Analysis',
  'First Occasion',
]

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Basics
  const [gender, setGender] = useState(user?.gender || '')
  const [dob, setDob] = useState(user?.date_of_birth || '')
  const [postcode, setPostcode] = useState(user?.postcode || '')

  // Step 2: Body Profile
  const [useImperial, setUseImperial] = useState(false)
  const [heightCm, setHeightCm] = useState(user?.height_cm?.toString() || '')
  const [weightKg, setWeightKg] = useState(user?.weight_kg?.toString() || '')
  const [bodyType, setBodyType] = useState(user?.body_type || '')

  // Step 3: Style Preferences
  const [styleGoTos, setStyleGoTos] = useState(user?.style_go_tos || '')
  const [styleNoGoes, setStyleNoGoes] = useState(user?.style_no_goes || '')
  const [styleCantWear, setStyleCantWear] = useState(user?.style_cant_wear || '')

  // Step 4: Body Photo
  const [bodyPhotoFile, setBodyPhotoFile] = useState<File | null>(null)
  const [bodyPhotoPreview, setBodyPhotoPreview] = useState<string | null>(null)
  const [bodyPhotoUploaded, setBodyPhotoUploaded] = useState(!!user?.body_photo_path)
  const bodyFileRef = useRef<HTMLInputElement>(null)

  // Step 5: Wardrobe
  const [wardrobeFiles, setWardrobeFiles] = useState<File[]>([])
  const [wardrobePreviews, setWardrobePreviews] = useState<string[]>([])
  const [wardrobeUploading, setWardrobeUploading] = useState(false)
  const [wardrobeUploaded, setWardrobeUploaded] = useState(0)
  const wardrobeFileRef = useRef<HTMLInputElement>(null)

  // Step 6: Face Photo + Colour Analysis
  const [facePhotoFile, setFacePhotoFile] = useState<File | null>(null)
  const [facePhotoPreview, setFacePhotoPreview] = useState<string | null>(null)
  const [analysisStage, setAnalysisStage] = useState<number>(0) // 0=idle, 1=facial, 2=hair, 3=done
  const [analysisResult, setAnalysisResult] = useState<string | null>(user?.colour_season || null)
  const faceFileRef = useRef<HTMLInputElement>(null)

  // Step 7: First Occasion
  const [occasionName, setOccasionName] = useState('')
  const [occasionType, setOccasionType] = useState('')
  const [occasionDate, setOccasionDate] = useState('')

  const handleBodyPhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBodyPhotoFile(file)
    setBodyPhotoPreview(URL.createObjectURL(file))
  }, [])

  const handleWardrobeFilesSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setWardrobeFiles((prev) => [...prev, ...files])
    setWardrobePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }, [])

  const removeWardrobeFile = useCallback((index: number) => {
    setWardrobeFiles((prev) => prev.filter((_, i) => i !== index))
    setWardrobePreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleFacePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFacePhotoFile(file)
    setFacePhotoPreview(URL.createObjectURL(file))
    setAnalysisResult(null)
    setAnalysisStage(0)
  }, [])

  const handleNext = async () => {
    setError('')
    setSaving(true)

    try {
      if (step === 1) {
        await authApi.updateProfile({
          gender: gender || undefined,
          date_of_birth: dob || undefined,
          postcode: postcode || undefined,
        })
        setStep(2)
      } else if (step === 2) {
        await authApi.updateProfile({
          height_cm: heightCm ? parseFloat(heightCm) : undefined,
          weight_kg: weightKg ? parseFloat(weightKg) : undefined,
          body_type: bodyType || undefined,
        })
        setStep(3)
      } else if (step === 3) {
        await authApi.updateProfile({
          style_go_tos: styleGoTos || undefined,
          style_no_goes: styleNoGoes || undefined,
          style_cant_wear: styleCantWear || undefined,
        })
        setStep(4)
      } else if (step === 4) {
        // Upload body photo if selected
        if (bodyPhotoFile) {
          await authApi.uploadBodyPhoto(bodyPhotoFile)
          setBodyPhotoUploaded(true)
        }
        setStep(5)
      } else if (step === 5) {
        // Upload wardrobe items
        if (wardrobeFiles.length > 0) {
          setWardrobeUploading(true)
          let uploaded = 0
          for (const file of wardrobeFiles) {
            try {
              await closetApi.create({}, file)
              uploaded++
              setWardrobeUploaded(uploaded)
            } catch {
              // Continue with remaining files
            }
          }
          setWardrobeUploading(false)
        }
        setStep(6)
      } else if (step === 6) {
        // Upload face photo and run colour analysis
        if (facePhotoFile && !analysisResult) {
          setAnalysisStage(1)
          // Simulate staged progress while real analysis runs
          const timer1 = setTimeout(() => setAnalysisStage(2), 2000)
          try {
            const result = await colourApi.analyse(facePhotoFile)
            clearTimeout(timer1)
            setAnalysisStage(3)
            setAnalysisResult(result.season)
            await refreshUser()
          } catch (err: any) {
            clearTimeout(timer1)
            setAnalysisStage(0)
            setError('Colour analysis failed. You can try again or skip for now.')
            setSaving(false)
            return
          }
        }
        setStep(7)
      } else if (step === 7) {
        // Create first occasion if filled
        if (occasionName && occasionType && occasionDate) {
          const { occasionsApi } = await import('@/lib/api/client')
          await occasionsApi.create({
            name: occasionName,
            occasion_type: occasionType,
            datetime_local: new Date(occasionDate).toISOString(),
          })
        }
        // Complete onboarding
        await authApi.completeOnboarding()
        await refreshUser()
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    setSaving(true)
    try {
      await authApi.completeOnboarding()
      await refreshUser()
      router.push('/dashboard')
    } catch {
      setError('Failed to skip. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const canSkipStep = step >= 4 // Photos and beyond are optional

  const getButtonLabel = () => {
    if (saving && step === 5 && wardrobeUploading) {
      return `Uploading ${wardrobeUploaded}/${wardrobeFiles.length}...`
    }
    if (saving && step === 6 && analysisStage > 0 && analysisStage < 3) {
      return 'Analysing...'
    }
    if (saving) return 'Saving...'
    if (step === TOTAL_STEPS) return 'Complete Setup'
    return 'Continue'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="max-w-onboarding w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <OriveLogo size="lg" className="mb-6 inline-block" />
            <h1 className="font-heading text-h2 text-charcoal mb-2">
              Let&apos;s get to know you
            </h1>
            <p className="font-body text-sm text-gray-500">
              Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < step ? 'bg-gold' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="card p-8">
            {/* Step 1: The Basics */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <p className="overline mb-4">The Basics</p>
                </div>

                <div>
                  <label className="input-label">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Female', 'Male', 'Non-binary'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g.toLowerCase().replace('-', '_'))}
                        className={`py-3 px-4 rounded-lg border text-sm font-body transition-colors ${
                          gender === g.toLowerCase().replace('-', '_')
                            ? 'border-gold bg-gold/5 text-charcoal font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="dob" className="input-label">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={dob}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                    onChange={(e) => setDob(e.target.value)}
                    className="input-field"
                  />
                  {dob && (() => {
                    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    if (age < 16) return <p className="font-body text-xs text-red-500 mt-1">You must be at least 16 years old</p>
                    if (age > 120) return <p className="font-body text-xs text-red-500 mt-1">Please enter a valid date of birth</p>
                    return null
                  })()}
                </div>

                <div>
                  <label htmlFor="postcode" className="input-label">
                    Postcode / ZIP
                  </label>
                  <input
                    id="postcode"
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="input-field"
                    placeholder="e.g. 2000"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Body Profile */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="overline">Body Profile</p>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (useImperial && heightCm) {
                          // already stored as cm, no conversion needed for display
                        }
                        setUseImperial(false)
                      }}
                      className={`px-3 py-1 text-xs font-body rounded-md transition-colors ${!useImperial ? 'bg-white text-charcoal shadow-sm font-semibold' : 'text-gray-500'}`}
                    >
                      Metric
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseImperial(true)}
                      className={`px-3 py-1 text-xs font-body rounded-md transition-colors ${useImperial ? 'bg-white text-charcoal shadow-sm font-semibold' : 'text-gray-500'}`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!useImperial ? (
                    <>
                      <div>
                        <label htmlFor="height" className="input-label">
                          Height (cm)
                        </label>
                        <input
                          id="height"
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          className="input-field"
                          placeholder="e.g. 165"
                        />
                      </div>
                      <div>
                        <label htmlFor="weight" className="input-label">
                          Weight (kg)
                        </label>
                        <input
                          id="weight"
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          className="input-field"
                          placeholder="e.g. 62"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="heightFt" className="input-label">
                          Height (ft &amp; in)
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="heightFt"
                            type="number"
                            value={heightCm ? Math.floor(parseFloat(heightCm) / 30.48).toString() : ''}
                            onChange={(e) => {
                              const ft = parseInt(e.target.value) || 0
                              const currentIn = heightCm ? Math.round((parseFloat(heightCm) / 2.54) % 12) : 0
                              setHeightCm(((ft * 12 + currentIn) * 2.54).toFixed(1))
                            }}
                            className="input-field flex-1"
                            placeholder="ft"
                            min="0"
                            max="8"
                          />
                          <input
                            type="number"
                            value={heightCm ? Math.round((parseFloat(heightCm) / 2.54) % 12).toString() : ''}
                            onChange={(e) => {
                              const inches = parseInt(e.target.value) || 0
                              const currentFt = heightCm ? Math.floor(parseFloat(heightCm) / 30.48) : 0
                              setHeightCm(((currentFt * 12 + inches) * 2.54).toFixed(1))
                            }}
                            className="input-field flex-1"
                            placeholder="in"
                            min="0"
                            max="11"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="weightLbs" className="input-label">
                          Weight (lbs)
                        </label>
                        <input
                          id="weightLbs"
                          type="number"
                          value={weightKg ? Math.round(parseFloat(weightKg) * 2.205).toString() : ''}
                          onChange={(e) => {
                            const lbs = parseFloat(e.target.value) || 0
                            setWeightKg((lbs / 2.205).toFixed(1))
                          }}
                          className="input-field"
                          placeholder="e.g. 137"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="input-label">Body Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BODY_TYPES.map((bt) => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => setBodyType(bt.value)}
                        className={`py-3 px-4 rounded-lg border text-sm font-body transition-colors ${
                          bodyType === bt.value
                            ? 'border-gold bg-gold/5 text-charcoal font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Style Preferences */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <p className="overline mb-4">Style Preferences</p>
                </div>

                <div>
                  <label htmlFor="gotos" className="input-label">
                    Style go-to&apos;s (what you love wearing)
                  </label>
                  <textarea
                    id="gotos"
                    value={styleGoTos}
                    onChange={(e) => setStyleGoTos(e.target.value)}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="e.g. Tailored blazers, midi skirts, neutral tones..."
                  />
                </div>

                <div>
                  <label htmlFor="nogoes" className="input-label">
                    Style no-go&apos;s (what you avoid)
                  </label>
                  <textarea
                    id="nogoes"
                    value={styleNoGoes}
                    onChange={(e) => setStyleNoGoes(e.target.value)}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="e.g. Neon colours, crop tops, overly casual..."
                  />
                </div>

                <div>
                  <label htmlFor="cantwear" className="input-label">
                    Can&apos;t wear (restrictions)
                  </label>
                  <textarea
                    id="cantwear"
                    value={styleCantWear}
                    onChange={(e) => setStyleCantWear(e.target.value)}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="e.g. High heels due to injury, certain fabrics..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Full Body Photo */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <p className="overline mb-4">Full Body Photo</p>
                  <p className="text-sm text-gray-500 mb-2">
                    This helps us generate accurate virtual try-ons of your outfits.
                  </p>
                </div>

                {/* Photo guidance */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">Photo tips for best results:</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Stand upright, facing directly at the camera
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Use natural lighting — avoid harsh shadows
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Ensure your full body is visible in the frame
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Clean, neutral background works best
                    </li>
                  </ul>
                </div>

                {bodyPhotoPreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-48 h-64 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={bodyPhotoPreview}
                        alt="Body photo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBodyPhotoFile(null)
                        setBodyPhotoPreview(null)
                        bodyFileRef.current?.click()
                      }}
                      className="text-sm text-gold hover:text-gold/80 font-medium"
                    >
                      Choose a different photo
                    </button>
                  </div>
                ) : bodyPhotoUploaded ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Body photo already uploaded</p>
                    <button
                      type="button"
                      onClick={() => bodyFileRef.current?.click()}
                      className="text-sm text-gold hover:text-gold/80 font-medium mt-2"
                    >
                      Upload a new one
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => bodyFileRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-gold/50 hover:bg-gold/5 transition-colors flex flex-col items-center gap-3"
                  >
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">
                      Upload a full-length photo of yourself
                    </span>
                    <span className="text-xs text-gray-400">JPEG, PNG or WebP</span>
                  </button>
                )}

                <input
                  ref={bodyFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBodyPhotoSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Step 5: Wardrobe Upload */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <p className="overline mb-4">Your Wardrobe</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload photos of your clothing items. Our AI will automatically tag each piece.
                    Start with 5–10 items you wear most.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">Photo tips:</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Lay each item flat on a neutral background
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Good lighting with no harsh shadows
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      One item per photo works best
                    </li>
                  </ul>
                </div>

                {/* Preview grid */}
                {wardrobePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {wardrobePreviews.map((src, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={src} alt={`Item ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeWardrobeFile(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove item ${i + 1}`}
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {/* Add more button */}
                    <button
                      type="button"
                      onClick={() => wardrobeFileRef.current?.click()}
                      className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-colors flex flex-col items-center justify-center gap-1"
                    >
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="text-xs text-gray-400">Add more</span>
                    </button>
                  </div>
                )}

                {wardrobePreviews.length === 0 && (
                  <button
                    type="button"
                    onClick={() => wardrobeFileRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-gold/50 hover:bg-gold/5 transition-colors flex flex-col items-center gap-3"
                  >
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">
                      Select photos of your clothing items
                    </span>
                    <span className="text-xs text-gray-400">You can select multiple files at once</span>
                  </button>
                )}

                {wardrobeUploaded > 0 && (
                  <p className="text-sm text-green-600 text-center">
                    {wardrobeUploaded} item{wardrobeUploaded !== 1 ? 's' : ''} uploaded successfully
                  </p>
                )}

                <input
                  ref={wardrobeFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleWardrobeFilesSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Step 6: Face Photo + Colour Analysis */}
            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <p className="overline mb-4">Colour Analysis</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload a clear photo of your face and we&apos;ll analyse your natural colouring
                    to recommend your most flattering colours.
                  </p>
                </div>

                {/* Privacy notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    We&apos;ll use your photo to analyse your natural colouring to recommend flattering colours.
                    Your photo is securely stored and never shared.
                  </p>
                </div>

                {/* Photo guidance */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">For best results:</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Remove glasses and hair accessories
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Natural lighting — no filters or flash
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Neutral expression, looking directly at camera
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      Clean camera lens
                    </li>
                  </ul>
                </div>

                {/* Analysis progress */}
                {analysisStage > 0 && analysisStage < 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${analysisStage >= 1 ? 'bg-gold' : 'bg-gray-200'}`}>
                        {analysisStage > 1 ? (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className={`text-sm ${analysisStage === 1 ? 'text-charcoal font-medium' : 'text-gray-500'}`}>
                        Analysing facial features...
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${analysisStage >= 2 ? 'bg-gold' : 'bg-gray-200'}`}>
                        {analysisStage > 2 ? (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : analysisStage === 2 ? (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        )}
                      </div>
                      <span className={`text-sm ${analysisStage === 2 ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
                        Analysing hair colour...
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      </div>
                      <span className="text-sm text-gray-400">Generating your palette...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-gold h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${(analysisStage / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Analysis result */}
                {analysisResult && analysisStage === 3 && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-heading text-charcoal mb-1">Analysis complete!</p>
                    <p className="text-sm text-gray-600">
                      Your colour season: <span className="font-semibold text-gold">{analysisResult}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      View your full palette on the Colour Analysis page after setup
                    </p>
                  </div>
                )}

                {/* Already analysed */}
                {analysisResult && analysisStage === 0 && !facePhotoPreview && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Colour analysis already done — <span className="font-semibold text-gold">{analysisResult}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => faceFileRef.current?.click()}
                      className="text-sm text-gold hover:text-gold/80 font-medium mt-2"
                    >
                      Re-analyse with a new photo
                    </button>
                  </div>
                )}

                {/* Upload area */}
                {!analysisResult && analysisStage === 0 && (
                  <>
                    {facePhotoPreview ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={facePhotoPreview}
                            alt="Face photo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFacePhotoFile(null)
                            setFacePhotoPreview(null)
                            faceFileRef.current?.click()
                          }}
                          className="text-sm text-gold hover:text-gold/80 font-medium"
                        >
                          Choose a different photo
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => faceFileRef.current?.click()}
                        className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-gold/50 hover:bg-gold/5 transition-colors flex flex-col items-center gap-3"
                      >
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">
                          Upload a photo of your face
                        </span>
                        <span className="text-xs text-gray-400">Clear, front-facing, no filters</span>
                      </button>
                    )}
                  </>
                )}

                <input
                  ref={faceFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFacePhotoSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Step 7: First Occasion */}
            {step === 7 && (
              <div className="space-y-5">
                <div>
                  <p className="overline mb-4">Your First Occasion</p>
                  <p className="text-sm text-gray-500 mb-2">
                    What&apos;s coming up? Tell us about an upcoming event and we&apos;ll
                    create a personalised playbook to get you ready.
                  </p>
                </div>

                <div>
                  <label htmlFor="occasion-name" className="input-label">
                    What&apos;s the occasion?
                  </label>
                  <input
                    id="occasion-name"
                    type="text"
                    value={occasionName}
                    onChange={(e) => setOccasionName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Sarah's Wedding, Client Presentation"
                  />
                </div>

                <div>
                  <label className="input-label">Occasion type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {OCCASION_TYPES.map((ot) => (
                      <button
                        key={ot.value}
                        type="button"
                        onClick={() => setOccasionType(ot.value)}
                        className={`py-2.5 px-3 rounded-lg border text-sm font-body transition-colors ${
                          occasionType === ot.value
                            ? 'border-gold bg-gold/5 text-charcoal font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {ot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="occasion-date" className="input-label">
                    When is it?
                  </label>
                  <input
                    id="occasion-date"
                    type="datetime-local"
                    value={occasionDate}
                    onChange={(e) => setOccasionDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <p className="text-xs text-gray-400 text-center">
                  You can add more details later from the Occasions page
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setStep(step - 1); setError('') }}
                  className="btn-outline"
                  disabled={saving}
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {canSkipStep && (
                <button
                  type="button"
                  onClick={() => {
                    if (step < TOTAL_STEPS) {
                      setStep(step + 1)
                      setError('')
                    } else {
                      handleSkip()
                    }
                  }}
                  disabled={saving}
                  className="font-body text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {step < TOTAL_STEPS ? 'Skip' : 'Skip for now'}
                </button>
              )}
              {!canSkipStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saving}
                  className="font-body text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip for now
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="btn-primary-gold disabled:opacity-50"
              >
                {getButtonLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
