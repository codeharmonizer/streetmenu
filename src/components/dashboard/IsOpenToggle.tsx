'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function IsOpenToggle({ vendorId, initialIsOpen }: { vendorId: string; initialIsOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initialIsOpen)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !isOpen
    const { error } = await createClient()
      .from('vendors')
      .update({ is_open: next })
      .eq('id', vendorId)

    if (error) {
      toast.error('فشل التحديث')
    } else {
      setIsOpen(next)
      toast.success(next ? '🟢 بسطتك الآن مفتوحة' : '🔴 بسطتك الآن مغلقة')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all w-full sm:w-auto disabled:opacity-60"
      style={{
        background: isOpen ? '#dcfce7' : '#fee2e2',
        border: `1px solid ${isOpen ? '#86efac' : '#fca5a5'}`,
      }}>
      {/* Toggle pill */}
      <div className="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: isOpen ? '#16a34a' : '#dc2626' }}>
        <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ right: isOpen ? '2px' : '18px' }} />
      </div>
      <div className="text-right">
        <p className="text-sm font-bold leading-none"
          style={{ color: isOpen ? '#15803d' : '#991b1b' }}>
          {isOpen ? 'مفتوح الآن' : 'مغلق الآن'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: isOpen ? '#16a34a' : '#dc2626', opacity: 0.8 }}>
          {isOpen ? 'انقر للإغلاق' : 'انقر للفتح'}
        </p>
      </div>
    </button>
  )
}
