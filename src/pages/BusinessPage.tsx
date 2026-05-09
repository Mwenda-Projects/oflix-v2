import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, MessageCircle, Phone, Clock } from 'lucide-react'
import { getBusinessBySlug, trackLead } from '@/lib/db'
import { isValidGeneratedHtml } from '@/lib/ai'
import type { Business } from '@/lib/db'
import { formatWhatsAppUrl, formatGoogleMapsUrl } from '@/lib/utils'

const CATEGORY_EMOJI: Record<string, string> = {
  retail: '🛍️', food: '🍽️', salon: '💇', clinic: '🏥',
  school: '📚', transport: '🚌', construction: '🏗️',
  agriculture: '🌾', tech: '💻', other: '✨',
}

// ── Fallback card (shown only if no generated_html exists) ─────
function FallbackPage({ business, onWhatsApp, onDirections }: {
  business: Business
  onWhatsApp: () => void
  onDirections: () => void
}) {
  const emoji = CATEGORY_EMOJI[business.category] || '✨'
  const whatsappNumber = business.whatsapp || business.phone

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{
        background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
        padding: '48px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ width: 80, height: 80, borderRadius: 22, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36 }}>
          {emoji}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.3px', marginBottom: 6 }}>
          {business.name}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{business.address}</p>
      </div>

      <div style={{ maxWidth: 480, margin: '-40px auto 0', padding: '0 16px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <button onClick={onWhatsApp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, border: 'none', background: '#25D366', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}>
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button onClick={onDirections} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, border: 'none', background: '#0A84FF', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(10,132,255,0.35)' }}>
            <MapPin size={18} /> Directions
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</h2>
          <p style={{ fontSize: 14, color: '#3D3D3F', lineHeight: 1.7, marginBottom: 20 }}>{business.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {business.phone && (
              <a href={`tel:${business.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(10,132,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={16} color="#0A84FF" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 1 }}>Phone</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>{business.phone}</p>
                </div>
              </a>
            )}
            {business.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,159,10,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={16} color="#FF9F0A" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 1 }}>Location</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>{business.address}</p>
                </div>
              </div>
            )}
            {business.hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(48,209,88,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={16} color="#30D158" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 1 }}>Hours</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>{business.hours}</p>
                </div>
              </div>
            )}
            {whatsappNumber && (
              <button onClick={onWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle size={16} color="#25D366" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 1 }}>WhatsApp</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>{whatsappNumber}</p>
                </div>
              </button>
            )}
          </div>
        </div>

        <button onClick={onWhatsApp} style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: '#25D366', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 20px rgba(37,211,102,0.3)', marginBottom: 24 }}>
          <MessageCircle size={20} /> Chat with us on WhatsApp
        </button>

        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{ fontSize: 12, color: '#8E8E93', textDecoration: 'none' }}>
            Powered by <span style={{ fontWeight: 700, color: '#0A84FF', fontFamily: "'Playfair Display', serif" }}>OfliX</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function BusinessPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      const data = await getBusinessBySlug(slug)
      if (!data) {
        setNotFound(true)
      } else {
        setBusiness(data)
        trackLead(data.id, 'page_view').catch(() => {})
      }
      setLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!business || !event.data || event.data.type !== 'oflix-track') return
      const action = event.data.action as 'whatsapp_tap' | 'directions_tap' | 'page_view'
      if (!['whatsapp_tap', 'directions_tap', 'page_view'].includes(action)) return
      trackLead(business.id, action).catch(() => {})
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [business])

  const handleWhatsApp = () => {
    if (!business) return
    trackLead(business.id, 'whatsapp_tap').catch(() => {})
    const number = business.whatsapp || business.phone
    const msg = `Hi, I found your business on OfliX. I'd like to know more about ${business.name}.`
    window.open(formatWhatsAppUrl(number, msg), '_blank')
  }

  const handleDirections = () => {
    if (!business) return
    trackLead(business.id, 'directions_tap').catch(() => {})
    const url = business.google_maps_url || formatGoogleMapsUrl(business.address)
    window.open(url, '_blank')
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 20 }}>O</span>
          </div>
          <p style={{ fontSize: 13, color: '#8E8E93', fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
        </div>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────
  if (notFound || !business) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 24 }}>
        <div>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Business not found</h1>
          <p style={{ fontSize: 14, color: '#8E8E93', marginBottom: 24 }}>This business page doesn't exist or may have been removed.</p>
          <a href="/" style={{ color: '#0A84FF', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>← Go to OfliX</a>
        </div>
      </div>
    )
  }

  const generatedHtml = (business as any).generated_html as string | undefined
  const hasValidGeneratedHtml = isValidGeneratedHtml(generatedHtml)

  // ── AI-generated website ─────────────────────────────────────
  // If we have generated valid generated HTML, render it full screen in an iframe
  if (hasValidGeneratedHtml) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <iframe
          srcDoc={generatedHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          title={business.name}
          sandbox="allow-scripts allow-popups allow-forms"
        />
      </div>
    )
  }

  // ── Fallback card (no generated HTML yet) ───────────────────
  return (
    <FallbackPage
      business={business}
      onWhatsApp={handleWhatsApp}
      onDirections={handleDirections}
    />
  )
}