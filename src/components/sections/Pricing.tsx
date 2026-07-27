import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

const tiers = [
  {
    en: {
      name: 'Starter',
      description: 'Perfect for getting your business online for the first time.',
      features: [
        'Instant AI site creation',
        '.vcf contact save',
        'Live viewer counter',
        'Standard template',
        'OfliX badge',
      ],
      cta: 'Start for free',
    },
    sw: {
      name: 'Mwanzo',
      description: 'Kamili kwa kupata biashara yako mtandaoni kwa mara ya kwanza.',
      features: [
        'Uundaji wa haraka wa tovuti na AI',
        'Kuhifadhi anwani ya .vcf',
        'Kihesabu cha watazamaji moja kwa moja',
        'Kiolezo cha kawaida',
        'Alama ya OfliX',
      ],
      cta: 'Anza bure',
    },
    price: 'Free',
    priceSw: 'Bure',
    period: 'forever',
    periodSw: 'milele',
    highlight: false,
    href: '/signup',
  },
  {
    en: {
      name: 'Pro Monthly',
      description: 'For active daily traders who want full control over their site.',
      features: [
        'Custom site editing',
        'Removal of OfliX badge',
        'Direct WhatsApp ordering buttons',
        'Location map',
      ],
      cta: 'Get Pro Monthly',
    },
    sw: {
      name: 'Pro Kila Mwezi',
      description: 'Kwa wafanyabiashara wa kila siku wanaotaka udhibiti kamili wa tovuti yao.',
      features: [
        'Uhariri maalum wa tovuti',
        'Kuondoa alama ya OfliX',
        'Vitufe vya moja kwa moja vya oda za WhatsApp',
        'Ramani ya eneo',
      ],
      cta: 'Pata Pro Kila Mwezi',
    },
    price: 'KSh 299',
    priceSw: 'KSh 299',
    period: '/month',
    periodSw: '/mwezi',
    highlight: false,
    href: '/signup?plan=pro&cycle=monthly',
  },
  {
    en: {
      name: 'Pro Annual',
      description: 'For established businesses ready to commit — pay once a year and save.',
      features: [
        'All Pro features',
        'Priority support',
        'Custom domain support (when live)',
        'One M-Pesa prompt per year',
      ],
      cta: 'Get Pro Annual',
    },
    sw: {
      name: 'Pro Kila Mwaka',
      description: 'Kwa biashara zilizoimara ziko tayari kujitolea — lipa mara moja kwa mwaka na uokoe.',
      features: [
        'Vipengele vyote vya Pro',
        'Msaada wa kipaumbele',
        'Msaada wa kikoa maalum (yatakapopatikana)',
        'Ombi moja la M-Pesa kwa mwaka',
      ],
      cta: 'Pata Pro Kila Mwaka',
    },
    price: 'KSh 2,499',
    priceSw: 'KSh 2,499',
    period: '/year',
    periodSw: '/mwaka',
    savings: 'Save ~30%',
    savingsSw: 'Okoa ~30%',
    highlight: true,
    href: '/signup?plan=pro&cycle=annual',
  },
]

export default function Pricing() {
  const { t, language } = useLanguage()

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label mb-3">{t('Pricing', 'Bei')}</p>
          <h2 className="heading-display text-4xl md:text-5xl mb-4">
            {t('Simple, fair pricing.', 'Bei rahisi na ya haki.')}
          </h2>
          <p className="font-body text-lg text-light-muted dark:text-dark-muted max-w-xl mx-auto">
            {t(
              'Start for free. Upgrade when your business is ready. No surprises, no hidden costs.',
              'Anza bure. Panda daraja biashara yako ikiwa tayari. Hakuna mshangao, hakuna gharama zilizofichwa.'
            )}
          </p>
        </div>

        {/* Tiers */}
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map(tier => (
            <div
              key={tier.en.name}
              className={
                tier.highlight
                  ? 'rounded-ios-lg p-6 bg-brand text-white shadow-ios-glow border border-brand relative'
                  : 'card'
              }
            >
              {/* Highlight badge */}
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white rounded-full">
                  <span className="font-mono text-xs text-brand font-semibold">
                    {t(tier.savings || 'Most popular', tier.savingsSw || 'Maarufu zaidi')}
                  </span>
                </div>
              )}

              {/* Name */}
              <p className={`font-body font-semibold text-xs uppercase tracking-wider mb-1 ${tier.highlight ? 'text-white/70' : 'text-light-muted dark:text-dark-muted'}`}>
                {t(tier.en.name, tier.sw.name)}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`font-display font-bold text-4xl ${tier.highlight ? 'text-white' : 'text-light-text dark:text-dark-text'}`}>
                  {t(tier.price, tier.priceSw)}
                </span>
                <span className={`font-body text-sm ${tier.highlight ? 'text-white/70' : 'text-light-muted dark:text-dark-muted'}`}>
                  {t(tier.period, tier.periodSw)}
                </span>
              </div>

              {/* Description */}
              <p className={`font-body text-sm mb-6 leading-relaxed ${tier.highlight ? 'text-white/80' : 'text-light-muted dark:text-dark-muted'}`}>
                {t(tier.en.description, tier.sw.description)}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8">
                {(language === 'sw' ? tier.sw.features : tier.en.features).map((feature: string) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check size={14} className={tier.highlight ? 'text-white mt-0.5 shrink-0' : 'text-accent-green mt-0.5 shrink-0'} />
                    <span className={`font-body text-sm leading-snug ${tier.highlight ? 'text-white' : 'text-light-text dark:text-dark-text'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={tier.href}
                className={
                  tier.highlight
                    ? 'w-full flex items-center justify-center px-6 py-3 rounded-ios bg-white text-brand font-body font-semibold text-sm hover:bg-white/90 transition-all active:scale-95'
                    : 'btn-secondary w-full justify-center'
                }
              >
                {t(tier.en.cta, tier.sw.cta)}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center font-body text-sm text-light-muted dark:text-dark-muted mt-10">
          {t(
            '🇰🇪 All prices in Kenyan Shillings. Paid securely via M-Pesa.',
            '🇰🇪 Bei zote ni Shilingi za Kenya. Malipo salama kupitia M-Pesa.'
          )}
        </p>

      </div>
    </section>
  )
}