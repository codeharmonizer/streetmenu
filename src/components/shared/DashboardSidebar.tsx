'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, QrCodeIcon, BarChart3, LogOut, ExternalLink, Settings, ShoppingBag, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Vendor } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import RelaxedMenuLogo from './RelaxedMenuLogo'

export default function DashboardSidebar({ vendor, pendingOrders }: { vendor: Vendor; pendingOrders?: number }) {
  const pathname = usePathname()
  const router   = useRouter()
  const t        = useTranslations('sidebar')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navItems = [
    { href: '/dashboard',            icon: LayoutDashboard, label: t('overview'),  badge: undefined                                       },
    { href: '/dashboard/menu',       icon: UtensilsCrossed, label: t('menu'),      badge: undefined                                       },
    { href: '/dashboard/orders',     icon: ShoppingBag,     label: t('orders'),    badge: (pendingOrders ?? 0) > 0 ? pendingOrders : undefined },
    { href: '/dashboard/qr',         icon: QrCodeIcon,      label: t('qr'),        badge: undefined                                       },
    { href: '/dashboard/analytics',  icon: BarChart3,       label: t('analytics'), badge: undefined                                       },
    { href: '/dashboard/settings',   icon: Settings,        label: t('settings'),  badge: undefined                                       },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success(t('logout'))
    router.push('/login')
    router.refresh()
  }

  const renderSidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2">
          <RelaxedMenuLogo size={28} />
          <span className="font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.03em' }}>
            Relaxed <span style={{ color: 'var(--brand)' }}>Menu</span>
          </span>
        </Link>
      </div>

      {/* Vendor info */}
      <div className="p-4 border-b mx-4 my-4 rounded-xl" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          {vendor.logo_url ? (
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative">
              <Image src={vendor.logo_url} alt={vendor.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style={{ background: 'var(--brand)' }}>
              {getInitials(vendor.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{vendor.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {vendor.category || t('defaultCategory')}
            </p>
          </div>
        </div>
        <Link
          href={`/m/${vendor.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors hover:opacity-70"
          style={{ color: 'var(--brand)' }}>
          <ExternalLink size={11} />
          {t('viewPublicMenu')}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'text-white' : 'hover:bg-[var(--surface-2)]'
              )}
              style={active ? { background: 'var(--brand)', color: 'white' } : { color: 'var(--text-secondary)' }}>
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge !== undefined && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--brand)',
                    color:      active ? 'white' : 'white',
                  }}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
        <LanguageSwitcher variant="sidebar" />
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all hover:bg-red-50"
          style={{ color: 'var(--text-secondary)' }}>
          <LogOut size={16} />
          {t('logout')}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between border-b px-4 md:hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', height: 64 }}
      >
        <Link href="/" className="flex items-center gap-2">
          <RelaxedMenuLogo size={24} />
          <span className="font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.03em' }}>
            Relaxed <span style={{ color: 'var(--brand)' }}>Menu</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(open => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[var(--surface-2)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label={t('closeMenu')}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 z-50 flex h-full w-64 flex-col transition-transform duration-200 md:hidden rtl:right-0 ltr:left-0 rtl:border-l ltr:border-r',
          mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        )}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex h-full flex-col">
          {renderSidebarContent()}
        </div>
      </aside>

      <aside
        className="fixed top-0 h-full w-64 hidden flex-col md:flex rtl:right-0 ltr:left-0 rtl:border-l ltr:border-r"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {renderSidebarContent()}
      </aside>
    </>
  )
}
