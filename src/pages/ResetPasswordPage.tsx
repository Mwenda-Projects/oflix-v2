import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2, Check, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Supabase puts the access token in the URL hash after the reset email link is clicked
    // We listen for the PASSWORD_RECOVERY event to confirm the session is valid
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
      }
      setChecking(false)
    })

    // Also check if already in a valid session from the hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
      setChecking(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async () => {
    if (!password) {
      setError(t('Please enter a new password.', 'Tafadhali ingiza nywila mpya.'))
      return
    }
    if (password.length < 8) {
      setError(t('Password must be at least 8 characters.', 'Nywila lazima iwe na herufi 8 au zaidi.'))
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(t('Something went wrong. Please request a new reset link.', 'Kuna tatizo. Tafadhali omba kiungo kipya cha kuweka upya.'))
      setLoading(false)
    } else {
      setDone(true)
      setLoading(false)
      setTimeout(() => navigate('/dashboard'), 2500)
    }
  }

  const bg = isDark ? '#08090C' : '#f0f2f8'
  const surface = isDark ? '#111318' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,100,220,0.1)'
  const textPrimary = isDark ? '#F5F5F7' : '#1a1a2e'
  const textMuted = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(20,30,90,0.5)'
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,50,140,0.5)'

  // Still checking session
  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: "'DM Sans', sans-serif" }}>
        <Loader2 size={24} color="#0A84FF" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Invalid or expired link
  if (!validSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔗</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>
            {t('Link expired', 'Kiungo kimeisha muda')}
          </h1>
          <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7, marginBottom: 28 }}>
            {t('This password reset link is invalid or has expired. Please request a new one.', 'Kiungo hiki cha kuweka upya nywila si sahihi au kimeisha muda. Tafadhali omba kipya.')}
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 11, background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
          >
            {t('Request new link', 'Omba kiungo kipya')} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(48,209,88,0.12)', border: '1.5px solid rgba(48,209,88,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={28} color="#30D158" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>
            {t('Password updated!', 'Nywila imesasishwa!')}
          </h1>
          <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7 }}>
            {t('Taking you to your dashboard...', 'Inakupeleka kwenye dashibodi yako...')}
          </p>
        </div>
      </div>
    )
  }

  // Main reset form
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '40px 36px' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 36 }}>
          <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10,100,220,0.15)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#555' : '#8090c0' }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0A84FF', marginBottom: 10 }}>
            {t('New password', 'Nywila mpya')}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.3px', marginBottom: 8 }}>
            {t('Set a new password', 'Weka nywila mpya')}
          </h1>
          <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>
            {t('Choose a strong password of at least 8 characters.', 'Chagua nywila imara ya angalau herufi 8.')}
          </p>
        </div>

        {error && (
          <div style={{ padding: '11px 14px', borderRadius: 9, marginBottom: 16, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 13, color: '#FF453A' }}>
            {error}
          </div>
        )}

        {/* Password input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: labelColor, marginBottom: 6 }}>
            {t('New password', 'Nywila mpya')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={t('At least 8 characters', 'Angalau herufi 8')}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10, fontSize: 16,
                border: `1.5px solid ${focused ? '#0A84FF' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,100,220,0.15)'}`,
                background: isDark ? (focused ? 'rgba(10,132,255,0.05)' : 'rgba(255,255,255,0.03)') : (focused ? 'rgba(10,100,220,0.04)' : 'rgba(10,100,220,0.02)'),
                color: textPrimary, fontFamily: "'DM Sans', sans-serif", outline: 'none',
                boxSizing: 'border-box' as const, transition: 'all 0.2s',
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#444' : '#8090c0', display: 'flex', padding: 0 }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(10,132,255,0.4)' : 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)', color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 20px rgba(10,132,255,0.4)', transition: 'all 0.2s', marginTop: 4 }}
        >
          {loading
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('Updating...', 'Inasasisha...')}</>
            : <>{t('Update password', 'Sasisha nywila')} <ArrowRight size={15} /></>
          }
        </button>

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}