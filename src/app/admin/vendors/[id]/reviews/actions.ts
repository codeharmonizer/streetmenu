'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteReview(reviewId: string, vendorId: string) {
  const supabase = await createClient()

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!adminRow) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('vendor_id', vendorId)   // extra safety: scope to vendor

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/vendors/${vendorId}/reviews`)
}
