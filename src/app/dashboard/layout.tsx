import { redirect } from 'next/navigation'
import { getUser, getVendor } from '@/lib/data'
import DashboardSidebar from '@/components/shared/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user   = await getUser()
  if (!user) redirect('/login')

  const vendor = await getVendor()
  if (!vendor) redirect('/register')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <DashboardSidebar vendor={vendor} />
      <main className="flex-1 rtl:mr-0 rtl:md:mr-64 ltr:ml-0 ltr:md:ml-64 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
