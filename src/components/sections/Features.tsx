import { Globe, MessageCircle, MapPin, Smartphone, Zap, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const features = [
  {
    icon: Globe,
    color: 'text-brand',
    bg: 'bg-brand/10',
    en: {
      label: 'Professional Website',
      title: 'A real website your customers can trust',
      description: 'Clean, fast, and mobile-friendly. Your business gets its own link — not a social media page, a proper website that looks serious.',
    },
    sw: {
      label: 'Tovuti ya Kitaalamu',
      title: 'Tovuti halisi ambayo wateja wako wanaweza kuamini',
      description: 'Safi, ya haraka, na inafanya kazi vizuri kwenye simu. Biashara yako inapata kiungo chake — si ukurasa wa mitandao ya kijamii, tovuti halisi inayoonekana kwa uzito.',
    },
  },
  {
    icon: MessageCircle,
    color: 'text-accent-green',
    bg: 'bg-accent-green/10',
    en: {
      label: 'WhatsApp Integration',
      title: 'Customers contact you on WhatsApp in one tap',
      description: 'Every business website comes with a WhatsApp button. Customers click it — they land straight in your WhatsApp chat. No phone numbers to remember.',
    },
    sw: {
      label: 'Muunganiko wa WhatsApp',
      title: 'Wateja wanakuwasiliana kwenye WhatsApp kwa kubonyeza mara moja',
      description: 'Kila tovuti ya biashara inakuja na kitufe cha WhatsApp. Wateja wanabonyeza — wanafika moja kwa moja kwenye mazungumzo yako ya WhatsApp.',
    },
  },
  {
    icon: MapPin,
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/10',
    en: {
      label: 'Location on the Map',
      title: 'Customers find you on Google Maps',
      description: 'Add your business location and customers get directions straight from your website. No more "where exactly are you?" on WhatsApp.',
    },
    sw: {
      label: 'Eneo kwenye Ramani',
      title: 'Wateja wakupate kwenye Google Maps',
      description: 'Ongeza eneo la biashara yako na wateja wapate mwelekeo moja kwa moja kutoka tovuti yako. Hakuna zaidi ya "uko wapi hasa?" kwa WhatsApp.',
    },
  },
  {
    icon: Smartphone,
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    en: {
      label: 'Mobile First',
      title: 'Looks great on every phone',
      description: 'Most Kenyans browse on mobile. Your website works perfectly on any phone — from a basic Android to the latest smartphone.',
    },
    sw: {
      label: 'Simu Kwanza',
      title: 'Inaonekana vizuri kwenye kila simu',
      description: 'Wakenya wengi wanatumia simu kuvinjari. Tovuti yako inafanya kazi vizuri kwenye simu yoyote — kutoka Android ya kawaida hadi simu ya kisasa.',
    },
  },
  {
    icon: Zap,
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/10',
    en: {
      label: 'Ready in Minutes',
      title: 'No waiting. No back and forth.',
      description: 'Traditional web developers take weeks. OfliX gets your business online in under 10 minutes — and you can update it yourself anytime.',
    },
    sw: {
      label: 'Tayari kwa Dakika',
      title: 'Hakuna kusubiri. Hakuna kurudi na mbele.',
      description: 'Wasanidi wa tovuti wa jadi huchukua wiki nyingi. OfliX inapata biashara yako mtandaoni kwa chini ya dakika 10 — na unaweza kuisasisha mwenyewe wakati wowote.',
    },
  },
  {
    icon: Shield,
    color: 'text-brand',
    bg: 'bg-brand/10',
    en: {
      label: 'Yours Forever',
      title: 'Your website. Your business. Your control.',
      description: 'No developer holding your website hostage. Log in anytime, update your details, change your photos, edit your hours. It belongs to you.',
    },
    sw: {
      label: 'Yako Milele',
      title: 'Tovuti yako. Biashara yako. Udhibiti wako.',
      description: 'Hakuna msanidi anayeshikilia tovuti yako mateka. Ingia wakati wowote, sasisha maelezo yako, badilisha picha zako, hariri masaa yako. Ni yako.',
    },
  },
]

export default function Features() {
  const { t } = useLanguage()

  return (
    <section id="features" className="py-24 px-6 bg-light-surface dark:bg-dark-surface">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label mb-3">
            {t('What you get', 'Unachopata')}
          </p>
          <h2 className="heading-display text-4xl md:text-5xl mb-4">
            {t('Everything your business needs', 'Kila kitu biashara yako inachohitaji')}
            <br />
            <span className="text-brand">
              {t('to look professional online.', 'kuonekana kitaalamu mtandaoni.')}
            </span>
          </h2>
          <p className="font-body text-lg text-light-muted dark:text-dark-muted max-w-xl mx-auto">
            {t(
              'No extras you don\'t need. No complicated settings. Just the tools that actually help your business grow.',
              'Hakuna ziada usiyohitaji. Hakuna mipangilio ngumu. Tu zana ambazo husaidia biashara yako kukua.'
            )}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.en.label} className="card-hover group">
                <div className={`w-10 h-10 rounded-ios flex items-center justify-center mb-4 ${f.bg} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className={f.color} />
                </div>
                <p className={`section-label mb-1 ${f.color}`}>
                  {t(f.en.label, f.sw.label)}
                </p>
                <h3 className="font-body font-semibold text-light-text dark:text-dark-text text-base mb-2 leading-snug">
                  {t(f.en.title, f.sw.title)}
                </h3>
                <p className="font-body text-sm text-light-muted dark:text-dark-muted leading-relaxed">
                  {t(f.en.description, f.sw.description)}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
