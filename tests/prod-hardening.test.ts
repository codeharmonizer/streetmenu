import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('production hardening checks', () => {
  it('uses a Next.js release outside the vulnerable 14.x line', () => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.dependencies.next).toMatch(/^\^?16\./)
  })

  it('does not expose orders or order items through public RLS policies', () => {
    const schema = read('supabase-schema.sql')
    expect(schema).not.toMatch(/Orders are publicly readable/i)
    expect(schema).not.toMatch(/Orders are publicly insertable/i)
    expect(schema).not.toMatch(/Order items are publicly readable/i)
    expect(schema).not.toMatch(/Order items are publicly insertable/i)
    expect(schema).toMatch(/Orders are readable by vendor owner/i)
    expect(schema).toMatch(/Order items are readable by vendor owner/i)
  })

  it('does not let vendor QR dashboard views count as customer scans', () => {
    const qrPage = read('src/app/dashboard/qr/page.tsx')
    expect(qrPage).not.toMatch(/from\('scans'\)\.insert/)
  })

  it('commits a non-interactive ESLint configuration', () => {
    const eslint = read('eslint.config.mjs')
    const pkg = JSON.parse(read('package.json'))
    expect(eslint).toContain('eslint-config-next/core-web-vitals')
    expect(pkg.scripts.lint).toBe('eslint .')
  })

  it('keeps public writes behind server-side rate limited actions', () => {
    const publicActions = read('src/lib/public-actions.ts')
    const orders = read('src/lib/orders.ts')
    const schema = read('supabase-schema.sql')
    expect(publicActions).toMatch(/isRateLimited\(supabase, 'scan'/)
    expect(publicActions).toMatch(/isRateLimited\(supabase, 'review'/)
    expect(orders).toMatch(/isRateLimited\(supabase, 'order'/)
    expect(schema).toContain('public_action_rate_limits')
  })

  it('sets metadataBase from NEXT_PUBLIC_APP_URL for production URLs', () => {
    const layout = read('src/app/layout.tsx')
    expect(layout).toContain('metadataBase: new URL(appUrl)')
    expect(layout).toContain('NEXT_PUBLIC_APP_URL')
  })
})
