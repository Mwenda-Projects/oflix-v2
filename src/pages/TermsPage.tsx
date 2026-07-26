import { useTheme } from '@/context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1 style={{ fontSize: 32, fontWeight: 800, color: textPrimary, marginBottom: 8, lineHeight: 1.2 }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: textMuted }}>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div style={{ background: surface, borderRadius: 12, border: `1px solid ${border}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By creating an account or using OfliX, you agree to these Terms of Service. If you do not agree, please do not use our platform. These terms apply to all users of OfliX, including free and paid subscribers.'
            },
            {
              title: '2. Description of Service',
              body: 'OfliX is an AI-powered website generation platform for Kenyan businesses. We provide tools to create, host, and manage a business website, along with analytics and subscription management. The service is provided "as is" and may change over time.'
            },
            {
              title: '3. Account Registration',
              body: 'You must provide accurate information when creating your account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use OfliX. One account per business is permitted.'
            },
            {
              title: '4. Subscription Plans and Payments',
              body: 'OfliX offers a free Starter plan and a Pro plan available as Pro Monthly (KES 299/month) or Pro Annual (KES 2,499/year). Payments are made via M-Pesa STK Push. Subscriptions renew automatically at the end of each billing period. We do not offer refunds for partial billing periods. You may cancel at any time and your plan will remain active until the end of the current billing period.'
            },
            {
              title: '5. Your Content',
              body: 'You retain ownership of the business information you provide. By using OfliX, you grant us a licence to use your business information solely to generate and host your website and provide our services. You are responsible for ensuring your business information is accurate and does not violate any laws or third-party rights.'
            },
            {
              title: '6. AI-Generated Websites',
              body: 'Your website is generated using AI (Anthropic Claude). While we strive for quality, we do not guarantee that the generated content will be perfect or error-free. You should review your generated website and use the editing tools to make corrections. OfliX is not liable for inaccuracies in AI-generated content.'
            },
            {
              title: '7. Prohibited Uses',
              body: 'You may not use OfliX to promote illegal businesses or activities, publish false or misleading information, infringe on intellectual property rights, send spam or unsolicited communications, attempt to reverse engineer or hack the platform, or resell access to OfliX without our written permission.'
            },
            {
              title: '8. Website Availability',
              body: 'We aim to keep your business website online at all times, but we do not guarantee 100% uptime. Free plan websites may be taken offline if the account remains inactive for more than 90 days. Paid plan websites remain active as long as the subscription is active.'
            },
            {
              title: '9. Limitation of Liability',
              body: 'OfliX is not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including loss of business, revenue, or data. Our total liability to you shall not exceed the amount you paid to us in the 3 months preceding the claim.'
            },
            {
              title: '10. Termination',
              body: 'We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent activity, or fail to pay your subscription fees. You may delete your account at any time from your dashboard settings.'
            },
            {
              title: '11. Changes to Terms',
              body: 'We may update these Terms of Service from time to time. We will notify you of significant changes via email or a dashboard notice. Continued use of OfliX after changes constitutes acceptance of the new terms.'
            },
            {
              title: '12. Governing Law',
              body: 'These terms are governed by the laws of Kenya. Any disputes shall be resolved under Kenyan jurisdiction. For any questions about these terms, contact us at mwendantony28@gmail.com.'
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
          © {new Date().getFullYear()} OfliX · <a href="/privacy" style={{ color: accent, textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}