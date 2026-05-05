import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UtensilsCrossed, QrCode, BarChart3, Star, ChevronRight, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/register')

  const [{ count: itemCount }, { count: scanCount }, { data: reviews }] = await Promise.all([
    supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
    supabase.from('scans').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
    supabase.from('reviews').select('rating').eq('vendor_id', vendor.id),
  ])

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const stats = [
    { label: 'Menu items', value: itemCount ?? 0, icon: UtensilsCrossed, href: '/dashboard/menu', cta: 'Add items' },
    { label: 'Total scans', value: scanCount ?? 0, icon: BarChart3, href: '/dashboard/analytics', cta: 'View analytics' },
    { label: 'Reviews', value: reviews?.length ?? 0, icon: Star, href: `/m/${vendor.slug}`, cta: 'See reviews' },
  ]

  const isNew = (itemCount ?? 0) === 0

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Hey 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's how <strong>{vendor.name}</strong> is doing.</p>
      </div>

      {/* Onboarding banner */}
      {isNew && (
        <div className="rounded-2xl p-6 mb-8 flex items-start gap-4"
          style={{ background: 'var(--brand-light)', border: '1px solid #ffd4a8' }}>
          <div className="text-2xl">🚀</div>
          <div className="flex-1">
            <p className="font-bold mb-1" style={{ color: 'var(--brand)' }}>You're almost live!</p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Add your first menu item to activate your public menu and QR code.
            </p>
            <Link href="/dashboard/menu" className="btn-primary text-sm px-4 py-2">
              Add first item →
            </Link>
          </div>
        </div>
      )}

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
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Quick actions</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { href: '/dashboard/menu', icon: UtensilsCrossed, title: 'Manage menu', desc: 'Add, edit, or remove dishes' },
          { href: '/dashboard/qr', icon: QrCode, title: 'Download QR code', desc: 'Print and stick it at your stall' },
          { href: `//m/${vendor.slug}`, icon: TrendingUp, title: 'Preview public menu', desc: 'See what customers see' },
          { href: '/dashboard/analytics', icon: BarChart3, title: 'View analytics', desc: 'Scan count and trends' },
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
            <ChevronRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  )
}
