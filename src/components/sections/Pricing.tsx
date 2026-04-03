import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

const tiers = [
  {
    en: {
      name: 'Starter',
      description: 'Perfect for getting your business online for the first time.',
      features: [
        'Professional business website',
        'WhatsApp contact button',
        'Location on Google Maps',
        'Mobile-friendly design',
        'Your own website link',
        'Community support',
      ],
      cta: 'Start for free',
    },
    sw: {
      name: 'Mwanzo',
      description: 'Kamili kwa kupata biashara yako mtandaoni kwa mara ya kwanza.',
      features: [
        'Tovuti ya biashara ya kitaalamu',
        'Kitufe cha mawasiliano cha WhatsApp',
        'Eneo kwenye Google Maps',
        'Muundo unaofaa kwa simu',
        'Kiungo chako cha tovuti',
        'Msaada wa jamii',
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
      name: 'Business',
      description: 'For businesses that want to stand out and grow their customer base.',
      features: [
        'Everything in Starter',
        'Custom domain (yourname.co.ke)',
        'Photo gallery for your products',
        'Business hours display',
        'Multiple WhatsApp numbers',
        'Priority support',
        'Analytics — see who visits',
      ],
      cta: 'Start free trial',
    },
    sw: {
      name: 'Biashara',
      description: 'Kwa biashara zinazotaka kujitofautisha na kukuza wateja wao.',
      features: [
        'Kila kitu katika Mwanzo',
        'Kikoa maalum (jinalako.co.ke)',
        'Matunzio ya picha za bidhaa zako',
        'Uonyeshaji wa masaa ya biashara',
        'Nambari nyingi za WhatsApp',
        'Msaada wa kipaumbele',
        'Takwimu — ona anayekutembelea',
      ],
      cta: 'Anza jaribio bure',
    },
    price: 'KSh 999',
    priceSw: 'KSh 999',
    period: '/month',
    periodSw: '/mwezi',
    highlight: true,
    href: '/signup?plan=business',
  },
  {
    en: {
      name: 'Growth',
      description: 'For established businesses ready to take their online presence seriously.',
      features: [
        'Everything in Business',
        'Online product catalogue',
        'Customer enquiry forms',
        'WhatsApp auto-reply setup',
        'Up to 3 business locations',
        'Dedicated account manager',
        'Monthly performance report',
      ],
      cta: 'Contact us',
    },
    sw: {
      name: 'Ukuaji',
      description: 'Kwa biashara zilizoimara zinazoko tayari kuchukua uwepo wao mtandaoni kwa uzito.',
      features: [
        'Kila kitu katika Biashara',
        'Katalogi ya bidhaa mtandaoni',
        'Fomu za maswali ya wateja',
        'Mpangilio wa majibu otomatiki ya WhatsApp',
        'Hadi maeneo 3 ya biashara',
        'Meneja wa akaunti aliyejitegemea',
        'Ripoti ya utendaji ya kila mwezi',
      ],
      cta: 'Wasiliana nasi',
    },
    price: 'KSh 2,499',
    priceSw: 'KSh 2,499',
    period: '/month',
    periodSw: '/mwezi',
    highlight: false,
    href: '/contact',
  },
]

export default function Pricing() {
  const { t } = useLanguage()

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
              {/* Popular badge */}
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white rounded-full">
                  <span className="font-mono text-xs text-brand font-semibold">
                    {t('Most popular', 'Maarufu zaidi')}
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
                {t(tier.en.features, tier.sw.features).map((feature: string) => (
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
            '🇰🇪 All prices in Kenyan Shillings. M-Pesa payments coming soon.',
            '🇰🇪 Bei zote ni Shilingi za Kenya. Malipo ya M-Pesa yanakuja hivi karibuni.'
          )}
        </p>

      </div>
    </section>
  )
}
