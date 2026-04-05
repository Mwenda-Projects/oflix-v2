import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { createBusiness, updateBusiness } from '@/lib/db'
import { Send, Sparkles } from 'lucide-react'

interface Message {
  id: string
  from: 'ai' | 'user'
  text: string
}

interface Collected {
  businessName?: string
  category?: string
  description?: string
  phone?: string
  whatsapp?: string
  address?: string
  hours?: string
}

const STEPS = [
  {
    field: 'businessName',
    ask: (lang: string) => lang === 'sw'
      ? 'Habari! 👋 Mimi ni msaidizi wako wa OfliX. Jina la biashara yako ni nini?'
      : "Hi there! 👋 I'm your OfliX assistant. Let's get your business online in 2 minutes. What's your business name?",
  },
  {
    field: 'description',
    ask: (_: string, d: Collected) =>
      `Nice name! 🎉 What does ${d.businessName} sell or offer? Just describe it like you'd tell a friend on WhatsApp.`,
  },
  {
    field: 'address',
    ask: (_: string, d: Collected) =>
      `Got it! Where is ${d.businessName} located? For example: "Tom Mboya Street, Nairobi CBD" or "Westlands, near Sarit Centre"`,
  },
  {
    field: 'phone',
    ask: () =>
      `What phone number should customers call or WhatsApp you on?`,
  },
  {
    field: 'hours',
    ask: () =>
      `Last one! ✨ What are your working hours? e.g. "Mon–Sat 8am–7pm" — or just type "skip" if you're flexible.`,
  },
]

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
- Address: ${business.address}${business.hours && business.hours !== 'skip' ? `\n- Hours: ${business.hours}` : ''}

DESIGN DIRECTION: ${style}

STRICT RULES:
1. Return ONLY raw HTML. No markdown. No backticks. No explanation.
2. Complete single file: <html>, <head> with Google Fonts, all CSS in <style>, all JS in <script>.
3. Mobile-first. Looks perfect on a phone.
4. Use the EXACT business details above — no placeholders ever.
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

export default function OnboardingPage() {
  const { isDark } = useTheme()
  const { language } = useLanguage()
  const navigate = useNavigate()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(0)
  const [collected, setCollected] = useState<Collected>({})
  const [isTyping, setIsTyping] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => sendAI(STEPS[0].ask(language, {})), 700)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, isBuilding])

  function sendAI(text: string) {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { id: Date.now().toString(), from: 'ai', text }])
      setTimeout(() => inputRef.current?.focus(), 100)
    }, 800 + Math.random() * 500)
  }

  async function handleSend() {
    const val = input.trim()
    if (!val || isTyping || isBuilding) return
    setInput('')

    setMessages(prev => [...prev, { id: Date.now().toString(), from: 'user', text: val }])

    const field = STEPS[step].field
    const next: Collected = { ...collected, [field]: val }
    if (field === 'description') next.category = detectCategory(val)
    if (field === 'phone') next.whatsapp = val
    setCollected(next)

    const nextStep = step + 1
    if (nextStep < STEPS.length) {
      setStep(nextStep)
      setTimeout(() => sendAI(STEPS[nextStep].ask(language, next)), 400)
    } else {
      setStep(nextStep)
      setTimeout(() => build(next), 400)
    }
  }

  async function build(data: Collected) {
    setIsBuilding(true)
    setError(null)
    sendAI(`Perfect! I have everything I need. 🚀 Building your website now — give me about 30 seconds...`)

    try {
      const { data: biz, error: err } = await createBusiness({
        name: data.businessName || '',
        category: data.category || 'other',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || data.phone || '',
        address: data.address || '',
        hours: data.hours !== 'skip' ? data.hours : undefined,
      })

      if (err || !biz) throw new Error('Could not save')

      const html = await generateWebsite(data)
      await updateBusiness(biz.id, { generated_html: html } as any)

      setIsBuilding(false)
      setDone(true)
      setTimeout(() => sendAI(`Your website is LIVE! 🎉 Go to your dashboard to view and share it with customers.`), 300)

    } catch {
      setIsBuilding(false)
      setError('Something went wrong.')
      setTimeout(() => sendAI(`Hmm, something went wrong. Tap "Try again" below.`), 300)
    }
  }

  const bg = isDark ? '#0D0D12' : '#ECE5DD'
  const surface = isDark ? '#1A1B22' : '#FFFFFF'
  const aiBg = isDark ? '#1E2028' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#555' : '#8E8E93'

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        height: '88vh', maxHeight: 720,
        background: surface,
        borderRadius: 20,
        border: `1px solid ${border}`,
        boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Header — WhatsApp style */}
        <div style={{
          padding: '14px 18px',
          background: '#008060',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>OfliX Assistant</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
              {isBuilding ? 'Building your website...' : 'Online'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 14px 8px',
          display: 'flex', flexDirection: 'column', gap: 6,
          background: isDark ? '#0D0D12' : '#ECE5DD',
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '78%',
                padding: '9px 13px',
                borderRadius: msg.from === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                background: msg.from === 'user' ? '#DCF8C6' : aiBg,
                color: msg.from === 'user' ? '#1A1A1A' : textPrimary,
                fontSize: 14, lineHeight: 1.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}>
                {msg.text}
                <div style={{ fontSize: 10, color: textMuted, marginTop: 3, textAlign: 'right' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing dots */}
          {isTyping && (
            <div style={{ display: 'flex' }}>
              <div style={{
                padding: '10px 16px', borderRadius: '4px 16px 16px 16px',
                background: aiBg, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: textMuted,
                    animation: `bounce 1.2s ease infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Building spinner */}
          {isBuilding && !isTyping && (
            <div style={{ display: 'flex' }}>
              <div style={{
                padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
                background: 'rgba(0,128,96,0.1)',
                border: '1px solid rgba(0,128,96,0.2)',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: '#008060', fontWeight: 500,
              }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid #008060', borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite', flexShrink: 0,
                }} />
                Building your website...
              </div>
            </div>
          )}

          {/* Done button */}
          {done && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '13px 28px', borderRadius: 25,
                  border: 'none', background: '#008060',
                  color: 'white', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 4px 20px rgba(0,128,96,0.4)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Sparkles size={16} /> Go to my dashboard
              </button>
            </div>
          )}

          {/* Error retry */}
          {error && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <button
                onClick={() => { setError(null); build(collected) }}
                style={{
                  padding: '10px 22px', borderRadius: 20,
                  border: '1px solid rgba(255,69,58,0.3)',
                  background: 'rgba(255,69,58,0.08)',
                  color: '#FF453A', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Try again
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar — WhatsApp style */}
        {!done && (
          <div style={{
            padding: '10px 12px',
            background: isDark ? '#1A1B22' : '#F0F0F0',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={isBuilding ? 'Building your website...' : 'Type a message...'}
              disabled={isTyping || isBuilding}
              style={{
                flex: 1, padding: '10px 16px',
                borderRadius: 24, border: 'none',
                background: surface,
                color: textPrimary, fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                opacity: (isTyping || isBuilding) ? 0.6 : 1,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isBuilding}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                border: 'none',
                background: input.trim() && !isTyping && !isBuilding ? '#008060' : (isDark ? '#2A2A2A' : '#D0D0D0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !isTyping && !isBuilding ? 'pointer' : 'not-allowed',
                flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              <Send size={16} color={input.trim() && !isTyping && !isBuilding ? 'white' : (isDark ? '#444' : '#999')} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}