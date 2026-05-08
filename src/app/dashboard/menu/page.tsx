import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuManager from '@/components/menu/MenuManager'
import { getVendor } from '@/lib/data'

export default async function MenuPage() {
  const vendor = await getVendor()
  if (!vendor) redirect('/login')

  const supabase = await createClient()
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return <MenuManager vendor={vendor} initialItems={items || []} />
}
