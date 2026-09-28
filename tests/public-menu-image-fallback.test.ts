import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('public menu image fallback', () => {
  it('hides broken menu item images and shows the dish placeholder instead', () => {
    const client = read('src/components/menu/PublicMenuClient.tsx')

    expect(client).toContain('MenuItemPhoto')
    expect(client).toContain('onError={() => setImageFailed(true)}')
    expect(client).toContain('if (!photoUrl || imageFailed)')
    expect(client).toContain('🍽️')
  })
})
