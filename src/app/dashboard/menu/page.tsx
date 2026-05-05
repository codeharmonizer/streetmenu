import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuManager from '@/components/menu/MenuManager'

export default async function MenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/register')

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: true })

  return <MenuManager vendor={vendor} initialItems={items || []} />
}
