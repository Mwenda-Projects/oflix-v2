// Language
export type Language = 'en' | 'sw'

// Theme
export type Theme = 'light' | 'dark'

// Business profile
export interface BusinessProfile {
  id: string
  name: string
  category: BusinessCategory
  description: string
  phone: string
  whatsapp: string
  email?: string
  location: {
    address: string
    lat?: number
    lng?: number
    googleMapsUrl?: string
  }
  hours?: string
  logo?: string
  primaryColor?: string
  createdAt: string
}

export type BusinessCategory =
  | 'retail'
  | 'food'
  | 'salon'
  | 'clinic'
  | 'school'
  | 'transport'
  | 'tech'
  | 'construction'
  | 'agriculture'
  | 'other'

// Onboarding step
export interface OnboardingStep {
  id: number
  title: string
  titleSw: string
}

// Pricing tier
export interface PricingTier {
  name: string
  nameSw: string
  price: string
  period: string
  description: string
  descriptionSw: string
  features: string[]
  featuresSw: string[]
  cta: string
  ctaSw: string
  highlight: boolean
}
