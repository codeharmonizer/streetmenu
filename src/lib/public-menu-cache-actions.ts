'use server'

import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { publicMenuTag } from '@/lib/public-menu-cache'

export async function revalidateVendorPublicMenu(vendorId: string, oldSlug?: string) {
  const supabase = createAdminClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('slug')
    .eq('id', vendorId)
    .single()

  if (oldSlug) {
    revalidateTag(publicMenuTag(oldSlug), 'max')
  }

  if (vendor?.slug) {
    revalidateTag(publicMenuTag(vendor.slug), 'max')
  }
}
