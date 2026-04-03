import { useEffect, useState } from 'react'
import { Globe, MessageCircle, MapPin, Eye, Settings, LogOut, Moon, Sun, TrendingUp, ExternalLink, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { getMyBusiness, getLeadStats } from '@/lib/db'
import type { Business } from '@/lib/db'

export default function DashboardPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [business, setBusiness] = useState<Business | null>(null)
  const [stats, setStats] = useState({ pageViews: 0, whatsappTaps: 0, directionsTaps: 0 })
  const [loading, setLoading] = useState(true)

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

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || t('there', 'wewe')
  const websiteUrl = business ? `${window.location.origin}/b/${business.slug}` : null

  const card: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
    borderRadius: 14,
    boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isDark ? '#0A0A0B' : '#F7F7F5', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', background: isDark ? 'rgba(14,15,20,0.97)' : 'rgba(255,255,255,0.97)', borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, height: '100vh', backdropFilter: 'blur(20px)' }}>

        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(10,132,255,0.4)' }}>
              <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 14 }}>O</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1D1D1F' }}>OfliX</span>
          </Link>
        </div>

        {/* Business status */}
        {business && (
          <div style={{ padding: '12px 14px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, background: isDark ? 'rgba(10,132,255,0.08)' : 'rgba(10,100,220,0.06)', border: isDark ? '1px solid rgba(10,132,255,0.15)' : '1px solid rgba(10,100,220,0.1)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14 }}>🏪</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#E5E5E7' : '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#30D158' }} />
                  <span style={{ fontSize: 10, color: '#30D158', fontWeight: 600 }}>{t('Live', 'Hai')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {[
            { label: t('Dashboard', 'Dashibodi'), icon: TrendingUp },
            { label: t('My Website', 'Tovuti Yangu'), icon: Globe, action: () => websiteUrl && window.open(websiteUrl, '_blank') },
            { label: t('Settings', 'Mipangilio'), icon: Settings },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, marginBottom: 1, border: 'none', fontSize: 13, color: isDark ? '#666' : '#888', background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
              <item.icon size={13} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '8px 8px 10px', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
          <button onClick={toggleLanguage} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: isDark ? '#555' : '#aaa', marginBottom: 1, fontFamily: "'DM Sans', sans-serif" }}>
            🌐 {language === 'en' ? 'Kiswahili' : 'English'}
          </button>
          <button onClick={toggleTheme} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: isDark ? '#555' : '#aaa', marginBottom: 1, fontFamily: "'DM Sans', sans-serif" }}>
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
            {isDark ? t('Light mode', 'Hali ya mwanga') : t('Dark mode', 'Hali ya giza')}
          </button>
          <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: isDark ? '#555' : '#aaa', fontFamily: "'DM Sans', sans-serif" }}>
            <LogOut size={12} /> {t('Sign out', 'Toka')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 36px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A84FF', marginBottom: 6 }}>
              {t('Dashboard', 'Dashibodi')}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1D1D1F', letterSpacing: '-0.3px', marginBottom: 4 }}>
              {t(`Good day, ${firstName} 👋`, `Habari, ${firstName} 👋`)}
            </h1>
            <p style={{ fontSize: 14, color: isDark ? '#555' : '#8090c0' }}>
              {business
                ? t("Here's how your business is doing online.", 'Hivi ndivyo biashara yako inavyofanya mtandaoni.')
                : t("Let's get your business online.", 'Hebu tuweke biashara yako mtandaoni.')}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} style={{ ...card, height: 80, padding: 20 }} />)}
            </div>
          ) : !business ? (
            /* No business yet */
            <div style={{ ...card, padding: '48px 32px', textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🏪</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1D1D1F', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
                {t("You don't have a website yet", 'Bado huna tovuti')}
              </h2>
              <p style={{ fontSize: 14, color: isDark ? '#555' : '#8090c0', marginBottom: 28, lineHeight: 1.6 }}>
                {t('Set up your business profile and get a professional website in minutes.', 'Sanidi wasifu wa biashara yako na upate tovuti ya kitaalamu kwa dakika chache.')}
              </p>
              <Link to="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 11, background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(10,132,255,0.35)' }}>
                <Plus size={16} /> {t('Set up my business', 'Sanidi biashara yangu')}
              </Link>
            </div>
          ) : (
            <>
              {/* Website URL */}
              <div style={{ ...card, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(10,132,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Globe size={18} color="#0A84FF" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: isDark ? '#555' : '#aaa', marginBottom: 2 }}>{t('Your website is live at', 'Tovuti yako iko hai kwenye')}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0A84FF', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {websiteUrl}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(websiteUrl || '').catch(() => {}) }} style={{ padding: '7px 14px', borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10,100,220,0.15)', background: 'transparent', color: isDark ? '#888' : '#6080cc', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    {t('Copy', 'Nakili')}
                  </button>
                  <a href={websiteUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                    <ExternalLink size={12} /> {t('View', 'Angalia')}
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: t('Page Views', 'Maoni ya Ukurasa'), value: stats.pageViews, icon: Eye, color: '#0A84FF' },
                  { label: t('WhatsApp Taps', 'Mabonyezo ya WhatsApp'), value: stats.whatsappTaps, icon: MessageCircle, color: '#25D366' },
                  { label: t('Directions Taps', 'Mabonyezo ya Mwelekeo'), value: stats.directionsTaps, icon: MapPin, color: '#FF9F0A' },
                ].map(stat => (
                  <div key={stat.label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <stat.icon size={18} color={stat.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: isDark ? '#F5F5F7' : '#1D1D1F', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: isDark ? '#555' : '#aaa', marginTop: 3 }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share tip */}
              <div style={{ ...card, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', background: isDark ? 'rgba(37,211,102,0.06)' : 'rgba(37,211,102,0.05)', border: isDark ? '1px solid rgba(37,211,102,0.15)' : '1px solid rgba(37,211,102,0.15)' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#E5E5E7' : '#1D1D1F', marginBottom: 4 }}>
                    {t('Share your website on WhatsApp Status', 'Shiriki tovuti yako kwenye Hali yako ya WhatsApp')}
                  </p>
                  <p style={{ fontSize: 12, color: isDark ? '#555' : '#8090c0', lineHeight: 1.6, marginBottom: 10 }}>
                    {t('Your contacts will see your business and visit your website directly.', 'Mawasiliano yako yataona biashara yako na kutembelea tovuti yako moja kwa moja.')}
                  </p>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out my business online: ${websiteUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <MessageCircle size={13} /> {t('Share now', 'Shiriki sasa')}
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}