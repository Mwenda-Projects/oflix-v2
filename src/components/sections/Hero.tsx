import { ArrowRight, MessageCircle, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-brand/5 dark:bg-brand/10 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent-green/5 dark:bg-accent-green/8 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-accent-purple/5 dark:bg-accent-purple/8 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center">

        {/* Kenya badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/30 bg-brand/5 dark:bg-brand/10 mb-8 animate-fade-in"
        >
          <span className="text-sm">🇰🇪</span>
          <span className="font-mono text-xs text-brand font-medium">
            {t('Built for Kenyan businesses', 'Imetengenezwa kwa biashara za Kenya')}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="heading-display text-5xl md:text-7xl mb-6 animate-fade-up"
          style={{ animationDelay: '0.1s', opacity: 0 }}
        >
          {t('Your business,', 'Biashara yako,')}
          <br />
          <span className="text-brand">
            {t('online in minutes.', 'mtandaoni kwa dakika.')}
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="font-body text-lg md:text-xl text-light-muted dark:text-dark-muted max-w-2xl mx-auto mb-4 leading-relaxed animate-fade-up"
          style={{ animationDelay: '0.2s', opacity: 0 }}
        >
          {t(
            'No technical knowledge needed. Just tell us about your business — we build you a professional website, complete with WhatsApp contact and your location on the map.',
            'Hakuna ujuzi wa teknolojia unaohitajika. Tuambie tu kuhusu biashara yako — tutakutengenezea tovuti ya kitaalamu, pamoja na mawasiliano ya WhatsApp na eneo lako kwenye ramani.'
          )}
        </p>

        {/* Reassurance */}
        <p
          className="font-body text-sm text-light-muted dark:text-dark-muted mb-10 animate-fade-up"
          style={{ animationDelay: '0.25s', opacity: 0 }}
        >
          {t(
            '💡 If you can describe your business on WhatsApp, you can use OfliX.',
            '💡 Kama unaweza kuelezea biashara yako kwa WhatsApp, unaweza kutumia OfliX.'
          )}
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          <Link to="/signup" className="btn-primary text-base px-8 py-4 shadow-ios-glow">
            {t('Get my business online', 'Weka biashara yangu mtandaoni')}
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">
            {t('See how it works', 'Ona jinsi inavyofanya kazi')}
          </a>
        </div>

        {/* Trust indicators */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 animate-fade-up"
          style={{ animationDelay: '0.4s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 text-light-muted dark:text-dark-muted">
            <span className="text-accent-green font-bold text-sm">✓</span>
            <span className="font-body text-xs">{t('Free to start', 'Bure kuanza')}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-light-border dark:bg-dark-border" />
          <div className="flex items-center gap-2 text-light-muted dark:text-dark-muted">
            <span className="text-accent-green font-bold text-sm">✓</span>
            <span className="font-body text-xs">{t('No credit card required', 'Hakuna kadi ya benki inayohitajika')}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-light-border dark:bg-dark-border" />
          <div className="flex items-center gap-2 text-light-muted dark:text-dark-muted">
            <span className="text-accent-green font-bold text-sm">✓</span>
            <span className="font-body text-xs">{t('Ready in minutes', 'Tayari kwa dakika')}</span>
          </div>
        </div>

        {/* Preview card */}
        <div
          className="mt-16 max-w-2xl mx-auto animate-fade-up"
          style={{ animationDelay: '0.5s', opacity: 0 }}
        >
          <div className="card shadow-ios-lg text-left">
            {/* Mock website preview */}
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-light-border dark:border-dark-border">
              <div className="w-3 h-3 rounded-full bg-accent-red/60" />
              <div className="w-3 h-3 rounded-full bg-accent-orange/60" />
              <div className="w-3 h-3 rounded-full bg-accent-green/60" />
              <div className="flex-1 mx-3 h-6 rounded-ios bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center px-3">
                <span className="font-mono text-xs text-light-muted dark:text-dark-muted">mama-grace-salon.oflix.co.ke</span>
              </div>
            </div>

            {/* Business card preview */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-ios-lg bg-brand/10 flex items-center justify-center">
                    <span className="text-2xl">💇</span>
                  </div>
                  <div>
                    <p className="font-display font-bold text-light-text dark:text-dark-text text-base">Mama Grace Salon</p>
                    <p className="font-body text-xs text-light-muted dark:text-dark-muted">Hair & Beauty · Nairobi</p>
                  </div>
                </div>
                <p className="font-body text-sm text-light-muted dark:text-dark-muted leading-relaxed mb-4">
                  {t(
                    'Professional hair styling, braiding, and beauty treatments. Walk-ins welcome.',
                    'Usafi wa nywele, kusuka, na matibabu ya uzuri. Karibuni bila miadi.'
                  )}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-body text-light-muted dark:text-dark-muted">
                    <MapPin size={12} className="text-brand" />
                    Tom Mboya Street, Nairobi CBD
                  </div>
                  <div className="flex items-center gap-2 text-xs font-body text-light-muted dark:text-dark-muted">
                    <MessageCircle size={12} className="text-accent-green" />
                    +254 700 123 456
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:justify-end">
                <div className="btn-whatsapp text-xs px-4 py-2 justify-center">
                  <MessageCircle size={13} />
                  {t('Chat on WhatsApp', 'Piga gumzo WhatsApp')}
                </div>
                <div className="btn-secondary text-xs px-4 py-2 justify-center">
                  <MapPin size={13} />
                  {t('Get directions', 'Pata mwelekeo')}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
              <p className="font-mono text-xs text-brand text-center">
                ✓ {t('This is what your business will look like online', 'Hivi ndivyo biashara yako itakavyoonekana mtandaoni')}
              </p>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.6s', opacity: 0 }}>
          <a href="#how-it-works" className="inline-flex flex-col items-center gap-2 text-light-muted dark:text-dark-muted hover:text-brand transition-colors">
            <span className="font-body text-xs">{t('See how it works', 'Ona jinsi inavyofanya kazi')}</span>
            <svg className="animate-bounce" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
