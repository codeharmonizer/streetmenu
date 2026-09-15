import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('admin vendor deletion', () => {
  it('provides an admin-only destructive action that deletes vendor files before cascading vendor records', () => {
    const actions = read('src/app/admin/vendors/actions.ts')

    expect(actions).toContain("'use server'")
    expect(actions).toContain('assertCurrentUserIsAdmin')
    expect(actions).toContain("from('admins')")
    expect(actions).toContain('createAdminClient()')
    expect(actions).toContain("storage.from('menu-photos').list")
    expect(actions).toContain("storage.from('menu-photos').remove")
    expect(actions).toContain("from('vendors').delete()")
    expect(actions.indexOf("storage.from('menu-photos').remove")).toBeLessThan(actions.indexOf("from('vendors').delete()"))
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
    const page = read('src/app/admin/vendors/page.tsx')

    expect(page).toContain('overflow-x-auto overscroll-x-contain')
    expect(page).toContain('min-w-[1040px]')
  })
})
