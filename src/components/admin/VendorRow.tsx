'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vendor, SubscriptionStatus } from '@/types'
import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import { ExternalLink, Pencil, Check, X, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Props {
  vendor: Vendor & { scan_count: number; review_count: number }
}

function Toggle({ enabled, onToggle, loading }: { enabled: boolean; onToggle: () => void; loading: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
      style={{ background: enabled ? 'var(--brand)' : '#cbd5e1' }}>
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(5px)' : 'translateX(21px)' }}
      />
    </button>
  )
}

const STATUS_META: Record<SubscriptionStatus, { label: string; bg: string; color: string }> = {
  free:    { label: 'Free',    bg: '#f1f5f9', color: '#64748b' },
  trial:   { label: 'Trial',   bg: '#eff6ff', color: '#2563eb' },
  active:  { label: 'Active ✓', bg: '#dcfce7', color: '#16a34a' },
  expired: { label: 'Expired', bg: '#fee2e2', color: '#dc2626' },
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

function SubBadge({ status }: { status: SubscriptionStatus }) {
  const m = STATUS_META[status]
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

export default function VendorRow({ vendor: initial }: Props) {
  const [vendor, setVendor]               = useState(initial)
  const [loadingActive, setLoadingActive] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [editingSub, setEditingSub]       = useState(false)
  const [subStatus, setSubStatus]         = useState<SubscriptionStatus>(initial.subscription_status)
  const [subStart, setSubStart]           = useState(initial.subscription_starts_at?.slice(0, 10) ?? '')
  const [subExpiry, setSubExpiry]         = useState(initial.subscription_expires_at?.slice(0, 10) ?? '')
  const [savingSub, setSavingSub]         = useState(false)
  const supabase = createClient()

  async function toggleActive() {
    setLoadingActive(true)
    const next = !vendor.is_active
    const { error } = await supabase.from('vendors').update({ is_active: next }).eq('id', vendor.id)
    if (error) toast.error('Failed to update vendor status')
    else {
      setVendor(v => ({ ...v, is_active: next }))
      toast.success(next ? `${vendor.name} enabled` : `${vendor.name} disabled`)
    }
    setLoadingActive(false)
  }

  async function toggleReviews() {
    setLoadingReviews(true)
    const next = !vendor.reviews_enabled
    const { error } = await supabase.from('vendors').update({ reviews_enabled: next }).eq('id', vendor.id)
    if (error) toast.error('Failed to update reviews')
    else {
      setVendor(v => ({ ...v, reviews_enabled: next }))
      toast.success(next ? 'Reviews enabled' : 'Reviews disabled')
    }
    setLoadingReviews(false)
  }

  async function saveSubscription() {
    setSavingSub(true)

    // Auto-set start to today when activating for the first time
    const resolvedStart = subStart
      || ((subStatus === 'active' || subStatus === 'trial') ? new Date().toISOString().slice(0, 10) : '')

    const starts  = resolvedStart ? new Date(resolvedStart).toISOString()  : null
    const expires = subExpiry     ? new Date(subExpiry).toISOString()       : null

    const { error } = await supabase
      .from('vendors')
      .update({
        subscription_status:     subStatus,
        subscription_starts_at:  starts,
        subscription_expires_at: expires,
      })
      .eq('id', vendor.id)

    if (error) {
      toast.error('Failed to update subscription')
    } else {
      setVendor(v => ({
        ...v,
        subscription_status:     subStatus,
        subscription_starts_at:  starts,
        subscription_expires_at: expires,
      }))
      setSubStart(resolvedStart)
      setEditingSub(false)
      toast.success(`Subscription updated for ${vendor.name}`)
    }
    setSavingSub(false)
  }

  function cancelEdit() {
    setEditingSub(false)
    setSubStatus(vendor.subscription_status)
    setSubStart(vendor.subscription_starts_at?.slice(0, 10) ?? '')
    setSubExpiry(vendor.subscription_expires_at?.slice(0, 10) ?? '')
  }

  const isPaid = subStatus === 'active' || subStatus === 'trial'

  return (
    <tr className="border-b transition-colors hover:bg-slate-50" style={{ borderColor: '#f1f5f9' }}>

      {/* Vendor */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {vendor.logo_url ? (
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 relative">
              <Image src={vendor.logo_url} alt={vendor.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'var(--brand)' }}>
              {getInitials(vendor.name)}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{vendor.name}</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{vendor.category || '—'}</p>
          </div>
        </div>
      </td>

      {/* Slug */}
      <td className="px-4 py-3">
        <a href={`/m/${vendor.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs hover:underline"
          style={{ color: 'var(--brand)' }}>
          <ExternalLink size={11} />
          {vendor.slug}
        </a>
      </td>

      {/* Stats */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-semibold">{initial.scan_count}</span>
        <p className="text-xs" style={{ color: '#94a3b8' }}>scans</p>
      </td>

      {/* Reviews — count + manage link */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-semibold">{initial.review_count}</span>
        <div>
          <Link href={`/admin/vendors/${vendor.id}/reviews`}
            className="inline-flex items-center gap-0.5 text-xs hover:underline mt-0.5"
            style={{ color: 'var(--brand)' }}>
            <MessageSquare size={10} /> إدارة
          </Link>
        </div>
      </td>

      {/* Joined */}
      <td className="px-4 py-3">
        <span className="text-xs" style={{ color: '#64748b' }}>
          {new Date(vendor.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </td>

      {/* Subscription */}
      <td className="px-4 py-3" style={{ minWidth: '240px' }}>
        {editingSub ? (
          <div className="space-y-2">
            {/* Status */}
            <select
              value={subStatus}
              onChange={e => setSubStatus(e.target.value as SubscriptionStatus)}
              className="w-full text-xs border rounded-lg px-2 py-1.5 focus:outline-none"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>
              <option value="free">Free</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            {isPaid && (
              <>
                <div>
                  <label className="text-xs mb-0.5 block" style={{ color: '#94a3b8' }}>Start date</label>
                  <input type="date" value={subStart} onChange={e => setSubStart(e.target.value)}
                    className="w-full text-xs border rounded-lg px-2 py-1.5 focus:outline-none"
                    style={{ borderColor: '#e2e8f0', color: '#0f172a' }} />
                </div>
                <div>
                  <label className="text-xs mb-0.5 block" style={{ color: '#94a3b8' }}>End date</label>
                  <input type="date" value={subExpiry} onChange={e => setSubExpiry(e.target.value)}
                    className="w-full text-xs border rounded-lg px-2 py-1.5 focus:outline-none"
                    style={{ borderColor: '#e2e8f0', color: '#0f172a' }} />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button onClick={saveSubscription} disabled={savingSub}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Check size={12} /> Save
              </button>
              <button onClick={cancelEdit}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{ background: '#fee2e2', color: '#dc2626' }}>
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <SubBadge status={vendor.subscription_status} />
              {(vendor.subscription_starts_at || vendor.subscription_expires_at) && (
                <div className="text-xs space-y-0.5" style={{ color: '#64748b' }}>
                  {vendor.subscription_starts_at && (
                    <p>من: {fmtDate(vendor.subscription_starts_at)}</p>
                  )}
                  {vendor.subscription_expires_at && (
                    <p style={{ color: new Date(vendor.subscription_expires_at) < new Date() ? '#dc2626' : '#64748b' }}>
                      {new Date(vendor.subscription_expires_at) < new Date() ? '⚠ انتهى: ' : 'حتى: '}
                      {fmtDate(vendor.subscription_expires_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setEditingSub(true)}
              className="p-1 rounded-lg hover:bg-slate-100 opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
              style={{ color: '#64748b' }}>
              <Pencil size={11} />
            </button>
          </div>
        )}
      </td>

      {/* Active toggle */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Toggle enabled={vendor.is_active} onToggle={toggleActive} loading={loadingActive} />
          <span className="text-xs font-medium" style={{ color: vendor.is_active ? '#16a34a' : '#dc2626' }}>
            {vendor.is_active ? 'Active' : 'Disabled'}
          </span>
        </div>
      </td>

      {/* Reviews toggle */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Toggle enabled={vendor.reviews_enabled} onToggle={toggleReviews} loading={loadingReviews} />
          <span className="text-xs font-medium" style={{ color: vendor.reviews_enabled ? '#16a34a' : '#dc2626' }}>
            {vendor.reviews_enabled ? 'On' : 'Off'}
          </span>
        </div>
      </td>
    </tr>
  )
}
