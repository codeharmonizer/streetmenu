import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importEpays() {
  vi.resetModules()
  return import('../src/lib/epays')
}

describe('ePays client proxy configuration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.PAYMENT_PROXY_BASE_URL
    delete process.env.PAYMENT_PROXY_SECRET
    process.env.NEXT_PUBLIC_APP_URL = 'https://relaxedmenu.beyounded.com'
    process.env.EPAYS_MODE_TYPE = 'test'
    process.env.EPAYS_API_ID = 'api-id'
    process.env.EPAYS_API_MASTER_KEY = 'master-key'
    process.env.EPAYS_API_KEY = 'gateway-key'
    process.env.EPAYS_MERCHANT_GATEWAY = 'merchant-gateway'
    process.env.EPAYS_MERCHANT_DOMAIN = 'relaxedmenu.beyounded.com'
  })

  it('sends gateway credentials directly to ePays when no payment proxy is configured', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = init.body as URLSearchParams
      expect(body.get('apiKey')).toBe('gateway-key')
      expect(body.get('merchantGateway')).toBe('merchant-gateway')
      expect(body.get('apiMasterKey')).toBe('master-key')
      return new Response(JSON.stringify({ status: 'SUCCESS', redirect: 'https://epays.example/redirect' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { initiatePayment } = await importEpays()
    const result = await initiatePayment({
      amount: 3,
      description: 'Relaxed Menu Pro',
      orderNumber: 'order-1',
      notifyUrl: 'https://relaxedmenu.beyounded.com/api/payment/callback?orderId=order-1',
      fullName: 'Vendor A',
    })

    expect(result).toEqual({ success: true, redirectUrl: 'https://epays.example/redirect' })
    expect(fetchMock).toHaveBeenCalledWith('https://testapi.epays.io/API/Initiate', expect.objectContaining({ method: 'POST' }))
  })

  it('routes ePays calls through the OCI payment proxy when PAYMENT_PROXY_BASE_URL is configured', async () => {
    process.env.PAYMENT_PROXY_BASE_URL = 'https://payments.relaxedmenu.beyounded.com'
    process.env.PAYMENT_PROXY_SECRET = 'proxy-secret'

    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('https://payments.relaxedmenu.beyounded.com/API/ProcessPayment')
      expect(init.headers).toMatchObject({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer proxy-secret',
      })
      const body = init.body as URLSearchParams
      expect(body.get('paymentId')).toBe('pay-1')
      return new Response(JSON.stringify({
        status: 'SUCCESS',
        data: {
          paymentId: 'pay-1',
          udf2: 'order-1',
          result: 'Completed',
          amount: 3,
          processed: 1,
          responseCode: '00',
          responseDesc: 'Approved',
        },
      }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { processPayment } = await importEpays()
    const result = await processPayment('pay-1')

    expect(result).toMatchObject({
      success: true,
      paymentId: 'pay-1',
      orderNumber: 'order-1',
      alreadyProcessed: true,
      responseCode: '00',
    })
  })
})
