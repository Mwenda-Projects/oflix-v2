import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { createBusiness, updateBusiness } from '@/lib/db'
import { ArrowRight, Sparkles } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────
interface Collected {
  businessName?: string
  category?: string
  description?: string
  phone?: string
  whatsapp?: string
  address?: string
  hours?: string
}

// ── Steps ──────────────────────────────────────────────────────
const STEPS = [
  {
    field: 'businessName',
    question: "What's your business name?",
    placeholder: 'e.g. Mama Grace Salon',
    hint: 'Just type the name your customers know you by.',
  },
  {
    field: 'description',
    question: 'What does your business offer?',
    placeholder: 'e.g. We do hair styling, braiding and manicures. Walk-ins welcome daily.',
    hint: 'Describe it like you would tell a friend on WhatsApp.',
    multiline: true,
  },
  {
    field: 'address',
    question: 'Where are you located?',
    placeholder: 'e.g. Tom Mboya Street, Nairobi CBD',
    hint: 'Your customers need to know where to find you.',
  },
  {
    field: 'phone',
    question: 'What number should customers call or WhatsApp?',
    placeholder: '0712 345 678',
    hint: 'This will appear on your website as a tap-to-call button.',
  },
  {
    field: 'hours',
    question: 'What are your working hours?',
    placeholder: 'e.g. Mon–Sat 8am–7pm',
    hint: "Not sure yet? Just type \"open\" and you can update it later.",
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

// ── AI generation ─────────────────────────────────────────────
async function generateWebsite(business: Collected): Promise<string> {
  const styles: Record<string, string> = {
    food: 'warm and appetising — deep amber, cream, forest green. Hero, menu highlights, hours, WhatsApp order button.',
    salon: 'elegant and luxurious — rose gold, soft blush, charcoal. Hero, services list, hours, WhatsApp booking button.',
    clinic: 'clean and trustworthy — white, calm blue, soft green. Hero, services, hours, WhatsApp appointment button.',
    retail: 'bold and modern — vibrant accent on white. Hero, products, hours, WhatsApp inquiry button.',
    school: 'inspiring and professional — navy, gold, white. Hero, courses, WhatsApp enrollment button.',
    transport: 'strong and reliable — dark navy, orange accent. Hero, routes/services, WhatsApp booking button.',
    construction: 'industrial and trustworthy — dark grey, yellow. Hero, services, WhatsApp quote button.',
    agriculture: 'natural and earthy — green, brown, cream. Hero, products, WhatsApp order button.',
    tech: 'modern and minimal — dark background, electric blue. Hero, services, WhatsApp button.',
    other: 'clean and professional — white with a bold colour accent. Hero, about, services, WhatsApp button.',
  }
  const cat = business.category || 'other'
  const style = styles[cat] || styles.other
  const num = (business.phone || '').replace(/\D/g, '').replace(/^0/, '254')
  const waLink = `https://wa.me/${num}`

  const prompt = `You are a world-class web designer. Build a complete, stunning, mobile-first single-page website for a real Nairobi business.

BUSINESS DETAILS:
- Name: ${business.businessName}
- Type: ${cat}
- Description: ${business.description}
- Phone: ${business.phone}
- WhatsApp: ${waLink}
- Address: ${business.address}${business.hours ? `\n- Hours: ${business.hours}` : ''}

DESIGN DIRECTION: ${style}

STRICT RULES:
1. Return ONLY raw HTML. No markdown. No backticks. No explanation.
2. Complete single file: <html>, <head> with Google Fonts, all CSS in <style>, all JS in <script>.
3. Mobile-first. Looks perfect on a phone.
4. Use EXACT business details above — no placeholders ever.
5. WhatsApp button: ${waLink}
6. Phone link: tel:${business.phone}
7. Minimum 4 sections: Hero, Services/About, Contact, Call-to-action.
8. Smooth scroll and subtle CSS animations.
9. Small "Powered by OfliX" footer linking to https://oflix.co.ke
10. Must look like a KES 80,000 website — premium, unique, not a template.`

  const response = await fetch('https://oflix-v2.vercel.app/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Generation failed')
  }

  const data = await response.json()
  const html = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
  if (!html) throw new Error('No website returned')
  return html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim()
}

// ── Component ──────────────────────────────────────────────────
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

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [step])

  async function handleNext() {
    const val = value.trim()
    if (!val) return

    const next: Collected = { ...collected, [currentStep.field]: val }
    if (currentStep.field === 'description') next.category = detectCategory(val)
    if (currentStep.field === 'phone') next.whatsapp = val
    setCollected(next)
    setValue('')

    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      await build(next)
    }
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
        hours: data.hours,
      })

      if (err || !biz) throw new Error('Could not save')

      setBuildStatus('AI is designing your website...')
      const html = await generateWebsite(data)

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

  // ── Building screen ──────────────────────────────────────────
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
            {/* Progress bar */}
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

        {/* Input */}
        {currentStep.multiline ? (
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
            type={currentStep.field === 'phone' ? 'tel' : 'text'}
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

        {/* Continue button */}
        <button
          onClick={handleNext}
          disabled={!value.trim()}
          style={{
            width: '100%', padding: '14px',
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

        <p style={{ fontSize: 12, color: textMuted, textAlign: 'center', marginTop: 14 }}>
          Press Enter to continue
        </p>

      </div>
    </div>
  )
}