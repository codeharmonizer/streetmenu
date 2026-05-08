'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const COOLDOWN_HOURS = 24
const storageKey = (id: string) => `sm_review_${id}`

export default function ReviewForm({ vendorId }: { vendorId: string }) {
  const [rating,     setRating]     = useState(0)
  const [hover,      setHover]      = useState(0)
  const [comment,    setComment]    = useState('')
  const [name,       setName]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [cooldown,   setCooldown]   = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(vendorId))
    if (!raw) return
    const then = new Date(raw)
    const diff = Date.now() - then.getTime()
    const hoursLeft = COOLDOWN_HOURS - diff / 3_600_000
    if (hoursLeft > 0) {
      const h = Math.ceil(hoursLeft)
      setCooldown(`يمكنك التقييم مرة أخرى بعد ${h} ${h === 1 ? 'ساعة' : 'ساعات'}`)
    }
  }, [vendorId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { toast.error('يرجى اختيار تقييم'); return }
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      vendor_id:     vendorId,
      rating,
      comment:       comment || null,
      reviewer_name: name || null,
    })

    if (error) {
      toast.error('فشل إرسال التقييم')
    } else {
      localStorage.setItem(storageKey(vendorId), new Date().toISOString())
      toast.success('شكراً على تقييمك!')
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="card text-center py-6">
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-semibold">شكراً على تقييمك!</p>
      </div>
    )
  }

  if (cooldown) {
    return (
      <div className="card text-center py-6">
        <p className="text-2xl mb-2">⏳</p>
        <p className="font-semibold mb-1">قيّمت هذه البسطة مسبقاً</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cooldown}</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>اكتب تقييماً</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">التقييم *</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}>
                <Star size={28}
                  fill={(hover || rating) >= s ? '#f59e0b' : 'none'}
                  stroke={(hover || rating) >= s ? '#f59e0b' : '#d1d5db'}
                  className="transition-colors" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">اسمك (اختياري)</label>
          <input className="input" placeholder="مثال: أحمد"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">تعليق (اختياري)</label>
          <textarea className="input resize-none" rows={3}
            placeholder="أخبر الآخرين عن تجربتك…"
            value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'جارٍ الإرسال…' : 'إرسال التقييم'}
        </button>
      </form>
    </div>
  )
}
