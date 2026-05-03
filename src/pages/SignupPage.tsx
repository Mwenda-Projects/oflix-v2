import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2, Check, Globe, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { signUp } from '@/lib/db'

export default function SignupPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError(t('Please fill in all fields.', 'Tafadhali jaza sehemu zote.'))
      return
    }
    if (password.length < 8) {
      setError(t('Password must be at least 8 characters.', 'Nywila lazima iwe na herufi 8 au zaidi.'))
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await signUp(email, password, name)
    if (error) {
      setError(t('Something went wrong. Try again.', 'Kuna tatizo. Jaribu tena.'))
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1.5px solid ${focused === field ? '#0A84FF' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,100,220,0.15)'}`,
    background: isDark ? (focused === field ? 'rgba(10,132,255,0.05)' : 'rgba(255,255,255,0.03)') : (focused === field ? 'rgba(10,100,220,0.04)' : 'rgba(10,100,220,0.02)'),
    color: isDark ? '#E5E5E7' : '#1a1a2e',
    fontSize: 16, // 16px prevents iOS auto-zoom on focus
    fontFamily: "'DM Sans', sans-serif", outline: 'none',
    boxSizing: 'border-box' as const, transition: 'all 0.2s',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
    textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,50,140,0.5)', marginBottom: 6
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#08090C' : '#f0f2f8', fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(48,209,88,0.12)', border: '1.5px solid rgba(48,209,88,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={28} color="#30D158" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1a1a2e', fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>
            {t("You're almost in!", 'Uko karibu kuingia!')}
          </h1>
          <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(20,30,90,0.5)', lineHeight: 1.7, marginBottom: 8 }}>
            {t('We sent a confirmation link to', 'Tumekutumia kiungo cha uthibitisho kwa')}
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#E5E5E7' : '#1a1a2e', marginBottom: 28 }}>{email}</p>
          <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(20,30,90,0.4)', lineHeight: 1.6, marginBottom: 32 }}>
            {t('Click the link to activate your account — then set up your business website.', 'Bonyeza kiungo kuthibitisha akaunti yako — kisha usanidi tovuti ya biashara yako.')}
          </p>
          <button onClick={() => navigate('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 11, background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            {t('Go to sign in', 'Nenda kuingia')} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: isDark ? '#08090C' : '#f0f2f8', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left marketing panel — hidden on mobile */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 64px', position: 'relative', overflow: 'hidden', background: isDark ? 'radial-gradient(ellipse 80% 70% at 10% 50%, rgba(48,209,88,0.2) 0%, transparent 60%), #08090C' : 'radial-gradient(ellipse 80% 70% at 10% 50%, rgba(48,180,80,0.12) 0%, transparent 60%), #dde4f5' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: isDark ? 0.06 : 0.1, backgroundImage: `linear-gradient(rgba(48,209,88,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(48,209,88,0.4) 1px, transparent 1px)`, backgroundSize: '48px 48px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 64 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 18 }}>O</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1a1a2e' }}>OfliX</span>
            </Link>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#30D158', marginBottom: 12 }}>🇰🇪 {t('Built for Kenya', 'Imetengenezwa kwa Kenya')}</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1a1a2e', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 16, maxWidth: 320 }}>
              {t('Get your business online today.', 'Weka biashara yako mtandaoni leo.')}
            </h2>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                t('Free website in under 10 minutes', 'Tovuti ya bure kwa chini ya dakika 10'),
                t('WhatsApp button included', 'Kitufe cha WhatsApp kimejumuishwa'),
                t('Your location on Google Maps', 'Eneo lako kwenye Google Maps'),
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={14} color="#30D158" />
                  <span style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(20,30,80,0.5)' }}>{item}</span>
                </div>
              ))}
            </div>
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
        borderLeft: isMobile ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(10,100,220,0.1)'),
        minHeight: isMobile ? '100vh' : 'auto',
        boxSizing: 'border-box',
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
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 15 }}>O</span>
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1a1a2e' }}>OfliX</span>
            </Link>
          ) : (
            <Link to="/" style={{ fontSize: 13, color: isDark ? '#444' : '#8090c0', textDecoration: 'none' }}>← {t('Home', 'Nyumbani')}</Link>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10,100,220,0.15)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: isDark ? '#555' : '#8090c0', fontFamily: "'DM Sans', sans-serif" }}>
              <Globe size={12} /> {language === 'en' ? 'SW' : 'EN'}
            </button>
            <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10,100,220,0.15)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#555' : '#8090c0' }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0A84FF', marginBottom: 10 }}>{t('Create your account', 'Tengeneza akaunti yako')}</p>
          <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1a1a2e', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.3px', marginBottom: 8 }}>
            {t('Your business deserves to be online.', 'Biashara yako inastahili kuwa mtandaoni.')}
          </h1>
          <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(20,30,90,0.5)', lineHeight: 1.6 }}>
            {t('Free to start. No credit card needed.', 'Bure kuanza. Hakuna kadi ya benki inayohitajika.')}
          </p>
        </div>

        {error && <div style={{ padding: '11px 14px', borderRadius: 9, marginBottom: 16, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 13, color: '#FF453A' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>{t('Your name', 'Jina lako')}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('Grace Wanjiku', 'Grace Wanjiku')} style={inputStyle('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
          </div>
          <div>
            <label style={labelStyle}>{t('Email address', 'Anwani ya barua pepe')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
          </div>
          <div>
            <label style={labelStyle}>{t('Choose a password', 'Chagua nywila')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder={t('At least 8 characters', 'Angalau herufi 8')} style={{ ...inputStyle('password'), paddingRight: 44 }} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#444' : '#8090c0', display: 'flex', padding: 0 }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(10,132,255,0.4)' : 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)', color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 20px rgba(10,132,255,0.4)', transition: 'all 0.2s', marginTop: 4 }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('Creating account...', 'Inaunda akaunti...')}</> : <>{t('Create free account', 'Tengeneza akaunti ya bure')} <ArrowRight size={15} /></>}
          </button>
        </div>

        <p style={{ fontSize: 13, color: isDark ? '#444' : '#8090c0', textAlign: 'center', marginTop: 24 }}>
          {t('Already have an account?', 'Una akaunti tayari?')}{' '}
          <Link to="/login" style={{ color: '#0A84FF', textDecoration: 'none', fontWeight: 600 }}>{t('Sign in →', 'Ingia →')}</Link>
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}