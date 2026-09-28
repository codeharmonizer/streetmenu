import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const page = readFileSync('src/app/m/[slug]/page.tsx', 'utf8')

describe('public menu logo rendering', () => {
  it('renders vendor logos with native eager img tags', () => {
    expect(page).not.toContain("import Image from 'next/image'")
    expect(page).toContain('src={vendor.logo_url}')
    expect(page).toContain('loading="eager"')
    expect(page).toContain('className="h-full w-full object-cover"')
  })
})
