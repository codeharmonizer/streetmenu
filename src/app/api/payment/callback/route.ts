/**
 * GET|POST /api/payment/callback?vendorId=XXX&paymentId=YYY
 *
 * ePays redirects the vendor's browser here after payment completes.
 *
 * Flow:
 *   1. Extract vendorId + paymentId from query string
 *   2. Call ePays /API/ProcessPayment for the authoritative result
 *   3. Completed → extend vendor subscription by 1 month, log payment, redirect to dashboard
 *   4. Failed     → redirect to upgrade page with ?payment=failed
 *
 * Uses admin/service-role client — this request comes from ePays, not a logged-in user.
 * ePays may call via GET (browser redirect) or POST (server-to-server); we handle both.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { processPayment }            from '@/lib/epays'

const APP_URL              = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scanbite-menu.vercel.app'
const SUBSCRIPTION_MONTHS  = 1   // how many months each payment covers

async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const vendorId  = searchParams.get('vendorId')
  const paymentId = searchParams.get('paymentId')

  if (!vendorId || !paymentId) {
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  // ── Call ePays to verify the payment ─────────────────────────────────────
  const result = await processPayment(paymentId)

  if (!result.success) {
    console.error('[payment/callback] processPayment failed:', result.errorCode, { vendorId, paymentId })
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  // Already handled — redirect appropriately without double-updating
  if (result.alreadyProcessed) {
    return NextResponse.redirect(`${APP_URL}/dashboard?subscription=renewed`)
  }

  // ── Completed: activate / extend subscription ─────────────────────────────
  if (result.result === 'Completed') {
    const supabase = createAdminClient()

    // Load current vendor to handle subscription extension correctly
    const { data: vendor } = await supabase
      .from('vendors')
      .select('subscription_expires_at')
      .eq('id', vendorId)
      .single()

    // Extend from current expiry if still active, otherwise from today
    const baseDate =
      vendor?.subscription_expires_at && new Date(vendor.subscription_expires_at) > new Date()
        ? new Date(vendor.subscription_expires_at)
        : new Date()

    const expiresAt = new Date(baseDate)
    expiresAt.setMonth(expiresAt.getMonth() + SUBSCRIPTION_MONTHS)

    await supabase
      .from('vendors')
      .update({
        subscription_status:     'active',
        subscription_starts_at:  new Date().toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', vendorId)

    // Log the payment for audit trail
    await supabase
      .from('subscription_payments')
      .insert({
        vendor_id:  vendorId,
        payment_id: result.paymentId ?? paymentId,
        amount:     result.amount,
        expires_at: expiresAt.toISOString(),
      })

    return NextResponse.redirect(`${APP_URL}/dashboard?subscription=success`)
  }

  // ── Failed / pending ──────────────────────────────────────────────────────
  return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=failed`)
}

export const GET  = handler
export const POST = handler
