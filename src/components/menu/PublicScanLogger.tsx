'use client'

import { useEffect } from 'react'
import { logPublicScan } from '@/lib/public-actions'

export default function PublicScanLogger({ vendorId }: { vendorId: string }) {
  useEffect(() => {
    if (!vendorId) return
    void logPublicScan(vendorId)
  }, [vendorId])

  return null
}
