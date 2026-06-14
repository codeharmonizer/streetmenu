import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UtensilsCrossed, QrCode, BarChart3, Star, ChevronRight, TrendingUp } from 'lucide-react'
import { isPaid } from '@/types'
import IsOpenToggle from '@/components/dashboard/IsOpenToggle'
import { getTranslations, getLocale } from 'next-intl/server'
import { getVendor } from '@/lib/data'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { subscription?: string }
}) {
  const vendor = await getVendor()
  if (!vendor) redirect('/login')

  const supabase = await createClient()
  const [{ count: itemCount }, { count: scanCount }, { data: reviews }] = await Promise.all([
    supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
    supabase.from('scans').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
    supabase.from('reviews').select('rating').eq('vendor_id', vendor.id),
  ])

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const t      = await getTranslations('dashboard')
  const locale = await getLocale()

  const stats = [
    { label: t('menuItems'),    value: itemCount ?? 0, icon: UtensilsCrossed, href: '/dashboard/menu',      cta: t('addItems')      },
    { label: t('totalScans'),   value: scanCount ?? 0, icon: BarChart3,       href: '/dashboard/analytics', cta: t('viewAnalytics') },
    { label: t('reviews'),      value: reviews?.length ?? 0, icon: Star,      href: `/m/${vendor.slug}`,    cta: t('viewReviews')   },
  ]

  const isNew = (itemCount ?? 0) === 0

  const profileSteps = [
    { done: !!vendor.phone,    label: t('profilePhone'),     href: '/dashboard/settings' },
    { done: !!vendor.address,  label: t('profileAddress'),   href: '/dashboard/settings' },
    { done: !!vendor.hours,    label: t('profileHours'),     href: '/dashboard/settings' },
    { done: !!vendor.logo_url, label: t('profileLogo'),      href: '/dashboard/settings' },
    { done: !isNew,            label: t('profileFirstItem'), href: '/dashboard/menu'     },
  ]
  const profileDone     = profileSteps.filter(s => s.done).length
  const profileComplete = profileDone === profileSteps.length
  const paid      = isPaid(vendor)
  const subStatus = vendor.subscription_status
  const expiresAt = vendor.subscription_expires_at ? new Date(vendor.subscription_expires_at) : null
  const daysLeft  = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000) : null

  function daysLabel(n: number) {
    if (locale === 'ar') return n === 1 ? t('day') : t('days')
    return n === 1 ? t('day') : t('days')
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {t('welcomeTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('welcomeDesc')} <strong>{vendor.name}</strong>.</p>
      </div>

      {/* ── Subscription payment success banner ── */}
      {(searchParams?.subscription === 'success' || searchParams?.subscription === 'renewed') && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: '#dcfce7', border: '1px solid #86efac' }}>
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold text-sm" style={{ color: '#166534' }}>
              {locale === 'ar' ? 'تم تفعيل اشتراكك بنجاح!' : 'Subscription activated successfully!'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#15803d' }}>
              {locale === 'ar'
                ? 'يمكنك الآن إضافة أصناف غير محدودة والوصول لجميع ميزات Pro.'
                : 'You can now add unlimited items and access all Pro features.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Subscription banner ── */}
      {paid && daysLeft !== null && daysLeft <= 7 && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <span className="text-xl">⏳</span>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: '#92400e' }}>
              {subStatus === 'trial' ? t('trialExpiringSoon') : t('subExpiringSoon')}{' '}
              {t('expiresSoon', { days: daysLeft, unit: daysLabel(daysLeft) })}
            </p>
            <p className="text-xs" style={{ color: '#b45309' }}>{t('renewContact')}</p>
          </div>
          <Link href="/dashboard/upgrade" className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
            style={{ background: '#f59e0b', color: 'white' }}>
            {t('renewNow')}
          </Link>
        </div>
      )}

      {subStatus === 'expired' && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <span className="text-xl">🔒</span>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: '#991b1b' }}>{t('subExpiredTitle')}</p>
            <p className="text-xs" style={{ color: '#b91c1c' }}>{t('subExpiredDesc')}</p>
          </div>
          <Link href="/dashboard/upgrade" className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
            style={{ background: '#dc2626', color: 'white' }}>
            {t('renewSub')}
          </Link>
        </div>
      )}

      {subStatus === 'free' && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'var(--brand-light)', border: '1px solid #ffd4a8' }}>
          <span className="text-xl">⭐</span>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: 'var(--brand)' }}>{t('freePlanTitle')}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('freePlanDesc')}</p>
          </div>
          <Link href="/dashboard/upgrade" className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
            style={{ background: 'var(--brand)', color: 'white' }}>
            {t('upgrade')}
          </Link>
        </div>
      )}

      {paid && subStatus === 'active' && daysLeft !== null && daysLeft > 7 && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <span className="text-xl">✅</span>
          <p className="text-sm font-medium" style={{ color: '#15803d' }}>
            {t('activeSubTitle')} {expiresAt!.toLocaleDateString(locale === 'ar' ? 'ar-BH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Profile completion */}
      {!profileComplete && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {t('profileTitle')} — {profileDone}/{profileSteps.length}
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
              {Math.round(profileDone / profileSteps.length * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full mb-4" style={{ background: 'var(--surface-2)' }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${profileDone / profileSteps.length * 100}%`, background: 'var(--brand)' }} />
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {profileSteps.map(step => (
              <Link key={step.label} href={step.href}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors"
                style={{ background: step.done ? '#f0fdf4' : 'var(--surface-2)' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: step.done ? '#16a34a' : 'var(--border)', color: step.done ? 'white' : 'var(--text-muted)' }}>
                  {step.done ? '✓' : '○'}
                </span>
                <span style={{ color: step.done ? '#15803d' : 'var(--text-secondary)', textDecoration: step.done ? 'line-through' : 'none' }}>
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Onboarding banner */}
      {isNew && (
        <div className="rounded-2xl p-6 mb-8 flex items-start gap-4"
          style={{ background: 'var(--brand-light)', border: '1px solid #ffd4a8' }}>
          <div className="text-2xl">🚀</div>
          <div className="flex-1">
            <p className="font-bold mb-1" style={{ color: 'var(--brand)' }}>{t('onboardingTitle')}</p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{t('onboardingDesc')}</p>
            <Link href="/dashboard/menu" className="btn-primary text-sm px-4 py-2">
              {t('onboardingBtn')}
            </Link>
          </div>
        </div>
      )}

      {/* is_open toggle */}
      <div className="mb-6">
        <IsOpenToggle vendorId={vendor.id} initialIsOpen={vendor.is_open} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, cta }) => (
          <Link key={label} href={href}
            className="card group hover:-translate-y-0.5 transition-all duration-200 block">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--brand-light)' }}>
                <Icon size={16} style={{ color: 'var(--brand)' }} />
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180"
                style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>{t('quickActions')}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { href: '/dashboard/menu',       icon: UtensilsCrossed, title: t('manageMenu'),   desc: t('manageMenuDesc')   },
          { href: '/dashboard/qr',         icon: QrCode,          title: t('downloadQr'),   desc: t('downloadQrDesc')   },
          { href: `/m/${vendor.slug}`,     icon: TrendingUp,      title: t('previewMenu'),  desc: t('previewMenuDesc')  },
          { href: '/dashboard/analytics',  icon: BarChart3,       title: t('viewStats'),    desc: t('viewStatsDesc')    },
        ].map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href}
            className="card flex items-center gap-4 group hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--surface-2)' }}>
              <Icon size={18} style={{ color: 'var(--brand)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
            <ChevronRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity rtl:rotate-180" />
          </Link>
        ))}
      </div>
    </div>
  )
}
