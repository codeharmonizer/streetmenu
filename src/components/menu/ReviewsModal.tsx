'use client'

import { useState } from 'react'
import { Star, X, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ReviewForm from './ReviewForm'

type Review = {
  id: string
  rating: number
  comment?: string | null
  reviewer_name?: string | null
  created_at: string
}

interface Props {
  vendorId: string
  reviews: Review[]
  avgRating: number | null
}

export default function ReviewsModal({ vendorId, reviews, avgRating }: Props) {
  const t  = useTranslations('publicMenu')
  const tr = useTranslations('reviewForm')
  const [open, setOpen] = useState<'reviews' | 'write' | null>(null)

  function close() { setOpen(null) }

  return (
    <>
      {/* ── Sticky bottom bar ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 flex gap-2 px-4 py-3"
        style={{
          background:   'var(--surface)',
          borderTop:    '1px solid var(--border)',
          boxShadow:    '0 -4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Reviews button */}
        <button
          onClick={() => setOpen('reviews')}
          className="btn-secondary flex-1"
          style={{ justifyContent: 'center' }}
        >
          <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
          {avgRating ? (
            <span>{avgRating.toFixed(1)}&nbsp;·&nbsp;</span>
          ) : null}
          {t('reviewsTitle')}
          {reviews.length > 0 && (
            <span className="ms-1 text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
              {reviews.length}
            </span>
          )}
        </button>

        {/* Write a review button */}
        <button
          onClick={() => setOpen('write')}
          className="btn-primary flex-1"
          style={{ justifyContent: 'center' }}
        >
          <Pencil size={14} />
          {tr('title')}
        </button>
      </div>

      {/* ── Bottom sheet ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={close}
          />

          {/* Sheet */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
            style={{
              background:     'var(--surface)',
              borderRadius:   '20px 20px 0 0',
              maxHeight:      '82vh',
              animation:      'slideUp 0.22s ease-out',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="font-bold text-base" style={{ fontFamily: 'var(--font-display)' }}>
                  {open === 'reviews'
                    ? `${t('reviewsTitle')}${reviews.length ? ` (${reviews.length})` : ''}`
                    : tr('title')}
                </h2>
                {open === 'reviews' && avgRating && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12}
                        fill={s <= Math.round(avgRating) ? '#f59e0b' : 'none'}
                        stroke={s <= Math.round(avgRating) ? '#f59e0b' : '#d1d5db'} />
                    ))}
                    <span className="text-xs ms-1" style={{ color: 'var(--text-secondary)' }}>
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--surface-2)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-4 py-4">
              {open === 'reviews' ? (
                reviews.length ? (
                  <div className="space-y-3 pb-6">
                    {reviews.map(r => (
                      <div key={r.id} className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={13}
                                fill={s <= r.rating ? '#f59e0b' : 'none'}
                                stroke={s <= r.rating ? '#f59e0b' : '#d1d5db'} />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">
                            {r.reviewer_name || t('anonymous')}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-3">💬</p>
                    <p className="font-semibold mb-1">{t('noReviews')}</p>
                    <button
                      onClick={() => setOpen('write')}
                      className="btn-primary mt-4 mx-auto">
                      <Pencil size={14} /> {tr('title')}
                    </button>
                  </div>
                )
              ) : (
                <div className="pb-6">
                  <ReviewForm vendorId={vendorId} onSuccess={close} />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
