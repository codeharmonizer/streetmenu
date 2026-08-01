import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('category jump tabs UX', () => {
  it('provides a reusable pinned horizontal category tabs component with scroll-spy behavior', () => {
    const component = read('src/components/menu/CategoryTabs.tsx')

    expect(component).toContain('data-category-tabs')
    expect(component).toContain('sticky')
    expect(component).toContain('overflow-x-auto')
    expect(component).toContain('IntersectionObserver')
    expect(component).toContain('scrollIntoView')
    expect(component).toContain('aria-current')
    expect(component).toContain('isProgrammaticScrollRef')
    expect(component).toContain('scrollEndTimerRef')
    expect(component).toContain("block: 'nearest'")
  })

  it('adds category tabs and section ids to the public customer menu', () => {
    const publicMenu = read('src/components/menu/PublicMenuClient.tsx')

    expect(publicMenu).toContain("import CategoryTabs")
    expect(publicMenu).toContain('<CategoryTabs')
    expect(publicMenu).toContain('sectionPrefix="public-menu-category"')
    expect(publicMenu).toContain('id={categorySectionId')
  })

  it('groups vendor dashboard menu items into sections with category tabs', () => {
    const manager = read('src/components/menu/MenuManager.tsx')

    expect(manager).toContain("import CategoryTabs")
    expect(manager).toContain('<CategoryTabs')
    expect(manager).toContain('sectionPrefix="vendor-menu-category"')
    expect(manager).toContain('id={categorySectionId')
    expect(manager).toContain('Object.entries(groupedItems)')
  })

  it('lets vendors reorder whole categories and persists item sort_order', () => {
    const manager = read('src/components/menu/MenuManager.tsx')
    const menuPage = read('src/app/dashboard/menu/page.tsx')
    const schema = read('supabase-schema.sql')

    expect(manager).toContain('async function moveCategory')
    expect(manager).toContain('aria-label={`Move ${category} up`}')
    expect(manager).toContain('aria-label={`Move ${category} down`}')
    expect(manager).toContain('sort_order')
    expect(menuPage).toContain(".order('sort_order'")
    expect(schema).toContain('sort_order integer')
  })
})
