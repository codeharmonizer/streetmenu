import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('track order realtime updates', () => {
  it('subscribes the public tracker to broadcast status updates and keeps a short polling fallback', () => {
    const tracker = read('src/components/orders/OrderTracker.tsx')

    expect(tracker).toContain(".channel(`order-status-${order.id}`)")
    expect(tracker).toContain(".on('broadcast', { event: 'status' }")
    expect(tracker).toContain("'postgres_changes'")
    expect(tracker).toContain('LIVE_STATUS_POLL_INTERVAL_FAST = 3_000')
    expect(tracker).toContain('LIVE_STATUS_POLL_INTERVAL_ACTIVE = 5_000')
    expect(tracker).toContain('LIVE_STATUS_POLL_INTERVAL_SLOW = 15_000')
    expect(tracker).toContain('function getLiveStatusPollInterval')
    expect(tracker).toContain('setInterval(refreshStatus, pollInterval)')
    expect(tracker).toContain('clearInterval(timer)')
  })

  it('broadcasts status-only updates after vendor status changes', () => {
    const orders = read('src/lib/orders.ts')

    expect(orders).toContain('order-status-${orderId}')
    expect(orders).toContain("type: 'broadcast'")
    expect(orders).toContain("event: 'status'")
    expect(orders).toContain('payload: { id: orderId, status }')
    expect(orders).toContain("realtimeStatus !== 'SUBSCRIBED'")
    expect(orders).toContain('customer track screen also has a short polling fallback')
  })
})
