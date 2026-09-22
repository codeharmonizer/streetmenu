'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { normalizeVendorSlug } from '@/lib/vendor-slugs'
import { normalizeVendorUsername } from '@/lib/vendor-usernames'

type AdminUser = { id: string }

type ActionResult = { ok: true; vendorId?: string; publicUrl?: string } | { ok: false; error: string }

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

async function assertCurrentUserIsAdmin(): Promise<AdminUser> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!adminRow) throw new Error('Unauthorized')
  return { id: user.id }
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

function formText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function nullableFormText(formData: FormData, key: string) {
  const value = formText(formData, key)
  return value || null
}

async function assertUniqueVendorIdentity(
  adminSupabase: ReturnType<typeof createAdminClient>,
  username: string,
  slug: string,
  excludeVendorId?: string,
) {
  let usernameQuery = adminSupabase
    .from('vendors')
    .select('id')
    .ilike('username', username)
    .limit(1)

  let slugQuery = adminSupabase
    .from('vendors')
    .select('id')
    .eq('slug', slug)
    .limit(1)

  if (excludeVendorId) {
    usernameQuery = usernameQuery.neq('id', excludeVendorId)
    slugQuery = slugQuery.neq('id', excludeVendorId)
  }

  const [{ data: usernameOwner, error: usernameError }, { data: slugOwner, error: slugError }] = await Promise.all([
    usernameQuery,
    slugQuery,
  ])

  if (usernameError) throw new Error(usernameError.message)
  if (slugError) throw new Error(slugError.message)
  if ((usernameOwner ?? []).length > 0) throw new Error('Username is already taken')
  if ((slugOwner ?? []).length > 0) throw new Error('Public link is already taken')
}

function vendorPayloadFromForm(formData: FormData, adminUserId: string, isCreate = false) {
  const name = formText(formData, 'name')
  const username = normalizeVendorUsername(formText(formData, 'username') || name)
  const slug = normalizeVendorSlug(formText(formData, 'slug') || name)
  const invitedEmail = nullableFormText(formData, 'invited_email')

  if (!name) throw new Error('Restaurant name is required')
  if (!username) throw new Error('Username is required')
  if (!slug) throw new Error('Public link is required')

  return {
    payload: {
      ...(isCreate ? { user_id: null } : {}),
      name,
      username,
      slug,
      description: nullableFormText(formData, 'description'),
      category: nullableFormText(formData, 'category'),
      address: nullableFormText(formData, 'address'),
      phone: nullableFormText(formData, 'phone'),
      hours: nullableFormText(formData, 'hours'),
      invited_email: invitedEmail,
      vendor_status: invitedEmail ? 'invited' : 'managed',
      invited_at: invitedEmail ? new Date().toISOString() : null,
      updated_by_admin_id: adminUserId,
      last_admin_action_at: new Date().toISOString(),
      ...(isCreate ? { created_by_admin_id: adminUserId, is_active: true } : {}),
    },
    username,
    slug,
  }
}

export async function createManagedVendor(formData: FormData): Promise<ActionResult> {
  const admin = await assertCurrentUserIsAdmin()
  const adminSupabase = createAdminClient()

  try {
    const { payload, username, slug } = vendorPayloadFromForm(formData, admin.id, true)
    await assertUniqueVendorIdentity(adminSupabase, username, slug)

    const { data, error } = await adminSupabase
      .from('vendors')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/admin/vendors')
    return { ok: true, vendorId: data.id }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to create vendor' }
  }
}

export async function updateManagedVendor(vendorId: string, formData: FormData): Promise<ActionResult> {
  const admin = await assertCurrentUserIsAdmin()
  const adminSupabase = createAdminClient()

  try {
    const { payload, username, slug } = vendorPayloadFromForm(formData, admin.id)
    await assertUniqueVendorIdentity(adminSupabase, username, slug, vendorId)

    const { error } = await adminSupabase
      .from('vendors')
      .update(payload)
      .eq('id', vendorId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/vendors')
    revalidatePath(`/admin/vendors/${vendorId}/edit`)
    return { ok: true, vendorId }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to update vendor' }
  }
}

export async function uploadAdminVendorImage(vendorId: string, formData: FormData): Promise<ActionResult> {
  await assertCurrentUserIsAdmin()
  const file = formData.get('file')
  const kind = formText(formData, 'kind') || 'item'

  if (!(file instanceof File)) return { ok: false, error: 'Image file is required' }
  if (!IMAGE_TYPES.has(file.type)) return { ok: false, error: 'Only JPG, PNG, WEBP, or GIF images are allowed' }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Image must be 5 MB or smaller' }

  const adminSupabase = createAdminClient()
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const prefix = kind === 'logo' ? 'logo' : 'item'
  const path = `${vendorId}/${prefix}-${Date.now()}.${ext}`

  const { error } = await adminSupabase.storage.from('menu-photos').upload(path, file, {
    upsert: false,
    contentType: file.type,
  })

  if (error) return { ok: false, error: error.message }

  const { data } = adminSupabase.storage.from('menu-photos').getPublicUrl(path)
  return { ok: true, publicUrl: data.publicUrl }
}

function menuItemPayloadFromForm(formData: FormData, vendorId: string) {
  const name = formText(formData, 'name')
  const price = Number(formText(formData, 'price') || '0')
  const sortOrder = Number(formText(formData, 'sort_order') || '0')
  if (!name) throw new Error('Item name is required')
  if (!Number.isFinite(price) || price < 0) throw new Error('Valid item price is required')

  return {
    vendor_id: vendorId,
    name,
    description: nullableFormText(formData, 'description'),
    price,
    category: nullableFormText(formData, 'category'),
    photo_url: nullableFormText(formData, 'photo_url'),
    available: formData.get('available') !== 'false',
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  }
}

export async function createAdminMenuItem(vendorId: string, formData: FormData): Promise<ActionResult> {
  await assertCurrentUserIsAdmin()
  const adminSupabase = createAdminClient()

  try {
    const { error } = await adminSupabase.from('menu_items').insert(menuItemPayloadFromForm(formData, vendorId))
    if (error) throw new Error(error.message)
    revalidatePath(`/admin/vendors/${vendorId}/menu`)
    revalidatePath('/admin/vendors')
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to create menu item' }
  }
}

export async function updateAdminMenuItem(vendorId: string, itemId: string, formData: FormData): Promise<ActionResult> {
  await assertCurrentUserIsAdmin()
  const adminSupabase = createAdminClient()

  try {
    const { error } = await adminSupabase
      .from('menu_items')
      .update(menuItemPayloadFromForm(formData, vendorId))
      .eq('id', itemId)
      .eq('vendor_id', vendorId)

    if (error) throw new Error(error.message)
    revalidatePath(`/admin/vendors/${vendorId}/menu`)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to update menu item' }
  }
}

export async function deleteAdminMenuItem(vendorId: string, itemId: string): Promise<ActionResult> {
  await assertCurrentUserIsAdmin()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('menu_items').delete().eq('id', itemId).eq('vendor_id', vendorId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/vendors/${vendorId}/menu`)
  return { ok: true }
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

  if (vendor.user_id) {
    // Deleting the owning auth account cascades the vendor row and related vendor records.
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(vendor.user_id)
    if (authDeleteError) throw new Error(authDeleteError.message)
  } else {
    // Admin-managed vendors do not have auth users yet; delete the vendor row directly.
    const { error: deleteError } = await adminSupabase.from('vendors').delete().eq('id', vendor.id)
    if (deleteError) throw new Error(deleteError.message)
  }

  revalidatePath('/admin/vendors')
}
