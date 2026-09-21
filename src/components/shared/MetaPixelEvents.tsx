'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackMetaEvent } from '@/lib/meta-pixel'

export default function MetaPixelEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }

    trackMetaEvent('PageView')
  }, [pathname, searchParams])

  return null
}
