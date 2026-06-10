import { getOrderByNumber } from '@/lib/orders'
import OrderTracker from '@/components/orders/OrderTracker'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: { code: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Order ${params.code} — ScanBite` }
}

export default async function TrackOrderPage({ params }: Props) {
  const t     = await getTranslations('track')
  const order = await getOrderByNumber(params.code.toUpperCase())

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('notFoundTitle')}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('notFoundDesc')}</p>
          <Link href="/track" className="btn-primary">
            {t('trackBtn')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <OrderTracker initialOrder={order} />
    </div>
  )
}
