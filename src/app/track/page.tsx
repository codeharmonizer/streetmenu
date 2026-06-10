'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, Clock } from 'lucide-react'

const SM_ORDERS_KEY = 'sm_orders'

interface SavedOrder {
  code:       string
  vendorName: string
  slug:       string
  at:         string
}

export default function TrackPage() {
  const t      = useTranslations('track')
  const router = useRouter()

  const [code,   setCode]   = useState('')
  const [recent, setRecent] = useState<SavedOrder[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SM_ORDERS_KEY)
      if (raw) setRecent(JSON.parse(raw))
    } catch {}
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    router.push(`/track/${trimmed}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black mb-1 text-center" style={{ fontFamily: 'var(--font-display)' }}>
          {t('title')}
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-secondary)' }}>{t('desc')}</p>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">{t('enterCode')}</label>
            <input
              type="text"
              className="input uppercase tracking-widest"
              placeholder={t('codePlaceholder')}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            <Search size={15} />
            {t('trackBtn')}
          </button>
        </form>

        {/* Recent orders */}
        <div className="mt-8">
          <p className="font-bold text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {t('recentOrders')}
          </p>
          {recent.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>{t('noRecent')}</p>
          ) : (
            <div className="space-y-2">
              {recent.map(o => (
                <Link key={o.code} href={`/track/${o.code}`}
                  className="card flex items-center gap-3 p-3 hover:-translate-y-0.5 transition-all duration-200 block">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--brand-light)' }}>
                    <Clock size={16} style={{ color: 'var(--brand)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm tracking-widest" style={{ color: 'var(--brand)' }}>{o.code}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{o.vendorName}</p>
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {new Date(o.at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
