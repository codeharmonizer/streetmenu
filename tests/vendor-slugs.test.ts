import { describe, expect, it } from 'vitest'
import { buildAvailableSlug, normalizeVendorSlug } from '@/lib/vendor-slugs'

describe('vendor public menu slugs', () => {
  it('uses the clean restaurant name when it is available', () => {
    expect(buildAvailableSlug('Salah Admin', [])).toBe('salah-admin')
  })

  it('adds numeric suffixes for duplicates instead of random codes', () => {
    expect(buildAvailableSlug('Salah Admin', ['salah-admin'])).toBe('salah-admin-2')
    expect(buildAvailableSlug('Salah Admin', ['salah-admin', 'salah-admin-2'])).toBe('salah-admin-3')
  })

  it('normalizes vendor-entered custom links', () => {
    expect(normalizeVendorSlug('  My Custom Link!!  ')).toBe('my-custom-link')
  })
})
