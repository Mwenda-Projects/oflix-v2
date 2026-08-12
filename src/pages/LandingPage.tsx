import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import {
  ArrowRight, MessageCircle, MapPin, Globe,
  Zap, Shield, Smartphone, Check, Moon, Sun,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const accent = '#008060'
const accentLight = '#F1F8F5'
const accentBorder = '#B3D9CC'

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t, language, toggleLanguage } = useLanguage()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const bg = isDark ? '#0D0D12' : '#FFFFFF'
  const surface = isDark ? '#111318' : '#FFFFFF'
  const surfaceAlt = isDark ? '#0D0D12' : '#F6F6F7'
  const border = isDark ? '#1E1E24' : '#E5E5E5'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#666' : '#6D7175'
  const cardBg = isDark ? '#111318' : '#FFFFFF'
  const cardBorder = isDark ? '#1E1E24' : '#E5E5E5'

  return (
    <div style={{ background: bg, color: textPrimary, fontFamily: "'DM Sans', sans-serif", minHeight: '100vh' }}>

      {/* ── Responsive styles ──────────────────────────────── */}
      <style>{`
        .oflix-nav-links { display: flex; align-items: center; gap: 24px; }
        .oflix-nav-login { display: flex; }
        .oflix-nav-lang { display: flex; }
        .pricing-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .how-it-works-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 768px) {
          .oflix-nav-links { display: none !important; }
          .oflix-nav-login { display: none !important; }
          .oflix-nav-lang { display: none !important; }
          .pricing-grid-3 { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; }
          .how-it-works-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .oflix-ctas { flex-direction: column !important; align-items: stretch !important; }
          .oflix-ctas a, .oflix-ctas button { text-align: center; justify-content: center !important; }
          .oflix-final-cta { width: 100%; box-sizing: border-box; }
        }
      `}</style>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDark ? 'rgba(13,13,18,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${border}`,
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/favicon.svg" alt="OfliX" style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: textPrimary, letterSpacing: '-0.3px' }}>OfliX</span>
        </Link>

        <div className="oflix-nav-links">
          <a href="#how-it-works" style={{ fontSize: 14, color: textMuted, textDecoration: 'none', fontWeight: 500 }}>
            {t('How it works', 'Jinsi inavyofanya kazi')}
          </a>
          <a href="#features" style={{ fontSize: 14, color: textMuted, textDecoration: 'none', fontWeight: 500 }}>
            {t('Features', 'Vipengele')}
          </a>
          <a href="#pricing" style={{ fontSize: 14, color: textMuted, textDecoration: 'none', fontWeight: 500 }}>
            {t('Pricing', 'Bei')}
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggleLanguage} className="oflix-nav-lang" style={{ fontSize: 12, color: textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '4px 8px' }}>
            {language === 'en' ? 'SW' : 'EN'}
          </button>
          <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link to="/login" className="oflix-nav-login" style={{ fontSize: 13, color: textMuted, textDecoration: 'none', padding: '7px 14px', fontWeight: 500 }}>
            {t('Log in', 'Ingia')}
          </Link>
          <Link to="/signup" style={{
            fontSize: 13, fontWeight: 600, color: 'white',
            background: accent, padding: '8px 16px',
            borderRadius: 8, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 5,
            whiteSpace: 'nowrap',
          }}>
            {t('Get started', 'Anza')} <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '52px 20px 44px' : '80px 24px 60px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20,
          background: accentLight, border: `1px solid ${accentBorder}`,
          fontSize: 12, fontWeight: 600, color: accent,
          marginBottom: 24,
        }}>
          🇰🇪 {t('Built for Kenyan businesses', 'Imetengenezwa kwa biashara za Kenya')}
        </div>

        <h1 style={{
          fontSize: isMobile ? '36px' : 'clamp(36px, 6vw, 64px)',
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-1.5px',
          color: textPrimary,
          marginBottom: 20,
        }}>
          {t('Your business,', 'Biashara yako,')}
          <br />
          <span style={{ color: accent }}>{t('online in minutes.', 'mtandaoni kwa dakika.')}</span>
        </h1>

        <p style={{
          fontSize: isMobile ? 16 : 18, color: textMuted, lineHeight: 1.7,
          maxWidth: 560, margin: '0 auto 12px', fontWeight: 400,
        }}>
          {t(
            'No technical knowledge needed. Just describe your business — OfliX builds you a professional website instantly.',
            'Hakuna ujuzi wa teknolojia unaohitajika. Elezea tu biashara yako — OfliX inakutengenezea tovuti ya kitaalamu mara moja.'
          )}
        </p>

        <p style={{ fontSize: 14, color: textMuted, marginBottom: 36 }}>
          💡 {t(
            'If you can describe your business on WhatsApp, you can use OfliX.',
            'Kama unaweza kuelezea biashara yako kwa WhatsApp, unaweza kutumia OfliX.'
          )}
        </p>

        <div className="oflix-ctas" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10,
            background: accent, color: 'white',
            fontSize: 15, fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,128,96,0.35)',
          }}>
            {t('Get my business online', 'Weka biashara yangu mtandaoni')}
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10,
            border: `1px solid ${border}`,
            background: surface, color: textPrimary,
            fontSize: 15, fontWeight: 500,
            textDecoration: 'none',
          }}>
            {t('See how it works', 'Ona jinsi inavyofanya kazi')}
          </a>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {[
            t('✓ Free to start', '✓ Bure kuanza'),
            t('✓ No credit card', '✓ Hakuna kadi ya benki'),
            t('✓ Ready in 2 minutes', '✓ Tayari kwa dakika 2'),
          ].map(pill => (
            <span key={pill} style={{ fontSize: 13, color: accent, fontWeight: 500 }}>{pill}</span>
          ))}
        </div>
      </section>

      {/* ── Mock website preview ─────────────────────────── */}
      <section style={{ padding: isMobile ? '0 20px 60px' : '0 24px 80px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{
          background: cardBg, border: `1px solid ${cardBorder}`,
          borderRadius: 16, overflow: 'hidden',
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            padding: '12px 16px',
            background: isDark ? '#1A1A1A' : '#F5F5F5',
            borderBottom: `1px solid ${cardBorder}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{
              flex: 1, height: 24, borderRadius: 6,
              background: isDark ? '#111' : '#E5E5E5',
              display: 'flex', alignItems: 'center', paddingLeft: 10,
              fontSize: 11, color: textMuted, fontFamily: 'monospace',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>
              oflix.co.ke/b/mama-grace-salon
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #004C3F, #008060)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💇</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>Mama Grace Salon</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>Tom Mboya Street, Nairobi CBD</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 20px', borderRadius: 8, background: '#25D366', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={14} /> WhatsApp
              </div>
              <div style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> Directions
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 24px', background: cardBg }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>About</p>
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, marginBottom: 0 }}>
              {t(
                'Professional hair styling, braiding, and beauty treatments. Walk-ins welcome every day from 8am–7pm.',
                'Usafi wa nywele wa kitaalamu, kusuka, na matibabu ya uzuri. Karibuni bila miadi kila siku 8am–7pm.'
              )}
            </p>
          </div>

          <div style={{ padding: '12px 24px', borderTop: `1px solid ${cardBorder}`, background: isDark ? '#0D0D12' : '#F9F9F9' }}>
            <p style={{ fontSize: 12, color: accent, textAlign: 'center', fontWeight: 500 }}>
              ✓ {t('This is what your business will look like online', 'Hivi ndivyo biashara yako itakavyoonekana mtandaoni')}
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: isMobile ? '60px 20px' : '80px 24px', background: surfaceAlt }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, marginBottom: 10 }}>
            {t('How it works', 'Jinsi inavyofanya kazi')}
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.5px', color: textPrimary, marginBottom: 12 }}>
            {t('3 steps. 2 minutes. Done.', 'Hatua 3. Dakika 2. Imeisha.')}
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: textMuted, marginBottom: 52, lineHeight: 1.6 }}>
            {t(
              'No forms to fill. No developer to hire. Just answer a few questions and your website is live.',
              'Hakuna fomu za kujaza. Hakuna msanidi wa kuajiri. Jibu maswali machache tu na tovuti yako iko hai.'
            )}
          </p>

          <div className="how-it-works-3">
            {[
              {
                step: '01',
                icon: '💬',
                title: t('Describe your business', 'Elezea biashara yako'),
                desc: t('Answer 5 simple questions — just like texting a friend.', 'Jibu maswali 5 rahisi — kama kutuma ujumbe kwa rafiki.'),
              },
              {
                step: '02',
                icon: '✨',
                title: t('AI builds your website', 'AI inajenga tovuti yako'),
                desc: t('Our AI designs a professional website specifically for your business.', 'AI yetu inabuni tovuti ya kitaalamu hasa kwa biashara yako.'),
              },
              {
                step: '03',
                icon: '🚀',
                title: t('Share & get customers', 'Shiriki na upate wateja'),
                desc: t('Your website is live. Share the link on WhatsApp Status and start getting customers.', 'Tovuti yako iko hai. Shiriki kiungo kwenye Hali ya WhatsApp na anza kupata wateja.'),
              },
            ].map(item => (
              <div key={item.step} style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 12, padding: '28px 24px', textAlign: 'left',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.1em', marginBottom: 12 }}>
                  {item.step}
                </div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" style={{ padding: isMobile ? '60px 20px' : '80px 24px', background: surface }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, marginBottom: 10 }}>
              {t('What you get', 'Unachopata')}
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.5px', color: textPrimary, marginBottom: 12 }}>
              {t('Everything your business needs', 'Kila kitu biashara yako inachohitaji')}
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: textMuted, maxWidth: 480, margin: '0 auto' }}>
              {t('No extras. No complications. Just the tools that help your business grow.', 'Hakuna ziada. Hakuna matatizo. Tu zana zinazokusaidia kukua.')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { icon: Globe, color: accent, bg: accentLight, title: t('Professional website', 'Tovuti ya kitaalamu'), desc: t('A real website with your own link — not a social media page.', 'Tovuti halisi na kiungo chako — si ukurasa wa mitandao ya kijamii.') },
              { icon: MessageCircle, color: '#25D366', bg: '#F0FBF4', title: t('WhatsApp button', 'Kitufe cha WhatsApp'), desc: t('Customers tap once and land straight in your WhatsApp chat.', 'Wateja wanabonyeza mara moja na wafike moja kwa moja kwenye mazungumzo yako.') },
              { icon: MapPin, color: '#FF9F0A', bg: '#FFF8EE', title: t('Google Maps location', 'Eneo la Google Maps'), desc: t('Customers get directions to your business with one tap.', 'Wateja wanapata mwelekeo wa biashara yako kwa kubonyeza mara moja.') },
              { icon: Smartphone, color: '#7C3AED', bg: '#F5F3FF', title: t('Mobile-first design', 'Muundo wa simu kwanza'), desc: t('Looks perfect on every phone — from basic Android to iPhone.', 'Inaonekana vizuri kwenye kila simu — kutoka Android ya kawaida hadi iPhone.') },
              { icon: Zap, color: '#F59E0B', bg: '#FFFBEB', title: t('Ready in minutes', 'Tayari kwa dakika'), desc: t('Traditional developers take weeks. OfliX takes 2 minutes.', 'Wasanidi wa jadi huchukua wiki. OfliX inachukua dakika 2.') },
              { icon: Shield, color: accent, bg: accentLight, title: t('Yours forever', 'Yako milele'), desc: t('Update your details anytime — no developer needed ever again.', 'Sasisha maelezo yako wakati wowote — msanidi hauhitajiki tena.') },
            ].map(f => (
              <div key={f.title} style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 12, padding: '22px 20px',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: f.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <f.icon size={17} color={f.color} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" style={{ padding: isMobile ? '60px 20px' : '80px 24px', background: surfaceAlt }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, marginBottom: 10 }}>
              {t('Pricing', 'Bei')}
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.5px', color: textPrimary, marginBottom: 12 }}>
              {t('Simple, fair pricing.', 'Bei rahisi na ya haki.')}
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: textMuted }}>
              {t('Start free. Upgrade when ready. No hidden costs.', 'Anza bure. Panda daraja ukiwa tayari. Hakuna gharama zilizofichwa.')}
            </p>
          </div>

          <div className="pricing-grid-3">
            {[
              {
                name: t('Starter', 'Kianzio'),
                price: t('Free', 'Bure'),
                period: '',
                savings: '',
                desc: t('New users & trial validation.', 'Watumiaji wapya na majaribio.'),
                features: [
                  t('Instant AI site creation', 'Uundaji wa haraka wa tovuti na AI'),
                  t('.vcf contact save', 'Kuhifadhi anwani ya .vcf'),
                  t('Live viewer counter', 'Kihesabu cha watazamaji moja kwa moja'),
                  t('Standard template', 'Kiolezo cha kawaida'),
                  t('OfliX badge', 'Alama ya OfliX'),
                ],
                cta: t('Start free', 'Anza bure'),
                href: '/signup',
                highlight: false,
              },
              {
                name: t('Pro Monthly', 'Pro Kila Mwezi'),
                price: 'KES 299',
                period: t('/month', '/mwezi'),
                savings: '',
                desc: t('For active daily traders.', 'Kwa wafanyabiashara wa kila siku.'),
                features: [
                  t('Custom site editing', 'Uhariri maalum wa tovuti'),
                  t('Removal of OfliX badge', 'Kuondoa alama ya OfliX'),
                  t('Direct WhatsApp ordering buttons', 'Vitufe vya moja kwa moja vya oda za WhatsApp'),
                  t('Location map', 'Ramani ya eneo'),
                ],
                cta: t('Get Pro Monthly', 'Pata Pro Kila Mwezi'),
                href: '/signup?plan=pro&cycle=monthly',
                highlight: false,
              },
              {
                name: t('Pro Annual', 'Pro Kila Mwaka'),
                price: 'KES 2,499',
                period: t('/year', '/mwaka'),
                savings: t('Save ~30%', 'Okoa ~30%'),
                desc: t('For established businesses.', 'Kwa biashara zilizoimarika.'),
                features: [
                  t('All Pro features', 'Vipengele vyote vya Pro'),
                  t('Priority support', 'Msaada wa kipaumbele'),
                  t('Custom domain support (when live)', 'Msaada wa kikoa maalum (yatakapopatikana)'),
                  t('One M-Pesa prompt per year', 'Ombi moja la M-Pesa kwa mwaka'),
                ],
                cta: t('Get Pro Annual', 'Pata Pro Kila Mwaka'),
                href: '/signup?plan=pro&cycle=annual',
                highlight: true,
              },
            ].map(tier => (
              <div key={tier.name} style={{
                background: tier.highlight ? accent : cardBg,
                border: tier.highlight ? 'none' : `1px solid ${cardBorder}`,
                borderRadius: 14, padding: '28px 24px',
                position: 'relative',
              }}>
                {tier.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#F5A623', color: 'white',
                    fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}>
                    {t('Most popular', 'Maarufu zaidi')}
                  </div>
                )}
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: tier.highlight ? 'rgba(255,255,255,0.7)' : textMuted, marginBottom: 4 }}>
                  {tier.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: tier.highlight ? 'white' : textPrimary, letterSpacing: '-0.5px' }}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span style={{ fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.6)' : textMuted }}>
                      {tier.period}
                    </span>
                  )}
                  {tier.savings && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: tier.highlight ? 'rgba(255,255,255,0.2)' : 'rgba(245,166,35,0.15)',
                      color: tier.highlight ? 'white' : '#F5A623', marginLeft: 4,
                    }}>
                      {tier.savings}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.75)' : textMuted, marginBottom: 20, lineHeight: 1.5 }}>
                  {tier.desc}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                      <Check size={14} color={tier.highlight ? 'white' : accent} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: tier.highlight ? 'white' : textPrimary, lineHeight: 1.4 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={tier.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '12px', borderRadius: 9,
                  background: tier.highlight ? 'white' : accent,
                  color: tier.highlight ? accent : 'white',
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                }}>
                  {tier.cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: textMuted, marginTop: 24 }}>
            🇰🇪 {t('All prices in Kenyan Shillings. Pay with M-Pesa — no credit card needed.', 'Bei zote ni Shilingi za Kenya. Lipa na M-Pesa — hakuna kadi ya benki inayohitajika.')}
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 24px', textAlign: 'center', background: surface }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.5px', color: textPrimary, marginBottom: 12 }}>
            {t('Ready to get your business online?', 'Uko tayari kuweka biashara yako mtandaoni?')}
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: textMuted, marginBottom: 32, lineHeight: 1.6 }}>
            {t(
              'Join hundreds of Nairobi businesses already using OfliX to reach more customers.',
              'Jiunge na biashara mamia za Nairobi ambazo tayari zinatumia OfliX kufikia wateja zaidi.'
            )}
          </p>
          <Link to="/signup" className="oflix-final-cta" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '16px 36px', borderRadius: 12,
            background: accent, color: 'white',
            fontSize: isMobile ? 15 : 16, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(0,128,96,0.4)',
            boxSizing: 'border-box',
          }}>
            {t('Get my business online — free', 'Weka biashara yangu mtandaoni — bure')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        padding: '32px 24px',
        borderTop: `1px solid ${border}`,
        background: isDark ? '#0A0A0B' : '#F6F6F7',
      }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: 12,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/favicon.svg" alt="OfliX" style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>OfliX</span>
            <span style={{ fontSize: 12, color: textMuted }}>— {t('Built for Kenya', 'Imetengenezwa kwa Kenya')} 🇰🇪</span>
          </div>
          <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
            © {new Date().getFullYear()} OfliX. {t('All rights reserved.', 'Haki zote zimehifadhiwa.')}
          </p>
        </div>

        {/* Legal links */}
        <div style={{
          borderTop: `1px solid ${border}`,
          paddingTop: 16,
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'center', gap: 24,
        }}>
          <Link to="/privacy" style={{ fontSize: 12, color: textMuted, textDecoration: 'none', fontWeight: 500 }}>
            {t('Privacy Policy', 'Sera ya Faragha')}
          </Link>
          <span style={{ fontSize: 12, color: border }}>·</span>
          <Link to="/terms" style={{ fontSize: 12, color: textMuted, textDecoration: 'none', fontWeight: 500 }}>
            {t('Terms of Service', 'Masharti ya Huduma')}
          </Link>
          <span style={{ fontSize: 12, color: border }}>·</span>
          <a href="mailto:mwendantony28@gmail.com" style={{ fontSize: 12, color: textMuted, textDecoration: 'none', fontWeight: 500 }}>
            {t('Contact', 'Wasiliana')}
          </a>
        </div>
      </footer>
    </div>
  )
}