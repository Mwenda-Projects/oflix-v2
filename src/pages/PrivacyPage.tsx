import { useTheme } from '@/context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const bg = isDark ? '#0F1011' : '#F6F6F7'
  const surface = isDark ? '#1C1C1E' : '#FFFFFF'
  const border = isDark ? '#2A2A2A' : '#E5E5E5'
  const textPrimary = isDark ? '#F5F5F7' : '#1A1A1A'
  const textMuted = isDark ? '#888' : '#6D7175'
  const accent = '#008060'

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: textPrimary }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: textMuted, fontSize: 14, cursor: 'pointer', marginBottom: 32, fontFamily: "'DM Sans', sans-serif", padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accent, color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 4, marginBottom: 16 }}>
            Legal
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: textPrimary, marginBottom: 8, lineHeight: 1.2 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: textMuted }}>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div style={{ background: surface, borderRadius: 12, border: `1px solid ${border}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {[
            {
              title: '1. Who We Are',
              body: 'OfliX is a SaaS platform operated by OfliX, based in Nairobi, Kenya. We help Kenyan businesses create AI-generated websites and manage their online presence. For any privacy-related concerns, contact us at hello@oflix.space.'
            },
            {
              title: '2. Information We Collect',
              body: 'We collect information you provide when creating an account and setting up your business profile, including your name, email address, phone number, business name, business category, address, and operating hours. We also collect usage data such as page views, WhatsApp taps, and direction taps on your business page to provide you with analytics.'
            },
            {
              title: '3. How We Use Your Information',
              body: 'We use your information to generate and host your AI-powered business website, provide you with a dashboard showing how your business is performing online, process subscription payments via M-Pesa, send you important service updates, and improve our platform based on usage patterns.'
            },
            {
              title: '4. Data Storage',
              body: 'Your data is stored securely using Supabase, a cloud database provider. Your business website is hosted on Vercel. Both services maintain industry-standard security practices. Your data is stored on servers that may be located outside Kenya, but we take reasonable steps to ensure it is protected.'
            },
            {
              title: '5. Sharing Your Information',
              body: 'We do not sell your personal information to third parties. We share data only with our service providers (Supabase, Vercel, Anthropic for AI generation) strictly to operate the platform, and when required by Kenyan law or legal process.'
            },
            {
              title: '6. Your Business Page',
              body: 'Your generated business website is publicly accessible via your unique OfliX link. The information displayed on it (business name, phone, address, description) is the information you provided during onboarding. You can update or delete this at any time from your dashboard.'
            },
            {
              title: '7. M-Pesa Payments',
              body: 'Subscription payments are processed via Safaricom M-Pesa. We store your M-Pesa phone number and payment receipt number to manage your subscription. We do not store your M-Pesa PIN or full financial details.'
            },
            {
              title: '8. Your Rights',
              body: 'You have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your account and associated data, and opt out of non-essential communications. To exercise these rights, email us at hello@oflix.space.'
            },
            {
              title: '9. Cookies',
              body: 'We use essential cookies and local storage to keep you logged in and remember your preferences (such as dark/light mode and language). We do not use advertising or tracking cookies.'
            },
            {
              title: '10. Changes to This Policy',
              body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice in your dashboard. Continued use of OfliX after changes means you accept the updated policy.'
            },
            {
              title: '11. Contact Us',
              body: 'If you have any questions about this Privacy Policy, please contact us at hello@oflix.space. We aim to respond within 3 business days.'
            },
          ].map((section, i) => (
            <div key={i}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>{section.title}</h2>
              <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.8, margin: 0 }}>{section.body}</p>
            </div>
          ))}

        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: textMuted, marginTop: 32 }}>
          © {new Date().getFullYear()} OfliX · <a href="/terms" style={{ color: accent, textDecoration: 'none' }}>Terms of Service</a>
        </p>
      </div>
    </div>
  )
}