import Link from 'next/link'
import { QrCode } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
            <QrCode size={18} color="white" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>StreetMenu</span>
        </Link>

        <p className="text-7xl font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)' }}>
          {t('code')}
        </p>
        <h1 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {t('title')}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {t('desc')}
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/" className="btn-primary py-3">
            {t('goHome')}
          </Link>
          <Link href="/dashboard" className="btn-secondary py-3">
            {t('goDashboard')}
          </Link>
        </div>
      </div>
    </div>
  )
}
