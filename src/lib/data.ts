/**
 * Cached server-side data fetchers.
 * React.cache() deduplicates calls within the same server render tree,
 * so layout + page components share one DB round-trip instead of each making their own.
 */
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getVendor = cache(async () => {
  const user = await getUser()
  if (!user) return null
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return vendor ?? null
})
