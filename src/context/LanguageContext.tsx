import { createContext, useContext, useState } from 'react'
import type { Language } from '@/types'

interface LanguageContextType {
  language: Language
  isSwahili: boolean
  toggleLanguage: () => void
  t: (en: string, sw: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('oflix-language')
    if (stored === 'en' || stored === 'sw') return stored
    return 'en'
  })

  const toggleLanguage = () => {
    setLanguage(l => {
      const next = l === 'en' ? 'sw' : 'en'
      localStorage.setItem('oflix-language', next)
      return next
    })
  }

  // t() — pick English or Kiswahili string
  const t = (en: string, sw: string) => language === 'sw' ? sw : en

  return (
    <LanguageContext.Provider value={{ language, isSwahili: language === 'sw', toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
