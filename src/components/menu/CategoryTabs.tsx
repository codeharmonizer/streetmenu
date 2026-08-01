'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  categories: string[]
  sectionPrefix: string
  className?: string
}

const STICKY_TABS_HEIGHT = 68

export function categorySectionId(sectionPrefix: string, category: string) {
  const safe = category
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

  return `${sectionPrefix}-${safe || 'uncategorized'}`
}

export default function CategoryTabs({ categories, sectionPrefix, className = '' }: Props) {
  const uniqueCategories = useMemo(
    () => Array.from(new Set(categories.filter(Boolean))),
    [categories]
  )
  const [activeCategory, setActiveCategory] = useState(uniqueCategories[0] ?? '')
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
      const section = document.getElementById(categorySectionId(sectionPrefix, category))
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

  if (uniqueCategories.length <= 1) return null

  function jumpToCategory(category: string) {
    setActiveCategory(category)
    isProgrammaticScrollRef.current = true
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)

    document
      .getElementById(categorySectionId(sectionPrefix, category))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    scrollEndTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 450)
  }

  return (
    <div
      data-category-tabs
      className={`sticky top-0 z-40 -mx-4 mb-5 overflow-x-auto overscroll-x-contain px-4 py-3 backdrop-blur-xl ${className}`}
      style={{
        background: 'color-mix(in srgb, var(--bg) 94%, transparent)',
        borderBottom: '1px solid var(--border)',
        scrollbarWidth: 'none',
      }}
      ref={scrollerRef}
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
  )
}
