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

  it('deduplicates refreshes so menu scans count one unique visitor per day', () => {
    const publicActions = read('src/lib/public-actions.ts')
    expect(publicActions).toContain('SCAN_DEDUPE_WINDOW_HOURS = 24')
    expect(publicActions).toMatch(/\.eq\('action', 'scan'\)/)
    expect(publicActions).toMatch(/\.eq\('vendor_id', vendorId\)/)
    expect(publicActions).toMatch(/\.eq\('fingerprint', fingerprint\)/)
    expect(publicActions).toMatch(/if \(countError \|\| \(count \?\? 0\) > 0\) return/)
    expect(publicActions.indexOf("from('public_action_rate_limits').insert")).toBeLessThan(publicActions.indexOf("from('scans').insert"))
  })

  it('keeps public writes behind server-side rate limited actions', () => {
    const publicActions = read('src/lib/public-actions.ts')
    const orders = read('src/lib/orders.ts')
    const schema = read('supabase-schema.sql')
    expect(publicActions).toMatch(/isRateLimited\(supabase, 'review'/)
    expect(orders).toMatch(/isRateLimited\(supabase, 'order'/)
    expect(schema).toContain('public_action_rate_limits')
  })

  it('sets metadataBase from normalized production app URL', () => {
    const layout = read('src/app/layout.tsx')
    expect(layout).toContain('metadataBase: new URL(appUrl)')
    expect(layout).toContain('getAppUrl()')
  })

  it('publishes Google and AI discovery files for the ScanBite subdomain', () => {
    const layout = read('src/app/layout.tsx')
    const robots = read('src/app/robots.ts')
    const sitemap = read('src/app/sitemap.ts')
    const llms = read('public/llms.txt')
    const indexNowKey = read('public/indexnow-key.txt')

    expect(layout).toContain("robots: {")
    expect(layout).toContain("'max-image-preview': 'large'")
    expect(layout).toContain("'text/markdown': '/llms.txt'")
    expect(layout).toContain("type=\"application/ld+json\"")
    expect(layout).toContain("SoftwareApplication")
    expect(robots).toContain('sitemap: `${appUrl}/sitemap.xml`')
    expect(sitemap).toContain('`${appUrl}/`')
    expect(sitemap).toContain('`${appUrl}/register`')
    expect(llms).toContain('ScanBite is a QR-code digital menu and online ordering platform')
    expect(indexNowKey.trim()).toMatch(/^[a-f0-9]{32}$/)
  })
})
