import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServer, getTargetBaseUrl } from '../infra/oci/payment-proxy/service/proxy-server.mjs'

function listen(server: ReturnType<typeof createServer>): Promise<string> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') throw new Error('unexpected address')
      resolve(`http://127.0.0.1:${address.port}`)
    })
  })
}

function close(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()))
}

describe('OCI payment proxy service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.EPAYS_API_BASE_URL
    delete process.env.EPAYS_MODE_TYPE
    process.env.PAYMENT_PROXY_SECRET = 'proxy-secret'
  })

  afterEach(() => {
    delete process.env.PAYMENT_PROXY_SECRET
  })

  it('selects live ePays by default and test ePays when requested', () => {
    expect(getTargetBaseUrl()).toBe('https://api.epays.io')
    expect(getTargetBaseUrl('test')).toBe('https://testapi.epays.io')
    process.env.EPAYS_API_BASE_URL = 'https://custom.epays.example/'
    expect(getTargetBaseUrl()).toBe('https://custom.epays.example')
  })

  it('rejects payment forwarding requests without the shared secret', async () => {
    const server = createServer()
    const baseUrl = await listen(server)
    try {
      const res = await fetch(`${baseUrl}/API/ProcessPayment`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ paymentId: 'pay-1' }),
      })

      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'unauthorized' })
    } finally {
      await close(server)
    }
  })

  it('forwards allowed ePays endpoints with form payloads and bearer auth', async () => {
    process.env.EPAYS_API_BASE_URL = 'https://epays-upstream.example'
    const realFetch = globalThis.fetch
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const urlString = String(url)
      if (urlString.startsWith('http://127.0.0.1:')) {
        return realFetch(url, init)
      }

      expect(urlString).toBe('https://epays-upstream.example/API/ProcessPayment')
      expect(init?.method).toBe('POST')
      expect(init?.headers).toMatchObject({
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json, text/plain, */*',
      })
      expect(String(init?.body)).toBe('paymentId=pay-1')
      return new Response(JSON.stringify({ status: 'SUCCESS' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const server = createServer()
    const baseUrl = await listen(server)
    try {
      const res = await fetch(`${baseUrl}/API/ProcessPayment`, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          authorization: 'Bearer proxy-secret',
        },
        body: new URLSearchParams({ paymentId: 'pay-1' }),
      })

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ status: 'SUCCESS' })
      const upstreamCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('https://epays-upstream.example'))
      expect(upstreamCalls).toHaveLength(1)
    } finally {
      await close(server)
    }
  })
})
