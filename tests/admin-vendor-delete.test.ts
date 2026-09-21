import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('admin vendor deletion', () => {
  it('provides an admin-only destructive action that removes vendor files and the owner auth account', () => {
    const actions = read('src/app/admin/vendors/actions.ts')

    expect(actions).toContain("'use server'")
    expect(actions).toContain('assertCurrentUserIsAdmin')
    expect(actions).toContain("from('admins')")
    expect(actions).toContain('createAdminClient()')
    expect(actions).toContain("select('id, user_id')")
    expect(actions).toContain("storage.from('menu-photos').list")
    expect(actions).toContain("storage.from('menu-photos').remove")
    expect(actions).toContain('auth.admin.deleteUser(vendor.user_id)')
    expect(actions.indexOf("storage.from('menu-photos').remove")).toBeLessThan(actions.indexOf('auth.admin.deleteUser(vendor.user_id)'))
    expect(actions).toContain("revalidatePath('/admin/vendors')")
  })

  it('renders a two-step delete control in each vendor table row', () => {
    const row = read('src/components/admin/VendorRow.tsx')
    const page = read('src/app/admin/vendors/page.tsx')

    expect(page).toContain('<th className="px-4 py-3 text-right whitespace-nowrap">Delete</th>')
    expect(row).toContain("import { deleteVendor } from '@/app/admin/vendors/actions'")
    expect(row).toContain('loadingDelete')
    expect(row).toContain('confirmDelete')
    expect(row).toContain('await deleteVendor(vendor.id)')
    expect(row).toContain('Vendor deleted')
  })

  it('keeps the admin vendors table wider than mobile and horizontally scrollable', () => {
    const layout = read('src/app/admin/layout.tsx')
    const page = read('src/app/admin/vendors/page.tsx')

    expect(layout).toContain('flex-1 min-w-0')
    expect(page).toContain('w-full min-w-0 max-w-7xl')
    expect(page).toContain('w-full max-w-full overflow-x-auto overscroll-x-contain')
    expect(page).toContain('min-w-[1040px]')
  })
})
