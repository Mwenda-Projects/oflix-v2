import { useEffect, useState } from 'react'
import {
  Globe, MessageCircle, MapPin, Eye,
  Moon, Sun, ExternalLink,
  Copy, CheckCheck, Sparkles, BarChart2,
  Settings, Share2, LogOut, Lock,
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { getMyBusiness, getLeadStats } from '@/lib/db'
import type { Business } from '@/lib/db'
import MobileNav from '@/components/layout/MobileNav'

// inside the return, just before the last closing </div>:


const CATEGORY_EMOJI: Record<string, string> = {
  retail: '🛍️', food: '🍽️', salon: '💇', clinic: '🏥',
  school: '📚', transport: '🚌', construction: '🏗️',
  agriculture: '🌾', tech: '💻', other: '✨',
}

export default function DashboardPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()
  const { user, signOut } = useAuth()
  const { subscription } = useSubscription()
  const navigate = useNavigate()
  const location = useLocation()

  const [business, setBusiness] = useState<Business | null>(null)
  const [stats, setStats] = useState({ pageViews: 0, whatsappTaps: 0, directionsTaps: 0 })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const biz = await getMyBusiness()
      setBusiness(biz)
      if (biz) {
        const s = await getLeadStats(biz.id)
        setStats(s)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl || '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || t('there', 'wewe')
  const websiteUrl = business ? `${window.location.origin}/b/${business.slug}` : null
  const emoji = business ? (CATEGORY_EMOJI[business.category] || '✨') : '🏪'

  const sidebarBg = '#1A1A1A'
  const mainBg = isDark ? '#0F1011' : '#F6F6F7'
  const surface = isDark ? '#1C1C1E' : '#FFFFFF'
  const border = isDark ? '#2A2A2A' : '#E1E3E5'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#666' : '#6D7175'
  const accent = '#008060'

  // Plan badge colors
  const planBadge = {
    free:    { bg: isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F0', color: isDark ? '#888' : '#666', label: 'Free' },
    pending: { bg: 'rgba(255,159,10,0.15)', color: '#FF9F0A', label: 'Pending' },
    basic:   { bg: 'rgba(0,128,96,0.15)', color: '#008060', label: 'Basic' },
    pro:     { bg: 'rgba(124,58,237,0.15)', color: '#7C3AED', label: 'Pro' },
  }

  const badge = planBadge[subscription.plan] || planBadge.free

  const navItems = [
    { id: 'overview', label: t('Overview', 'Muhtasari'),      icon: BarChart2, path: '/dashboard' },
    { id: 'website',  label: t('My Website', 'Tovuti Yangu'), icon: Globe,     path: '/dashboard/website' },
    { id: 'upgrade',  label: t('Upgrade plan', 'Boresha'),    icon: Sparkles,  path: '/upgrade' },
    { id: 'settings', label: t('Settings', 'Mipangilio'),     icon: Settings,  path: '/dashboard/settings' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: mainBg, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{ width: 220, flexShrink: 0, background: sidebarBg, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>

        <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 14 }}>O</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>OfliX</span>
          </Link>
        </div>

        {business && (
          <div style={{ padding: '10px 10px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: 'rgba(255,255,255,0.06)', borderRadius: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${accent}, #004C3F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {emoji}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {business.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#30D158' }} />
                  <span style={{ fontSize: 10, color: '#30D158', fontWeight: 600 }}>{t('Live', 'Hai')}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: badge.bg, color: badge.color, marginLeft: 2 }}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '8px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 8px 4px' }}>
            {t('Main', 'Kuu')}
          </div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 9px', borderRadius: 7, marginBottom: 1,
                border: 'none', fontSize: 13,
                background: isActive(item.path)
                  ? item.id === 'upgrade' ? 'rgba(124,58,237,0.2)' : 'rgba(0,128,96,0.2)'
                  : 'transparent',
                color: isActive(item.path)
                  ? item.id === 'upgrade' ? '#A78BFA' : '#34D399'
                  : item.id === 'upgrade' ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s', textAlign: 'left',
              }}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={toggleLanguage} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 1, fontFamily: "'DM Sans', sans-serif" }}>
            🌐 {language === 'en' ? 'Kiswahili' : 'English'}
          </button>
          <button onClick={toggleTheme} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 1, fontFamily: "'DM Sans', sans-serif" }}>
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
            {isDark ? t('Light mode', 'Mwanga') : t('Dark mode', 'Giza')}
          </button>
          <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif" }}>
            <LogOut size={12} /> {t('Sign out', 'Toka')}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <div style={{ background: surface, borderBottom: `1px solid ${border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{t('Overview', 'Muhtasari')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {websiteUrl && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${t('Check out my business online', 'Angalia biashara yangu mtandaoni')}: ${websiteUrl}`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: `1px solid ${border}`, background: surface, color: textPrimary, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}
              >
                <Share2 size={13} /> {t('Share', 'Shiriki')}
              </a>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', background: accent, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
              >
                <ExternalLink size={13} /> {t('View website', 'Angalia tovuti')}
              </a>
            )}
          </div>
        </div>

        <main style={{ flex: 1, padding: '28px 28px 60px', maxWidth: 860, width: '100%', margin: '0 auto' }}>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, letterSpacing: '-0.3px', marginBottom: 4 }}>
              {t(`Good day, ${firstName} 👋`, `Habari, ${firstName} 👋`)}
            </h1>
            <p style={{ fontSize: 14, color: textMuted }}>
              {business
                ? t("Here's how your business is doing online today.", 'Hivi ndivyo biashara yako inavyofanya leo.')
                : t("Let's get your business online.", 'Hebu tuweke biashara yako mtandaoni.')}
            </p>
          </div>

          {/* Upgrade banner for free users */}
          {subscription.isFree && business && (
            <div style={{ background: isDark ? 'rgba(124,58,237,0.1)' : '#F5F3FF', border: `1px solid ${isDark ? 'rgba(124,58,237,0.25)' : '#DDD6FE'}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={16} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 2 }}>
                  {t('Your website will expire soon', 'Tovuti yako itaisha hivi karibuni')}
                </div>
                <div style={{ fontSize: 12, color: textMuted }}>
                  {t('Upgrade to Basic (KES 499/mo) to keep your website live permanently.', 'Boresha hadi Basic (KES 499/mwezi) kuweka tovuti yako hai daima.')}
                </div>
              </div>
              <button
                onClick={() => navigate('/upgrade')}
                style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#7C3AED', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}
              >
                {t('Upgrade now', 'Boresha sasa')}
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 10, background: isDark ? '#1C1C1E' : '#EBEBEB', animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>

          ) : !business ? (
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
                {t("You don't have a website yet", 'Bado huna tovuti')}
              </h2>
              <p style={{ fontSize: 14, color: textMuted, marginBottom: 28, lineHeight: 1.6 }}>
                {t('Chat with our AI assistant and get a professional website in 2 minutes.', 'Zungumza na msaidizi wetu wa AI na upate tovuti ya kitaalamu kwa dakika 2.')}
              </p>
              <Link to="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8, background: accent, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                <Sparkles size={16} /> {t('Build my website', 'Jenga tovuti yangu')}
              </Link>
            </div>

          ) : (
            <>
              {/* Live alert */}
              <div style={{ background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', border: `1px solid ${isDark ? 'rgba(0,128,96,0.25)' : '#B3D9CC'}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Globe size={16} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 2 }}>
                    {t('Your website is live!', 'Tovuti yako iko hai!')}
                  </div>
                  <div style={{ fontSize: 12, color: accent, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {websiteUrl}
                  </div>
                </div>
                <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, border: `1px solid ${border}`, background: surface, color: textPrimary, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                  {copied ? <CheckCheck size={13} color={accent} /> : <Copy size={13} />}
                  {copied ? t('Copied!', 'Imenakiliwa!') : t('Copy link', 'Nakili')}
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: t('Visitors today', 'Wageni leo'), value: stats.pageViews, icon: Eye, color: accent, lightBg: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', trend: t('Total page views', 'Jumla ya maoni') },
                  { label: t('WhatsApp taps', 'Mabonyezo ya WhatsApp'), value: stats.whatsappTaps, icon: MessageCircle, color: '#25D366', lightBg: isDark ? 'rgba(37,211,102,0.08)' : '#F0FBF4', trend: t('People who messaged you', 'Watu waliokutumia ujumbe') },
                  { label: t('Directions taps', 'Mabonyezo ya Mwelekeo'), value: stats.directionsTaps, icon: MapPin, color: '#FF9F0A', lightBg: isDark ? 'rgba(255,159,10,0.08)' : '#FFF8EE', trend: t('People coming to you', 'Watu wanaokuja kwako') },
                ].map(stat => (
                  <div key={stat.label} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '18px 20px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: stat.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <stat.icon size={16} color={stat.color} />
                    </div>
                    <div style={{ fontSize: 12, color: textMuted, marginBottom: 4, fontWeight: 500 }}>{stat.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 700, color: textPrimary, lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: stat.color, fontWeight: 500 }}>{stat.trend}</div>
                  </div>
                ))}
              </div>

              {/* Bottom two col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>

                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{t('Your website', 'Tovuti yako')}</div>
                    {subscription.canEdit ? (
                      <button onClick={() => navigate('/dashboard/website')} style={{ fontSize: 12, color: accent, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                        {t('Edit with AI', 'Hariri na AI')} ↗
                      </button>
                    ) : (
                      <button onClick={() => navigate('/upgrade')} style={{ fontSize: 12, color: '#7C3AED', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={11} /> {t('Pro feature', 'Kipengele cha Pro')}
                      </button>
                    )}
                  </div>
                  <div style={{ background: isDark ? '#0D0D12' : '#F6F6F7', border: `1px solid ${border}`, borderRadius: 8, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, #004C3F, ${accent})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <div style={{ fontSize: 24 }}>{emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{business.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{business.address}</div>
                    </div>
                  </div>
                  <a href={websiteUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px', borderRadius: 7, border: 'none', background: accent, color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                    <ExternalLink size={13} /> {t('View full website', 'Angalia tovuti kamili')}
                  </a>
                </div>

                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>
                    {t('Grow your business', 'Kukuza biashara yako')}
                  </div>
                  <p style={{ fontSize: 12, color: textMuted, lineHeight: 1.6, marginBottom: 16 }}>
                    {t('Share your website link on WhatsApp Status. Businesses that do this get 3× more visitors.', 'Shiriki kiungo chako kwenye Hali ya WhatsApp. Biashara zinazofanya hivi zinapata wageni 3× zaidi.')}
                  </p>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${t('Check out my business online', 'Angalia biashara yangu mtandaoni')}: ${websiteUrl}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '10px', borderRadius: 7, border: 'none', background: '#25D366', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}
                  >
                    <MessageCircle size={14} /> {t('Share on WhatsApp', 'Shiriki kwenye WhatsApp')}
                  </a>
                  <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '10px', borderRadius: 7, border: `1px solid ${border}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    {copied ? <CheckCheck size={14} color={accent} /> : <Copy size={14} />}
                    {copied ? t('Link copied!', 'Kiungo imenakiliwa!') : t('Copy link', 'Nakili kiungo')}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <MobileNav />
    </div>
  )
}