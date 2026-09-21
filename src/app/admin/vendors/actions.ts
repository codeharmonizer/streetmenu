'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function assertCurrentUserIsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!adminRow) throw new Error('Unauthorized')
}

async function listVendorStoragePaths(
  storage: ReturnType<typeof createAdminClient>['storage'],
  folder: string,
): Promise<string[]> {
  const { data, error } = await storage.from('menu-photos').list(folder, { limit: 1000 })
  if (error) throw new Error(error.message)

  const paths = await Promise.all((data ?? []).map(async object => {
    const path = `${folder}/${object.name}`

    if (object.id === null) {
      return listVendorStoragePaths(storage, path)
    }

    return [path]
  }))

  return paths.flat()
}

export async function deleteVendor(vendorId: string) {
  await assertCurrentUserIsAdmin()

  const adminSupabase = createAdminClient()

  const { data: vendor, error: vendorLookupError } = await adminSupabase
    .from('vendors')
    .select('id, user_id')
    .eq('id', vendorId)
    .single()

  if (vendorLookupError || !vendor) {
    throw new Error(vendorLookupError?.message ?? 'Vendor not found')
  }

  const vendorStoragePaths = await listVendorStoragePaths(adminSupabase.storage, vendor.id)
  if (vendorStoragePaths.length > 0) {
    const { error: storageError } = await adminSupabase.storage.from('menu-photos').remove(vendorStoragePaths)

    if (storageError) throw new Error(storageError.message)
  }

  // Delete the owning auth account. The public.vendors.user_id foreign key has
  // ON DELETE CASCADE, so this removes the vendor and related vendor records at
  // the same root that allows the owner to sign in again after an admin delete.
  const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(vendor.user_id)

  if (authDeleteError) throw new Error(authDeleteError.message)

  revalidatePath('/admin/vendors')
}
