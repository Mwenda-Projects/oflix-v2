import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MessageCircle, MapPin, Phone, Clock, Mail,
  Wrench, Scissors, UtensilsCrossed, Stethoscope,
  ShoppingBag, Monitor, GraduationCap, Truck, Leaf,
  Building2, ArrowRight, Shield, Star, CheckCircle2,
  Globe, ChevronRight, ExternalLink
} from 'lucide-react'
import { getBusinessBySlug, trackLead } from '@/lib/db'
import type { Business } from '@/lib/db'

// ── Category config ─────────────────────────────────────────

const CATEGORIES: Record<string, {
  icon: React.ElementType
  label: string
  heroGradient: string
  accent: string
  accentBg: string
  tagline: string
  services: string[]
  badge: string
}> = {
  construction: {
    icon: Wrench,
    label: 'Construction',
    heroGradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d3a 60%, #3d3020 100%)',
    accent: '#D97706',
    accentBg: 'rgba(217,119,6,0.1)',
    tagline: 'Building dreams, delivering quality.',
    services: ['Site Construction', 'Renovations', 'Plumbing & Electrical', 'Project Management', 'Consultation', 'Maintenance'],
    badge: 'Licensed & Insured',
  },
  salon: {
    icon: Scissors,
    label: 'Salon & Beauty',
    heroGradient: 'linear-gradient(135deg, #4a1942 0%, #7c3a6e 60%, #9d5a8a 100%)',
    accent: '#BE185D',
    accentBg: 'rgba(190,24,93,0.08)',
    tagline: 'Look good, feel amazing.',
    services: ['Hair Styling', 'Braiding & Weaves', 'Manicure & Pedicure', 'Facials', 'Makeup', 'Hair Treatment'],
    badge: 'Professional Stylists',
  },
  food: {
    icon: UtensilsCrossed,
    label: 'Food & Restaurant',
    heroGradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 60%, #ea580c 100%)',
    accent: '#EA580C',
    accentBg: 'rgba(234,88,12,0.08)',
    tagline: 'Delicious food, made with love.',
    services: ['Dine In', 'Takeaway', 'Delivery', 'Catering', 'Private Events', 'Breakfast & Lunch'],
    badge: 'Fresh Daily',
  },
  clinic: {
    icon: Stethoscope,
    label: 'Clinic & Health',
    heroGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)',
    accent: '#0284C7',
    accentBg: 'rgba(2,132,199,0.08)',
    tagline: 'Your health, our priority.',
    services: ['General Consultation', 'Lab Tests', 'Pharmacy', 'Vaccination', 'Specialist Referral', 'Health Check'],
    badge: 'Certified Medical Staff',
  },
  retail: {
    icon: ShoppingBag,
    label: 'Retail Shop',
    heroGradient: 'linear-gradient(135deg, #14532d 0%, #15803d 60%, #16a34a 100%)',
    accent: '#16A34A',
    accentBg: 'rgba(22,163,74,0.08)',
    tagline: 'Quality products, great prices.',
    services: ['Wide Product Range', 'Wholesale Available', 'Home Delivery', 'Order via WhatsApp', 'New Arrivals Weekly', 'Genuine Products'],
    badge: 'Trusted Retailer',
  },
  tech: {
    icon: Monitor,
    label: 'Tech & Digital',
    heroGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)',
    accent: '#2563EB',
    accentBg: 'rgba(37,99,235,0.08)',
    tagline: 'Technology solutions that work.',
    services: ['Web Development', 'App Development', 'IT Support', 'Network Setup', 'Software Solutions', 'Digital Marketing'],
    badge: 'Certified Professionals',
  },
  school: {
    icon: GraduationCap,
    label: 'School & Training',
    heroGradient: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #2563eb 100%)',
    accent: '#CA8A04',
    accentBg: 'rgba(202,138,4,0.08)',
    tagline: 'Empowering minds, shaping futures.',
    services: ['Quality Education', 'Skilled Teachers', 'Modern Curriculum', 'Extracurriculars', 'Mentorship', 'Exams Prep'],
    badge: 'Accredited Institution',
  },
  transport: {
    icon: Truck,
    label: 'Transport',
    heroGradient: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #44403c 100%)',
    accent: '#EA580C',
    accentBg: 'rgba(234,88,12,0.08)',
    tagline: 'Safe, reliable transport you can count on.',
    services: ['Passenger Transport', 'Cargo & Logistics', 'Airport Transfers', 'Long Distance', 'Corporate Hire', 'Parcel Delivery'],
    badge: 'Licensed Operators',
  },
  agriculture: {
    icon: Leaf,
    label: 'Agriculture',
    heroGradient: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)',
    accent: '#15803D',
    accentBg: 'rgba(21,128,61,0.08)',
    tagline: 'Fresh from farm to table.',
    services: ['Fresh Produce', 'Farm Supplies', 'Bulk Orders', 'Delivery Available', 'Organic Options', 'Seasonal Specials'],
    badge: 'Farm Fresh',
  },
  other: {
    icon: Building2,
    label: 'Business',
    heroGradient: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
    accent: '#0A84FF',
    accentBg: 'rgba(10,132,255,0.08)',
    tagline: 'Professional services you can trust.',
    services: ['Professional Service', 'Quality Guaranteed', 'Customer First', 'Fast Response', 'Affordable Rates', 'Experienced Team'],
    badge: 'Trusted Business',
  },
}

const getCategory = (cat: string) => CATEGORIES[cat] || CATEGORIES.other

// ── Loading ─────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'spin 2s linear infinite' }}>
          <Building2 size={26} color="white" />
        </div>
        <p style={{ fontSize: 14, color: '#8E8E93', fontWeight: 500 }}>Loading your business page...</p>
      </div>
      <style>{`@keyframes spin { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}

// ── Not found ───────────────────────────────────────────────

function NotFoundScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Building2 size={32} color="#0A84FF" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1D1D1F', fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>Business not found</h1>
        <p style={{ fontSize: 14, color: '#8E8E93', marginBottom: 32, lineHeight: 1.6 }}>This page doesn't exist or may have been removed.</p>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #0A84FF, #0066CC)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          Go to OfliX <ArrowRight size={15} />
        </a>
      </div>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────

export default function BusinessPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      const data = await getBusinessBySlug(slug)
      if (!data) setNotFound(true)
      else {
        setBusiness(data)
        trackLead(data.id, 'page_view').catch(() => {})
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <LoadingScreen />
  if (notFound || !business) return <NotFoundScreen />

  const cat = getCategory(business.category)
  const Icon = cat.icon
  const phone = business.phone || ''
  const whatsapp = business.whatsapp || phone
  const clean = whatsapp.replace(/\D/g, '')
  const waNumber = clean.startsWith('0') ? `254${clean.slice(1)}` : clean
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${business.name}, I found you on OfliX and would like to know more.`)}`
  const mapsUrl = business.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`

  const handleWhatsApp = () => {
    trackLead(business.id, 'whatsapp_tap').catch(() => {})
    window.open(waUrl, '_blank')
  }

  const handleDirections = () => {
    trackLead(business.id, 'directions_tap').catch(() => {})
    window.open(mapsUrl, '_blank')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const navItems = ['Home', 'About', 'Services', 'Contact']

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#FAFAFA' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.heroGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{business.name}</p>
            <p style={{ fontSize: 10, color: '#8E8E93', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 1 }}>{cat.label}</p>
          </div>
        </div>

        {/* Nav links — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {navItems.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setActiveSection(item.toLowerCase())}
              style={{
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                color: activeSection === item.toLowerCase() ? cat.accent : '#6E6E73',
                borderBottom: activeSection === item.toLowerCase() ? `2px solid ${cat.accent}` : '2px solid transparent',
                paddingBottom: 2, transition: 'all 0.15s',
              }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: 'none', background: '#25D366', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          <MessageCircle size={15} /> WhatsApp
        </button>
      </nav>

      {/* ── Hero ── */}
      <section id="home" style={{
        background: cat.heroGradient,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', pointerEvents: 'none' }} />

        {/* Share button */}
        <button onClick={handleCopy} style={{ position: 'absolute', top: 80, right: 24, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          <Globe size={12} /> {copied ? 'Link copied!' : 'Share'}
        </button>

        <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 24, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 24 }}>
            <Shield size={13} color="rgba(255,255,255,0.9)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em' }}>{cat.badge}</span>
          </div>

          {/* Name */}
          <h1 style={{ fontSize: 52, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'white', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            {business.name}
          </h1>

          {/* Tagline */}
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', marginBottom: 16, fontStyle: 'italic', lineHeight: 1.4 }}>
            {cat.tagline}
          </p>

          {/* Description */}
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 32, maxWidth: 520 }}>
            {business.description}
          </p>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 36 }}>
            <MapPin size={15} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{business.address}</span>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 24px', borderRadius: 12, border: 'none', background: '#25D366', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 24px rgba(37,211,102,0.4)' }}>
              <MessageCircle size={19} /> Chat on WhatsApp
            </button>
            <button onClick={handleDirections} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 24px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              <MapPin size={19} /> Get Directions
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {[
              { value: '100%', label: 'Customer Satisfaction' },
              { value: '24/7', label: 'Available on WhatsApp' },
              { value: '⭐⭐⭐⭐⭐', label: 'Quality Service' },
            ].map(stat => (
              <div key={stat.label}>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: "'Playfair Display', serif", lineHeight: 1, marginBottom: 4 }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.accent, marginBottom: 12 }}>About Us</p>
              <h2 style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#1D1D1F', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 20 }}>
                Who We Are
              </h2>
              <p style={{ fontSize: 16, color: '#6E6E73', lineHeight: 1.8, marginBottom: 24 }}>
                {business.description}
              </p>
              {business.hours && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: cat.accentBg, marginBottom: 24 }}>
                  <Clock size={16} color={cat.accent} />
                  <div>
                    <p style={{ fontSize: 11, color: cat.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Hours</p>
                    <p style={{ fontSize: 14, color: '#1D1D1F', fontWeight: 500 }}>{business.hours}</p>
                  </div>
                </div>
              )}
              <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 10, border: 'none', background: cat.accent, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Contact Us <ChevronRight size={16} />
              </button>
            </div>

            {/* Values */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: Shield, title: 'Trusted & Reliable', desc: 'We deliver on our promises every single time.' },
                { icon: Star, title: 'Quality Service', desc: 'Every customer deserves the best we can offer.' },
                { icon: CheckCircle2, title: 'Customer First', desc: 'Your satisfaction is our measure of success.' },
                { icon: MessageCircle, title: 'Always Reachable', desc: 'Reach us anytime on WhatsApp — we respond fast.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#F8F9FA', border: '1px solid #EFEFEF' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: cat.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={18} color={cat.accent} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', marginBottom: 3 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" style={{ padding: '80px 24px', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.accent, marginBottom: 12 }}>What We Offer</p>
            <h2 style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#1D1D1F', letterSpacing: '-0.5px', marginBottom: 14 }}>
              Our Services
            </h2>
            <p style={{ fontSize: 16, color: '#6E6E73', maxWidth: 480, margin: '0 auto' }}>
              Everything you need — under one roof. Reach us on WhatsApp for more details.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {cat.services.map((service, i) => (
              <div key={service} style={{ padding: '22px 20px', borderRadius: 14, background: 'white', border: '1px solid #EFEFEF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 11, background: cat.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={22} color={cat.accent} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>{service}</p>
                <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: cat.accent, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  Enquire <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section style={{ padding: '60px 24px', background: cat.heroGradient, textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'white', marginBottom: 14, letterSpacing: '-0.3px' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 28, lineHeight: 1.6 }}>
            Send us a message on WhatsApp — we respond fast and are always happy to help.
          </p>
          <button onClick={handleWhatsApp} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 14, border: 'none', background: '#25D366', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 24px rgba(37,211,102,0.4)' }}>
            <MessageCircle size={20} /> Chat with us on WhatsApp
          </button>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.accent, marginBottom: 12 }}>Get In Touch</p>
            <h2 style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#1D1D1F', letterSpacing: '-0.5px' }}>
              Contact Us
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              phone && { icon: Phone, label: 'Phone', value: phone, href: `tel:${phone}`, color: cat.accent, bg: cat.accentBg },
              whatsapp && { icon: MessageCircle, label: 'WhatsApp', value: whatsapp, action: handleWhatsApp, color: '#25D366', bg: 'rgba(37,211,102,0.1)' },
              business.address && { icon: MapPin, label: 'Location', value: business.address, action: handleDirections, color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)' },
              business.hours && { icon: Clock, label: 'Business Hours', value: business.hours, color: '#30D158', bg: 'rgba(48,209,88,0.1)' },
              business.email && { icon: Mail, label: 'Email', value: business.email, href: `mailto:${business.email}`, color: cat.accent, bg: cat.accentBg },
            ].filter(Boolean).map((item, i) => {
              if (!item) return null
              const ItemIcon = item.icon
              const content = (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14, background: '#F8F9FA', border: '1px solid #EFEFEF', cursor: item.href || item.action ? 'pointer' : 'default', textDecoration: 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ItemIcon size={20} color={item.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{item.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                  </div>
                  {(item.href || item.action) && <ExternalLink size={14} color="#C7C7CC" />}
                </div>
              )

              if (item.href) return <a key={i} href={item.href} style={{ textDecoration: 'none' }}>{content}</a>
              if (item.action) return <button key={i} onClick={item.action} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', width: '100%' }}>{content}</button>
              return <div key={i}>{content}</div>
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#1D1D1F', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: cat.heroGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color="white" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif" }}>{business.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{cat.label}</p>
              </div>
            </div>
            <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#25D366', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              <MessageCircle size={15} /> WhatsApp Us
            </button>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} {business.name}. All rights reserved.
            </p>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Powered by</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0A84FF', fontFamily: "'Playfair Display', serif" }}>OfliX</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <button
        onClick={handleWhatsApp}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: '#25D366', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 6px 24px rgba(37,211,102,0.5)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
        title="Chat on WhatsApp"
      >
        <MessageCircle size={26} color="white" />
      </button>
    </div>
  )
}