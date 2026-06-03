'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, X, Pencil, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { placeOrder } from '@/lib/orders'
import ReviewForm from './ReviewForm'
import toast from 'react-hot-toast'

type MenuItem = {
  id: string
  vendor_id: string
  name: string
  description: string | null
  price: number
  photo_url: string | null
  category: string | null
  available: boolean
  created_at: string
}

type Review = {
  id: string
  rating: number
  comment?: string | null
  reviewer_name?: string | null
  created_at: string
}

interface Props {
  vendor: {
    id: string
    name: string
    slug: string
    reviews_enabled: boolean
  }
  items: MenuItem[]
  reviews: Review[]
  avgRating: number | null
  ordersEnabled: boolean
}

type SheetType = 'cart' | 'reviews' | 'write' | null

const SM_ORDERS_KEY = 'sm_orders'

export default function PublicMenuClient({ vendor, items, reviews, avgRating, ordersEnabled }: Props) {
  const t      = useTranslations('publicMenu')
  const tc     = useTranslations('cart')
  const tr     = useTranslations('reviewForm')
  const locale = useLocale()

  const [cart,        setCart]        = useState<Map<string, number>>(new Map())
  const [sheet,       setSheet]       = useState<SheetType>(null)
  const [customerName,  setCustomerName]  = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [note,          setNote]          = useState('')
  const [isPending,     startTransition]  = useTransition()
  const [successCode,   setSuccessCode]   = useState<string | null>(null)

  // ── Cart helpers ──────────────────────────────────────────────────────────
  function addItem(itemId: string) {
    setCart(prev => {
      const next = new Map(prev)
      next.set(itemId, (next.get(itemId) ?? 0) + 1)
      return next
    })
  }

  function removeOne(itemId: string) {
    setCart(prev => {
      const next = new Map(prev)
      const qty  = (next.get(itemId) ?? 0) - 1
      if (qty <= 0) next.delete(itemId)
      else          next.set(itemId, qty)
      return next
    })
  }

  function removeAll(itemId: string) {
    setCart(prev => {
      const next = new Map(prev)
      next.delete(itemId)
      return next
    })
  }

  const itemMap = new Map(items.map(i => [i.id, i]))

  const cartItems  = Array.from(cart.entries()).map(([id, qty]) => ({ item: itemMap.get(id)!, qty })).filter(x => x.item)
  const cartCount  = cartItems.reduce((s, x) => s + x.qty, 0)
  const cartTotal  = cartItems.reduce((s, x) => s + x.item.price * x.qty, 0)

  // ── Group items by category ───────────────────────────────────────────────
  const categories = [...new Set(items.map(i => i.category || 'Other'))]
  const grouped    = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter(i => (i.category || 'Other') === cat)
    return acc
  }, {})

  // ── Place order ───────────────────────────────────────────────────────────
  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (!cartItems.length)    { toast.error(tc('emptyCartError')); return }
    if (!customerName.trim()) { toast.error(tc('nameRequired'));   return }
    if (!customerPhone.trim()){ toast.error(tc('phoneRequired'));  return }

    startTransition(async () => {
      const result = await placeOrder({
        vendorId:      vendor.id,
        items:         cartItems.map(x => ({ menuItemId: x.item.id, quantity: x.qty })),
        customerName:  customerName.trim(),
        customerPhone: customerPhone.trim(),
        note:          note.trim() || undefined,
      })

      if (result.error || !result.orderNumber) {
        toast.error(tc('failed'))
        return
      }

      // Persist to localStorage
      try {
        const raw   = localStorage.getItem(SM_ORDERS_KEY)
        const saved = raw ? JSON.parse(raw) : []
        saved.unshift({
          code:       result.orderNumber,
          vendorName: vendor.name,
          slug:       vendor.slug,
          at:         new Date().toISOString(),
        })
        localStorage.setItem(SM_ORDERS_KEY, JSON.stringify(saved.slice(0, 20)))
      } catch {}

      setSuccessCode(result.orderNumber)
      setCart(new Map())
      setCustomerName('')
      setCustomerPhone('')
      setNote('')
    })
  }

  function closeSheet() {
    setSheet(null)
    setSuccessCode(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Menu items ── */}
      <div className="max-w-lg mx-auto px-4">
        {!items.length ? (
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
                {catItems.map(item => {
                  const qty = cart.get(item.id) ?? 0
                  return (
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
                          {formatPrice(item.price, locale)}
                        </p>
                        {!item.available && (
                          <span className="text-xs mt-1 inline-block" style={{ color: 'var(--text-muted)' }}>
                            {t('unavailable')}
                          </span>
                        )}
                        {/* Add / stepper */}
                        {ordersEnabled && item.available && (
                          <div className="mt-2">
                            {qty === 0 ? (
                              <button
                                onClick={() => addItem(item.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                                style={{ background: 'var(--brand)' }}>
                                <Plus size={14} />
                                {tc('addToCart')}
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-2 rounded-xl px-1 py-1"
                                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                <button onClick={() => removeOne(item.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-100">
                                  <Minus size={13} />
                                </button>
                                <span className="text-sm font-bold w-5 text-center">{qty}</span>
                                <button onClick={() => addItem(item.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                  style={{ background: 'var(--brand)', color: 'white' }}>
                                  <Plus size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('poweredBy')} <a href="/" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>StreetMenu</a>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-40"
        style={{
          background: 'var(--surface)',
          borderTop:  '1px solid var(--border)',
          boxShadow:  '0 -4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div className="max-w-lg mx-auto flex gap-2 px-4 py-3">
          {/* Reviews button */}
          {vendor.reviews_enabled && (
            <button
              onClick={() => setSheet('reviews')}
              className="btn-secondary flex-1"
              style={{ justifyContent: 'center' }}
            >
              <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
              {avgRating ? <span>{avgRating.toFixed(1)}&nbsp;·&nbsp;</span> : null}
              {t('reviewsTitle')}
              {reviews.length > 0 && (
                <span className="ms-1 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                  {reviews.length}
                </span>
              )}
            </button>
          )}

          {/* Cart / order button */}
          {ordersEnabled && cartCount > 0 && (
            <button
              onClick={() => setSheet('cart')}
              className="btn-primary flex-1"
              style={{ justifyContent: 'center' }}
            >
              <ShoppingBag size={14} />
              {tc('placeOrderBar', { count: cartCount, total: formatPrice(cartTotal, locale) })}
            </button>
          )}

          {/* If reviews are disabled and no cart, show write review only */}
          {!vendor.reviews_enabled && cartCount === 0 && (
            <button
              onClick={() => setSheet('write')}
              className="btn-primary flex-1"
              style={{ justifyContent: 'center' }}>
              <Pencil size={14} />
              {tr('title')}
            </button>
          )}

          {/* Write review button (secondary, when reviews visible) */}
          {vendor.reviews_enabled && cartCount === 0 && (
            <button
              onClick={() => setSheet('write')}
              className="btn-primary flex-1"
              style={{ justifyContent: 'center' }}>
              <Pencil size={14} />
              {tr('title')}
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom sheets ── */}
      {sheet && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={closeSheet}
          />

          <div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-w-lg mx-auto"
            style={{
              background:   'var(--surface)',
              borderRadius: '20px 20px 0 0',
              maxHeight:    '88vh',
              animation:    'slideUp 0.22s ease-out',
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
                  {sheet === 'cart'    ? tc('title')
                  : sheet === 'reviews' ? `${t('reviewsTitle')}${reviews.length ? ` (${reviews.length})` : ''}`
                  : tr('title')}
                </h2>
                {sheet === 'reviews' && avgRating && (
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
              <button onClick={closeSheet}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--surface-2)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-4 py-4">

              {/* ── Cart sheet ── */}
              {sheet === 'cart' && (
                successCode ? (
                  <div className="text-center py-10 pb-6">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="font-bold text-lg mb-1">{tc('successTitle')}</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{tc('successDesc')}</p>
                    <div className="inline-block px-6 py-3 rounded-2xl mb-6"
                      style={{ background: 'var(--brand-light)', border: '2px solid var(--brand)' }}>
                      <p className="text-3xl font-black tracking-widest" style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
                        {successCode}
                      </p>
                    </div>
                    <div className="pb-4">
                      <Link
                        href={`/track/${successCode}`}
                        className="btn-primary w-full justify-center"
                        onClick={closeSheet}>
                        {tc('trackOrder')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConfirm} className="space-y-4 pb-6">
                    {/* Cart lines */}
                    {cartItems.length === 0 ? (
                      <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>{tc('empty')}</p>
                    ) : (
                      <div className="space-y-2 mb-2">
                        {cartItems.map(({ item, qty }) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'var(--surface-2)' }}>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{item.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {formatPrice(item.price, locale)} × {qty} = {formatPrice(item.price * qty, locale)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button type="button" onClick={() => removeOne(item.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-100">
                                <Minus size={13} />
                              </button>
                              <span className="text-sm font-bold w-5 text-center">{qty}</span>
                              <button type="button" onClick={() => addItem(item.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                                style={{ background: 'var(--brand)' }}>
                                <Plus size={13} />
                              </button>
                              <button type="button" onClick={() => removeAll(item.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center ms-1 transition-colors hover:bg-red-100 text-red-500">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    {cartItems.length > 0 && (
                      <div className="flex items-center justify-between px-2 py-2 rounded-xl font-semibold"
                        style={{ background: 'var(--surface-2)' }}>
                        <span>{tc('total')}</span>
                        <span style={{ color: 'var(--brand)' }}>{formatPrice(cartTotal, locale)}</span>
                      </div>
                    )}

                    <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <label className="label">{tc('name')} *</label>
                        <input
                          type="text"
                          className="input"
                          placeholder={tc('namePlaceholder')}
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mt-3">
                        <label className="label">{tc('phone')} *</label>
                        <input
                          type="tel"
                          className="input"
                          placeholder={tc('phonePlaceholder')}
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mt-3">
                        <label className="label">{tc('note')}</label>
                        <textarea
                          className="input resize-none"
                          rows={2}
                          placeholder={tc('notePlaceholder')}
                          value={note}
                          onChange={e => setNote(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending || cartItems.length === 0}
                      className="btn-primary w-full justify-center">
                      {isPending ? tc('placing') : tc('confirm')}
                    </button>
                  </form>
                )
              )}

              {/* ── Reviews sheet ── */}
              {sheet === 'reviews' && (
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
                      onClick={() => setSheet('write')}
                      className="btn-primary mt-4 mx-auto">
                      <Pencil size={14} /> {tr('title')}
                    </button>
                  </div>
                )
              )}

              {/* ── Write review sheet ── */}
              {sheet === 'write' && (
                <div className="pb-6">
                  <ReviewForm vendorId={vendor.id} onSuccess={closeSheet} />
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
