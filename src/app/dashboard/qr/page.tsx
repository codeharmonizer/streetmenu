import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QRDisplay from '@/components/vendor/QRDisplay'

export default async function QRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/register')

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/m/${vendor.slug}`

  // Log scan on creation for demo purposes
  try { await supabase.from('scans').insert({ vendor_id: vendor.id }) } catch {}

  return <QRDisplay vendor={vendor} menuUrl={menuUrl} />
}
