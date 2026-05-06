import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { getMyBusiness, updateBusiness, signOut } from '@/lib/db'
import { generateWebsite as generateWebsiteFromAI, isValidGeneratedHtml } from '@/lib/ai'
import type { Business } from '@/lib/db'
import { Moon, Sun, Sparkles, Globe, Phone, Clock, MapPin, Mail, Lock, Trash2, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, language, toggleLanguage } = useLanguage()
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const navigate = useNavigate()

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    getMyBusiness().then(biz => {
      setBusiness(biz)
      setLoading(false)
    })
  }, [])

  const startEdit = (field: string, value: string) => {
    setEditing(field)
    setEditValue(value)
    setSaved(false)
  }

  const saveEdit = async () => {
    if (!business || !editing) return
    setSaving(true)
    await updateBusiness(business.id, { [editing]: editValue } as any)
    setBusiness({ ...business, [editing]: editValue } as Business)
    setSaving(false)
    setSaved(true)
    setEditing(null)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/login')
  }

  const handleRegenerate = async () => {
    if (!business || !subscription.canRegenerate) {
      navigate('/upgrade')
      return
    }
    setRegenerating(true)
    setError(null)
    try {
      const html = await generateWebsiteFromAI({
        name: business.name,
        category: business.category,
        description: business.description,
        phone: business.phone,
        whatsapp: business.whatsapp,
        address: business.address,
        hours: business.hours,
      })

      if (!isValidGeneratedHtml(html)) {
        setError('Generated website was incomplete. Please try again.')
      } else {
        await updateBusiness(business.id, { generated_html: html } as any)
        setBusiness({ ...business, generated_html: html } as any)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong while regenerating. Please try again.')
    }
    setRegenerating(false)
  }

  const bg = isDark ? '#0F1011' : '#F6F6F7'
  const surface = isDark ? '#1C1C1E' : '#FFFFFF'
  const border = isDark ? '#2A2A2A' : '#E5E5E5'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#666' : '#6D7175'
  const accent = '#008060'
  const rowBorder = isDark ? '#222' : '#F0F0F0'

  const planColors: Record<string, { bg: string; color: string }> = {
    free:    { bg: isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0', color: isDark ? '#666' : '#888' },
    pending: { bg: 'rgba(255,159,10,0.12)', color: '#FF9F0A' },
    basic:   { bg: 'rgba(0,128,96,0.12)', color: '#008060' },
    pro:     { bg: 'rgba(124,58,237,0.12)', color: '#7C3AED' },
  }
  const pc = planColors[subscription.plan] || planColors.free

  const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${rowBorder}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: textMuted }}>{subtitle}</div>
      </div>
      {children}
    </div>
  )

  const Row = ({ label, value, action, actionLabel, actionStyle, icon: Icon }: {
    label: string; value?: string; action?: () => void
    actionLabel?: string; actionStyle?: 'primary' | 'outline' | 'danger'; icon?: any
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${rowBorder}`, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {Icon && (
          <div style={{ width: 30, height: 30, borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={13} color={textMuted} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{label}</div>
          {value && <div style={{ fontSize: 12, color: textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>}
        </div>
      </div>
      {action && actionLabel && (
        <button onClick={action} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: actionStyle === 'danger' ? '1px solid rgba(255,69,58,0.3)' : actionStyle === 'primary' ? 'none' : `1px solid ${border}`, background: actionStyle === 'primary' ? accent : 'transparent', color: actionStyle === 'danger' ? '#FF453A' : actionStyle === 'primary' ? 'white' : textPrimary, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
          {actionLabel}
        </button>
      )}
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '28px 28px 60px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, letterSpacing: '-0.3px', marginBottom: 4 }}>
            {t('Settings', 'Mipangilio')}
          </h1>
          <p style={{ fontSize: 14, color: textMuted }}>
            {t('Manage your business and account preferences.', 'Simamia biashara yako na mapendeleo ya akaunti.')}
          </p>
        </div>

        {/* Current plan banner */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: pc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={13} color={pc.color} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                {t('Current plan', 'Mpango wa sasa')}:
                <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 20, background: pc.bg, color: pc.color, fontSize: 11, fontWeight: 700 }}>
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </span>
              </div>
              {subscription.expiresAt && (
                <div style={{ fontSize: 11, color: textMuted, marginTop: 1 }}>
                  {t('Expires', 'Inaisha')}: {new Date(subscription.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          {subscription.isFree && (
            <button onClick={() => navigate('/upgrade')} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: '#7C3AED', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {t('Upgrade', 'Boresha')}
            </button>
          )}
        </div>

        {saved && (
          <div style={{ background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', border: `1px solid ${isDark ? 'rgba(0,128,96,0.2)' : '#B3D9CC'}`, borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: accent, fontWeight: 500 }}>
            ✓ {t('Changes saved successfully.', 'Mabadiliko yamehifadhiwa.')}
          </div>
        )}
        {error && (
          <div style={{ background: isDark ? 'rgba(255,69,58,0.08)' : '#FDECEA', border: `1px solid ${isDark ? 'rgba(255,69,58,0.15)' : '#F5C6CB'}`, borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#B32525', fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        {editing && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 12 }}>
              {t('Edit', 'Hariri')} {editing}
            </div>
            <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1.5px solid ${accent}`, background: isDark ? '#111' : '#FFF', color: textPrimary, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', marginBottom: 12, boxSizing: 'border-box' as const }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(null)} style={{ padding: '8px 16px', borderRadius: 7, border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {t('Cancel', 'Ghairi')}
              </button>
              <button onClick={saveEdit} disabled={saving} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: accent, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {saving ? t('Saving...', 'Inahifadhi...') : t('Save', 'Hifadhi')}
              </button>
            </div>
          </div>
        )}

        {!loading && business && (
          <Section title={t('Business profile', 'Wasifu wa biashara')} subtitle={t('Update your business information', 'Sasisha maelezo ya biashara yako')}>
            <Row icon={Globe} label={t('Business name', 'Jina la biashara')} value={business.name} action={() => startEdit('name', business.name)} actionLabel={t('Edit', 'Hariri')} actionStyle="outline" />
            <Row icon={Phone} label={t('Phone number', 'Nambari ya simu')} value={business.phone} action={() => startEdit('phone', business.phone)} actionLabel={t('Edit', 'Hariri')} actionStyle="outline" />
            <Row icon={Clock} label={t('Business hours', 'Masaa ya biashara')} value={business.hours || t('Not set', 'Haijawekwa')} action={() => startEdit('hours', business.hours || '')} actionLabel={t('Edit', 'Hariri')} actionStyle="outline" />
            <Row icon={MapPin} label={t('Location', 'Eneo')} value={business.address} action={() => startEdit('address', business.address)} actionLabel={t('Edit', 'Hariri')} actionStyle="outline" />
          </Section>
        )}

        {!loading && business && (
          <Section title={t('Your website', 'Tovuti yako')} subtitle={t('Manage your public business page', 'Simamia ukurasa wako wa umma wa biashara')}>
            <Row icon={Globe} label={t('Website status', 'Hali ya tovuti')} value={`oflix.co.ke/b/${business.slug}`} action={() => window.open(`/b/${business.slug}`, '_blank')} actionLabel={t('View', 'Angalia')} actionStyle="outline" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: subscription.canRegenerate ? (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5') : 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={13} color={subscription.canRegenerate ? accent : '#7C3AED'} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t('Regenerate website', 'Jenga upya tovuti')}
                    {!subscription.canRegenerate && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>PRO</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 1 }}>
                    {subscription.canRegenerate
                      ? t('Build a fresh new design with AI', 'Jenga muundo mpya na AI')
                      : t('Upgrade to Pro to regenerate your website', 'Boresha hadi Pro kujenga upya tovuti yako')}
                  </div>
                </div>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: subscription.canRegenerate ? 'none' : `1px solid rgba(124,58,237,0.3)`, background: subscription.canRegenerate ? accent : 'transparent', color: subscription.canRegenerate ? 'white' : '#7C3AED', cursor: regenerating ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: regenerating ? 0.7 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {regenerating ? (
                  <><div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />{t('Regenerating...', 'Inajenga upya...')}</>
                ) : subscription.canRegenerate ? t('Regenerate', 'Jenga upya') : t('Upgrade to unlock', 'Boresha kufungua')}
              </button>
            </div>
          </Section>
        )}

        <Section title={t('Preferences', 'Mapendeleo')} subtitle={t('Personalise your experience', 'Binafsisha uzoefu wako')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${rowBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={13} color={textMuted} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{t('Language', 'Lugha')}</div>
                <div style={{ fontSize: 12, color: textMuted }}>{language === 'en' ? 'English' : 'Kiswahili'}</div>
              </div>
            </div>
            <button onClick={toggleLanguage} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: `1px solid ${border}`, background: 'transparent', color: textPrimary, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {language === 'en' ? 'Kiswahili' : 'English'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDark ? <Moon size={13} color={textMuted} /> : <Sun size={13} color={textMuted} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{t('Dark mode', 'Hali ya giza')}</div>
                <div style={{ fontSize: 12, color: textMuted }}>{isDark ? t('On', 'Imewashwa') : t('Off', 'Imezimwa')}</div>
              </div>
            </div>
            <div onClick={toggleTheme} style={{ width: 40, height: 22, borderRadius: 11, background: isDark ? accent : '#E5E5E5', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: isDark ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </Section>

        <Section title={t('Account', 'Akaunti')} subtitle={t('Manage your OfliX account', 'Simamia akaunti yako ya OfliX')}>
          <Row icon={Mail} label={t('Email address', 'Anwani ya barua pepe')} value={user?.email || ''} />
          <Row
            icon={Lock}
            label={t('Change password', 'Badilisha nenosiri')}
            value={t('Update your login password', 'Sasisha nenosiri lako la kuingia')}
            action={() => navigate('/forgot-password')}
            actionLabel={t('Change', 'Badilisha')}
            actionStyle="outline"
          />

          {/* ── Sign out ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${rowBorder}`, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogOut size={13} color={textMuted} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{t('Sign out', 'Toka')}</div>
                <div style={{ fontSize: 12, color: textMuted }}>{user?.email || ''}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: `1px solid ${border}`, background: 'transparent', color: textPrimary, cursor: signingOut ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0, opacity: signingOut ? 0.6 : 1 }}
            >
              {signingOut ? t('Signing out...', 'Inatoka...') : t('Sign out', 'Toka')}
            </button>
          </div>

          {/* ── Delete account ── */}
          <div style={{ padding: '14px 20px' }}>
            {!deleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,69,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={13} color="#FF453A" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#FF453A' }}>{t('Delete account', 'Futa akaunti')}</div>
                    <div style={{ fontSize: 12, color: textMuted }}>{t('Permanently remove your business and website', 'Ondoa biashara na tovuti yako kabisa')}</div>
                  </div>
                </div>
                <button onClick={() => setDeleteConfirm(true)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,69,58,0.3)', background: 'transparent', color: '#FF453A', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                  {t('Delete', 'Futa')}
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 8, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: '#FF453A', fontWeight: 600, marginBottom: 4 }}>{t('Are you sure?', 'Una uhakika?')}</p>
                <p style={{ fontSize: 12, color: textMuted, marginBottom: 12 }}>{t('This will permanently delete your business, website and all data. This cannot be undone.', 'Hii itafuta biashara yako, tovuti na data zote kabisa. Haiwezi kutendwa upya.')}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setDeleteConfirm(false)} style={{ padding: '7px 16px', borderRadius: 7, border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    {t('Cancel', 'Ghairi')}
                  </button>
                  <button style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#FF453A', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    {t('Yes, delete everything', 'Ndio, futa kila kitu')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}