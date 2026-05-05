export type Plan = 'free' | 'pro'

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
  created_at: string
}

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

export interface ScanEvent {
  id: string
  vendor_id: string
  scanned_at: string
}
