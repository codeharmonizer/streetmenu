'use client'

import { useEffect, useRef } from 'react'
import { trackMetaEvent } from '@/lib/meta-pixel'

export default function MetaViewContentTracker() {
  const seen = useRef(new Set<string>())

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-meta-view-content]'))
    if (!targets.length) return

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        const contentName = element.dataset.metaViewContent
        if (!contentName || seen.current.has(contentName)) continue

        seen.current.add(contentName)
        trackMetaEvent('ViewContent', {
          content_name: contentName,
          content_category: 'Landing page section',
        })
        observer.unobserve(element)
      }
    }, { threshold: 0.35 })

    targets.forEach(target => observer.observe(target))

    return () => observer.disconnect()
  }, [])

  return null
}
