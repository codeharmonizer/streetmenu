import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import DeleteReviewButton from './DeleteReviewButton'

interface Props {
  params: { id: string }
}

export default async function VendorReviewsPage({ params }: Props) {
  const supabase = await createClient()

  // Auth check — must be admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: adminRow } = await supabase.from('admins').select('user_id').eq('user_id', user.id).single()
  if (!adminRow) redirect('/dashboard')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, name, slug')
    .eq('id', params.id)
    .single()

  if (!vendor) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const avg = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link href="/admin/vendors"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: '#64748b' }}>
        <ArrowRight size={14} className="rotate-180" /> All Vendors
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-black mb-0.5" style={{ fontFamily: 'var(--font-display)', color: '#0f172a' }}>
          Reviews — {vendor.name}
        </h1>
        <div className="flex items-center gap-3 text-sm" style={{ color: '#64748b' }}>
          <a href={`/m/${vendor.slug}`} target="_blank" rel="noopener noreferrer"
            className="hover:underline" style={{ color: 'var(--brand)' }}>
            /m/{vendor.slug}
          </a>
          {avg && (
            <span className="flex items-center gap-1">
              <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              {avg} avg · {reviews?.length} reviews
            </span>
          )}
        </div>
      </div>

      {!reviews?.length ? (
        <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-3xl mb-2">💬</p>
          <p className="font-semibold" style={{ color: '#0f172a' }}>No reviews yet</p>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Reviews left by customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border p-5 flex gap-4"
              style={{ borderColor: '#e2e8f0' }}>
              {/* Stars + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14}
                        fill={s <= review.rating ? '#f59e0b' : 'none'}
                        stroke={s <= review.rating ? '#f59e0b' : '#d1d5db'} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                    {review.reviewer_name || 'Anonymous'}
                  </span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    {new Date(review.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                {review.comment ? (
                  <p className="text-sm" style={{ color: '#475569' }}>{review.comment}</p>
                ) : (
                  <p className="text-xs italic" style={{ color: '#94a3b8' }}>No comment</p>
                )}
              </div>

              {/* Delete */}
              <DeleteReviewButton reviewId={review.id} />
            </div>
          ))}
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <p className="text-xs mt-4 text-right" style={{ color: '#94a3b8' }}>
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  )
}
