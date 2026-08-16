import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mb-10">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/favicon.svg" alt="OfliX" className="w-7 h-7 rounded-ios flex-shrink-0" />
              <span className="font-display font-semibold text-light-text dark:text-dark-text">OfliX</span>
            </div>
            <p className="font-body text-sm text-light-muted dark:text-dark-muted leading-relaxed max-w-xs">
              {t(
                'Helping Kenyan businesses get online — fast, simple, and affordable.',
                'Kusaidia biashara za Kenya kuingia mtandaoni — haraka, rahisi, na bei nafuu.'
              )}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-body font-semibold text-xs text-light-text dark:text-dark-text uppercase tracking-wider mb-3">
              {t('Product', 'Bidhaa')}
            </h4>
            <ul className="space-y-2">
              {[
                { en: 'How it works', sw: 'Jinsi Inavyofanya Kazi', href: '#how-it-works' },
                { en: 'Features', sw: 'Vipengele', href: '#features' },
                { en: 'Pricing', sw: 'Bei', href: '#pricing' },
              ].map(item => (
                <li key={item.en}>
                  <a href={item.href} className="font-body text-sm text-light-muted dark:text-dark-muted hover:text-brand transition-colors">
                    {t(item.en, item.sw)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body font-semibold text-xs text-light-text dark:text-dark-text uppercase tracking-wider mb-3">
              {t('Company', 'Kampuni')}
            </h4>
            <ul className="space-y-2">
              {[
                { en: 'About', sw: 'Kuhusu', href: '#' },
                { en: 'Contact', sw: 'Wasiliana', href: '#' },
                { en: 'Privacy', sw: 'Faragha', href: '#' },
                { en: 'Terms', sw: 'Masharti', href: '#' },
              ].map(item => (
                <li key={item.en}>
                  <Link to={item.href} className="font-body text-sm text-light-muted dark:text-dark-muted hover:text-brand transition-colors">
                    {t(item.en, item.sw)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-body font-semibold text-xs text-light-text dark:text-dark-text uppercase tracking-wider mb-3">
              {t('Support', 'Msaada')}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://wa.me/254700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-light-muted dark:text-dark-muted hover:text-brand transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:hello@oflix.co.ke" className="font-body text-sm text-light-muted dark:text-dark-muted hover:text-brand transition-colors">
                  hello@oflix.co.ke
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-light-border dark:border-dark-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-body text-xs text-light-muted dark:text-dark-muted">
            © {new Date().getFullYear()} OfliX. {t('All rights reserved.', 'Haki zote zimehifadhiwa.')}
          </p>
          <p className="font-mono text-xs text-light-muted dark:text-dark-muted">
            {t('Made in Kenya', 'Imetengenezwa Kenya')}
          </p>
        </div>
      </div>
    </footer>
  )
}