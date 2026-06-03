'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Phone, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { updateOrderStatus } from '@/lib/orders'
import type { Order, OrderStatus } from '@/types'
import toast from 'react-hot-toast'

const POLL_INTERVAL = 12_000

type Tab = 'new' | 'active' | 'done' | 'all'

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const num    = digits.startsWith('973') ? digits : `973${digits}`
  return `https://wa.me/${num}`
}

function statusBadgeStyle(status: OrderStatus): React.CSSProperties {
  switch (status) {
    case 'pending':   return { background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' }
    case 'accepted':  return { background: '#eff6ff', color: '#1e40af', border: '1px solid #93c5fd' }
    case 'ready':     return { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }
    case 'completed': return { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
    case 'rejected':  return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' }
  }
}

interface Props {
  initialOrders: Order[]
}

export default function OrdersManager({ initialOrders }: Props) {
  const t      = useTranslations('orders')
  const locale = useLocale()
  const router = useRouter()

  const [orders,     setOrders]     = useState<Order[]>(initialOrders)
  const [tab,        setTab]        = useState<Tab>('new')
  const [isPending,  startTransition] = useTransition()
  const [actionId,   setActionId]   = useState<string | null>(null)

  // Poll for new orders
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh()
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [router])

  // Sync with server refreshes
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  function filterByTab(tab: Tab): Order[] {
    switch (tab) {
      case 'new':    return orders.filter(o => o.status === 'pending')
      case 'active': return orders.filter(o => o.status === 'accepted' || o.status === 'ready')
      case 'done':   return orders.filter(o => o.status === 'completed' || o.status === 'rejected')
      case 'all':    return orders
    }
  }

  async function handleStatusUpdate(orderId: string, status: OrderStatus) {
    setActionId(orderId)
    startTransition(async () => {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))

      const result = await updateOrderStatus(orderId, status)
      if (result.error) {
        toast.error(t('updateFailed'))
        // Revert
        setOrders(initialOrders)
      } else {
        router.refresh()
      }
      setActionId(null)
    })
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'new',    label: t('tabNew'),    count: orders.filter(o => o.status === 'pending').length                                  },
    { id: 'active', label: t('tabActive'), count: orders.filter(o => o.status === 'accepted' || o.status === 'ready').length         },
    { id: 'done',   label: t('tabDone'),   count: orders.filter(o => o.status === 'completed' || o.status === 'rejected').length     },
    { id: 'all',    label: t('tabAll'),    count: orders.length                                                                       },
  ]

  const visible = filterByTab(tab)

  function statusLabel(s: OrderStatus) {
    switch (s) {
      case 'pending':   return t('statusPending')
      case 'accepted':  return t('statusAccepted')
      case 'ready':     return t('statusReady')
      case 'completed': return t('statusCompleted')
      case 'rejected':  return t('statusRejected')
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('desc')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ id, label, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            style={tab === id
              ? { background: 'var(--brand)', color: 'white' }
              : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
            {label}
            {count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={tab === id
                  ? { background: 'rgba(255,255,255,0.25)' }
                  : { background: 'var(--border)', color: 'var(--text-muted)' }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {visible.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-semibold">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(order => (
            <div key={order.id} className="card p-5 space-y-3">
              {/* Order header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-lg tracking-widest" style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
                      #{order.order_number}
                    </p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={statusBadgeStyle(order.status)}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={11} />
                    {new Date(order.created_at).toLocaleString('ar-BH')}
                  </div>
                </div>
                <p className="font-bold text-lg flex-shrink-0" style={{ color: 'var(--brand)' }}>
                  {formatPrice(order.total, locale)}
                </p>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold">{order.customer_name || '—'}</span>
                {order.customer_phone ? (
                  <a href={waLink(order.customer_phone)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 font-medium"
                    style={{ color: 'var(--brand)' }}>
                    <Phone size={13} />
                    {order.customer_phone}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>{t('noPhone')}</span>
                )}
              </div>

              {/* Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'var(--surface-2)' }}>
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span></span>
                      <span className="font-semibold">{formatPrice(item.price * item.quantity, locale)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Note */}
              {order.note && (
                <p className="text-sm italic px-3 py-2 rounded-xl"
                  style={{ background: '#fffbeb', color: '#92400e' }}>
                  &ldquo;{order.note}&rdquo;
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                {order.status === 'pending' && (
                  <>
                    <button
                      disabled={isPending && actionId === order.id}
                      onClick={() => handleStatusUpdate(order.id, 'accepted')}
                      className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                      {t('accept')}
                    </button>
                    <button
                      disabled={isPending && actionId === order.id}
                      onClick={() => handleStatusUpdate(order.id, 'rejected')}
                      className="text-sm px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-60"
                      style={{ background: '#fee2e2', color: '#991b1b' }}>
                      {t('reject')}
                    </button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <button
                    disabled={isPending && actionId === order.id}
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                    {t('markReady')}
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    disabled={isPending && actionId === order.id}
                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                    {t('markCompleted')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
