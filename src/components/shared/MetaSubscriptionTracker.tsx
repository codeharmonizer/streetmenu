'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackMetaEvent } from '@/lib/meta-pixel'

export default function MetaSubscriptionTracker() {
  const searchParams = useSearchParams()
  const tracked = useRef(false)
  const subscription = searchParams.get('subscription')

  useEffect(() => {
    if (tracked.current) return
    if (subscription === 'success' || subscription === 'renewed') {
      tracked.current = true
      trackMetaEvent('Subscribe', {
        content_name: 'Relaxed Menu Pro',
        subscription_state: subscription,
      })
    }
  }, [subscription])

  return null
}
