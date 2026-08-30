import { afterEach, describe, expect, it } from 'vitest'
import { getAppUrl, getMerchantDomain } from '../src/lib/app-url'

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL
const originalMerchantDomain = process.env.EPAYS_MERCHANT_DOMAIN

afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = originalAppUrl
  process.env.EPAYS_MERCHANT_DOMAIN = originalMerchantDomain
})

describe('app URL normalization', () => {
  it('uses relaxedmenu.beyounded.com when Vercel still has the legacy app URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://scanbite-menu.vercel.app'
    process.env.EPAYS_MERCHANT_DOMAIN = 'scanbite-menu.vercel.app'

    expect(getAppUrl()).toBe('https://relaxedmenu.beyounded.com')
    expect(getMerchantDomain()).toBe('relaxedmenu.beyounded.com')
  })

  it('preserves explicit local development URLs and domains', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.EPAYS_MERCHANT_DOMAIN = 'localhost'

    expect(getAppUrl()).toBe('http://localhost:3000')
    expect(getMerchantDomain()).toBe('localhost')
  })
})
