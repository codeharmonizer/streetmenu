'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { categorySectionId as getCategorySectionId } from '@/lib/category-section'

export { categorySectionId } from '@/lib/category-section'

interface Props {
  categories: string[]
  sectionPrefix: string
  className?: string
}

const STICKY_TABS_HEIGHT = 68

export default function CategoryTabs({ categories, sectionPrefix, className = '' }: Props) {
  const uniqueCategories = useMemo(
    () => Array.from(new Set(categories.filter(Boolean))),
    [categories]
  )
  const [activeCategory, setActiveCategory] = useState(uniqueCategories[0] ?? '')
  const [isPinned, setIsPinned] = useState(false)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const isProgrammaticScrollRef = useRef(false)
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!uniqueCategories.length) return
    setActiveCategory(prev => uniqueCategories.includes(prev) ? prev : uniqueCategories[0])
  }, [uniqueCategories])

  useEffect(() => {
    if (!uniqueCategories.length) return

    const observer = new IntersectionObserver(
      entries => {
        if (isProgrammaticScrollRef.current) return

        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

        const category = visible?.target.getAttribute('data-category')
        if (category) setActiveCategory(category)
      },
      {
        root: null,
        rootMargin: `-${STICKY_TABS_HEIGHT + 18}px 0px -65% 0px`,
        threshold: [0, 0.2, 0.6],
      }
    )

    uniqueCategories.forEach(category => {
      const section = document.getElementById(getCategorySectionId(sectionPrefix, category))
      if (section) observer.observe(section)
    })

    return () => {
      observer.disconnect()
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
    }
  }, [sectionPrefix, uniqueCategories])

  useEffect(() => {
    const scroller = scrollerRef.current
    const activeTab = tabRefs.current[activeCategory]
    if (!scroller || !activeTab) return

    const targetLeft = activeTab.offsetLeft - (scroller.clientWidth - activeTab.clientWidth) / 2
    scroller.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' })
  }, [activeCategory])

  useEffect(() => {
    const updatePinned = () => {
      const shell = shellRef.current
      if (!shell) return
      setIsPinned(shell.getBoundingClientRect().top <= 0)
    }

    updatePinned()
    window.addEventListener('scroll', updatePinned, { passive: true })
    window.addEventListener('resize', updatePinned)

    return () => {
      window.removeEventListener('scroll', updatePinned)
      window.removeEventListener('resize', updatePinned)
    }
  }, [uniqueCategories.length])

  if (uniqueCategories.length <= 1) return null

  function jumpToCategory(category: string) {
    setActiveCategory(category)
    isProgrammaticScrollRef.current = true
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)

    document
      .getElementById(getCategorySectionId(sectionPrefix, category))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    scrollEndTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 450)
  }

  return (
    <div
      ref={shellRef}
      data-category-tabs-shell
      className={`relative -mx-4 mb-5 ${className}`}
      style={isPinned ? { height: STICKY_TABS_HEIGHT } : undefined}
    >
      <div
        data-category-tabs
        className={isPinned
          ? 'fixed top-0 inset-x-0 z-50 px-4 py-3 backdrop-blur-xl'
          : 'sticky top-0 z-40 px-4 py-3 backdrop-blur-xl'}
        style={{
          background: 'color-mix(in srgb, var(--bg) 94%, transparent)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="mx-auto max-w-lg">
          <div
            data-category-tabs-scroller
            ref={scrollerRef}
            className="overflow-x-auto overscroll-x-contain"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex min-w-max gap-2">
              {uniqueCategories.map(category => {
                const isActive = category === activeCategory
                return (
                  <button
                    key={category}
                    ref={node => { tabRefs.current[category] = node }}
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => jumpToCategory(category)}
                    className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95"
                    style={{
                      background: isActive ? 'var(--brand)' : 'var(--surface)',
                      color:      isActive ? 'white'        : 'var(--text-secondary)',
                      border:     `1px solid ${isActive ? 'var(--brand)' : 'var(--border)'}`,
                      boxShadow:  isActive ? '0 8px 18px rgba(0,0,0,0.12)' : 'none',
                    }}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
