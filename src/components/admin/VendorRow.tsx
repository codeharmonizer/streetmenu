'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vendor } from '@/types'
import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
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

export default function VendorRow({ vendor: initial }: Props) {
  const [vendor, setVendor] = useState(initial)
  const [loadingActive, setLoadingActive] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const supabase = createClient()

  async function toggleActive() {
    setLoadingActive(true)
    const next = !vendor.is_active
    const { error } = await supabase
      .from('vendors')
      .update({ is_active: next })
      .eq('id', vendor.id)

    if (error) {
      toast.error('Failed to update vendor status')
    } else {
      setVendor(v => ({ ...v, is_active: next }))
      toast.success(next ? `${vendor.name} enabled` : `${vendor.name} disabled`)
    }
    setLoadingActive(false)
  }

  async function toggleReviews() {
    setLoadingReviews(true)
    const next = !vendor.reviews_enabled
    const { error } = await supabase
      .from('vendors')
      .update({ reviews_enabled: next })
      .eq('id', vendor.id)

    if (error) {
      toast.error('Failed to update reviews status')
    } else {
      setVendor(v => ({ ...v, reviews_enabled: next }))
      toast.success(next ? 'Reviews enabled' : 'Reviews disabled')
    }
    setLoadingReviews(false)
  }

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

      {/* Public menu link */}
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
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-semibold">{initial.review_count}</span>
        <p className="text-xs" style={{ color: '#94a3b8' }}>reviews</p>
      </td>

      {/* Joined */}
      <td className="px-4 py-3">
        <span className="text-xs" style={{ color: '#64748b' }}>
          {new Date(vendor.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
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
