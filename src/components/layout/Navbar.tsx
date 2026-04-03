import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Menu, X, Globe } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const { t, toggleLanguage, language } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  const navLinks = [
    { label: t('How it works', 'Jinsi Inavyofanya Kazi'), href: '#how-it-works' },
    { label: t('Features', 'Vipengele'), href: '#features' },
    { label: t('Pricing', 'Bei'), href: '#pricing' },
  ]

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isLanding
        ? 'glass border-b border-light-border/50 dark:border-dark-border/50'
        : 'bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-xl border-b border-light-border dark:border-dark-border'
    )}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-ios bg-brand flex items-center justify-center shadow-ios-glow group-hover:scale-105 transition-transform">
            <span className="font-display font-bold text-white text-sm">O</span>
          </div>
          <span className="font-display font-semibold text-lg text-light-text dark:text-dark-text tracking-tight">
            OfliX
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm text-light-muted dark:text-dark-muted hover:text-brand transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-ios text-xs font-mono font-medium border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-brand hover:text-brand transition-all"
            title={t('Switch to Kiswahili', 'Badilisha kwa Kiingereza')}
          >
            <Globe size={12} />
            {language === 'en' ? 'SW' : 'EN'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-ios flex items-center justify-center border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-brand hover:text-brand transition-all"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="btn-secondary py-2 px-4 text-xs">
              {t('Sign in', 'Ingia')}
            </Link>
            <Link to="/signup" className="btn-primary py-2 px-4 text-xs">
              {t('Get started free', 'Anza bure')}
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-ios flex items-center justify-center text-light-muted dark:text-dark-muted"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface px-6 py-4 flex flex-col gap-4">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-body text-sm text-light-muted dark:text-dark-muted"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-light-border dark:border-dark-border">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-ios text-xs font-mono border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted">
              <Globe size={12} /> {language === 'en' ? 'Kiswahili' : 'English'}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/login" className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>
              {t('Sign in', 'Ingia')}
            </Link>
            <Link to="/signup" className="btn-primary justify-center" onClick={() => setMenuOpen(false)}>
              {t('Get started free', 'Anza bure')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
