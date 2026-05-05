import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VendorSettings from '@/components/vendor/VendorSettings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/register')

  return <VendorSettings vendor={vendor} />
}
