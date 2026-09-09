import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FREE_DAILY_ORDER_LIMIT, FREE_ITEM_LIMIT, hasReachedFreeDailyOrderLimit } from '../src/lib/plan-limits'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('free plan limits', () => {
  it('limits non-paying vendors to 5 menu items and 5 online orders per day', () => {
    expect(FREE_ITEM_LIMIT).toBe(5)
    expect(FREE_DAILY_ORDER_LIMIT).toBe(5)
  })

  it('marks only non-paying vendors as daily order-limit reached at 5 orders', () => {
    const freeVendor = { subscription_status: 'free', subscription_expires_at: null }
    const activeVendor = {
      subscription_status: 'active',
      subscription_expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    }

    expect(hasReachedFreeDailyOrderLimit(freeVendor, 4)).toBe(false)
    expect(hasReachedFreeDailyOrderLimit(freeVendor, 5)).toBe(true)
    expect(hasReachedFreeDailyOrderLimit(activeVendor, 50)).toBe(false)
  })

  it('applies the daily free order cap server-side before creating an order', () => {
    const orders = read('src/lib/orders.ts')

    expect(orders).toContain('getTodayOrderWindow')
    expect(orders).toContain('hasReachedFreeDailyOrderLimit(vendor, todayOrderCount ?? 0)')
    expect(orders).toContain("return { error: 'free_daily_order_limit_reached' }")
    expect(orders.indexOf('free_daily_order_limit_reached')).toBeLessThan(orders.indexOf('order_number:'))
  })

  it('documents a database trigger so free vendors cannot bypass the 5-item limit', () => {
    const schema = read('supabase-schema.sql')

    expect(schema).toContain('enforce_free_menu_item_limit')
    expect(schema).toContain('FREE_ITEM_LIMIT: 5')
    expect(schema).toContain('raise exception')
  })

  it('shows a clear daily order cap disclaimer on the public review screen', () => {
    const page = read('src/app/m/[slug]/page.tsx')
    const client = read('src/components/menu/PublicMenuClient.tsx')
    const en = read('messages/en.json')
    const ar = read('messages/ar.json')

    expect(page).toContain('freeDailyOrderLimitReached')
    expect(client).toContain("tc('freeDailyOrderLimitReached')")
    expect(en).toContain('"freeDailyOrderLimitReached": "Free plan daily order limit reached. Online orders are turned off for today."')
    expect(ar).toContain('"freeDailyOrderLimitReached": "تم الوصول إلى حد الطلبات اليومية للخطة المجانية. الطلبات الإلكترونية متوقفة لهذا اليوم."')
  })
})
