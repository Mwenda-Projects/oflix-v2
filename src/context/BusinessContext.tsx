import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBusinessBySlug, trackLead } from '@/lib/db'
import type { Business } from '@/lib/db'

interface BusinessContextType {
  business: Business | null
  loading: boolean
  notFound: boolean
  handleWhatsApp: () => void
  handleDirections: () => void
  whatsappUrl: string
  mapsUrl: string
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
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

  const whatsappNumber = business?.whatsapp || business?.phone || ''
  const clean = whatsappNumber.replace(/\D/g, '')
  const formatted = clean.startsWith('0') ? `254${clean.slice(1)}` : clean
  const msg = encodeURIComponent(`Hi, I found ${business?.name} on OfliX. I'd like to know more.`)
  const whatsappUrl = `https://wa.me/${formatted}?text=${msg}`
  const mapsUrl = business?.google_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business?.address || '')}`

  const handleWhatsApp = () => {
    if (business) trackLead(business.id, 'whatsapp_tap').catch(() => {})
    window.open(whatsappUrl, '_blank')
  }

  const handleDirections = () => {
    if (business) trackLead(business.id, 'directions_tap').catch(() => {})
    window.open(mapsUrl, '_blank')
  }

  return (
    <BusinessContext.Provider value={{
      business, loading, notFound,
      handleWhatsApp, handleDirections,
      whatsappUrl, mapsUrl,
    }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}