import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const processPaymentMock = vi.fn()
const initiatePaymentMock = vi.fn()
const createAdminClientMock = vi.fn()
const createClientMock = vi.fn()

vi.mock('@/lib/epays', () => ({
  processPayment: processPaymentMock,
  initiatePayment: initiatePaymentMock,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: createAdminClientMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

type SupabaseOptions = {
  user?: any
  vendor?: any
  subscriptionOrder?: any
  createdSubscriptionOrder?: any
}

function makeSupabaseMock(options: SupabaseOptions = {}) {
  const calls: any[] = []
  const vendor = options.vendor ?? {
    id: 'vendor-a',
    name: 'Vendor A',
    subscription_status: 'free',
    subscription_expires_at: null,
  }
  const subscriptionOrder = Object.prototype.hasOwnProperty.call(options, 'subscriptionOrder')
    ? options.subscriptionOrder
    : {
      id: 'order-a',
      vendor_id: vendor.id,
      status: 'pending',
      amount: 3,
    }
  const createdSubscriptionOrder = Object.prototype.hasOwnProperty.call(options, 'createdSubscriptionOrder')
    ? options.createdSubscriptionOrder
    : subscriptionOrder

  function eqChain(table: string, selected?: string) {
    const chain: any = {
      eq: vi.fn((_column: string, _value: string) => chain),
      single: vi.fn(async () => {
        if (table === 'vendors') return { data: vendor, error: vendor ? null : { message: 'not found' } }
        if (table === 'subscription_orders') {
          return { data: subscriptionOrder, error: subscriptionOrder ? null : { message: 'not found' } }
        }
        return { data: null, error: null }
      }),
    }
    return chain
  }

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: options.user ?? { id: 'user-a', email: 'owner@example.com' } } })),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn((selected?: string) => eqChain(table, selected)),
      insert: vi.fn((payload: any) => {
        calls.push({ table, op: 'insert', payload })
        if (table === 'subscription_orders') {
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({ data: createdSubscriptionOrder, error: null })),
            })),
          }
        }
        return Promise.resolve({ error: null })
      }),
      update: vi.fn((payload: any) => {
        calls.push({ table, op: 'update', payload })
        return {
          eq: vi.fn((column: string, value: string) => {
            calls.push({ table, op: 'update.eq', column, value })
            return Promise.resolve({ error: null })
          }),
        }
      }),
    })),
    calls,
  }
  return supabase
}

async function callCallback(query: string) {
  const mod = await import('../src/app/api/payment/callback/route')
  const req = new NextRequest(`https://scanbite-menu.vercel.app/api/payment/callback${query}`)
  return mod.GET(req)
}

async function callInitiate() {
  const mod = await import('../src/app/api/payment/initiate/route')
  const req = new NextRequest('https://scanbite-menu.vercel.app/api/payment/initiate', { method: 'POST' })
  return mod.POST(req)
}

describe('payment initiate behavior', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'https://scanbite-menu.vercel.app'
  })

  it('creates the local subscription order with the admin client and sends its id to ePays as orderNumber', async () => {
    const userSupabase = makeSupabaseMock({
      vendor: { id: 'vendor-a', name: 'Vendor A', subscription_status: 'free', subscription_expires_at: null },
    })
    const adminSupabase = makeSupabaseMock({
      createdSubscriptionOrder: { id: 'sub-order-1', vendor_id: 'vendor-a', status: 'pending', amount: 3 },
    })
    createClientMock.mockResolvedValue(userSupabase)
    createAdminClientMock.mockReturnValue(adminSupabase)
    initiatePaymentMock.mockResolvedValue({ success: true, redirectUrl: 'https://epays.example/pay' })

    const res = await callInitiate()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ redirectUrl: 'https://epays.example/pay' })
    expect(userSupabase.calls.some(c => c.table === 'subscription_orders' && c.op === 'insert')).toBe(false)
    expect(adminSupabase.calls.some(c => c.table === 'subscription_orders' && c.op === 'insert' && c.payload.vendor_id === 'vendor-a' && c.payload.status === 'pending')).toBe(true)
    expect(initiatePaymentMock).toHaveBeenCalledWith(expect.objectContaining({
      orderNumber: 'sub-order-1',
      notifyUrl: 'https://scanbite-menu.vercel.app/api/payment/callback?orderId=sub-order-1',
    }))
  })
})

describe('payment callback behavior', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'https://scanbite-menu.vercel.app'
  })

  it('redirects to payment=error when required callback params are missing', async () => {
    const res = await callCallback('?orderId=order-a')
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard/upgrade?payment=error')
    expect(processPaymentMock).not.toHaveBeenCalled()
  })

  it('does not update subscription when ePays says payment failed', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'Failed', alreadyProcessed: false, paymentId: 'pay-1', orderNumber: 'order-a', amount: 3 })
    const supabase = makeSupabaseMock()
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-1')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard/upgrade?payment=failed')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update')).toBe(false)
    expect(supabase.calls.some(c => c.table === 'subscription_orders' && c.op === 'update' && c.payload.status === 'failed')).toBe(true)
  })

  it('does not update subscription when processed payment orderNumber does not match callback orderId', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'Completed', alreadyProcessed: false, paymentId: 'pay-1', orderNumber: 'other-order', amount: 3 })
    const supabase = makeSupabaseMock()
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-1')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard/upgrade?payment=error')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update')).toBe(false)
  })

  it('does not update subscription when ePays omits the processed payment orderNumber', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'Completed', alreadyProcessed: false, paymentId: 'pay-1', amount: 3 })
    const supabase = makeSupabaseMock()
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-1')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard/upgrade?payment=error')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update')).toBe(false)
  })

  it('does not update subscription when the local subscription order is unknown', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'Completed', alreadyProcessed: false, paymentId: 'pay-1', orderNumber: 'order-a', amount: 3 })
    const supabase = makeSupabaseMock({ subscriptionOrder: null })
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-1')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard/upgrade?payment=error')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update')).toBe(false)
  })

  it('does not double-update an already paid local subscription order', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'Completed', alreadyProcessed: true, paymentId: 'pay-1', orderNumber: 'order-a', amount: 3 })
    const supabase = makeSupabaseMock({ subscriptionOrder: { id: 'order-a', vendor_id: 'vendor-a', status: 'paid', amount: 3 } })
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-1')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard?subscription=renewed')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update')).toBe(false)
    expect(supabase.calls.some(c => c.table === 'subscription_payments' && c.op === 'insert')).toBe(false)
  })

  it('still completes a pending local order when ePays reports the payment was already processed', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'Completed', alreadyProcessed: true, paymentId: 'pay-1', orderNumber: 'order-a', amount: 3 })
    const supabase = makeSupabaseMock({ subscriptionOrder: { id: 'order-a', vendor_id: 'vendor-a', status: 'pending', amount: 3 } })
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-1')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard?subscription=success')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update' && c.payload.plan === 'pro')).toBe(true)
    expect(supabase.calls.some(c => c.table === 'subscription_orders' && c.op === 'update' && c.payload.status === 'paid')).toBe(true)
  })

  it('treats ePays ATM card approval responseCode 00 as successful even when result text is not Completed', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'CAPTURED', responseCode: '00', responseDesc: 'Approved', alreadyProcessed: false, paymentId: 'pay-atm-1', orderNumber: 'order-a', amount: 3 })
    const supabase = makeSupabaseMock({
      subscriptionOrder: { id: 'order-a', vendor_id: 'vendor-a', status: 'pending', amount: 3 },
      vendor: { id: 'vendor-a', name: 'Vendor A', subscription_status: 'free', subscription_expires_at: null },
    })
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-atm-1')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard?subscription=success')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update' && c.payload.plan === 'pro' && c.payload.subscription_status === 'active')).toBe(true)
    expect(supabase.calls.some(c => c.table === 'subscription_orders' && c.op === 'update' && c.payload.status === 'paid' && c.payload.epays_payment_id === 'pay-atm-1')).toBe(true)
  })

  it('sets the matching vendor plan to pro, activates subscription, marks order paid, and logs payment when ePays verifies Completed', async () => {
    processPaymentMock.mockResolvedValue({ success: true, result: 'Completed', alreadyProcessed: false, paymentId: 'pay-2', orderNumber: 'order-a', amount: 3 })
    const supabase = makeSupabaseMock({
      subscriptionOrder: { id: 'order-a', vendor_id: 'vendor-a', status: 'pending', amount: 3 },
      vendor: { id: 'vendor-a', name: 'Vendor A', subscription_status: 'free', subscription_expires_at: null },
    })
    createAdminClientMock.mockReturnValue(supabase)

    const res = await callCallback('?orderId=order-a&paymentId=pay-2')

    expect(res.headers.get('location')).toBe('https://scanbite-menu.vercel.app/dashboard?subscription=success')
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update' && c.payload.plan === 'pro' && c.payload.subscription_status === 'active')).toBe(true)
    expect(supabase.calls.some(c => c.table === 'vendors' && c.op === 'update.eq' && c.column === 'id' && c.value === 'vendor-a')).toBe(true)
    expect(supabase.calls.some(c => c.table === 'subscription_orders' && c.op === 'update' && c.payload.status === 'paid' && c.payload.epays_payment_id === 'pay-2')).toBe(true)
    expect(supabase.calls.some(c => c.table === 'subscription_payments' && c.op === 'insert' && c.payload.vendor_id === 'vendor-a' && c.payload.payment_id === 'pay-2' && c.payload.subscription_order_id === 'order-a')).toBe(true)
  })
})
