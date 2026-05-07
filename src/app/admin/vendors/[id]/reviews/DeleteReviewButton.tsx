'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirmed) {
      setConfirmed(true)
      // Auto-reset after 3s if not confirmed
      setTimeout(() => setConfirmed(false), 3000)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
    if (error) {
      toast.error('Failed to delete review')
      setLoading(false)
    } else {
      toast.success('Review deleted')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={confirmed ? 'Click again to confirm' : 'Delete review'}
      className="flex-shrink-0 p-2 rounded-xl transition-all disabled:opacity-50"
      style={{
        background: confirmed ? '#fee2e2' : '#f8fafc',
        color: confirmed ? '#dc2626' : '#94a3b8',
        border: confirmed ? '1px solid #fca5a5' : '1px solid #e2e8f0',
      }}>
      {confirmed ? (
        <span className="text-xs font-bold whitespace-nowrap px-1">تأكيد؟</span>
      ) : (
        <Trash2 size={15} />
      )}
    </button>
  )
}
