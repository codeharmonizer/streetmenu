/**
 * GET|POST /api/payment/callback?orderId=XXX&paymentId=YYY
 *
 * ePays redirects the vendor's browser here after payment completes.
 *
 * Flow:
 *   1. Extract our local subscription order id + ePays paymentId
 *   2. Call ePays /API/ProcessPayment for the authoritative result
 *   3. Verify ePays' udf2/orderNumber matches our local order id
 *   4. Completed → set vendor plan to Pro, activate / extend subscription, mark order paid, log payment
 *   5. Failed    → mark order failed, redirect to upgrade page with ?payment=failed
 *
 * Uses admin/service-role client — this request comes from ePays, not a logged-in user.
 * ePays may call via GET (browser redirect) or POST (server-to-server); we handle both.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { processPayment }            from '@/lib/epays'
import { getAppUrl }                 from '@/lib/app-url'

const APP_URL              = getAppUrl()
const SUBSCRIPTION_MONTHS  = 1   // how many months each payment covers

function isSuccessfulPayment(result: Awaited<ReturnType<typeof processPayment>>) {
  const normalizedResult = (result.result ?? '').trim().toLowerCase()
  const normalizedCode   = (result.responseCode ?? '').trim()

  return (
    normalizedResult === 'completed' ||
    normalizedResult === 'success' ||
    normalizedResult === 'successful' ||
    normalizedResult === 'succeeded' ||
    normalizedResult === 'approved' ||
    normalizedResult === 'captured' ||
    normalizedCode === '00' ||
    normalizedCode === '000'
  )
}

async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const orderId   = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')

  if (!orderId || !paymentId) {
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  // ── Call ePays to verify the payment ─────────────────────────────────────
  const result = await processPayment(paymentId)

  if (!result.success) {
    console.error('[payment/callback] processPayment failed:', result.errorCode, { orderId, paymentId })
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  // Validate that ePays' authoritative order value matches our local order id.
  // orderId is callback query input; result.orderNumber comes from ePays
  // ProcessPayment response for the supplied paymentId.
  if (result.orderNumber !== orderId) {
    console.error('[payment/callback] order mismatch:', {
      orderId,
      paymentId,
      orderNumber: result.orderNumber,
    })
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  const supabase = createAdminClient()

  // Load the local subscription order. This is the source of truth for which
  // vendor may be updated; never update a vendor directly from callback params.
  const { data: subscriptionOrder, error: orderLookupError } = await supabase
    .from('subscription_orders')
    .select('id, vendor_id, status, amount, epays_payment_id, paid_at')
    .eq('id', orderId)
    .single()

  if (orderLookupError || !subscriptionOrder) {
    console.error('[payment/callback] local subscription order not found:', {
      orderId,
      paymentId,
      error: orderLookupError,
    })
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  // Already handled locally — redirect appropriately without double-updating or
  // duplicating audit rows. Local order status is the idempotency source of truth;
  // ePays `alreadyProcessed` can be true on a retried callback even if our first
  // local write failed, so do not skip a pending local order only because of it.
  if (subscriptionOrder.status === 'paid') {
    return NextResponse.redirect(`${APP_URL}/dashboard?subscription=renewed`)
  }

  if (subscriptionOrder.status !== 'pending') {
    console.error('[payment/callback] subscription order is not payable:', {
      orderId,
      paymentId,
      status: subscriptionOrder.status,
    })
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  // ── Failed / pending ──────────────────────────────────────────────────────
  if (!isSuccessfulPayment(result)) {
    console.error('[payment/callback] payment was not successful:', {
      orderId,
      paymentId,
      result:       result.result,
      responseCode: result.responseCode,
      responseDesc: result.responseDesc,
    })

    if ((result.result ?? '').trim().toLowerCase() === 'failed') {
      await supabase
        .from('subscription_orders')
        .update({
          status:           'failed',
          epays_payment_id: result.paymentId ?? paymentId,
        })
        .eq('id', orderId)
    }

    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=failed`)
  }

  const vendorId = subscriptionOrder.vendor_id

  // Load current vendor to handle subscription extension correctly
  const { data: vendor } = await supabase
    .from('vendors')
    .select('subscription_expires_at')
    .eq('id', vendorId)
    .single()

  if (!vendor) {
    console.error('[payment/callback] vendor for subscription order not found:', { orderId, vendorId, paymentId })
    return NextResponse.redirect(`${APP_URL}/dashboard/upgrade?payment=error`)
  }

  // Extend from current expiry if still active, otherwise from today
  const baseDate =
    vendor.subscription_expires_at && new Date(vendor.subscription_expires_at) > new Date()
      ? new Date(vendor.subscription_expires_at)
      : new Date()

  const nowIso = new Date().toISOString()
  const expiresAt = new Date(baseDate)
  expiresAt.setMonth(expiresAt.getMonth() + SUBSCRIPTION_MONTHS)

  await supabase
    .from('vendors')
    .update({
      plan:                    'pro',
      subscription_status:     'active',
      subscription_starts_at:  nowIso,
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq('id', vendorId)

  await supabase
    .from('subscription_orders')
    .update({
      status:           'paid',
      epays_payment_id: result.paymentId ?? paymentId,
      paid_at:          nowIso,
    })
    .eq('id', orderId)

  // Log the payment for audit trail
  await supabase
    .from('subscription_payments')
    .insert({
      subscription_order_id: orderId,
      vendor_id:             vendorId,
      payment_id:            result.paymentId ?? paymentId,
      amount:                result.amount ?? subscriptionOrder.amount,
      expires_at:            expiresAt.toISOString(),
    })

  return NextResponse.redirect(`${APP_URL}/dashboard?subscription=success`)
}

export const GET  = handler
export const POST = handler
