import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, Eye, TrendingUp, Calendar, Lock } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { isPaid } from '@/types'
import Link from 'next/link'
import { getVendor } from '@/lib/data'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function AnalyticsPage() {
  const vendor = await getVendor()
  if (!vendor) redirect('/login')

  const t      = await getTranslations('analytics')
  const locale = await getLocale()
  const dateLocale = locale === 'ar' ? ar : enUS

  const supabase = await createClient()

  if (!isPaid(vendor)) {
    return (
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('desc')}</p>
        </div>
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--surface-2)' }}>
            <Lock size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('lockedTitle')}
          </h2>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('lockedDesc')}
          </p>
          <Link href="/dashboard/upgrade" className="btn-primary mx-auto">
            {t('subscribeNow')}
          </Link>
        </div>
      </div>
    )
  }

  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const sevenDaysAgo  = subDays(new Date(), 7).toISOString()
  const today         = new Date().toISOString().slice(0, 10)

  const { data: allScans } = await supabase
    .from('scans')
    .select('scanned_at')
    .eq('vendor_id', vendor.id)
    .gte('scanned_at', thirtyDaysAgo)
    .order('scanned_at', { ascending: true })

  const scans = allScans || []

  const totalScans = scans.length
  const todayScans = scans.filter(s => s.scanned_at.slice(0, 10) === today).length
  const weekScans  = scans.filter(s => s.scanned_at >= sevenDaysAgo).length

  // Group by day for the chart
  const byDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i).toISOString().slice(0, 10)
    byDay[d] = 0
  }
  scans.forEach(s => {
    const d = s.scanned_at.slice(0, 10)
    if (byDay[d] !== undefined) byDay[d]++
  })

  const chartData = Object.entries(byDay).map(([date, count]) => ({ date, count }))
  const maxCount  = Math.max(...chartData.map(d => d.count), 1)

  const stats = [
    { label: `${t('totalScans')} (${t('last30Days')})`, value: totalScans, icon: Eye      },
    { label: t('last7Days'),                             value: weekScans,  icon: TrendingUp },
    { label: t('today'),                                 value: todayScans, icon: Calendar   },
  ]

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('desc')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card">
            <Icon size={16} className="mb-3" style={{ color: 'var(--brand)' }} />
            <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {t('scanActivity')} — {t('last30Days')}
          </h2>
          <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
        {totalScans === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('noScans')}</p>
          </div>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {chartData.map(({ date, count }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1 group"
                title={`${format(new Date(date), 'd MMM', { locale: dateLocale })}: ${count}`}>
                <div className="w-full rounded-t-sm transition-all duration-200 group-hover:opacity-80"
                  style={{
                    height:    `${(count / maxCount) * 100}%`,
                    minHeight: count > 0 ? '4px' : '2px',
                    background: count > 0 ? 'var(--brand)' : 'var(--border)',
                  }} />
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('last30Days')}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('today')}</span>
        </div>
      </div>
    </div>
  )
}
