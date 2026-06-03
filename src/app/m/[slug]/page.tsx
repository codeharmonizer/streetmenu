import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Clock, Phone, Star } from 'lucide-react'
import ShareButton from '@/components/menu/ShareButton'
import PublicMenuClient from '@/components/menu/PublicMenuClient'
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

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://streetmenu-ten.vercel.app'
  const menuUrl = `${appUrl}/m/${vendor.slug}`

  const ordersEnabled =
    vendor.orders_enabled === true &&
    vendor.is_open === true &&
    vendor.is_active !== false

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header — server-rendered */}
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

      {/* Client island: menu grid + cart + reviews bottom bar */}
      <PublicMenuClient
        vendor={{
          id:              vendor.id,
          name:            vendor.name,
          slug:            vendor.slug,
          reviews_enabled: vendor.reviews_enabled !== false,
        }}
        items={items ?? []}
        reviews={reviews ?? []}
        avgRating={avgRating}
        ordersEnabled={ordersEnabled}
      />
    </div>
  )
}
