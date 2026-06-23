import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { createBusiness, updateBusiness } from '@/lib/db'
import { generateWebsite as generateWebsiteFromAI } from '@/lib/ai'
import { ArrowRight, Sparkles, Phone, MessageCircle } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────
interface Collected {
  businessName?: string
  category?: string
  description?: string
  phone?: string
  whatsapp?: string
  building?: string
  floorUnit?: string
  address?: string
  hours?: string
}

// ── Steps ──────────────────────────────────────────────────────
// "building" and "floorUnit" are optional steps with a "Skip" option,
// handled separately in the component alongside the WhatsApp "same as" step
const STEPS = [
  {
    field: 'businessName',
    question: "What's your business name?",
    placeholder: 'e.g. Mama Grace Salon',
    hint: 'Just type the name your customers know you by.',
    type: 'text',
    icon: null,
  },
  {
    field: 'description',
    question: 'What does your business offer?',
    placeholder: 'e.g. We do hair styling, braiding and manicures. Walk-ins welcome daily.',
    hint: 'Describe it like you would tell a friend on WhatsApp.',
    type: 'textarea',
    icon: null,
  },
  {
    field: 'building',
    question: 'Are you inside a mall or office complex?',
    placeholder: 'e.g. Yaya Centre, Sarit Centre',
    hint: 'Optional — only fill this if you operate inside a building with a name. Skip if you have a standalone shop.',
    type: 'text',
    icon: null,
    optional: true,
  },
  {
    field: 'floorUnit',
    question: 'What floor and shop/unit number?',
    placeholder: 'e.g. 2nd Floor, Shop 24',
    hint: "Optional — helps customers find your exact unit once they arrive. We'll show this next to your location.",
    type: 'text',
    icon: null,
    optional: true,
  },
  {
    field: 'address',
    question: 'What area or street are you on?',
    placeholder: 'e.g. Tom Mboya Street, Nairobi CBD',
    hint: 'Your customers need to know the general area to find you.',
    type: 'text',
    icon: null,
  },
  {
    field: 'phone',
    question: 'What number should customers call?',
    placeholder: '0712 345 678',
    hint: 'This is the number for phone calls — it will appear as a tap-to-call button on your website.',
    type: 'tel',
    icon: 'phone',
  },
  {
    field: 'whatsapp',
    question: 'What is your WhatsApp number?',
    placeholder: '0790 123 456',
    hint: 'Customers will tap this to message you directly on WhatsApp. Can be different from your call number.',
    type: 'tel',
    icon: 'whatsapp',
  },
  {
    field: 'hours',
    question: 'What are your working hours?',
    placeholder: 'e.g. Mon–Sat 8am–7pm',
    hint: "Not sure yet? Just type 'flexible' and you can update it later.",
    type: 'text',
    icon: null,
  },
]

// ── Category detection ─────────────────────────────────────────
function detectCategory(description: string): string {
  const d = description.toLowerCase()
  if (d.match(/hair|salon|beauty|nail|braid|barber|spa/)) return 'salon'
  if (d.match(/food|restaurant|cafe|pizza|burger|chicken|nyama|mkahawa/)) return 'food'
  if (d.match(/clinic|hospital|doctor|health|pharmacy|dawa|medical/)) return 'clinic'
  if (d.match(/school|college|training|tutor|class|education/)) return 'school'
  if (d.match(/transport|matatu|taxi|delivery|courier|logistics/)) return 'transport'
  if (d.match(/build|construction|contractor|plumb|electric|fundi/)) return 'construction'
  if (d.match(/farm|agriculture|produce|vegetable|fruit|maize|kilimo/)) return 'agriculture'
  if (d.match(/tech|software|app|website|computer|digital/)) return 'tech'
  if (d.match(/shop|store|retail|sell|duka|clothes|shoes|fashion/)) return 'retail'
  return 'other'
}

export default function OnboardingPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [value, setValue] = useState('')
  const [collected, setCollected] = useState<Collected>({})
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildStatus, setBuildStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const currentStep = STEPS[step]
  const isWhatsAppStep = currentStep.field === 'whatsapp'
  const isOptionalStep = !!currentStep.optional

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [step])

  function goNext(next: Collected) {
    setCollected(next)
    setValue('')
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      build(next)
    }
  }

  async function handleNext() {
    const val = value.trim()
    if (!val) return

    const next: Collected = { ...collected, [currentStep.field]: val }
    if (currentStep.field === 'description') next.category = detectCategory(val)
    goNext(next)
  }

  // Skip an optional step (building / floorUnit)
  function handleSkip() {
    const next: Collected = { ...collected, [currentStep.field]: '' }
    goNext(next)
  }

  // "Same as call number" shortcut on WhatsApp step
  function handleSameAsPhone() {
    const next: Collected = { ...collected, whatsapp: collected.phone || '' }
    goNext(next)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  async function build(data: Collected) {
    setIsBuilding(true)
    setError(null)
    setBuildStatus('Saving your business details...')

    try {
      const { data: biz, error: err } = await createBusiness({
        name: data.businessName || '',
        category: data.category || 'other',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || data.phone || '',
        address: data.address || '',
        building: data.building || undefined,
        floorUnit: data.floorUnit || undefined,
        hours: data.hours,
      })

      if (err || !biz) throw new Error('Could not save')

      setBuildStatus('AI is designing your website...')
      const html = await generateWebsiteFromAI({
        id: biz.id,
        name: data.businessName || '',
        category: data.category || 'other',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || data.phone || '',
        address: data.address || '',
        building: data.building || undefined,
        floorUnit: data.floorUnit || undefined,
        hours: data.hours,
      })

      setBuildStatus('Almost done...')
      await updateBusiness(biz.id, { generated_html: html } as any)

      setIsBuilding(false)
      setDone(true)

    } catch {
      setIsBuilding(false)
      setBuildStatus('')
      setError('Something went wrong. Please try again.')
    }
  }

  // ── Theme ────────────────────────────────────────────────────
  const bg = isDark ? '#0D0D12' : '#FFFFFF'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#666' : '#8E8E93'
  const inputBorder = isDark ? '#2A2A2A' : '#E5E5E5'
  const inputBg = isDark ? '#1A1A1A' : '#FFFFFF'
  const inputFocus = '#008060'
  const accent = '#008060'

  // ── Building / Done screen ────────────────────────────────────
  if (isBuilding || done) {
    return (
      <div style={{
        minHeight: '100vh', background: bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'DM Sans', sans-serif",
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          animation: isBuilding ? 'pulse 2s ease infinite' : 'none',
        }}>
          <Sparkles size={28} color="white" />
        </div>

        {done ? (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, marginBottom: 8, letterSpacing: '-0.4px' }}>
              Your website is live! 🎉
            </h2>
            <p style={{ fontSize: 14, color: textMuted, marginBottom: 32, lineHeight: 1.6 }}>
              Your professional website has been built and is ready to share with customers.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '14px 32px', borderRadius: 10,
                border: 'none', background: accent,
                color: 'white', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Go to my dashboard <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 8, letterSpacing: '-0.4px' }}>
              Building your website...
            </h2>
            <p style={{ fontSize: 14, color: textMuted, marginBottom: 20 }}>
              {buildStatus}
            </p>
            <div style={{
              width: 200, height: 3, borderRadius: 2,
              background: isDark ? '#2A2A2A' : '#E5E5E5',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: accent,
                animation: 'loading 2s ease infinite',
              }} />
            </div>
            <p style={{ fontSize: 12, color: textMuted, marginTop: 12 }}>
              This takes about 30 seconds — please don't close this tab
            </p>
          </>
        )}

        <style>{`
          @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
          @keyframes loading { 0%{width:0%} 70%{width:85%} 100%{width:90%} }
        `}</style>
      </div>
    )
  }

  // ── Main onboarding ──────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 14 }}>O</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary, letterSpacing: '-0.3px' }}>OfliX</span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i < step
                  ? accent
                  : i === step
                    ? isDark ? '#2A2A2A' : '#E5E5E5'
                    : isDark ? '#1A1A1A' : '#F0F0F0',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Step counter */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, color: accent, fontWeight: 600,
          background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5',
          border: `1px solid ${isDark ? 'rgba(0,128,96,0.2)' : '#B3D9CC'}`,
          padding: '4px 10px', borderRadius: 20,
          marginBottom: 20,
        }}>
          <Sparkles size={11} />
          Step {step + 1} of {STEPS.length}
        </div>

        {/* Icon for phone/whatsapp steps */}
        {currentStep.icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: currentStep.icon === 'whatsapp'
              ? 'rgba(37,211,102,0.1)'
              : 'rgba(0,128,96,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            {currentStep.icon === 'whatsapp'
              ? <MessageCircle size={22} color="#25D366" />
              : <Phone size={22} color={accent} />
            }
          </div>
        )}

        {/* Question */}
        <h1 style={{
          fontSize: 26, fontWeight: 700,
          color: textPrimary,
          letterSpacing: '-0.4px',
          lineHeight: 1.3,
          marginBottom: 8,
        }}>
          {currentStep.question}
        </h1>

        <p style={{
          fontSize: 14, color: textMuted,
          marginBottom: 28, lineHeight: 1.6,
        }}>
          {currentStep.hint}
        </p>

        {/* WhatsApp step — show "Same as call number" shortcut */}
        {isWhatsAppStep && collected.phone && (
          <button
            onClick={handleSameAsPhone}
            style={{
              width: '100%', padding: '13px 16px',
              borderRadius: 10, marginBottom: 12,
              border: `1.5px dashed ${isDark ? '#2A2A2A' : '#B3D9CC'}`,
              background: isDark ? 'rgba(0,128,96,0.05)' : '#F1F8F5',
              color: accent, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={16} color="#25D366" />
              <span>Same as call number</span>
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700,
              background: isDark ? 'rgba(0,128,96,0.15)' : 'rgba(0,128,96,0.1)',
              padding: '3px 10px', borderRadius: 20,
              color: accent,
            }}>
              {collected.phone}
            </span>
          </button>
        )}

        {/* Divider when showing "same as" option */}
        {isWhatsAppStep && collected.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: isDark ? '#2A2A2A' : '#E5E5E5' }} />
            <span style={{ fontSize: 12, color: textMuted }}>or enter a different number</span>
            <div style={{ flex: 1, height: 1, background: isDark ? '#2A2A2A' : '#E5E5E5' }} />
          </div>
        )}

        {/* Input */}
        {currentStep.type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentStep.placeholder}
            rows={4}
            style={{
              width: '100%', padding: '14px 16px',
              borderRadius: 10,
              border: `1.5px solid ${inputBorder}`,
              background: inputBg,
              color: textPrimary,
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              resize: 'none',
              lineHeight: 1.6,
              marginBottom: 16,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = inputFocus}
            onBlur={e => e.target.style.borderColor = inputBorder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={currentStep.type === 'tel' ? 'tel' : 'text'}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentStep.placeholder}
            style={{
              width: '100%', padding: '14px 16px',
              borderRadius: 10,
              border: `1.5px solid ${inputBorder}`,
              background: inputBg,
              color: textPrimary,
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              marginBottom: 16,
              transition: 'border-color 0.2s',
              display: 'block',
            }}
            onFocus={e => e.target.style.borderColor = inputFocus}
            onBlur={e => e.target.style.borderColor = inputBorder}
          />
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,69,58,0.08)',
            border: '1px solid rgba(255,69,58,0.2)',
            fontSize: 13, color: '#FF453A',
            marginBottom: 14,
          }}>
            {error}
          </div>
        )}

        {/* Continue / Skip buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleNext}
            disabled={!value.trim()}
            style={{
              flex: 1, padding: '14px',
              borderRadius: 10, border: 'none',
              background: value.trim() ? accent : (isDark ? '#1A1A1A' : '#F0F0F0'),
              color: value.trim() ? 'white' : textMuted,
              fontSize: 15, fontWeight: 600,
              cursor: value.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {step === STEPS.length - 1 ? 'Build my website' : 'Continue'}
            <ArrowRight size={16} />
          </button>

          {isOptionalStep && (
            <button
              onClick={handleSkip}
              style={{
                padding: '14px 20px',
                borderRadius: 10,
                border: `1.5px solid ${inputBorder}`,
                background: 'transparent',
                color: textMuted,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              Skip
            </button>
          )}
        </div>

        <p style={{ fontSize: 12, color: textMuted, textAlign: 'center', marginTop: 14 }}>
          Press Enter to continue
        </p>

      </div>
    </div>
  )
}