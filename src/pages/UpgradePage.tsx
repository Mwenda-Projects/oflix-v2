import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Check, Sparkles, ArrowLeft, Phone } from 'lucide-react'

type Plan = 'monthly' | 'annual'

const PLANS = {
  monthly: {
    name: 'Pro Monthly',
    price: 299,
    period: 'month',
    color: '#7C3AED',
    features: [
      'Custom site editing',
      'Removal of OfliX badge',
      'Direct WhatsApp ordering buttons',
      'Location map',
    ],
  },
  annual: {
    name: 'Pro Annual',
    price: 2499,
    period: 'year',
    color: '#7C3AED',
    savings: 'Save ~30%',
    features: [
      'All Pro features',
      'Priority support',
      'Custom domain support (when live)',
      'One M-Pesa prompt per year',
    ],
  },
}

export default function UpgradePage() {
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const { user, session } = useAuth()
  const navigate = useNavigate()

  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'choose' | 'pay' | 'waiting' | 'success' | 'error'>('choose')
  const [errorMsg, setErrorMsg] = useState('')

  const bg = isDark ? '#0F1011' : '#F6F6F7'
  const surface = isDark ? '#1C1C1E' : '#FFFFFF'
  const border = isDark ? '#2A2A2A' : '#E5E5E5'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#666' : '#6D7175'
  const accent = '#008060'

  const handlePay = async () => {
    const cleanPhone = phone.trim()
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg(t('Please enter a valid phone number', 'Tafadhali weka nambari sahihi ya simu'))
      return
    }
    if (!user?.id) {
      setErrorMsg(t('Please log in first', 'Tafadhali ingia kwanza'))
      return
    }
    if (!session?.access_token) {
      setErrorMsg(t('Your session has expired. Please log in again.', 'Muda wa kikao chako umeisha. Tafadhali ingia tena.'))
      return
    }

    setStep('waiting')
    setErrorMsg('')

    try {
      const response = await fetch('/api/mpesa-stk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          phone: cleanPhone,
          billingCycle: selectedPlan,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || t('Payment failed. Please try again.', 'Malipo hayakufaulu. Jaribu tena.'))
        setStep('pay')
        return
      }

      // Poll Supabase every 3 seconds for up to 2 minutes
      let attempts = 0
      const maxAttempts = 40

      const poll = setInterval(async () => {
        attempts++
        try {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('plan')
            .eq('user_id', user.id)
            .single()

          if (sub?.plan === 'pro') {
            clearInterval(poll)
            setStep('success')
            setTimeout(() => navigate('/dashboard'), 3000)
            return
          }

          if (attempts >= maxAttempts) {
            clearInterval(poll)
            setErrorMsg(t(
              'Payment may have been received but we could not confirm. Please contact support.',
              'Malipo yanaweza kuwa yamepokelewa lakini hatukuweza kuthibitisha. Tafadhali wasiliana na msaada.'
            ))
            setStep('error')
          }
        } catch {
          // keep polling silently
        }
      }, 3000)

    } catch {
      setErrorMsg(t('Something went wrong. Please try again.', 'Hitilafu fulani imetokea. Jaribu tena.'))
      setStep('pay')
    }
  }

  // ── Success screen ────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,128,96,0.1)', border: '2px solid rgba(0,128,96,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={32} color={accent} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, marginBottom: 8, letterSpacing: '-0.3px' }}>
            {t('Welcome to OfliX Pro! 🎉', 'Karibu OfliX Pro! 🎉')}
          </h2>
          <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.6 }}>
            {t('Your account has been upgraded. Taking you to your dashboard...', 'Akaunti yako imeboreshwa. Tunakupeleka kwenye dashibodi yako...')}
          </p>
        </div>
      </div>
    )
  }

  // ── Waiting screen ────────────────────────────────────────────
  if (step === 'waiting') {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulse 2s ease infinite' }}>
            <Phone size={28} color="white" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 8, letterSpacing: '-0.3px' }}>
            {t('Check your phone', 'Angalia simu yako')}
          </h2>
          <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7, marginBottom: 8 }}>
            {t(
              'An M-Pesa prompt has been sent to your phone. Enter your PIN to complete the payment.',
              'Ombi la M-Pesa limetumwa kwenye simu yako. Weka PIN yako kukamilisha malipo.'
            )}
          </p>
          <p style={{ fontSize: 13, color: accent, fontWeight: 500 }}>
            KES {PLANS[selectedPlan].price}/{PLANS[selectedPlan].period} → OfliX {PLANS[selectedPlan].name}
          </p>
          <p style={{ fontSize: 12, color: textMuted, marginTop: 24 }}>
            {t('Waiting for payment confirmation...', 'Tunasubiri uthibitisho wa malipo...')}
          </p>
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`}</style>
      </div>
    )
  }

  // ── Main upgrade page ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'DM Sans', sans-serif", padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 32, fontFamily: "'DM Sans', sans-serif", padding: 0 }}
        >
          <ArrowLeft size={14} /> {t('Back to dashboard', 'Rudi kwenye dashibodi')}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: isDark ? 'rgba(0,128,96,0.1)' : '#F1F8F5', border: `1px solid ${isDark ? 'rgba(0,128,96,0.2)' : '#B3D9CC'}`, fontSize: 12, color: accent, fontWeight: 600, marginBottom: 16 }}>
            <Sparkles size={12} /> {t('Upgrade your plan', 'Boresha mpango wako')}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: textPrimary, letterSpacing: '-0.4px', marginBottom: 8 }}>
            {t('Choose your plan', 'Chagua mpango wako')}
          </h1>
          <p style={{ fontSize: 14, color: textMuted }}>
            {t('Pay with M-Pesa. No credit card needed.', 'Lipa na M-Pesa. Hakuna kadi ya benki inayohitajika.')}
          </p>
        </div>

        {/* Plan cards */}
        {step === 'choose' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {(Object.keys(PLANS) as Plan[]).map(planKey => {
                const plan = PLANS[planKey]
                const isSelected = selectedPlan === planKey
                return (
                  <div
                    key={planKey}
                    onClick={() => setSelectedPlan(planKey)}
                    style={{ background: surface, border: isSelected ? `2px solid ${plan.color}` : `1px solid ${border}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}
                  >
                    {planKey === 'annual' && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#7C3AED', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        {t('Save ~30%', 'Okoa ~30%')}
                      </div>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? plan.color : textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      {plan.name}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: textPrimary, letterSpacing: '-0.5px', marginBottom: 4 }}>
                      KES {plan.price}
                    </div>
                    <div style={{ fontSize: 12, color: textMuted, marginBottom: 16 }}>
                      {plan.period === 'year' ? t('/year', '/mwaka') : t('/month', '/mwezi')}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12 }}>
                          <Check size={12} color={plan.color} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span style={{ color: textPrimary, lineHeight: 1.4 }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setStep('pay')}
              style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: PLANS[selectedPlan].color, color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {t(`Continue with ${PLANS[selectedPlan].name}`, `Endelea na ${PLANS[selectedPlan].name}`)}
              <span style={{ fontSize: 13, opacity: 0.85 }}>KES {PLANS[selectedPlan].price}/{PLANS[selectedPlan].period === 'year' ? 'yr' : 'mo'}</span>
            </button>
          </>
        )}

        {/* Payment step */}
        {step === 'pay' && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>
                {t('Selected plan', 'Mpango uliochaguliwa')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: isDark ? 'rgba(0,128,96,0.08)' : '#F1F8F5', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(0,128,96,0.2)' : '#B3D9CC'}` }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>OfliX {PLANS[selectedPlan].name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: accent }}>KES {PLANS[selectedPlan].price}/{PLANS[selectedPlan].period === 'year' ? 'yr' : 'mo'}</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>
                {t('Your M-Pesa phone number', 'Nambari yako ya M-Pesa')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 0712 345 678"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: `1.5px solid ${border}`, background: isDark ? '#111' : '#FFF', color: textPrimary, fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e => e.target.style.borderColor = border}
              />
              <p style={{ fontSize: 12, color: textMuted, marginTop: 6 }}>
                {t('You will receive an M-Pesa prompt on this number.', 'Utapokea ombi la M-Pesa kwenye nambari hii.')}
              </p>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 13, color: '#FF453A', marginBottom: 16 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setStep('choose')}
                style={{ padding: '12px 20px', borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('Back', 'Rudi')}
              </button>
              <button
                onClick={handlePay}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: accent, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Phone size={15} />
                {t('Pay with M-Pesa', 'Lipa na M-Pesa')} — KES {PLANS[selectedPlan].price}
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {step === 'error' && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>
              {t('Payment confirmation pending', 'Uthibitisho wa malipo unasubiri')}
            </h3>
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, marginBottom: 20 }}>{errorMsg}</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: accent, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              {t('Go to dashboard', 'Nenda kwenye dashibodi')}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: textMuted, marginTop: 20 }}>
          🔒 {t('Payments are processed securely via Safaricom M-Pesa.', 'Malipo yanashughulikiwa kwa usalama kupitia Safaricom M-Pesa.')}
        </p>
      </div>
    </div>
  )
}