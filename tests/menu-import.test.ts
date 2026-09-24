import { describe, expect, it } from 'vitest'
import { buildImportPlan, normalizeSlug, normalizeUsername, parsePrice } from '../scripts/menu-import/lib.mjs'
import { normalizeVendorSlug } from '@/lib/vendor-slugs'
import { normalizeVendorUsername } from '@/lib/vendor-usernames'

const item = (name: string, price: unknown, category = 'Main') => ({ name, price, category })

describe('menu importer', () => {
  it('keeps slug and username rules in sync with the app', () => {
    for (const value of ['Karak House!!', '  Café  Zafran ', 'Burger_District 2', 'مطعم النور']) {
      expect(normalizeSlug(value)).toBe(normalizeVendorSlug(value))
      if (normalizeUsername(value)) expect(normalizeUsername(value)).toBe(normalizeVendorUsername(value))
    }
  })

  it('reads prices written the way vendors write them', () => {
    expect(parsePrice(0.5)).toBe(0.5)
    expect(parsePrice('0.500 BD')).toBe(0.5)
    expect(parsePrice('د.ب ١٫٢٥٠')).toBe(1.25)
    expect(parsePrice('1,5')).toBe(1.5)
    expect(parsePrice('ask')).toBeNull()
    expect(parsePrice(-1)).toBeNull()
  })

  it('falls back to the Instagram handle when the name is Arabic', () => {
    const plan = buildImportPlan({ vendor: { name: 'كرك النور', instagram: 'https://instagram.com/karak_alnoor/' }, items: [item('كرك', 0.2)] })
    expect(plan.vendor.slug).toBe('karak-alnoor')
    expect(plan.vendor.username).toBe('karak_alnoor')
  })

  it('caps free-plan imports at 5 items and groups by category', () => {
    const items = [item('A', 1, 'Drinks'), item('B', 1, 'Food'), item('C', 1, 'Drinks'), item('D', 1, 'Food'), item('E', 1, 'Food'), item('F', 1, 'Drinks')]
    const free = buildImportPlan({ vendor: { name: 'Test' }, items })
    expect(free.items.map((i: { name: string }) => i.name)).toEqual(['A', 'C', 'F', 'B', 'D'])
    expect(free.skipped).toBe(1)
    expect(free.items.map((i: { sort_order: number }) => i.sort_order)).toEqual([0, 1, 2, 3, 4])

    const trial = buildImportPlan({ vendor: { name: 'Test' }, items }, { itemLimit: Infinity })
    expect(trial.items).toHaveLength(6)
  })

  it('lists every problem instead of importing a broken menu', () => {
    expect(() => buildImportPlan({ vendor: { name: 'مطعم' }, items: [item('', 1), item('Soup', 'call us')] }))
      .toThrow(/vendor\.slug is required[\s\S]*items\[0\]\.name[\s\S]*Soup/)
  })

  it('warns about prices that look like fils', () => {
    const plan = buildImportPlan({ vendor: { name: 'Test' }, items: [item('Shawarma', 500)] })
    expect(plan.warnings.join()).toMatch(/fils/)
  })
})
