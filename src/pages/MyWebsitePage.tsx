import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { useSubscription } from '@/hooks/useSubscription'
import { getMyBusiness, updateBusiness } from '@/lib/db'
import {
  isValidGeneratedHtml,
  editSiteData,
  renderSiteHtml,
  extractHeroImageHtml,
  extractPhotoCreditHtml,
  type SiteData,
} from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import { compressAndUpload, deleteIfOwnedImage, findImageSlots, replaceImageSlot, type ImageSlot } from '@/lib/imageUpload'
import type { Business } from '@/lib/db'
import { Smartphone, Monitor, Tablet, Send, Sparkles, ExternalLink, Copy, CheckCheck, RefreshCw, Lock, ChevronDown, ChevronUp, ImagePlus, Upload, Globe, Check } from 'lucide-react'

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

// Friendly labels for known slot names — falls back to the raw slot name
// (title-cased) for anything else, so new slot types just work.
function slotLabel(slot: string): string {
  const known: Record<string, string> = {
    hero: 'Cover Photo',
    logo: 'Store Logo',
  }
  if (known[slot]) return known[slot]
  if (/^gallery-\d+$/.test(slot)) return `Gallery Photo ${slot.split('-')[1]}`
  return slot.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

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
  const [editCount, setEditCount] = useState(0)
  const DAILY_EDIT_LIMIT = 5

  // Image slot manager state
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([])
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    getMyBusiness().then(biz => {
      setBusiness(biz)
      setLoading(false)
    })
  }, [])

  // The business's public site lives on its own subdomain
  // (businessname.oflix.space) — a different address from wherever the
  // dashboard itself happens to be hosted, so this is built directly
  // from the slug rather than window.location.origin.
  const websiteUrl = business ? `https://${business.slug}.oflix.space` : null
  const generatedHtml = (business as any)?.generated_html

  // Re-scan for image slots whenever the underlying HTML changes
  useEffect(() => {
    if (generatedHtml) {
      setImageSlots(findImageSlots(generatedHtml))
    } else {
      setImageSlots([])
    }
  }, [generatedHtml])

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl || '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = async (editPrompt: string) => {
    if (!business || !editPrompt.trim()) return
    if (!subscription.canEdit) { navigate('/upgrade'); return }
    if (editCount >= DAILY_EDIT_LIMIT) {
      setMessage(t('Daily edit limit reached (5/day). Come back tomorrow!', 'Umefika kikomo cha mabadiliko ya leo (5/siku). Rudi kesho!'))
      return
    }

    setIsGenerating(true)
    setMessage(null)

    const isQuickEdit = QUICK_EDITS.includes(editPrompt)
    const siteData = (business as any).site_data as SiteData | undefined
    const hasCustomEdit = !!(business as any).has_custom_edit
    const currentHtml = (business as any).generated_html || ''

    // ── FAST PATH ────────────────────────────────────────────────
    // Only for Quick Edits, only when this business has structured
    // site_data AND has never used the free-text custom edit box.
    // Once has_custom_edit is true, site_data can no longer be trusted
    // to represent everything on the live page (a custom edit may have
    // added a section site_data has no field for), so every edit falls
    // back to the slow path from then on, permanently, for safety.
    const canAttemptFastPath = isQuickEdit && !!siteData && !hasCustomEdit
    const heroImageHtml = canAttemptFastPath ? extractHeroImageHtml(currentHtml) : null

    try {
      if (canAttemptFastPath && heroImageHtml) {
        const updated = await editSiteData(siteData as SiteData, editPrompt)

        if (JSON.stringify(updated) === JSON.stringify(siteData)) {
          // The model determined this request needs a section or
          // structure site_data can't represent — point the owner at
          // the custom edit box instead of silently doing nothing.
          setMessage(t(
            'That kind of change needs the custom edit box below.',
            'Aina hiyo ya mabadiliko inahitaji kisanduku cha mabadiliko maalum hapa chini.'
          ))
          setIsGenerating(false)
          return
        }

        const photoCreditHtml = extractPhotoCreditHtml(currentHtml)
        const newHtml = renderSiteHtml(business as any, updated, heroImageHtml, photoCreditHtml)

        await updateBusiness(business.id, { generated_html: newHtml, site_data: updated } as any)
        setBusiness({ ...business, generated_html: newHtml, site_data: updated } as any)
        setEditCount(c => c + 1)
        setMessage(t('Website updated!', 'Tovuti imesasishwa!'))
        setPrompt('')
        setTimeout(() => setMessage(null), 3000)
        setIsGenerating(false)
        return
      }

      // ── SLOW PATH ──────────────────────────────────────────────
      // Full-page AI rewrite — unchanged from before. Used for: custom
      // free-text edits (always, since they may need structure site_data
      // can't describe), any business without site_data yet (sites
      // generated before this change), and any business that has ever
      // used a custom edit.
      const aiPrompt = `You are a web designer editing an existing business website. Make ONLY the requested change. Keep everything else exactly the same.

CURRENT WEBSITE HTML:
${currentHtml}

OWNER'S REQUESTED CHANGE: "${editPrompt}"

STRICT RULES:
1. Return ONLY the complete modified HTML. No markdown. No backticks. No explanation.
2. Keep ALL existing business details, phone numbers, WhatsApp links, addresses exactly as they are.
3. Keep the Save Contact button and its JavaScript exactly as is.
4. Keep all tracking functions (track, trackWA, trackDir, saveContact) exactly as they are.
5. Keep "Powered by OfliX" in the footer.
6. Only change what was specifically requested. Do not redesign sections that were not mentioned.
7. The file MUST start with <!DOCTYPE html> and end with </html>.
8. Every <img> tag that already has a data-img-slot attribute MUST keep that exact attribute and value, even if you move, restyle, or wrap the image. If you add brand-new images (e.g. a gallery section), give each one a data-img-slot attribute using a short lowercase name (e.g. data-img-slot="gallery-1", data-img-slot="gallery-2", incrementing in order). Never remove or renumber an existing data-img-slot value.`

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setMessage(t('Your session has expired. Please log in again.', 'Muda wa kikao chako umeisha. Tafadhali ingia tena.'))
        setIsGenerating(false)
        return
      }

      const response = await fetch('https://oflix.space/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          messages: [{ role: 'user', content: aiPrompt }],
        }),
      })

      const data = await response.json()
      const html = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''

      if (!html) {
        setMessage(t('AI did not respond. Please try again.', 'AI haikujibu. Jaribu tena.'))
        setIsGenerating(false)
        return
      }

      const clean = html.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/i, '').trim()

      if (!isValidGeneratedHtml(clean)) {
        setMessage(t('AI returned incomplete output. Please try again.', 'AI ilirudisha pato lisilo kamili. Jaribu tena.'))
        setIsGenerating(false)
        return
      }

      // Only the free-text custom box can mark a business as having a
      // custom edit — a Quick Edit that fell through to the slow path
      // (e.g. a legacy business with no site_data yet) hasn't added
      // anything site_data couldn't describe, so it doesn't need to
      // permanently disable the fast path.
      const updates: Record<string, any> = { generated_html: clean }
      if (!isQuickEdit) updates.has_custom_edit = true

      await updateBusiness(business.id, updates)
      setBusiness({ ...business, ...updates } as any)
      setEditCount(c => c + 1)
      setMessage(t('Website updated!', 'Tovuti imesasishwa!'))
      setPrompt('')
      setTimeout(() => setMessage(null), 3000)

    } catch {
      setMessage(t('Something went wrong. Try again.', 'Hitilafu fulani. Jaribu tena.'))
    }

    setIsGenerating(false)
  }

  const handleImageReplace = async (slot: string, file: File) => {
    if (!business) return
    if (!subscription.canEdit) { navigate('/upgrade'); return }

    setImageError(null)
    setUploadingSlot(slot)

    try {
      const currentHtml = (business as any).generated_html || ''
      const previousSlot = imageSlots.find(s => s.slot === slot)

      const { publicUrl } = await compressAndUpload(file, business.id, slot)
      const updatedHtml = replaceImageSlot(currentHtml, slot, publicUrl)

      await updateBusiness(business.id, { generated_html: updatedHtml } as any)
      setBusiness({ ...business, generated_html: updatedHtml } as any)

      // Clean up the old file only after the new HTML is safely saved
      if (previousSlot?.src) {
        deleteIfOwnedImage(previousSlot.src).catch(() => {})
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('Image upload failed. Try again.', 'Kupakia picha kumeshindikana. Jaribu tena.'))
    }

    setUploadingSlot(null)
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
        .mwp-image-slot-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: ${isDark ? '#111' : '#eee'}; }
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
                <div style={{ width: 56, height: 56, borderRadius: 14, background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={26} color={accent} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t('No website yet', 'Bado huna tovuti')}</h3>
                <p style={{ fontSize: 13, color: textMuted }}>{t('Complete onboarding to generate your website.', 'Kamilisha mchakato wa kuanza.')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel: AI Editor + Image Manager */}
        <div className="mwp-panel" style={{ background: surface, borderLeft: `1px solid ${border}` }}>

          {/* ── Image manager ─────────────────────────────────── */}
          {generatedHtml && (
            <div style={{ borderBottom: `1px solid ${border}` }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <ImagePlus size={14} color={subscription.canEdit ? accent : textMuted} />
                <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>{t('Manage Images', 'Simamia Picha')}</span>
                {!subscription.canEdit && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>PRO</span>
                )}
              </div>

              {!subscription.canEdit ? (
                <div style={{ padding: '0 16px 16px' }}>
                  <p style={{ fontSize: 12, color: textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                    {t('Upload your own photos to replace the stock images on your site. Available on Pro.', 'Pakia picha zako mwenyewe badala ya picha za hisa. Inapatikana kwenye Pro.')}
                  </p>
                  <button
                    onClick={() => navigate('/upgrade')}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#7C3AED', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Sparkles size={13} /> {t('Upgrade to Pro', 'Boresha hadi Pro')}
                  </button>
                </div>
              ) : imageSlots.length === 0 ? (
                <div style={{ padding: '0 16px 16px' }}>
                  <p style={{ fontSize: 12, color: textMuted, lineHeight: 1.6 }}>
                    {t('No editable image slots found on this site yet.', 'Hakuna nafasi za picha zinazoweza kuhaririwa bado.')}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {imageError && (
                    <div style={{ padding: '8px 10px', borderRadius: 7, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 11, color: '#FF453A' }}>
                      {imageError}
                    </div>
                  )}
                  {imageSlots.map(({ slot, src }) => {
                    const isUploading = uploadingSlot === slot
                    return (
                      <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {src ? (
                          <img src={src} alt={slotLabel(slot)} className="mwp-image-slot-thumb" />
                        ) : (
                          <div className="mwp-image-slot-thumb" />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>{slotLabel(slot)}</p>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: isUploading ? textMuted : accent, cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                            <Upload size={11} />
                            {isUploading ? t('Uploading...', 'Inapakia...') : t('Replace', 'Badilisha')}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) handleImageReplace(slot, file)
                                e.target.value = ''
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── AI Editor ──────────────────────────────────────── */}
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
              {subscription.canEdit && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: editCount >= DAILY_EDIT_LIMIT ? 'rgba(255,69,58,0.12)' : 'rgba(0,128,96,0.12)', color: editCount >= DAILY_EDIT_LIMIT ? '#FF453A' : '#008060' }}>
                  {DAILY_EDIT_LIMIT - editCount}/{DAILY_EDIT_LIMIT} edits left
                </span>
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
                  {t('AI website editing is available on the Pro plan (from KES 299/month).', 'Kuhariri tovuti kwa AI kunapatikana kwenye mpango wa Pro (kuanzia KES 299/mwezi).')}
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
                  <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 7, background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', border: `1px solid ${isDark ? 'rgba(0,128,96,0.2)' : '#B3D9CC'}`, fontSize: 12, color: accent, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={13} style={{ flexShrink: 0 }} /> {message}
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