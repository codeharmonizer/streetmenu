import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('settings and public menu regressions', () => {
  it('awaits dynamic public menu params before querying by slug', () => {
    const page = read('src/app/m/[slug]/page.tsx')
    expect(page).toContain('params: Promise<{ slug: string }>')
    expect(page).toContain('const { slug } = await params')
    expect(page).not.toContain('params.slug')
  })

  it('lets vendors set latitude and longitude from a map in settings', () => {
    const settings = read('src/components/vendor/VendorSettings.tsx')
    expect(settings).toContain('LocationPicker')
    expect(settings).toMatch(/lat:\s+vendor\.lat/)
    expect(settings).toMatch(/lng:\s+vendor\.lng/)
    expect(settings).toMatch(/lat:\s+location\.lat/)
    expect(settings).toMatch(/lng:\s+location\.lng/)
  })

  it('shows the signed-in account email on the settings page', () => {
    const page = read('src/app/dashboard/settings/page.tsx')
    const settings = read('src/components/vendor/VendorSettings.tsx')
    const en = read('messages/en.json')
    const ar = read('messages/ar.json')

    expect(page).toContain('getUser')
    expect(page).toContain('<VendorSettings vendor={vendor} userEmail={user.email ?? null} />')
    expect(settings).toContain('userEmail')
    expect(settings).toContain('{userEmail || t(\'accountEmailMissing\')}')
    expect(settings).toContain('t(\'accountEmail\')')
    expect(en).toContain('"accountEmail": "Account email"')
    expect(ar).toContain('"accountEmail": "البريد الإلكتروني للحساب"')
  })

  it('lets vendors edit their public menu link slug in settings', () => {
    const settings = read('src/components/vendor/VendorSettings.tsx')
    const en = read('messages/en.json')
    const ar = read('messages/ar.json')

    expect(settings).toContain('normalizeVendorSlug')
    expect(settings).toContain('publicSlug')
    expect(settings).toContain('slug: nextSlug')
    expect(settings).toContain(".neq('id', vendor.id)")
    expect(settings).toContain('oldSlug')
    expect(en).toContain('"publicLink": "Public link"')
    expect(ar).toContain('"publicLink": "الرابط العام"')
  })

  it('shows opening-hour time inputs directly for selected days without hiding them behind details', () => {
    const hours = read('src/components/vendor/HoursBuilder.tsx')
    expect(hours).not.toContain('<details>')
    expect(hours).toContain('enabledIndices.map')
    expect(hours).toMatch(/type="time"/) 
    expect(hours).toContain('useState<Schedule>(() => parseHours(value))')
    expect(hours).not.toContain('useEffect')
  })
})
