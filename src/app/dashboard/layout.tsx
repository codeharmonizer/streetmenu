import { redirect } from 'next/navigation'
import { getUser, getVendor } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/shared/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user   = await getUser()
  if (!user) redirect('/login')

  const vendor = await getVendor()
  if (!vendor) redirect('/register')

  const supabase = await createClient()
  const { count: pendingCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id)
    .eq('status', 'pending')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <DashboardSidebar vendor={vendor} pendingOrders={pendingCount ?? 0} />
      <main className="flex-1 rtl:mr-0 rtl:md:mr-64 ltr:ml-0 ltr:md:ml-64 p-4 pt-20 md:p-8">
        {children}
      </main>
    </div>
  )
}
