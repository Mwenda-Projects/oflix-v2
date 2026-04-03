import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-6 text-center">
      <div>
        <p className="font-mono text-xs text-brand mb-3 tracking-widest uppercase">
          404
        </p>
        <h1 className="heading-display text-5xl mb-4">
          {t('This page doesn\'t exist.', 'Ukurasa huu haupo.')}
        </h1>
        <p className="font-body text-light-muted dark:text-dark-muted mb-8">
          {t(
            'The link may be wrong or the page has moved.',
            'Kiungo kinaweza kuwa kibaya au ukurasa umehamia.'
          )}
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft size={15} />
          {t('Back to home', 'Rudi nyumbani')}
        </Link>
      </div>
    </div>
  )
}
