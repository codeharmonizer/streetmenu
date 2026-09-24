import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { normalizeVendorUsername } from '@/lib/vendor-usernames'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('admin-managed vendors', () => {
  it('normalizes username handles for admin-created vendors', () => {
    expect(normalizeVendorUsername(' Burger Station! ')).toBe('burgerstation')
    expect(normalizeVendorUsername('مطعم-تجربة')).toBe('vendor')
    expect(normalizeVendorUsername('Cafe_973')).toBe('cafe_973')
  })

  it('adds an additive Supabase migration for managed vendor lifecycle fields', () => {
    const migration = read('supabase-admin-managed-vendors.sql')

    expect(migration).toContain('alter column user_id drop not null')
    expect(migration).toContain('add column if not exists username')
    expect(migration).toContain("vendor_status")
    expect(migration).toContain("managed")
    expect(migration).toContain("invited")
    expect(migration).toContain("active")
    expect(migration).toContain("suspended")
    expect(migration).toContain('created_by_admin_id')
    expect(migration).toContain('updated_by_admin_id')
    expect(migration).toContain('invited_email')
    expect(migration).toContain('vendors_username_unique_idx')
  })

  it('provides admin server actions for managed vendor creation and menu item management', () => {
    const actions = read('src/app/admin/vendors/actions.ts')

    expect(actions).toContain('createManagedVendor')
    expect(actions).toContain('updateManagedVendor')
    expect(actions).toContain('createAdminMenuItem')
    expect(actions).toContain('updateAdminMenuItem')
    expect(actions).toContain('deleteAdminMenuItem')
    expect(actions).toContain('uploadAdminVendorImage')
    expect(actions).toContain('sendVendorInvite')
    expect(actions).toContain('assertCurrentUserIsAdmin')
    expect(actions).toContain('createAdminClient()')
    expect(actions).toContain("'managed'")
    expect(actions).toContain('normalizeVendorUsername')
    expect(actions).toContain('normalizeVendorSlug')
    expect(actions).toContain("storage.from('menu-photos').upload")
    expect(actions).toContain('auth.admin.generateLink')
    expect(actions).toContain('new Resend')
    expect(actions).toContain('resend.emails.send')
    expect(actions).toContain('existingVendor.vendor_status !== \'active\'')
    expect(actions).toContain('invited_at')
  })

  it('adds admin routes for creating vendors and managing vendor menus', () => {
    expect(existsSync(join(root, 'src/app/admin/vendors/new/page.tsx'))).toBe(true)
    expect(existsSync(join(root, 'src/app/admin/vendors/[id]/edit/page.tsx'))).toBe(true)
    expect(existsSync(join(root, 'src/app/admin/vendors/[id]/menu/page.tsx'))).toBe(true)

    const listPage = read('src/app/admin/vendors/page.tsx')
    const newPage = read('src/app/admin/vendors/new/page.tsx')
    const editPage = read('src/app/admin/vendors/[id]/edit/page.tsx')
    const menuPage = read('src/app/admin/vendors/[id]/menu/page.tsx')

    expect(listPage).toContain('/admin/vendors/new')
    expect(newPage).toContain('CreateManagedVendorForm')
    expect(editPage).toContain('CreateManagedVendorForm')
    expect(editPage).toContain('params: Promise<{ id: string }>')
    expect(editPage).toContain('const { id } = await params')
    expect(menuPage).toContain('AdminVendorMenuManager')
  })

  it('shows managed/invited/active lifecycle and admin menu links in the vendor row', () => {
    const row = read('src/components/admin/VendorRow.tsx')

    expect(row).toContain('vendor.vendor_status')
    expect(row).toContain('/admin/vendors/${vendor.id}/edit')
    expect(row).toContain('/admin/vendors/${vendor.id}/menu')
    expect(row).toContain('Managed')
    expect(row).toContain('Invited')
    expect(row).toContain('Active login')
  })

  it('activates invited vendors after the invite auth callback succeeds', () => {
    const callback = read('src/app/auth/callback/route.ts')

    expect(callback).toContain('createAdminClient')
    expect(callback).toContain("vendor_status: 'active'")
    expect(callback).toContain('activated_at')
    expect(callback).toContain("eq('invited_email', user.email.toLowerCase())")
  })
})
