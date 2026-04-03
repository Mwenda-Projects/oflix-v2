import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

const steps = [
  {
    number: '01',
    en: {
      title: 'Tell us about your business',
      description: 'No forms, no tech jargon. Just describe what your business does, where it is, and how customers can reach you. Like explaining to a friend.',
      example: '"I sell second-hand clothes in Gikomba Market. Customers can order on WhatsApp and I deliver within Nairobi."',
    },
    sw: {
      title: 'Tuambie kuhusu biashara yako',
      description: 'Hakuna fomu ngumu, hakuna lugha ya teknolojia. Eleza tu biashara yako inafanya nini, iko wapi, na jinsi wateja wanaweza kukufikia.',
      example: '"Nauza nguo za pili Gikomba Market. Wateja wanaweza kuagiza kwa WhatsApp nami nitapeleka ndani ya Nairobi."',
    },
    color: 'text-brand',
    bg: 'bg-brand/10',
    border: 'border-brand/20',
    emoji: '💬',
  },
  {
    number: '02',
    en: {
      title: 'OfliX builds your website',
      description: 'In minutes, OfliX creates a clean professional website for your business — with your details, WhatsApp button, and your location on Google Maps. Nothing complicated.',
      example: '✓ Professional website ready  ✓ WhatsApp button added  ✓ Location pinned on map  ✓ Mobile-friendly',
    },
    sw: {
      title: 'OfliX inaunda tovuti yako',
      description: 'Kwa dakika chache, OfliX inaunda tovuti nzuri ya kitaalamu kwa biashara yako — na maelezo yako, kitufe cha WhatsApp, na eneo lako kwenye Google Maps.',
      example: '✓ Tovuti tayari  ✓ Kitufe cha WhatsApp kimeongezwa  ✓ Eneo limewekwa kwenye ramani  ✓ Inafanya kazi kwenye simu',
    },
    color: 'text-accent-green',
    bg: 'bg-accent-green/10',
    border: 'border-accent-green/20',
    emoji: '🏗️',
  },
  {
    number: '03',
    en: {
      title: 'Share it and get customers',
      description: 'Your website has its own link. Share it on WhatsApp, Facebook, Instagram — anywhere. Customers find you, see your details, and contact you directly.',
      example: 'Share: mama-grace-salon.oflix.co.ke → Customers click WhatsApp → You get business.',
    },
    sw: {
      title: 'Shiriki na upate wateja',
      description: 'Tovuti yako ina kiungo chake. Shiriki kwa WhatsApp, Facebook, Instagram — popote. Wateja wakupate, waone maelezo yako, na wakuwasiliane moja kwa moja.',
      example: 'Shiriki: duka-la-grace.oflix.co.ke → Wateja wabonyeze WhatsApp → Upate biashara.',
    },
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    border: 'border-accent-purple/20',
    emoji: '🚀',
  },
]

export default function HowItWorks() {
  const { t } = useLanguage()

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label mb-3">
            {t('How it works', 'Jinsi Inavyofanya Kazi')}
          </p>
          <h2 className="heading-display text-4xl md:text-5xl mb-4">
            {t('Three steps.', 'Hatua tatu.')}
            <br />
            <span className="text-brand">
              {t('That\'s all it takes.', 'Hiyo ndiyo yote inayohitajika.')}
            </span>
          </h2>
          <p className="font-body text-lg text-light-muted dark:text-dark-muted max-w-xl mx-auto">
            {t(
              'No technical knowledge. No expensive developers. No waiting weeks.',
              'Hakuna ujuzi wa teknolojia. Hakuna wasanidi programu wa gharama. Hakuna kusubiri wiki.'
            )}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-5 mb-16">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`card border ${step.border} hover:shadow-ios-md transition-shadow duration-300`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">

                {/* Number + emoji */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-ios flex flex-col items-center justify-center ${step.bg}`}>
                  <span className="text-xl">{step.emoji}</span>
                  <span className={`font-mono text-xs font-bold ${step.color}`}>{step.number}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-body font-semibold text-light-text dark:text-dark-text text-lg mb-2">
                    {t(step.en.title, step.sw.title)}
                  </h3>
                  <p className="font-body text-sm text-light-muted dark:text-dark-muted leading-relaxed mb-4">
                    {t(step.en.description, step.sw.description)}
                  </p>
                  <div className={`rounded-ios p-4 ${step.bg} border ${step.border}`}>
                    <p className="font-mono text-xs text-light-text dark:text-dark-text leading-relaxed">
                      <span className="text-light-muted dark:text-dark-muted">
                        {t('Example: ', 'Mfano: ')}
                      </span>
                      {t(step.en.example, step.sw.example)}
                    </p>
                  </div>
                </div>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center self-center flex-shrink-0">
                    <ArrowRight size={16} className="text-light-muted dark:text-dark-muted" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Time callout */}
        <div className="card bg-brand/5 dark:bg-brand/10 border border-brand/20 text-center py-12 mb-10">
          <p className="section-label mb-3">
            {t('From start to live website', 'Kutoka mwanzo hadi tovuti hai')}
          </p>
          <p className="heading-display text-5xl md:text-6xl text-brand mb-3">
            {t('Under 10 minutes.', 'Chini ya dakika 10.')}
          </p>
          <p className="font-body text-sm text-light-muted dark:text-dark-muted max-w-md mx-auto">
            {t(
              'What used to cost thousands of shillings and take weeks — OfliX does it in minutes, for free.',
              'Kilichokuwa kinagharimu maelfu ya shilingi na kuchukua wiki nyingi — OfliX inafanya kwa dakika, bila malipo.'
            )}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/signup"
            className="btn-primary text-base px-8 py-4 shadow-ios-glow inline-flex"
          >
            {t('Get my business online now', 'Weka biashara yangu mtandaoni sasa')}
            <ArrowRight size={16} />
          </Link>
          <p className="font-body text-xs text-light-muted dark:text-dark-muted mt-4">
            {t('Free to start · No card needed · Cancel anytime', 'Bure kuanza · Hakuna kadi · Acha wakati wowote')}
          </p>
        </div>

      </div>
    </section>
  )
}
