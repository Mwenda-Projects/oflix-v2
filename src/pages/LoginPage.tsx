import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2, Globe, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

export default function LoginPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email || !password) {
      setError(t('Please fill in all fields.', 'Tafadhali jaza sehemu zote.'))
      return
    }
    setLoading(true)
    setError(null)
    // Auth will be wired up when Supabase is connected
    setTimeout(() => {
      setLoading(false)
      setError(t('Sign in coming soon — backend not connected yet.', 'Kuingia kunakuja hivi karibuni.'))
    }, 1000)
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: 10,
    border: `1.5px solid ${focused === field
      ? '#0A84FF'
      : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,100,220,0.15)'}`,
    background: isDark
      ? focused === field ? 'rgba(10,132,255,0.05)' : 'rgba(255,255,255,0.03)'
      : focused === field ? 'rgba(10,100,220,0.04)' : 'rgba(10,100,220,0.02)',
    color: isDark ? '#E5E5E7' : '#1a1a2e',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    boxShadow: focused === field ? `0 0 0 3px ${isDark ? 'rgba(10,132,255,0.1)' : 'rgba(10,100,220,0.08)'}` : 'none',
  })

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: isDark ? '#08090C' : '#f0f2f8',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse 80% 70% at 10% 50%, rgba(10,132,255,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 20%, rgba(48,209,88,0.15) 0%, transparent 60%), #08090C'
          : 'radial-gradient(ellipse 80% 70% at 10% 50%, rgba(10,100,220,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 20%, rgba(48,180,80,0.1) 0%, transparent 60%), #dde4f5',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: isDark ? 0.06 : 0.1,
          backgroundImage: `linear-gradient(rgba(10,132,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(10,132,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 64 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 14px rgba(10,132,255,0.45)' }}>
              <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 18 }}>O</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isDark ? '#F5F5F7' : '#1a1a2e', letterSpacing: '-0.3px' }}>OfliX</span>
          </Link>

          <h2 style={{ fontSize: 34, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1a1a2e', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 16, maxWidth: 340 }}>
            {t('Welcome back, builder.', 'Karibu tena, mjenzi.')}
          </h2>
          <p style={{ fontSize: 15, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(20,30,80,0.5)', lineHeight: 1.7, maxWidth: 300 }}>
            {t(
              'Your business website is waiting. Sign in to manage it.',
              'Tovuti ya biashara yako inakusubiri. Ingia kuisimamia.'
            )}
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              t('Your website is live and running', 'Tovuti yako iko hai na inafanya kazi'),
              t('Customers can find you right now', 'Wateja wanaweza kukupata sasa hivi'),
              t('Update your details anytime', 'Sasisha maelezo yako wakati wowote'),
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A84FF', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(20,30,80,0.45)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 500, flexShrink: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 56px',
        background: isDark ? '#111318' : '#ffffff',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(10,100,220,0.1)',
        position: 'relative',
      }}>

        {/* Top actions */}
        <div style={{ position: 'absolute', top: 24, left: 28, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: isDark ? '#444' : '#8090c0', textDecoration: 'none' }}>
            ← {t('Home', 'Nyumbani')}
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10,100,220,0.15)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: isDark ? '#555' : '#8090c0', fontFamily: "'DM Sans', sans-serif" }}>
              <Globe size={12} /> {language === 'en' ? 'SW' : 'EN'}
            </button>
            <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10,100,220,0.15)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#555' : '#8090c0' }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0A84FF', marginBottom: 10 }}>
            {t('Sign in', 'Ingia')}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: isDark ? '#F5F5F7' : '#1a1a2e', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.3px', marginBottom: 8 }}>
            {t('Good to see you again.', 'Vizuri kukuona tena.')}
          </h1>
          <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(20,30,90,0.5)', lineHeight: 1.6 }}>
            {t('Sign in to manage your business website.', 'Ingia kusimamia tovuti ya biashara yako.')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '11px 14px', borderRadius: 9, marginBottom: 20, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 13, color: '#FF453A' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,50,140,0.5)', marginBottom: 7 }}>
              {t('Email address', 'Anwani ya barua pepe')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle('email')}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,50,140,0.5)' }}>
                {t('Password', 'Nywila')}
              </label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#0A84FF', textDecoration: 'none' }}>
                {t('Forgot?', 'Umesahau?')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle('password'), paddingRight: 44 }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#444' : '#8090c0', display: 'flex', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 11, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(10,132,255,0.4)' : 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
              color: 'white', fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(10,132,255,0.4)',
              transition: 'all 0.2s', marginTop: 4,
            }}
          >
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('Signing in...', 'Inaingia...')}</>
              : <>{t('Sign in', 'Ingia')} <ArrowRight size={15} /></>
            }
          </button>
        </div>

        {/* Sign up link */}
        <p style={{ fontSize: 13, color: isDark ? '#444' : '#8090c0', textAlign: 'center', marginTop: 28 }}>
          {t("Don't have an account?", 'Huna akaunti?')}{' '}
          <Link to="/signup" style={{ color: '#0A84FF', textDecoration: 'none', fontWeight: 600 }}>
            {t('Create one free →', 'Tengeneza bure →')}
          </Link>
        </p>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
