import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2, Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async () => {
    if (!email) {
      setError(t('Please enter your email address.', 'Tafadhali ingiza anwani yako ya barua pepe.'))
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(t('Something went wrong. Please try again.', 'Kuna tatizo. Tafadhali jaribu tena.'))
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  const bg = isDark ? '#08090C' : '#f0f2f8'
  const surface = isDark ? '#111318' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,100,220,0.1)'
  const textPrimary = isDark ? '#F5F5F7' : '#1a1a2e'
  const textMuted = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(20,30,90,0.5)'
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,50,140,0.5)'

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>
            {t('Check your email', 'Angalia barua pepe yako')}
          </h1>
          <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7, marginBottom: 8 }}>
            {t('We sent a password reset link to', 'Tumekutumia kiungo cha kuweka upya nywila kwa')}
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 28 }}>{email}</p>
          <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, marginBottom: 32 }}>
            {t('Click the link in the email to reset your password. Check your spam folder if you don\'t see it.', 'Bonyeza kiungo katika barua pepe kuweka upya nywila yako. Angalia folda ya spam ikiwa huioni.')}
          </p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 11, background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
            {t('Back to sign in', 'Rudi kuingia')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '40px 36px', position: 'relative' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <Link to="/login" style={{ fontSize: 13, color: isDark ? '#444' : '#8090c0', textDecoration: 'none' }}>
            ← {t('Back to sign in', 'Rudi kuingia')}
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

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0A84FF', marginBottom: 10 }}>
            {t('Reset password', 'Weka upya nywila')}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.3px', marginBottom: 8 }}>
            {t('Forgot your password?', 'Umesahau nywila yako?')}
          </h1>
          <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>
            {t("No problem. Enter your email and we'll send you a reset link.", "Hakuna shida. Ingiza barua pepe yako na tutakutumia kiungo cha kuweka upya.")}
          </p>
        </div>

        {error && (
          <div style={{ padding: '11px 14px', borderRadius: 9, marginBottom: 16, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 13, color: '#FF453A' }}>
            {error}
          </div>
        )}

        {/* Email input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: labelColor, marginBottom: 6 }}>
            {t('Email address', 'Anwani ya barua pepe')}
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="you@example.com"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 16,
              border: `1.5px solid ${focused ? '#0A84FF' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,100,220,0.15)'}`,
              background: isDark ? (focused ? 'rgba(10,132,255,0.05)' : 'rgba(255,255,255,0.03)') : (focused ? 'rgba(10,100,220,0.04)' : 'rgba(10,100,220,0.02)'),
              color: textPrimary, fontFamily: "'DM Sans', sans-serif", outline: 'none',
              boxSizing: 'border-box', transition: 'all 0.2s',
            }}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(10,132,255,0.4)' : 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)', color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 20px rgba(10,132,255,0.4)', transition: 'all 0.2s', marginTop: 4 }}
        >
          {loading
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('Sending...', 'Inatuma...')}</>
            : <>{t('Send reset link', 'Tuma kiungo cha kuweka upya')} <ArrowRight size={15} /></>
          }
        </button>

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}