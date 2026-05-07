import { createClient } from '@/lib/supabase/server'
import { Store, BarChart3, Star, AlertCircle, CheckCircle, CreditCard, FlaskConical } from 'lucide-react'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [
    { count: totalVendors },
    { count: activeVendors },
    { count: disabledVendors },
    { count: payingVendors },
    { count: trialVendors },
    { count: totalScans },
    { count: totalReviews },
    { data: recentVendors },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', false),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trial'),
    supabase.from('scans').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('id, name, slug, category, is_active, subscription_status, subscription_expires_at, created_at')
      .order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Vendors', value: totalVendors ?? 0, icon: Store,         color: '#6366f1' },
    { label: 'Active',        value: activeVendors ?? 0, icon: CheckCircle,   color: '#16a34a' },
    { label: 'Disabled',      value: disabledVendors ?? 0, icon: AlertCircle, color: '#dc2626' },
    { label: '💳 Paying',     value: payingVendors ?? 0, icon: CreditCard,    color: '#0ea5e9' },
    { label: '🔬 Trial',      value: trialVendors ?? 0, icon: FlaskConical,   color: '#8b5cf6' },
    { label: 'Total Scans',   value: totalScans ?? 0, icon: BarChart3,        color: '#f59e0b' },
    { label: 'Total Reviews', value: totalReviews ?? 0, icon: Star,           color: '#ec4899' },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: '#0f172a' }}>
          Admin Overview
        </h1>
        <p style={{ color: '#64748b' }}>Platform-wide stats and quick actions.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5 bg-white border" style={{ borderColor: '#e2e8f0' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${color}15` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-3xl font-black mb-0.5" style={{ fontFamily: 'var(--font-display)', color: '#0f172a' }}>
              {value}
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent vendors */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Recently Joined
          </h2>
          <Link href="/admin/vendors" className="text-xs font-medium hover:underline" style={{ color: 'var(--brand)' }}>
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentVendors?.map(v => (
            <div key={v.id} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: '#f1f5f9' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{v.name}</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{v.category || 'No category'} · /m/{v.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: v.is_active ? '#dcfce7' : '#fee2e2',
                    color: v.is_active ? '#16a34a' : '#dc2626',
                  }}>
                  {v.is_active ? 'Active' : 'Disabled'}
                </span>
                {v.subscription_status === 'active' && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#dcfce7', color: '#16a34a' }}>💳 Paying</span>
                )}
                {v.subscription_status === 'trial' && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#eff6ff', color: '#2563eb' }}>Trial</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
