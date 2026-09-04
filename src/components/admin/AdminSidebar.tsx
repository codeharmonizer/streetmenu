'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Store, LogOut } from 'lucide-react'
import RelaxedMenuLogo from '@/components/shared/RelaxedMenuLogo'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/vendors', icon: Store, label: 'Vendors' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 border-b"
        style={{ background: '#0f172a', borderColor: '#1e293b', height: 56 }}>
        <Link href="/admin" className="flex items-center gap-2">
          <RelaxedMenuLogo size={22} />
          <p className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
            Relaxed <span style={{ color: 'var(--brand)' }}>Menu</span>
          </p>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all', active ? 'text-white' : '')}
                style={active ? { background: 'var(--brand)' } : { color: '#94a3b8' }}>
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
          <button onClick={handleLogout}
            className="flex items-center px-2 py-1.5 rounded-lg transition-all hover:bg-red-500/10 ms-1"
            style={{ color: '#64748b' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed right-0 top-0 h-full w-64 flex-col border-l"
        style={{ background: '#0f172a', borderColor: '#1e293b' }}>

        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: '#1e293b' }}>
          <Link href="/admin" className="flex items-center gap-2">
            <RelaxedMenuLogo size={28} />
            <div>
              <p className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
                Relaxed <span style={{ color: 'var(--brand)' }}>Menu</span>
              </p>
              <p className="text-xs" style={{ color: '#64748b' }}>Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'text-white' : 'hover:bg-white/5'
                )}
                style={active
                  ? { background: 'var(--brand)', color: 'white' }
                  : { color: '#94a3b8' }}>
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t space-y-1" style={{ borderColor: '#1e293b' }}>
          <Link href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
            style={{ color: '#64748b' }}>
            <Store size={16} />
            My Vendor Dashboard
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all hover:bg-red-500/10"
            style={{ color: '#64748b' }}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
