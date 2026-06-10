import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin role
  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!adminRow) redirect('/dashboard')

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      <AdminSidebar />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-[72px] md:pt-8 min-h-screen" style={{ background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  )
}
