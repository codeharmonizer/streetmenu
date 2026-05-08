import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Clock, Phone, Star, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import ReviewForm from '@/components/menu/ReviewForm'
import ShareButton from '@/components/menu/ShareButton'
import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('name, description, category')
    .eq('slug', params.slug)
    .single()

  if (!vendor) return { title: 'Menu not found' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://streetmenu-ten.vercel.app'
  const desc   = vendor.description || `تصفح قائمة ${vendor.name} — ${vendor.category ?? 'طعام'} بالبحرين`

  return {
    title: `${vendor.name} — القائمة`,
    description: desc,
    openGraph: {
      title: vendor.name,
      description: desc,
      url: `${appUrl}/m/${params.slug}`,
      siteName: 'StreetMenu',
      locale: 'ar_BH',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: vendor.name,
      description: desc,
    },
  }
}

export default async function PublicMenuPage({ params }: Props) {
  const supabase = await createClient()
  const t        = await getTranslations('publicMenu')
  const locale   = await getLocale()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!vendor) notFound()

  // Vendor disabled by admin
  if (vendor.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('inactiveTitle')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('inactiveDesc')}</p>
        </div>
      </div>
    )
  }

  // Log scan
  try { await supabase.from('scans').insert({ vendor_id: vendor.id }) } catch {}

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('available', { ascending: false })
    .order('created_at', { ascending: true })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const avgRating = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  // Group items by category
  type MenuItem = NonNullable<typeof items>[number]
  const categories = [...new Set(items?.map(i => i.category || 'Other') ?? [])]
  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items?.filter(i => (i.category || 'Other') === cat) ?? []
    return acc
  }, {})

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://streetmenu-ten.vercel.app'
  const menuUrl = `${appUrl}/m/${vendor.slug}`

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-6 max-w-lg mx-auto">
        <div className="flex items-start gap-4 mb-4">
          {vendor.logo_url ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative">
              <Image src={vendor.logo_url} alt={vendor.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 font-bold text-white"
              style={{ background: 'var(--brand)' }}>
              {vendor.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {vendor.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {vendor.category && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                  {vendor.category}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: vendor.is_open ? '#dcfce7' : '#fee2e2',
                  color:      vendor.is_open ? '#15803d' : '#dc2626',
                }}>
                {vendor.is_open ? t('open') : t('closed')}
              </span>
              {avgRating && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Star size={11} fill="currentColor" style={{ color: '#f59e0b' }} />
                  {avgRating.toFixed(1)} ({reviews?.length})
                </span>
              )}
              <ShareButton url={menuUrl} name={vendor.name} />
            </div>
          </div>
        </div>

        {vendor.description && (
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{vendor.description}</p>
        )}

        <div className="flex flex-col gap-1.5">
          {vendor.address && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <MapPin size={13} style={{ color: 'var(--brand)' }} /> {vendor.address}
            </div>
          )}
          {vendor.hours && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={13} style={{ color: 'var(--brand)' }} /> {vendor.hours}
            </div>
          )}
          {vendor.phone && (
            <a
              href={`https://wa.me/${
                (() => {
                  const digits = vendor.phone.replace(/\D/g, '')
                  return digits.startsWith('973') ? digits : `973${digits}`
                })()
              }`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--brand)' }}>
              <Phone size={13} /> {vendor.phone} ({t('whatsapp')})
            </a>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-lg mx-auto px-4">
        {!items?.length ? (
          <div className="card text-center py-12">
            <ShoppingBag size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold">{t('comingSoon')}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('comingSoonDesc')}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} className="mb-6">
              <h2 className="font-bold text-sm uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {category}
              </h2>
              <div className="space-y-3">
                {catItems?.map(item => (
                  <div key={item.id} className="card flex gap-4 p-4"
                    style={{ opacity: item.available ? 1 : 0.5 }}>
                    {item.photo_url ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0">
                        <Image src={item.photo_url} alt={item.name} fill className="object-cover" />
                        {!item.available && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
                            style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <span className="text-white text-xs font-bold">{t('soldOut')}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ background: 'var(--surface-2)' }}>🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      {item.description && (
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                      )}
                      <p className="font-bold mt-2" style={{ color: 'var(--brand)' }}>
                        {formatPrice(item.price)}
                      </p>
                      {!item.available && (
                        <span className="text-xs mt-1 inline-block" style={{ color: 'var(--text-muted)' }}>
                          {t('unavailable')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reviews */}
      {vendor.reviews_enabled !== false && (
        <div className="max-w-lg mx-auto px-4 mt-8">
          <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {t('reviewsTitle')} {reviews?.length ? `(${reviews.length})` : ''}
          </h2>

          {reviews?.length ? (
            <div className="space-y-3 mb-6">
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
                    <span className="text-sm font-medium">{r.reviewer_name || t('anonymous')}</span>
                  </div>
                  {r.comment && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('noReviews')}</p>
          )}

          <ReviewForm vendorId={vendor.id} />
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('poweredBy')} <a href="/" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>StreetMenu</a>
      </div>
    </div>
  )
}
