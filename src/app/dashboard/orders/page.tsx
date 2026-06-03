import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getVendor } from '@/lib/data'
import OrdersManager from '@/components/orders/OrdersManager'

export default async function OrdersPage() {
  const vendor = await getVendor()
  if (!vendor) redirect('/login')

  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  return <OrdersManager initialOrders={orders ?? []} />
}
