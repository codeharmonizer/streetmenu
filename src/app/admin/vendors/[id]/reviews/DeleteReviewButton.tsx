'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteReview } from './actions'
import toast from 'react-hot-toast'

export default function DeleteReviewButton({ reviewId, vendorId }: { reviewId: string; vendorId: string }) {
  const [loading,   setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null }

  async function handleClick() {
    if (!confirmed) {
      setConfirmed(true)
      timerRef.current = setTimeout(() => setConfirmed(false), 3000)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setLoading(true)
    try {
      await deleteReview(reviewId, vendorId)
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
      setLoading(false)
      setConfirmed(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={confirmed ? 'Click again to confirm deletion' : 'Delete review'}
      className="flex-shrink-0 p-2 rounded-xl transition-all disabled:opacity-50"
      style={{
        background: confirmed ? '#fee2e2' : '#f8fafc',
        color:      confirmed ? '#dc2626' : '#94a3b8',
        border:     confirmed ? '1px solid #fca5a5' : '1px solid #e2e8f0',
        minWidth: '2.5rem',
      }}>
      {loading ? (
        <span className="text-xs">…</span>
      ) : confirmed ? (
        <span className="text-xs font-bold px-1">تأكيد؟</span>
      ) : (
        <Trash2 size={15} />
      )}
    </button>
  )
}
