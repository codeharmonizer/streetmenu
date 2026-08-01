import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { MenuItem, Review, Vendor } from '@/types'

export const PUBLIC_MENU_REVALIDATE_SECONDS = 60 * 60 * 24
export const publicMenuTag = (slug: string) => `public-menu:${slug}`

type PublicMenuVendor = Vendor

type PublicMenuData = {
  vendor: PublicMenuVendor | null
  items: MenuItem[]
  reviews: Review[]
}

async function loadPublicMenuData(slug: string): Promise<PublicMenuData> {
  const supabase = createAdminClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!vendor) {
    return { vendor: null, items: [], reviews: [] }
  }

  const [{ data: items }, { data: reviews }] = await Promise.all([
    supabase
      .from('menu_items')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('available', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('reviews')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return {
    vendor: vendor as PublicMenuVendor,
    items: (items ?? []) as MenuItem[],
    reviews: (reviews ?? []) as Review[],
  }
}

export async function getCachedPublicMenuData(slug: string) {
  return unstable_cache(
    () => loadPublicMenuData(slug),
    ['public-menu', slug],
    {
      revalidate: PUBLIC_MENU_REVALIDATE_SECONDS,
      tags: [publicMenuTag(slug)],
    }
  )()
}

export async function getPublicMenuMetadata(slug: string) {
  const { vendor } = await getCachedPublicMenuData(slug)
  return vendor
    ? {
        name: vendor.name,
        description: vendor.description,
        category: vendor.category,
      }
    : null
}
