import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('track order route', () => {
  it('awaits dynamic route params before reading the order code', () => {
    const page = read('src/app/track/[code]/page.tsx')
    expect(page).toContain('params: Promise<{ code: string }>')
    expect(page).toContain('const { code } = await params')
    expect(page).toContain('code.toUpperCase()')
    expect(page).not.toContain('params.code')
  })
})
