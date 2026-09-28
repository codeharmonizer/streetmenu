import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('public menu performance', () => {
  it('does not block initial menu rendering on scan analytics writes', () => {
    const page = read('src/app/m/[slug]/page.tsx')

    expect(page).not.toContain('await logPublicScan')
    expect(page).not.toContain("import { logPublicScan } from '@/lib/public-actions'")
    expect(page).toContain('PublicScanLogger')
  })

  it('only checks daily order counts when ordering can actually be used by a free vendor', () => {
    const page = read('src/app/m/[slug]/page.tsx')

    expect(page).toContain('hasActivePaidAccess')
    expect(page).toContain('shouldCheckFreeDailyOrderLimit')
    expect(page).toContain('vendor.orders_enabled === true')
    expect(page).toContain('vendor.is_open === true')
    expect(page).toContain('!hasActivePaidAccess(vendor)')
    expect(page.indexOf('shouldCheckFreeDailyOrderLimit')).toBeLessThan(page.indexOf(".from('orders')"))
  })
})
