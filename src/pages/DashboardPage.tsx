import { useState } from 'react'
import { Globe, MessageCircle, MapPin, Eye, Settings, LogOut, Moon, Sun, TrendingUp, Users, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

// Mock business data — will come from Supabase when connected
const MOCK_BUSINESS = {
  name: 'Mama Grace Salon',
  category: '💇 Salon & Beauty',
  address: 'Tom Mboya Street, Nairobi CBD',
  phone: '0712 345 678',
  whatsapp: '254712345678',
  websiteUrl: 'mama-grace-salon.oflix.co.ke',
  status: 'live',
}

const MOCK_STATS = [
  { en: 'Website Views', sw: 'Maoni ya Tovuti', value: '142', icon: Eye, color: '#0A84FF' },
  { en: 'WhatsApp Taps', sw: 'Mabonyezo ya WhatsApp', value: '28', icon: MessageCircle, color: '#25D366' },
  { en: 'Map Views', sw: 'Maoni ya Ramani', value: '54', icon: MapPin, color: '#FF9F0A' },
  { en: 'This Month', sw: 'Mwezi Huu', value: '↑ 23%', icon: TrendingUp, color: '#30D158' },
]

export default function DashboardPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  const s = {
    page: {
      display: 'flex' as const,
      minHeight: '100vh',
      background: isDark ? '#0A0A0B' : '#F7F7F5',
      fontFamily: "'DM Sans', sans-serif",
    },
    sidebar: {
      width: 220, flexShrink: 0,
      display: 'flex' as const, flexDirection: 'column' as const,
      background: isDark ? 'rgba(14,15,20,0.97)' : 'rgba(255,255,255,0.97)',
      borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
      position: 'sticky' as const, top: 0, height: '100vh',
      backdropFilter: 'blur(20px)',
    },
    card: {
      background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
    } as React.CSSProperties,
  }

  return (
    <div style={s.page}>

      {/* Sidebar */}
      <aside style={s.sidebar}>

        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(10,132,255,0.4)' }}>
              <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 14 }}>O</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1D1D1F', letterSpacing: '-0.3px' }}>OfliX</span>
          </Link>
        </div>

        {/* Business info */}
        <div style={{ padding: '14px 14px 10px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, background: isDark ? 'rgba(10,132,255,0.08)' : 'rgba(10,100,220,0.06)', border: isDark ? '1px solid rgba(10,132,255,0.15)' : '1px solid rgba(10,100,220,0.1)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14 }}>💇</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#E5E5E7' : '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{MOCK_BUSINESS.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#30D158' }} />
                <span style={{ fontSize: 10, color: '#30D158', fontWeight: 600 }}>{t('Live', 'Hai')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: isDark ? '#3a3a3c' : '#c0c0c0', padding: '8px 8px 5px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            {t('My Business', 'Biashara Yangu')}
          </div>
          {[
            { label: t('Overview', 'Muhtasari'), icon: TrendingUp, tab: 'overview' },
            { label: t('My Website', 'Tovuti Yangu'), icon: Globe, tab: null, href: `https://${MOCK_BUSINESS.websiteUrl}` },
            { label: t('Visitors', 'Wageni'), icon: Users, tab: null },
            { label: t('Settings', 'Mipangilio'), icon: Settings, tab: 'settings' },
          ].map(item => (
            item.href ? (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, marginBottom: 1, textDecoration: 'none', fontSize: 13, color: isDark ? '#666' : '#888', transition: 'all 0.15s' }}>
                <item.icon size={13} />
                <span style={{ flex: 1 }}>{item.label}</span>
                <ExternalLink size={10} />
              </a>
            ) : (
              <button key={item.label} onClick={() => item.tab && setActiveTab(item.tab as 'overview' | 'settings')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, marginBottom: 1, border: 'none', fontSize: 13, fontWeight: activeTab === item.tab ? 500 : 400, color: activeTab === item.tab ? (isDark ? '#fff' : '#1D1D1F') : (isDark ? '#666' : '#888'), background: activeTab === item.tab ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
                <item.icon size={13} />
                {item.label}
              </button>
            )
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
          <Link to="/" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 7, fontSize: 12, color: isDark ? '#555' : '#aaa', textDecoration: 'none' }}>
            <LogOut size={12} /> {t('Sign out', 'Toka')}
          </Link>
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
              {t('Good morning', 'Habari za asubuhi')} 👋
            </h1>
            <p style={{ fontSize: 14, color: isDark ? '#555' : '#8090c0' }}>
              {t('Here\'s how your business is doing online.', 'Hivi ndivyo biashara yako inavyofanya mtandaoni.')}
            </p>
          </div>

          {/* Website URL card */}
          <div style={{ ...s.card, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(10,132,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={18} color="#0A84FF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: isDark ? '#555' : '#aaa', marginBottom: 2 }}>{t('Your website is live at', 'Tovuti yako iko hai kwenye')}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0A84FF', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {MOCK_BUSINESS.websiteUrl}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { navigator.clipboard.writeText(`https://${MOCK_BUSINESS.websiteUrl}`).catch(() => {}) }}
                style={{ padding: '7px 14px', borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10,100,220,0.15)', background: 'transparent', color: isDark ? '#888' : '#6080cc', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('Copy link', 'Nakili kiungo')}
              </button>
              <a href={`https://${MOCK_BUSINESS.websiteUrl}`} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                <ExternalLink size={12} /> {t('View', 'Angalia')}
              </a>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
            {MOCK_STATS.map(stat => (
              <div key={stat.en} style={{ ...s.card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <stat.icon size={18} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: isDark ? '#F5F5F7' : '#1D1D1F', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: isDark ? '#555' : '#aaa', marginTop: 3 }}>{t(stat.en, stat.sw)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1D1D1F', fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
              {t('Quick Actions', 'Vitendo vya Haraka')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: t('Share on WhatsApp', 'Shiriki kwa WhatsApp'), icon: '📲', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(`Check out my business online: https://${MOCK_BUSINESS.websiteUrl}`)}` },
                { label: t('Get directions link', 'Pata kiungo cha mwelekeo'), icon: '📍', color: '#0A84FF', href: '#' },
                { label: t('Update my details', 'Sasisha maelezo yangu'), icon: '✏️', color: '#BF5AF2', href: '/onboarding' },
              ].map(action => (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={{ ...s.card, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: 24 }}>{action.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: isDark ? '#aaa' : '#555', lineHeight: 1.3 }}>{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* WhatsApp tip */}
          <div style={{ ...s.card, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', background: isDark ? 'rgba(37,211,102,0.06)' : 'rgba(37,211,102,0.05)', border: isDark ? '1px solid rgba(37,211,102,0.15)' : '1px solid rgba(37,211,102,0.15)' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#E5E5E7' : '#1D1D1F', marginBottom: 4 }}>
                {t('Pro tip: Share your website link on your WhatsApp Status', 'Kidokezo: Shiriki kiungo cha tovuti yako kwenye Hali yako ya WhatsApp')}
              </p>
              <p style={{ fontSize: 12, color: isDark ? '#555' : '#8090c0', lineHeight: 1.6 }}>
                {t(
                  'Your contacts will see your business and can visit your website directly. It\'s the fastest way to get your first customers.',
                  'Mawasiliano yako yataona biashara yako na yanaweza kutembelea tovuti yako moja kwa moja. Ndiyo njia ya haraka zaidi kupata wateja wako wa kwanza.'
                )}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
