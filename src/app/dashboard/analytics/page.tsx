import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Activity, Award, BarChart3, Calendar, Clock3, Eye, Lock, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { isPaid } from '@/types'
import Link from 'next/link'
import { getVendor } from '@/lib/data'
import { getTranslations, getLocale } from 'next-intl/server'
import { buildScanAnalytics } from '@/lib/analytics'

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
  const { data: allScans } = await supabase
    .from('scans')
    .select('scanned_at')
    .eq('vendor_id', vendor.id)
    .gte('scanned_at', thirtyDaysAgo)
    .order('scanned_at', { ascending: true })

  const scans = allScans || []
  const analytics = buildScanAnalytics(scans)
  const { totalScans, todayScans, weekScans, previousWeekScans, weekChangePercent, averagePerDay, bestDay, peakHour, chartData, hourlyData, weekdayData } = analytics
  const maxCount  = Math.max(...chartData.map(d => d.count), 1)
  const maxHourlyCount = Math.max(...hourlyData.map(d => d.count), 1)
  const maxWeekdayCount = Math.max(...weekdayData.map(d => d.count), 1)

  const copy = {
    ar: {
      averageDaily: 'المتوسط اليومي',
      peakHour: 'وقت الذروة',
      bestDay: 'أفضل يوم',
      weeklyTrend: 'مقارنة الأسبوع',
      vsPrevious: `مقارنة بـ ${previousWeekScans} في الأسبوع السابق`,
      noTrend: 'لا يوجد أسبوع سابق للمقارنة',
      scans: 'مسح',
      hourlyPattern: 'أوقات الذروة خلال اليوم',
      weekdayPattern: 'النشاط حسب أيام الأسبوع',
      insightsTitle: 'ملاحظات مفيدة',
      promoteBestTime: 'شارك عروضك قبل وقت الذروة لزيادة الزيارات.',
      printQr: 'ضع رمز QR في مكان واضح وعلى الطاولات لزيادة المسح.',
      addPhotos: 'أضف صوراً للأصناف الأكثر طلباً لتحويل الزيارات إلى طلبات.',
      noPeak: 'تحتاج إلى بعض الزيارات قبل ظهور أوقات الذروة.',
      todayShare: 'حصة اليوم',
      of30Days: 'من زيارات آخر 30 يوم',
    },
    en: {
      averageDaily: 'Daily average',
      peakHour: 'Peak hour',
      bestDay: 'Best day',
      weeklyTrend: 'Weekly trend',
      vsPrevious: `vs ${previousWeekScans} previous week`,
      noTrend: 'No previous week to compare yet',
      scans: 'scans',
      hourlyPattern: 'Peak times during the day',
      weekdayPattern: 'Activity by weekday',
      insightsTitle: 'Useful insights',
      promoteBestTime: 'Share offers before your peak time to catch more visitors.',
      printQr: 'Place your QR code clearly on tables and counters to grow scans.',
      addPhotos: 'Add photos to popular items to turn visits into orders.',
      noPeak: 'You need a few visits before peak times appear.',
      todayShare: "Today's share",
      of30Days: 'of last 30 days visits',
    },
  }[locale === 'ar' ? 'ar' : 'en']

  const hourLabel = (hour: number) => {
    const date = new Date(Date.UTC(2026, 0, 1, hour))
    return format(date, 'haaa', { locale: dateLocale })
  }

  const weekdayLabel = (weekday: number) => {
    const date = new Date(Date.UTC(2026, 0, 4 + weekday)) // Jan 4 2026 is Sunday
    return format(date, 'EEE', { locale: dateLocale })
  }

  const stats = [
    { label: `${t('totalScans')} (${t('last30Days')})`, value: totalScans,                    icon: Eye        },
    { label: t('last7Days'),                             value: weekScans,                     icon: TrendingUp },
    { label: t('today'),                                 value: todayScans,                    icon: Calendar   },
    { label: copy.averageDaily,                           value: averagePerDay.toLocaleString(locale), icon: Activity   },
  ]

  const todayShare = totalScans > 0 ? Math.round((todayScans / totalScans) * 100) : 0

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('desc')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card">
            <Icon size={16} className="mb-3" style={{ color: 'var(--brand)' }} />
            <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <Award size={16} className="mb-3" style={{ color: 'var(--brand)' }} />
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{copy.bestDay}</p>
          <p className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            {bestDay ? format(new Date(bestDay.date), 'd MMM', { locale: dateLocale }) : '—'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {bestDay ? `${bestDay.count} ${copy.scans}` : t('noScans')}
          </p>
        </div>
        <div className="card">
          <Clock3 size={16} className="mb-3" style={{ color: 'var(--brand)' }} />
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{copy.peakHour}</p>
          <p className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            {peakHour ? hourLabel(peakHour.hour) : '—'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {peakHour ? `${peakHour.count} ${copy.scans}` : copy.noPeak}
          </p>
        </div>
        <div className="card">
          <TrendingUp size={16} className="mb-3" style={{ color: 'var(--brand)' }} />
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{copy.weeklyTrend}</p>
          <p className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            {weekChangePercent === null ? '—' : `${weekChangePercent > 0 ? '+' : ''}${weekChangePercent}%`}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {weekChangePercent === null ? copy.noTrend : copy.vsPrevious}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card mb-6">
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

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>{copy.hourlyPattern}</h2>
            <Clock3 size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="flex items-end gap-0.5 h-28">
            {hourlyData.map(({ hour, count }) => (
              <div key={hour} className="flex-1 rounded-t-sm" title={`${hourLabel(hour)}: ${count}`}
                style={{
                  height:     `${(count / maxHourlyCount) * 100}%`,
                  minHeight:  count > 0 ? '4px' : '2px',
                  background: count > 0 ? 'var(--brand)' : 'var(--border)',
                  opacity:    count > 0 ? 1 : 0.6,
                }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>12am</span><span>12pm</span><span>11pm</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>{copy.weekdayPattern}</h2>
            <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="space-y-3">
            {weekdayData.map(({ weekday, count }) => (
              <div key={weekday} className="flex items-center gap-3">
                <span className="text-xs w-10" style={{ color: 'var(--text-secondary)' }}>{weekdayLabel(weekday)}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(count / maxWeekdayCount) * 100}%`, background: count > 0 ? 'var(--brand)' : 'transparent' }} />
                </div>
                <span className="text-xs w-8 text-end" style={{ color: 'var(--text-muted)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>{copy.insightsTitle}</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
            <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)' }}>{todayShare}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{copy.todayShare} {copy.of30Days}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
            <p className="text-sm font-semibold mb-1">💡 {peakHour ? hourLabel(peakHour.hour) : copy.peakHour}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{peakHour ? copy.promoteBestTime : copy.printQr}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
            <p className="text-sm font-semibold mb-1">📸</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{copy.addPhotos}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
