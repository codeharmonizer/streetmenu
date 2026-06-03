'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { getOrderByNumber } from '@/lib/orders'
import type { Order, OrderStatus } from '@/types'

type TrackOrder = Order & { vendor_name: string; vendor_slug: string }

const POLL_INTERVAL = 12_000 // 12 s

const TERMINAL: OrderStatus[] = ['completed', 'rejected']

interface Props {
  initialOrder: TrackOrder
}

export default function OrderTracker({ initialOrder }: Props) {
  const t = useTranslations('track')
  const [order, setOrder] = useState<TrackOrder>(initialOrder)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll unless terminal
  useEffect(() => {
    if (TERMINAL.includes(order.status)) return

    timerRef.current = setInterval(async () => {
      const fresh = await getOrderByNumber(order.order_number)
      if (fresh) setOrder(fresh)
    }, POLL_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [order.status, order.order_number])

  const steps: { status: OrderStatus; label: string; hint: string }[] = [
    { status: 'pending',   label: t('statusPending'),   hint: t('pendingHint')   },
    { status: 'accepted',  label: t('statusAccepted'),  hint: t('acceptedHint')  },
    { status: 'ready',     label: t('statusReady'),     hint: t('readyHint')     },
    { status: 'completed', label: t('statusCompleted'), hint: t('completedHint') },
  ]

  const isRejected = order.status === 'rejected'

  const currentStep = isRejected
    ? -1
    : steps.findIndex(s => s.status === order.status)

  const activeHint = isRejected
    ? t('rejectedHint')
    : steps[currentStep]?.hint ?? ''

  function statusColor(s: OrderStatus) {
    if (s === 'completed') return '#16a34a'
    if (s === 'rejected')  return '#dc2626'
    if (s === 'ready')     return '#d97706'
    if (s === 'accepted')  return 'var(--brand)'
    return 'var(--text-muted)'
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Order code */}
      <div className="text-center mb-6">
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{t('order')}</p>
        <p className="text-4xl font-black tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)' }}>
          {order.order_number}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {t('vendor')}: <span className="font-semibold">{order.vendor_name}</span>
        </p>
      </div>

      {/* Status banner */}
      {isRejected ? (
        <div className="rounded-2xl p-4 mb-6 text-center"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <p className="font-bold mb-1" style={{ color: '#991b1b' }}>{t('statusRejected')}</p>
          <p className="text-sm" style={{ color: '#b91c1c' }}>{t('rejectedHint')}</p>
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-6 text-center"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="font-bold mb-0.5" style={{ color: statusColor(order.status) }}>
            {steps[currentStep]?.label}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeHint}</p>
        </div>
      )}

      {/* Timeline */}
      {!isRejected && (
        <div className="card p-5 mb-6">
          <div className="flex items-start gap-0">
            {steps.map((step, idx) => {
              const done    = idx < currentStep
              const active  = idx === currentStep
              return (
                <div key={step.status} className="flex-1 flex flex-col items-center">
                  {/* Connector line */}
                  <div className="w-full flex items-center">
                    {idx > 0 && (
                      <div className="flex-1 h-0.5 transition-colors duration-500"
                        style={{ background: done || active ? 'var(--brand)' : 'var(--border)' }} />
                    )}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-500"
                      style={{
                        background: done ? 'var(--brand)' : active ? 'var(--brand)' : 'var(--surface-2)',
                        color:      done || active ? 'white' : 'var(--text-muted)',
                        border:     active ? '2px solid var(--brand)' : done ? 'none' : '1px solid var(--border)',
                      }}>
                      {done ? '✓' : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="flex-1 h-0.5 transition-colors duration-500"
                        style={{ background: done ? 'var(--brand)' : 'var(--border)' }} />
                    )}
                  </div>
                  <p className="text-xs mt-1.5 text-center px-0.5 leading-tight"
                    style={{ color: active ? 'var(--brand)' : done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-4 mb-4">
        <p className="font-bold mb-3 text-sm" style={{ fontFamily: 'var(--font-display)' }}>{t('items')}</p>
        <div className="space-y-2">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="flex-1">{item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span></span>
              <span className="font-semibold" style={{ color: 'var(--brand)' }}>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex items-center justify-between font-bold"
          style={{ borderColor: 'var(--border)' }}>
          <span>{t('total')}</span>
          <span style={{ color: 'var(--brand)' }}>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Placed at */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('placedAt')}: {new Date(order.created_at).toLocaleString('ar-BH')}
      </p>
    </div>
  )
}
