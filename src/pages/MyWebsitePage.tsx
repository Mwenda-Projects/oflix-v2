import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { getMyBusiness, updateBusiness } from '@/lib/db'
import type { Business } from '@/lib/db'
import { Smartphone, Monitor, Tablet, Send, Sparkles, ExternalLink, Copy, CheckCheck, RefreshCw } from 'lucide-react'

type Device = 'mobile' | 'tablet' | 'desktop'

const DEVICE_WIDTHS: Record<Device, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
}

const QUICK_EDITS = [
  'Change the colors to something more vibrant',
  'Make the hero section more eye-catching',
  'Add a services section with prices',
  'Make it look more professional and corporate',
  'Change to a dark theme',
  'Make it feel warmer and more welcoming',
]

export default function MyWebsitePage() {
  const { isDark } = useTheme()
  const { t } = useLanguage()

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState<Device>('mobile')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getMyBusiness().then(biz => {
      setBusiness(biz)
      setLoading(false)
    })
  }, [])

  const websiteUrl = business ? `${window.location.origin}/b/${business.slug}` : null
  const generatedHtml = (business as any)?.generated_html

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl || '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = async (editPrompt: string) => {
    if (!business || !editPrompt.trim()) return
    setIsGenerating(true)
    setMessage(null)

    try {
      const styles: Record<string, string> = {
        food: 'warm and appetising — deep amber, cream, forest green.',
        salon: 'elegant and luxurious — rose gold, soft blush, charcoal.',
        clinic: 'clean and trustworthy — white, calm blue, soft green.',
        retail: 'bold and modern — vibrant accent on white.',
        school: 'inspiring and professional — navy, gold, white.',
        transport: 'strong and reliable — dark navy, orange accent.',
        construction: 'industrial and trustworthy — dark grey, yellow.',
        agriculture: 'natural and earthy — green, brown, cream.',
        tech: 'modern and minimal — dark background, electric blue.',
        other: 'clean and professional — white with a bold colour accent.',
      }

      const num = (business.whatsapp || business.phone).replace(/\D/g, '').replace(/^0/, '254')
      const waLink = `https://wa.me/${num}`

      const aiPrompt = `You are a world-class web designer. Rebuild this Nairobi business website with the following specific changes requested by the owner.

BUSINESS DETAILS:
- Name: ${business.name}
- Type: ${business.category}
- Description: ${business.description}
- Phone: ${business.phone}
- WhatsApp: ${waLink}
- Address: ${business.address}${business.hours ? `\n- Hours: ${business.hours}` : ''}

BASE DESIGN DIRECTION: ${styles[business.category] || styles.other}

OWNER'S REQUESTED CHANGE: "${editPrompt}"

Apply the owner's requested change while keeping all the business details exactly the same.

STRICT RULES:
1. Return ONLY raw HTML. No markdown. No backticks. No explanation.
2. Complete single file with Google Fonts in <head>, all CSS in <style>, JS in <script>.
3. Mobile-first. Minimum 4 sections.
4. WhatsApp button must open: ${waLink}
5. Phone link: tel:${business.phone}
6. Small "Powered by OfliX" footer.
7. Must look premium and professional.`

      const response = await fetch('https://oflix-v2.vercel.app/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: aiPrompt }],
        }),
      })

      const data = await response.json()
      const html = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''

      if (html) {
        const clean = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim()
        await updateBusiness(business.id, { generated_html: clean } as any)
        setBusiness({ ...business, generated_html: clean } as any)
        setMessage(t('Website updated successfully!', 'Tovuti imesasishwa!'))
        setPrompt('')
        setTimeout(() => setMessage(null), 3000)
      }
    } catch {
      setMessage(t('Something went wrong. Please try again.', 'Hitilafu fulani imetokea. Jaribu tena.'))
    }

    setIsGenerating(false)
  }

  // ── Theme ────────────────────────────────────────────────────
  const bg = isDark ? '#0F1011' : '#F6F6F7'
  const surface = isDark ? '#1C1C1E' : '#FFFFFF'
  const border = isDark ? '#2A2A2A' : '#E5E5E5'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#666' : '#6D7175'
  const accent = '#008060'
  const inputBg = isDark ? '#111' : '#FFF'

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', height: '100vh' }}>

      {/* Top bar */}
      <div style={{ background: surface, borderBottom: `1px solid ${border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

        {/* URL bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: isDark ? '#111' : '#F5F5F5', border: `1px solid ${border}`, borderRadius: 8, padding: '7px 12px', minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#30D158', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {websiteUrl || 'No website yet'}
          </span>
        </div>

        {/* Device switcher */}
        <div style={{ display: 'flex', background: isDark ? '#111' : '#F5F5F5', borderRadius: 8, border: `1px solid ${border}`, overflow: 'hidden' }}>
          {([
            { id: 'mobile', icon: Smartphone },
            { id: 'tablet', icon: Tablet },
            { id: 'desktop', icon: Monitor },
          ] as { id: Device; icon: any }[]).map(d => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              style={{
                width: 36, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                background: device === d.id ? accent : 'transparent',
                color: device === d.id ? 'white' : textMuted,
                transition: 'all 0.15s',
              }}
            >
              <d.icon size={14} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: `1px solid ${border}`, background: surface, color: textPrimary, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
          {copied ? <CheckCheck size={13} color={accent} /> : <Copy size={13} />}
          {copied ? t('Copied!', 'Imenakiliwa!') : t('Copy link', 'Nakili')}
        </button>

        <a href={websiteUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: 'none', background: accent, color: 'white', fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
          <ExternalLink size={13} />
          {t('Open', 'Fungua')}
        </a>
      </div>

      {/* Main area — preview + editor */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Preview pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', overflow: 'auto', background: isDark ? '#0A0A0B' : '#E8E8E8' }}>
          {generatedHtml ? (
            <div style={{
              width: DEVICE_WIDTHS[device],
              maxWidth: '100%',
              height: device === 'desktop' ? '100%' : 'auto',
              minHeight: 500,
              background: 'white',
              borderRadius: device === 'desktop' ? 0 : 12,
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
              transition: 'width 0.3s ease',
              flexShrink: 0,
            }}>
              {isGenerating ? (
                <div style={{ width: '100%', height: '100%', minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#fff' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s ease infinite' }}>
                    <Sparkles size={22} color="white" />
                  </div>
                  <p style={{ fontSize: 14, color: '#6D7175', fontFamily: "'DM Sans', sans-serif" }}>
                    {t('AI is updating your website...', 'AI inasasisha tovuti yako...')}
                  </p>
                  <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
                </div>
              ) : (
                <iframe
                  srcDoc={generatedHtml}
                  style={{ width: '100%', height: '100%', minHeight: 600, border: 'none', display: 'block' }}
                  title="Website preview"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: 12 }}>
              <div style={{ fontSize: 48 }}>🌐</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t('No website yet', 'Bado huna tovuti')}</h3>
              <p style={{ fontSize: 13, color: textMuted }}>{t('Complete the onboarding to generate your website.', 'Kamilisha mchakato wa kuanza kupata tovuti yako.')}</p>
            </div>
          )}
        </div>

        {/* AI editor panel */}
        <div style={{ width: 300, flexShrink: 0, background: surface, borderLeft: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Panel header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <Sparkles size={14} color={accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>{t('Edit with AI', 'Hariri na AI')}</span>
            </div>
            <p style={{ fontSize: 11, color: textMuted, lineHeight: 1.5 }}>
              {t('Tell the AI what to change and your website updates instantly.', 'Mwambie AI nini kibadilishe na tovuti yako itasasishwa mara moja.')}
            </p>
          </div>

          {/* Success message */}
          {message && (
            <div style={{ margin: '10px 12px 0', padding: '8px 12px', borderRadius: 7, background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', border: `1px solid ${isDark ? 'rgba(0,128,96,0.2)' : '#B3D9CC'}`, fontSize: 12, color: accent, fontWeight: 500 }}>
              ✓ {message}
            </div>
          )}

          {/* Quick edits */}
          <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${border}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('Quick edits', 'Mabadiliko ya haraka')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {QUICK_EDITS.map(edit => (
                <button
                  key={edit}
                  onClick={() => handleEdit(edit)}
                  disabled={isGenerating}
                  style={{
                    padding: '7px 10px', borderRadius: 7, textAlign: 'left',
                    border: `1px solid ${border}`, background: 'transparent',
                    color: textPrimary, fontSize: 12, cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    opacity: isGenerating ? 0.5 : 1,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                  }}
                  onMouseEnter={e => !isGenerating && ((e.target as HTMLElement).style.borderColor = accent)}
                  onMouseLeave={e => ((e.target as HTMLElement).style.borderColor = border)}
                >
                  {edit}
                  <RefreshCw size={11} color={textMuted} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('Custom edit', 'Mabadiliko maalum')}
            </p>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={t(
                'e.g. Add a photo gallery section, change font to something more elegant, make the footer green...',
                'mf. Ongeza sehemu ya picha, badilisha fonti kuwa ya kisasa zaidi, fanya footer iwe ya kijani...'
              )}
              rows={4}
              disabled={isGenerating}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: `1.5px solid ${border}`,
                background: inputBg, color: textPrimary,
                fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                outline: 'none', resize: 'none', lineHeight: 1.6,
                opacity: isGenerating ? 0.5 : 1,
              }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = border}
            />
            <button
              onClick={() => handleEdit(prompt)}
              disabled={!prompt.trim() || isGenerating}
              style={{
                padding: '10px', borderRadius: 8, border: 'none',
                background: prompt.trim() && !isGenerating ? accent : (isDark ? '#1A1A1A' : '#E5E5E5'),
                color: prompt.trim() && !isGenerating ? 'white' : textMuted,
                fontSize: 13, fontWeight: 600, cursor: prompt.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {isGenerating ? (
                <>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                  {t('Updating...', 'Inasasisha...')}
                </>
              ) : (
                <>
                  <Send size={13} />
                  {t('Apply changes', 'Tumia mabadiliko')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
    </div>
  )
}