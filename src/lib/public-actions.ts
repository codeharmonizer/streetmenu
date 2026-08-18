'use server'

import { headers } from 'next/headers'
import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_REVIEW_NAME_LENGTH = 80
const MAX_REVIEW_COMMENT_LENGTH = 1000
const SCAN_DEDUPE_WINDOW_HOURS = 24
const REVIEW_RATE_LIMIT = { windowMinutes: 60, maxEvents: 3 }

async function getClientFingerprint(action: string, vendorId: string): Promise<string> {
  const h = await headers()
  const forwardedFor = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwardedFor || h.get('x-real-ip') || 'unknown'
  const ua = h.get('user-agent') || 'unknown'
  return createHash('sha256').update(`${action}:${vendorId}:${ip}:${ua}`).digest('hex')
}

async function isRateLimited(
  supabase: ReturnType<typeof createAdminClient>,
  action: string,
  vendorId: string,
  limit: { windowMinutes: number; maxEvents: number }
): Promise<boolean> {
  const key = await getClientFingerprint(action, vendorId)
  const since = new Date(Date.now() - limit.windowMinutes * 60_000).toISOString()

  const { count, error: countError } = await supabase
    .from('public_action_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('action', action)
    .eq('fingerprint', key)
    .gte('created_at', since)

  if (countError) return false
  if ((count ?? 0) >= limit.maxEvents) return true

  await supabase.from('public_action_rate_limits').insert({ action, vendor_id: vendorId, fingerprint: key })
  return false
}

export async function logPublicScan(vendorId: string): Promise<void> {
  if (!vendorId) return
  try {
    const supabase = createAdminClient()
    const fingerprint = await getClientFingerprint('scan', vendorId)
    const since = new Date(Date.now() - SCAN_DEDUPE_WINDOW_HOURS * 60 * 60_000).toISOString()

    const { count, error: countError } = await supabase
      .from('public_action_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'scan')
      .eq('vendor_id', vendorId)
      .eq('fingerprint', fingerprint)
      .gte('created_at', since)

    if (countError || (count ?? 0) > 0) return

    await supabase.from('public_action_rate_limits').insert({
      action: 'scan',
      vendor_id: vendorId,
      fingerprint,
    })
    await supabase.from('scans').insert({ vendor_id: vendorId })
  } catch {
    // Scan analytics must never break public menu rendering.
  }
}

export async function submitReview(input: {
  vendorId: string
  rating: number
  comment?: string | null
  reviewerName?: string | null
}): Promise<{ error?: string }> {
  const rating = Number(input.rating)
  if (!input.vendorId) return { error: 'vendor_required' }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'invalid_rating' }

  const comment = input.comment?.trim() || null
  const reviewerName = input.reviewerName?.trim() || null

  if (comment && comment.length > MAX_REVIEW_COMMENT_LENGTH) return { error: 'comment_too_long' }
  if (reviewerName && reviewerName.length > MAX_REVIEW_NAME_LENGTH) return { error: 'name_too_long' }

  const supabase = createAdminClient()
  if (await isRateLimited(supabase, 'review', input.vendorId, REVIEW_RATE_LIMIT)) {
    return { error: 'rate_limited' }
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, is_active, reviews_enabled')
    .eq('id', input.vendorId)
    .single()

  if (!vendor) return { error: 'vendor_not_found' }
  if (vendor.is_active === false) return { error: 'vendor_inactive' }
  if (vendor.reviews_enabled === false) return { error: 'reviews_disabled' }

  const { error } = await supabase.from('reviews').insert({
    vendor_id:      input.vendorId,
    rating,
    comment,
    reviewer_name: reviewerName,
  })

  if (error) return { error: 'submit_failed' }
  return {}
}
