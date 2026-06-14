export type Plan = 'free' | 'pro'
export type SubscriptionStatus = 'free' | 'trial' | 'active' | 'expired'

export interface Vendor {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  address: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  hours: string | null
  logo_url: string | null
  plan: Plan
  is_open: boolean
  is_active: boolean
  reviews_enabled: boolean
  orders_enabled: boolean
  subscription_status: SubscriptionStatus
  subscription_starts_at: string | null
  subscription_expires_at: string | null
  created_at: string
}

/** Returns true if the vendor currently has an active paid/trial subscription */
export function isPaid(vendor: Pick<Vendor, 'subscription_status' | 'subscription_expires_at'>): boolean {
  const { subscription_status, subscription_expires_at } = vendor
  if (subscription_status !== 'active' && subscription_status !== 'trial') return false
  if (!subscription_expires_at) return true          // no expiry = lifetime
  return new Date(subscription_expires_at) > new Date()
}

export const FREE_ITEM_LIMIT = 10

export interface MenuItem {
  id: string
  vendor_id: string
  name: string
  description: string | null
  price: number
  photo_url: string | null
  category: string | null
  available: boolean
  created_at: string
}

export interface Review {
  id: string
  vendor_id: string
  rating: number
  comment: string | null
  reviewer_name: string | null
  created_at: string
}

export type OrderStatus = 'pending' | 'accepted' | 'ready' | 'completed' | 'rejected'

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  name: string
  price: number
  quantity: number
  created_at: string
}

export interface Order {
  id: string
  vendor_id: string
  order_number: string
  status: OrderStatus
  customer_name: string | null
  customer_phone: string | null
  note: string | null
  total: number
  created_at: string
  order_items?: OrderItem[]
}

export interface ScanEvent {
  id: string
  vendor_id: string
  scanned_at: string
}
