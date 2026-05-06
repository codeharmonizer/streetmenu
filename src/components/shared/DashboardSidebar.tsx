'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { QrCode, LayoutDashboard, UtensilsCrossed, QrCodeIcon, BarChart3, LogOut, ExternalLink, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Vendor } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'نظرة عامة' },
  { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'القائمة' },
  { href: '/dashboard/qr', icon: QrCodeIcon, label: 'رمز QR' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'الإحصائيات' },
  { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
]

export default function DashboardSidebar({ vendor }: { vendor: Vendor }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('تم تسجيل الخروج')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-64 flex flex-col border-l hidden md:flex"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
            <QrCode size={15} color="white" />
          </div>
          <span className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>StreetMenu</span>
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
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{vendor.category || 'طعام شعبي'}</p>
          </div>
        </div>
        <Link
          href={`/m/${vendor.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors hover:opacity-70"
          style={{ color: 'var(--brand)' }}>
          <ExternalLink size={11} />
          عرض القائمة العامة
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'text-white' : 'hover:bg-[var(--surface-2)]'
              )}
              style={active ? { background: 'var(--brand)', color: 'white' } : { color: 'var(--text-secondary)' }}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all hover:bg-red-50"
          style={{ color: 'var(--text-secondary)' }}>
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
