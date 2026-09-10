import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('category jump tabs UX', () => {
  it('provides reusable sticky horizontal category tabs with stable scroll-spy behavior', () => {
    const component = read('src/components/menu/CategoryTabs.tsx')

    expect(component).toContain('data-category-tabs-shell')
    expect(component).toContain('setIsPinned')
    expect(component).toContain("window.addEventListener('scroll', updatePinned")
    expect(component).toContain('fixed top-0 inset-x-0 z-50')
    expect(component).toContain('style={isPinned ? { height: STICKY_TABS_HEIGHT } : undefined}')
    expect(component).toContain('data-category-tabs-scroller')
    expect(component).toContain('sticky top-0')
    expect(component).toContain('className="overflow-x-auto overscroll-x-contain"')
    expect(component).not.toContain('fixed inset-x-0 top-0')
    expect(component).toContain('overflow-x-auto')
    expect(component).toContain('IntersectionObserver')
    expect(component).toContain('scrollIntoView')
    expect(component).toContain("block: 'start'")
    expect(component).toContain('scroller.scrollTo')
    expect(component).toContain('aria-current')
    expect(component).toContain('isProgrammaticScrollRef')
    expect(component).toContain('scrollEndTimerRef')
    expect(component).not.toContain('tabRefs.current[activeCategory]?.scrollIntoView')
  })

  it('adds category tabs and section ids to the public customer menu', () => {
    const publicMenu = read('src/components/menu/PublicMenuClient.tsx')

    expect(publicMenu).toContain("import CategoryTabs")
    expect(publicMenu).toContain('<CategoryTabs')
    expect(publicMenu).toContain('sectionPrefix="public-menu-category"')
    expect(publicMenu).toContain('id={categorySectionId')
  })

  it('adds the same sticky category tabs and scroll target ids to the public demo menu', () => {
    const demo = read('src/app/demo/page.tsx')

    expect(demo).toContain("import CategoryTabs")
    expect(demo).toContain('<CategoryTabs')
    expect(demo).toContain('sectionPrefix="demo-menu-category"')
    expect(demo).toContain('id={categorySectionId')
    expect(demo).toContain('data-category={category}')
    expect(demo).toContain('scroll-mt-24')
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
