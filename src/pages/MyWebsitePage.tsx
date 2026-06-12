import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { useSubscription } from '@/hooks/useSubscription'
import { getMyBusiness, updateBusiness } from '@/lib/db'
import { cleanGeneratedHtml, isValidGeneratedHtml } from '@/lib/ai'
import type { Business } from '@/lib/db'
import { Smartphone, Monitor, Tablet, Send, Sparkles, ExternalLink, Copy, CheckCheck, RefreshCw, Lock, ChevronDown, ChevronUp } from 'lucide-react'

type Device = 'mobile' | 'tablet' | 'desktop'

const DEVICE_WIDTHS: Record<Device, string> = {
  mobile:  '375px',
  tablet:  '768px',
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
  const { subscription } = useSubscription()
  const navigate = useNavigate()

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState<Device>('mobile')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

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
    if (!subscription.canEdit) { navigate('/upgrade'); return }

    setIsGenerating(true)
    setMessage(null)

    try {
      const currentHtml = (business as any).generated_html || ''
      const num = (business.whatsapp || business.phone).replace(/\D/g, '').replace(/^0/, '254')
      const waLink = `https://wa.me/${num}`
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', Nairobi, Kenya')}`

      const aiPrompt = `You are a web designer editing an existing business website. Make ONLY the requested change. Keep everything else exactly the same.

CURRENT WEBSITE HTML:
${currentHtml}

OWNER'S REQUESTED CHANGE: "${editPrompt}"

STRICT RULES:
1. Return ONLY the complete modified HTML. No markdown. No backticks. No explanation.
2. Keep ALL existing business details, phone numbers, WhatsApp links, addresses exactly as they are.
3. Keep the Save Contact button and its JavaScript exactly as is.
4. Keep the Get Directions button linking to: ${mapsLink}
5. Keep WhatsApp link: ${waLink} and phone: tel:${business.phone}
6. Keep "Powered by OfliX" in the footer.
7. Keep footer year as ${new Date().getFullYear()}.
8. Only change what was specifically requested. Do not redesign sections that weren't mentioned.
9. The file MUST end with </html>.`

      const response = await fetch('https://oflix-v2.vercel.app/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          messages: [{ role: 'user', content: aiPrompt }],
        }),
      })

      const data = await response.json()
      const html = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''

      if (html) {
        const clean = cleanGeneratedHtml(html)
        if (!isValidGeneratedHtml(clean)) {
          setMessage(t('AI returned incomplete website output. Please try again.', 'AI ilirudisha tovuti isiyokamilika. Jaribu tena.'))
        } else {
          await updateBusiness(business.id, { generated_html: clean } as any)
          setBusiness({ ...business, generated_html: clean } as any)
          setMessage(t('Website updated!', 'Tovuti imesasishwa!'))
          setPrompt('')
          setTimeout(() => setMessage(null), 3000)
        }
      } else {
        setMessage(t('AI did not return website HTML. Please try again.', 'AI haikurudisha HTML ya tovuti. Jaribu tena.'))
      }
    } catch {
      setMessage(t('Something went wrong. Try again.', 'Hitilafu fulani. Jaribu tena.'))
    }

    setIsGenerating(false)
  }

  const bg = isDark ? '#0F1011' : '#F6F6F7'
  const surface = isDark ? '#1C1C1E' : '#FFFFFF'
  const border = isDark ? '#2A2A2A' : '#E5E5E5'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#666' : '#6D7175'
  const accent = '#008060'
  const inputBg = isDark ? '#111' : '#FFF'

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, minHeight: '100vh' }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', paddingBottom: 70 }}>

      <style>{`
        .mwp-layout { display: flex; flex: 1; overflow: hidden; height: calc(100vh - 53px); }
        .mwp-preview { flex: 1; overflow: auto; display: flex; flex-direction: column; }
        .mwp-preview-inner { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 16px; background: ${isDark ? '#0A0A0B' : '#E8E8E8'}; }
        .mwp-preview-inner iframe { flex: 1; width: 100%; min-height: 0; border: none; display: block; }
        .mwp-panel { width: 300px; flex-shrink: 0; overflow-y: auto; }
        .mwp-topbar { display: flex; align-items: center; gap: 8px; padding: 10px 16px; flex-wrap: nowrap; overflow-x: auto; }
        .mwp-device-btns { display: flex; }
        .mwp-copy-btn { display: flex; }
        @media (max-width: 768px) {
          .mwp-layout { flex-direction: column; height: auto; overflow: visible; }
          .mwp-preview { min-height: 60vh; }
          .mwp-preview-inner { min-height: 60vh; }
          .mwp-preview-inner iframe { min-height: 500px; flex: none; }
          .mwp-panel { width: 100%; border-left: none !important; border-top: 1px solid ${border}; max-height: none; }
          .mwp-device-btns { display: none; }
          .mwp-copy-btn { display: none; }
          .mwp-topbar { padding: 8px 12px; gap: 6px; }
        }
      `}</style>

      {/* Top bar */}
      <div className="mwp-topbar" style={{ background: surface, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, background: isDark ? '#111' : '#F5F5F5', border: `1px solid ${border}`, borderRadius: 8, padding: '7px 10px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#30D158', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {websiteUrl || 'No website yet'}
          </span>
        </div>

        <div className="mwp-device-btns" style={{ background: isDark ? '#111' : '#F5F5F5', borderRadius: 8, border: `1px solid ${border}`, overflow: 'hidden' }}>
          {([{ id: 'mobile', icon: Smartphone }, { id: 'tablet', icon: Tablet }, { id: 'desktop', icon: Monitor }] as { id: Device; icon: any }[]).map(d => (
            <button key={d.id} onClick={() => setDevice(d.id)} style={{ width: 36, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: device === d.id ? accent : 'transparent', color: device === d.id ? 'white' : textMuted }}>
              <d.icon size={14} />
            </button>
          ))}
        </div>

        <button className="mwp-copy-btn" onClick={handleCopy} style={{ alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: `1px solid ${border}`, background: surface, color: textPrimary, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
          {copied ? <CheckCheck size={13} color={accent} /> : <Copy size={13} />}
          {copied ? t('Copied!', 'Imenakiliwa!') : t('Copy link', 'Nakili')}
        </button>

        <a href={websiteUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: 'none', background: accent, color: 'white', fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
          <ExternalLink size={13} /> {t('Open', 'Fungua')}
        </a>
      </div>

      {/* Main layout */}
      <div className="mwp-layout">

        {/* Preview pane */}
        <div className="mwp-preview">
          <div className="mwp-preview-inner">
            {generatedHtml ? (
              <div style={{ width: DEVICE_WIDTHS[device], maxWidth: '100%', flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: device === 'desktop' ? 0 : 12, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', transition: 'width 0.3s ease' }}>
                {isGenerating ? (
                  <div style={{ flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#fff' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s ease infinite' }}>
                      <Sparkles size={22} color="white" />
                    </div>
                    <p style={{ fontSize: 14, color: '#6D7175', fontFamily: "'DM Sans', sans-serif" }}>
                      {t('AI is updating your website...', 'AI inasasisha tovuti yako...')}
                    </p>
                  </div>
                ) : (
                  <iframe
                    srcDoc={generatedHtml}
                    style={{ flex: 1, width: '100%', minHeight: 0, border: 'none', display: 'block' }}
                    title="Website preview"
                    sandbox="allow-scripts allow-popups"
                  />
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', gap: 12 }}>
                <div style={{ fontSize: 48 }}>🌐</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t('No website yet', 'Bado huna tovuti')}</h3>
                <p style={{ fontSize: 13, color: textMuted }}>{t('Complete onboarding to generate your website.', 'Kamilisha mchakato wa kuanza.')}</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Editor panel */}
        <div className="mwp-panel" style={{ background: surface, borderLeft: `1px solid ${border}` }}>

          <div
            onClick={() => setEditorOpen(!editorOpen)}
            style={{ padding: '14px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Sparkles size={14} color={subscription.canEdit ? accent : textMuted} />
              <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>{t('Edit with AI', 'Hariri na AI')}</span>
              {!subscription.canEdit && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>PRO</span>
              )}
            </div>
            <div style={{ color: textMuted }}>
              {editorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          <div style={{ display: editorOpen ? 'block' : 'none' }} className="mwp-panel-body">
            <style>{`.mwp-panel-body { display: block !important; } @media (max-width: 768px) { .mwp-panel-body { display: ${editorOpen ? 'block' : 'none'} !important; } }`}</style>

            {!subscription.canEdit ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Lock size={24} color="#7C3AED" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>
                  {t('Pro feature', 'Kipengele cha Pro')}
                </div>
                <p style={{ fontSize: 12, color: textMuted, lineHeight: 1.6, marginBottom: 20 }}>
                  {t('AI website editing is available on the Pro plan (KES 999/month).', 'Kuhariri tovuti kwa AI kunapatikana kwenye mpango wa Pro (KES 999/mwezi).')}
                </p>
                <button
                  onClick={() => navigate('/upgrade')}
                  style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#7C3AED', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Sparkles size={14} />
                  {t('Upgrade to Pro', 'Boresha hadi Pro')}
                </button>
              </div>
            ) : (
              <div style={{ padding: 12 }}>
                {message && (
                  <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 7, background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', border: `1px solid ${isDark ? 'rgba(0,128,96,0.2)' : '#B3D9CC'}`, fontSize: 12, color: accent, fontWeight: 500 }}>
                    ✓ {message}
                  </div>
                )}

                <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('Quick edits', 'Mabadiliko ya haraka')}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                  {QUICK_EDITS.map(edit => (
                    <button
                      key={edit}
                      onClick={() => handleEdit(edit)}
                      disabled={isGenerating}
                      style={{ padding: '8px 10px', borderRadius: 7, textAlign: 'left', border: `1px solid ${border}`, background: 'transparent', color: textPrimary, fontSize: 11, cursor: isGenerating ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: isGenerating ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, lineHeight: 1.4 }}
                    >
                      {edit}
                      <RefreshCw size={10} color={textMuted} style={{ flexShrink: 0 }} />
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('Custom edit', 'Mabadiliko maalum')}
                </p>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={t('e.g. Add a photo gallery, change font, make footer green...', 'mf. Ongeza picha, badilisha fonti...')}
                  rows={3}
                  disabled={isGenerating}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${border}`, background: inputBg, color: textPrimary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none', lineHeight: 1.6, marginBottom: 8 }}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = border}
                />
                <button
                  onClick={() => handleEdit(prompt)}
                  disabled={!prompt.trim() || isGenerating}
                  style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: prompt.trim() && !isGenerating ? accent : (isDark ? '#1A1A1A' : '#E5E5E5'), color: prompt.trim() && !isGenerating ? 'white' : textMuted, fontSize: 13, fontWeight: 600, cursor: prompt.trim() && !isGenerating ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {isGenerating ? (
                    <><div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />{t('Updating...', 'Inasasisha...')}</>
                  ) : (
                    <><Send size={13} />{t('Apply changes', 'Tumia mabadiliko')}</>
                  )}
                </button>
              </div>
            )}
          </div>

          <style>{`
            @media (min-width: 769px) {
              .mwp-panel-body { display: block !important; }
            }
          `}</style>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>
    </div>
  )
}