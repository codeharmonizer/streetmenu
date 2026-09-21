'use client'

import { useEffect } from 'react'
import { trackMetaCustomEvent, trackMetaEvent } from '@/lib/meta-pixel'

const TRACKED_CTA_PATHS = [
  '/register',
  '/demo',
  '/contact',
  '/dashboard/upgrade',
]

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim().slice(0, 80) || undefined
}

function classifyContact(href: string) {
  const normalized = href.toLowerCase()
  if (normalized.startsWith('tel:')) return 'phone'
  if (normalized.startsWith('mailto:')) return 'email'
  if (normalized.includes('wa.me') || normalized.includes('whatsapp')) return 'whatsapp'
  return null
}

export default function MetaInteractionTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href') ?? ''
      const contactType = classifyContact(href)
      const contentName = cleanText(anchor.textContent) ?? href

      if (contactType) {
        trackMetaEvent('Contact', {
          content_name: contentName,
          contact_type: contactType,
        })
        return
      }

      let url: URL
      try {
        url = new URL(anchor.href, window.location.origin)
      } catch {
        return
      }

      if (url.origin !== window.location.origin) return

      const matchedPath = TRACKED_CTA_PATHS.find(path => url.pathname === path || url.pathname.startsWith(`${path}/`))
      if (!matchedPath) return

      trackMetaCustomEvent('CTA_Click', {
        content_name: contentName,
        button_destination: matchedPath,
        page_path: window.location.pathname,
      })
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  return null
}
