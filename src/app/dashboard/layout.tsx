import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/shared/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/register')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <DashboardSidebar vendor={vendor} />
      {/* rtl: sidebar is on right → margin-right; ltr: sidebar is on left → margin-left */}
      <main className="flex-1 rtl:mr-0 rtl:md:mr-64 ltr:ml-0 ltr:md:ml-64 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
