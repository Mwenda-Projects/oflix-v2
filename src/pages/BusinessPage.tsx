import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  MapPin, MessageCircle, Phone, Clock, Globe,
  Wrench, Scissors, UtensilsCrossed, Stethoscope,
  ShoppingBag, Monitor, GraduationCap, Truck,
  Leaf, Building2, ArrowRight, ExternalLink, Mail
} from 'lucide-react'
import { getBusinessBySlug, trackLead } from '@/lib/db'
import type { Business } from '@/lib/db'
import { formatWhatsAppUrl, formatGoogleMapsUrl } from '@/lib/utils'

interface CategoryConfig {
  icon: React.ElementType
  heroGradient: string
  accentColor: string
  accentBg: string
  label: string
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  construction: {
    icon: Wrench,
    heroGradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #3d3020 100%)',
    accentColor: '#D97706',
    accentBg: 'rgba(217,119,6,0.1)',
    label: 'Construction',
  },
  salon: {
    icon: Scissors,
    heroGradient: 'linear-gradient(135deg, #4a1942 0%, #7c3a6e 50%, #9d5a8a 100%)',
    accentColor: '#BE185D',
    accentBg: 'rgba(190,24,93,0.08)',
    label: 'Salon & Beauty',
  },
  food: {
    icon: UtensilsCrossed,
    heroGradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
    accentColor: '#EA580C',
    accentBg: 'rgba(234,88,12,0.08)',
    label: 'Food & Restaurant',
  },
  clinic: {
    icon: Stethoscope,
    heroGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
    accentColor: '#0284C7',
    accentBg: 'rgba(2,132,199,0.08)',
    label: 'Clinic & Health',
  },
  retail: {
    icon: ShoppingBag,
    heroGradient: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)',
    accentColor: '#16A34A',
    accentBg: 'rgba(22,163,74,0.08)',
    label: 'Retail Shop',
  },
  tech: {
    icon: Monitor,
    heroGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
    accentColor: '#2563EB',
    accentBg: 'rgba(37,99,235,0.08)',
    label: 'Tech & Digital',
  },
  school: {
    icon: GraduationCap,
    heroGradient: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)',
    accentColor: '#CA8A04',
    accentBg: 'rgba(202,138,4,0.08)',
    label: 'School & Training',
  },
  transport: {
    icon: Truck,
    heroGradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
    accentColor: '#EA580C',
    accentBg: 'rgba(234,88,12,0.08)',
    label: 'Transport',
  },
  agriculture: {
    icon: Leaf,
    heroGradient: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
    accentColor: '#15803D',
    accentBg: 'rgba(21,128,61,0.08)',
    label: 'Agriculture',
  },
  other: {
    icon: Building2,
    heroGradient: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
    accentColor: '#0A84FF',
    accentBg: 'rgba(10,132,255,0.08)',
    label: 'Business',
  },
}

const getConfig = (category: string): CategoryConfig =>
  CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other

export default function BusinessPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
            <Building2 size={24} color="white" />
          </div>
          <p style={{ fontSize: 13, color: '#8E8E93', fontWeight: 500 }}>Loading...</p>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.96)} }`}</style>
      </div>
    )
  }

  if (notFound || !business) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 24 }}>
        <div>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(10,132,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Building2 size={28} color="#0A84FF" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Business not found</h1>
          <p style={{ fontSize: 14, color: '#8E8E93', marginBottom: 28 }}>This page doesn't exist or may have been removed.</p>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Go to OfliX <ArrowRight size={15} />
          </a>
        </div>
      </div>
    )
  }

  const config = getConfig(business.category)
  const CategoryIcon = config.icon
  const whatsappNumber = business.whatsapp || business.phone
  const mapsUrl = business.google_maps_url || formatGoogleMapsUrl(business.address)
  const whatsappUrl = formatWhatsAppUrl(whatsappNumber, `Hi, I found ${business.name} on OfliX. I'd like to know more.`)

  const handleWhatsApp = () => {
    trackLead(business.id, 'whatsapp_tap').catch(() => {})
    window.open(whatsappUrl, '_blank')
  }

  const handleDirections = () => {
    trackLead(business.id, 'directions_tap').catch(() => {})
    window.open(mapsUrl, '_blank')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 14px', borderRadius: 12,
    background: '#F8F9FA', border: '1px solid #EFEFEF',
    textDecoration: 'none', width: '100%',
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
  }

  const iconBox = (bg: string) => ({
    width: 40, height: 40, borderRadius: 10,
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: config.heroGradient, padding: '0 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 20, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', position: 'relative', zIndex: 1 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 14 }}>O</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'rgba(255,255,255,0.9)' }}>OfliX</span>
          </a>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            <Globe size={12} />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {/* Identity */}
        <div style={{ textAlign: 'center', padding: '24px 24px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <CategoryIcon size={32} color="white" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {config.label}
            </span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'white', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 10, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
            {business.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <MapPin size={14} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{business.address}</span>
          </div>
        </div>
      </div>

      {/* Floating CTA card */}
      <div style={{ maxWidth: 520, margin: '-48px auto 0', padding: '0 16px', position: 'relative', zIndex: 2 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#25D366', color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}>
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button onClick={handleDirections} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: config.accentColor, color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            <MapPin size={18} /> Directions
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: '16px auto 0', padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* About */}
        <div style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={iconBox(config.accentBg)}>
              <CategoryIcon size={18} color={config.accentColor} />
            </div>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              About {business.name}
            </h2>
          </div>
          <p style={{ fontSize: 15, color: '#3D3D3F', lineHeight: 1.75 }}>{business.description}</p>
        </div>

        {/* Contact details */}
        <div style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
            Contact & Location
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {business.phone && (
              <a href={`tel:${business.phone}`} style={rowStyle}>
                <div style={iconBox(config.accentBg)}><Phone size={18} color={config.accentColor} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2, fontWeight: 500 }}>Phone</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{business.phone}</p>
                </div>
                <ExternalLink size={14} color="#C7C7CC" />
              </a>
            )}

            {whatsappNumber && (
              <button onClick={handleWhatsApp} style={rowStyle}>
                <div style={iconBox('rgba(37,211,102,0.1)')}><MessageCircle size={18} color="#25D366" /></div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2, fontWeight: 500 }}>WhatsApp</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{whatsappNumber}</p>
                </div>
                <ExternalLink size={14} color="#C7C7CC" />
              </button>
            )}

            {business.address && (
              <button onClick={handleDirections} style={rowStyle}>
                <div style={iconBox('rgba(255,159,10,0.1)')}><MapPin size={18} color="#FF9F0A" /></div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2, fontWeight: 500 }}>Location</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business.address}</p>
                </div>
                <ExternalLink size={14} color="#C7C7CC" style={{ flexShrink: 0 }} />
              </button>
            )}

            {business.hours && (
              <div style={{ ...rowStyle, cursor: 'default' }}>
                <div style={iconBox('rgba(48,209,88,0.1)')}><Clock size={18} color="#30D158" /></div>
                <div>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2, fontWeight: 500 }}>Business Hours</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{business.hours}</p>
                </div>
              </div>
            )}

            {business.email && (
              <a href={`mailto:${business.email}`} style={rowStyle}>
                <div style={iconBox(config.accentBg)}><Mail size={18} color={config.accentColor} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2, fontWeight: 500 }}>Email</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{business.email}</p>
                </div>
                <ExternalLink size={14} color="#C7C7CC" />
              </a>
            )}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <button onClick={handleWhatsApp} style={{ width: '100%', padding: '18px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #25D366, #1da851)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 24px rgba(37,211,102,0.35)' }}>
          <MessageCircle size={20} />
          Chat with us on WhatsApp
          <ArrowRight size={16} />
        </button>

        {/* Directions CTA */}
        <button onClick={handleDirections} style={{ width: '100%', padding: '16px', borderRadius: 16, border: `2px solid ${config.accentColor}`, background: 'white', color: config.accentColor, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <MapPin size={18} />
          Get Directions
        </button>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0 8px', borderTop: '1px solid #E5E5EA', marginTop: 8 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', marginBottom: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'serif', fontWeight: 900, color: 'white', fontSize: 11 }}>O</span>
            </div>
            <span style={{ fontSize: 13, color: '#8E8E93' }}>Powered by </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0A84FF', fontFamily: "'Playfair Display', serif" }}>OfliX</span>
          </a>
          <p style={{ fontSize: 11, color: '#C7C7CC' }}>Get your business online · oflix.co.ke</p>
        </div>
      </div>
    </div>
  )
}