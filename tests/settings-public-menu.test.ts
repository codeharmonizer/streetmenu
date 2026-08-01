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

  it('shows opening-hour time inputs directly for selected days without hiding them behind details', () => {
    const hours = read('src/components/vendor/HoursBuilder.tsx')
    expect(hours).not.toContain('<details>')
    expect(hours).toContain('enabledIndices.map')
    expect(hours).toMatch(/type="time"/) 
  })
})
