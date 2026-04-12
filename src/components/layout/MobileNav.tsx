import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart2, Globe, Sparkles, Settings } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()

  const items = [
    { path: '/dashboard',          icon: BarChart2, label: t('Home', 'Nyumbani') },
    { path: '/dashboard/website',  icon: Globe,     label: t('Website', 'Tovuti') },
    { path: '/upgrade',            icon: Sparkles,  label: t('Upgrade', 'Boresha') },
    { path: '/dashboard/settings', icon: Settings,  label: t('Settings', 'Mipangilio') },
  ]

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {items.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}