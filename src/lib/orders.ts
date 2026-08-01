'use server'

import { headers } from 'next/headers'
import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Order, OrderStatus } from '@/types'

const ORDER_NUMBER_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const ORDER_RATE_LIMIT = { windowMinutes: 10, maxEvents: 5 }

async function getClientFingerprint(action: string, vendorId: string): Promise<string> {
  const h = await headers()
  const forwardedFor = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwardedFor || h.get('x-real-ip') || 'unknown'
  const ua = h.get('user-agent') || 'unknown'
  return createHash('sha256').update(`${action}:${vendorId}:${ip}:${ua}`).digest('hex')
}

async function isRateLimited(
  supabase: ReturnType<typeof createAdminClient>,
  action: string,
  vendorId: string,
  limit: { windowMinutes: number; maxEvents: number }
): Promise<boolean> {
  const key = await getClientFingerprint(action, vendorId)
  const since = new Date(Date.now() - limit.windowMinutes * 60_000).toISOString()

  const { count, error: countError } = await supabase
    .from('public_action_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('action', action)
    .eq('fingerprint', key)
    .gte('created_at', since)

  if (countError) return false
  if ((count ?? 0) >= limit.maxEvents) return true

  await supabase.from('public_action_rate_limits').insert({ action, vendor_id: vendorId, fingerprint: key })
  return false
}

function generateOrderNumber(): string {
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += ORDER_NUMBER_CHARS[Math.floor(Math.random() * ORDER_NUMBER_CHARS.length)]
  }
  return result
}

export async function placeOrder(input: {
  vendorId: string
  items: { menuItemId: string; quantity: number }[]
  customerName: string
  customerPhone: string
  note?: string
}): Promise<{ orderNumber?: string; error?: string }> {
  const { vendorId, items, customerName, customerPhone, note } = input

  if (!items.length) return { error: 'empty_cart' }
  for (const it of items) {
    if (!it.menuItemId || it.quantity < 1) return { error: 'invalid_quantity' }
  }

  const supabase = createAdminClient()
  if (await isRateLimited(supabase, 'order', vendorId, ORDER_RATE_LIMIT)) {
    return { error: 'rate_limited' }
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, orders_enabled, is_open, is_active')
    .eq('id', vendorId)
    .single()

  if (!vendor)                       return { error: 'vendor_not_found' }
  if (!vendor.orders_enabled)        return { error: 'orders_disabled' }
  if (!vendor.is_open)               return { error: 'vendor_closed' }
  if (vendor.is_active === false)    return { error: 'vendor_inactive' }

  // Load referenced menu items (server-side price validation)
  const itemIds = items.map(i => i.menuItemId)
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name, price, available, vendor_id')
    .eq('vendor_id', vendorId)
    .in('id', itemIds)

  if (!menuItems || menuItems.length !== itemIds.length) {
    return { error: 'items_not_found' }
  }

  for (const mi of menuItems) {
    if (!mi.available) return { error: `item_unavailable:${mi.name}` }
  }

  const menuItemMap = new Map(menuItems.map(m => [m.id, m]))

  let total = 0
  const orderItemsPayload = items.map(it => {
    const mi = menuItemMap.get(it.menuItemId)!
    total += mi.price * it.quantity
    return {
      menu_item_id: mi.id,
      name:         mi.name,
      price:        mi.price,
      quantity:     it.quantity,
    }
  })

  // Generate unique order number (retry on collision)
  let orderNumber = ''
  let orderId     = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    orderNumber = generateOrderNumber()

    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        vendor_id:      vendorId,
        order_number:   orderNumber,
        customer_name:  customerName || null,
        customer_phone: customerPhone || null,
        note:           note || null,
        total:          Math.round(total * 1000) / 1000,
      })
      .select('id')
      .single()

    if (orderErr) {
      // unique violation on order_number → retry
      if (orderErr.code === '23505') continue
      return { error: orderErr.message }
    }

    orderId = orderRow.id
    break
  }

  if (!orderId) return { error: 'order_number_collision' }

  // Insert order items
  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(orderItemsPayload.map(it => ({ ...it, order_id: orderId })))

  if (itemsErr) return { error: itemsErr.message }

  return { orderNumber }
}

export async function getOrderByNumber(
  orderNumber: string
): Promise<(Order & { vendor_name: string; vendor_slug: string }) | null> {
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      vendors (name, slug)
    `)
    .eq('order_number', orderNumber)
    .single()

  if (!order) return null

  const { vendors, order_items, ...rest } = order as typeof order & {
    vendors: { name: string; slug: string }
    order_items: Order['order_items']
  }

  return {
    ...rest,
    order_items,
    vendor_name: vendors?.name ?? '',
    vendor_slug: vendors?.slug ?? '',
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Verify auth user owns the vendor (belt-and-suspenders on top of RLS)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'unauthenticated' }

  const { data: order } = await supabase
    .from('orders')
    .select('vendor_id')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'order_not_found' }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('id', order.vendor_id)
    .eq('user_id', user.id)
    .single()

  if (!vendor) return { error: 'unauthorized' }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) return { error: error.message }
  return {}
}
