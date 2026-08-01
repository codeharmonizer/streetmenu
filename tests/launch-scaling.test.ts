import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('launch scaling and public menu cache', () => {
  it('caches public menu data for one full day with a per-vendor tag', () => {
    const cache = read('src/lib/public-menu-cache.ts')
    const publicPage = read('src/app/m/[slug]/page.tsx')

    expect(cache).toContain('PUBLIC_MENU_REVALIDATE_SECONDS = 60 * 60 * 24')
    expect(cache).toContain('unstable_cache')
    expect(cache).toContain("tags: [publicMenuTag(slug)]")
    expect(cache).toContain('loadPublicMenuData(slug)')
    expect(publicPage).toContain('getCachedPublicMenuData(slug)')
    expect(publicPage).not.toContain(".from('menu_items')")
  })

  it('clears the public menu cache when the vendor updates menu items or settings', () => {
    const action = read('src/lib/public-menu-cache-actions.ts')
    const manager = read('src/components/menu/MenuManager.tsx')
    const settings = read('src/components/vendor/VendorSettings.tsx')

    expect(action).toContain("'use server'")
    expect(action).toContain('revalidateTag(publicMenuTag(vendor.slug), \'max\')')
    expect(manager).toContain('await revalidateVendorPublicMenu(vendor.id)')
    expect(settings).toContain('await revalidateVendorPublicMenu(vendor.id)')
  })

  it('adds database indexes for high-traffic public menu, order, scan, and review paths', () => {
    const schema = read('supabase-schema.sql')
    const migration = read('supabase-launch-indexes.sql')

    for (const indexName of [
      'vendors_slug_idx',
      'vendors_user_id_idx',
      'menu_items_vendor_available_sort_idx',
      'scans_vendor_scanned_at_idx',
      'reviews_vendor_created_at_idx',
      'orders_vendor_status_created_at_idx',
    ]) {
      expect(schema).toContain(indexName)
      expect(migration).toContain(indexName)
    }
  })
})
