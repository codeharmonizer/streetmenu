import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config.js'

const config = nextConfig as {
  images?: {
    remotePatterns?: Array<{
      protocol?: string
      hostname?: string
      pathname?: string
    }>
  }
}

describe('Next image remote hosts', () => {
  it('allows public vendor photo hosts used by imported menus', () => {
    expect(config.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          protocol: 'https',
          hostname: 'talabat.dhmedia.io',
        }),
        expect.objectContaining({
          protocol: 'https',
          hostname: 'relaxedmenu.beyounded.com',
          pathname: '/prospect-photos/**',
        }),
      ]),
    )
  })
})
