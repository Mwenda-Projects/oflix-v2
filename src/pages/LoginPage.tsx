import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2, Globe, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { signIn } from '@/lib/db'

const ACCENT = '#008060'
const ACCENT_LIGHT = '#00C896'

export default function LoginPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSubmit = async () => {
    if (!email || !password) {
      setError(t('Please fill in both fields.', 'Tafadhali jaza sehemu zote mbili.'))
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError(t('Wrong email or password. Please try again.', 'Barua pepe au nywila si sahihi. Jaribu tena.'))
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '13px 16px', borderRadius: 10,
    border: `1.5px solid ${focused === field ? ACCENT : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,128,96,0.15)'}`,
    background: isDark ? (focused === field ? 'rgba(0,128,96,0.08)' : 'rgba(255,255,255,0.03)') : (focused === field ? 'rgba(0,128,96,0.05)' : 'rgba(0,128,96,0.02)'),
    color: isDark ? '#E5E5E7' : '#1a1a2e',
    fontSize: 16, // 16px prevents iOS auto-zoom on focus
    fontFamily: "'DM Sans', sans-serif", outline: 'none',
    boxSizing: 'border-box' as const, transition: 'all 0.2s',
    boxShadow: focused === field ? `0 0 0 3px ${isDark ? 'rgba(0,128,96,0.12)' : 'rgba(0,128,96,0.08)'}` : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: isDark ? '#08090C' : '#f0f8f4', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left marketing panel — hidden on mobile */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 64px', position: 'relative', overflow: 'hidden', background: isDark ? 'radial-gradient(ellipse 80% 70% at 10% 50%, rgba(0,128,96,0.25) 0%, transparent 60%), #08090C' : 'radial-gradient(ellipse 80% 70% at 10% 50%, rgba(0,128,96,0.12) 0%, transparent 60%), #dde9df' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: isDark ? 0.06 : 0.1, backgroundImage: `linear-gradient(rgba(0,128,96,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,128,96,0.5) 1px, transparent 1px)`, backgroundSize: '48px 48px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 64 }}>
              <img src="/favicon.svg" alt="OfliX" style={{ width: 34, height: 34, borderRadius: 9 }} />
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1a1a2e' }}>OfliX</span>
            </Link>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1a1a2e', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 16, maxWidth: 340 }}>
              {t('Welcome back, builder.', 'Karibu tena, mjenzi.')}
            </h2>
            <p style={{ fontSize: 15, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(20,50,40,0.5)', lineHeight: 1.7, maxWidth: 300 }}>
              {t('Your business website is waiting.', 'Tovuti ya biashara yako inakusubiri.')}
            </p>
          </div>
        </div>
      )}

      {/* Right form panel */}
      <div style={{
        width: isMobile ? '100%' : 500,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isMobile ? 'flex-start' : 'center',
        padding: isMobile ? '24px 24px 40px' : '48px 56px',
        background: isDark ? '#111318' : '#ffffff',
        borderLeft: isMobile ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,128,96,0.1)'),
        minHeight: isMobile ? '100vh' : 'auto',
        boxSizing: 'border-box' as const,
      }}>

        {/* Top nav bar — in normal flow on mobile, absolute on desktop */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? 32 : 0,
          ...(isMobile ? {} : { position: 'absolute' as const, top: 24, left: 28, right: 24 }),
        }}>
          {isMobile ? (
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/favicon.svg" alt="OfliX" style={{ width: 28, height: 28, borderRadius: 7 }} />
              <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1a1a2e' }}>OfliX</span>
            </Link>
          ) : (
            <Link to="/" style={{ fontSize: 13, color: isDark ? '#444' : '#6b9080', textDecoration: 'none' }}>← {t('Home', 'Nyumbani')}</Link>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,128,96,0.15)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: isDark ? '#555' : '#6b9080', fontFamily: "'DM Sans', sans-serif" }}>
              <Globe size={12} /> {language === 'en' ? 'SW' : 'EN'}
            </button>
            <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,128,96,0.15)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#555' : '#6b9080' }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>{t('Sign in', 'Ingia')}</p>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1a1a2e', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.3px', marginBottom: 8 }}>
            {t('Good to see you again.', 'Vizuri kukuona tena.')}
          </h1>
          <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(20,50,40,0.5)', lineHeight: 1.6 }}>
            {t('Sign in to manage your business website.', 'Ingia kusimamia tovuti ya biashara yako.')}
          </p>
        </div>

        {error && <div style={{ padding: '11px 14px', borderRadius: 9, marginBottom: 20, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 13, color: '#FF453A' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,50,40,0.5)', marginBottom: 7 }}>{t('Email address', 'Anwani ya barua pepe')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,50,40,0.5)' }}>{t('Password', 'Nywila')}</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none' }}>{t('Forgot?', 'Umesahau?')}</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle('password'), paddingRight: 44 }} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#444' : '#6b9080', display: 'flex', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(0,128,96,0.4)' : `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`, color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 20px rgba(0,128,96,0.4)', transition: 'all 0.2s', marginTop: 4 }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('Signing in...', 'Inaingia...')}</> : <>{t('Sign in', 'Ingia')} <ArrowRight size={15} /></>}
          </button>
        </div>

        <p style={{ fontSize: 13, color: isDark ? '#444' : '#6b9080', textAlign: 'center', marginTop: 28 }}>
          {t("Don't have an account?", 'Huna akaunti?')}{' '}
          <Link to="/signup" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>{t('Create one free →', 'Tengeneza bure →')}</Link>
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}