/**
 * GET|POST /api/payment/callback?orderNumber=XXX&paymentId=YYY
 *
 * ePays redirects the user's browser here after payment completes.
 * Flow:
 *   1. Extract paymentId + orderNumber from query string
 *   2. Call ePays /API/ProcessPayment to get the authoritative result
 *   3. If result === 'Completed' → mark order paid, redirect to /track/XXX?payment=success
 *   4. If result === 'Failed'    → mark order failed, redirect to /track/XXX?payment=failed
 *   5. alreadyProcessed guard prevents double-updates (ePays sets processed flag)
 *
 * ePays may call this via GET (browser redirect) or POST (server-to-server).
 * We handle both.
 */

import { NextRequest, NextResponse }  from 'next/server'
import { createAdminClient }          from '@/lib/supabase/admin'
import { processPayment }             from '@/lib/epays'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scanbite-menu.vercel.app'

async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const paymentId   = searchParams.get('paymentId')
  const orderNumber = searchParams.get('orderNumber')

  // ── Validate params ──────────────────────────────────────────────────────
  if (!paymentId || !orderNumber) {
    // Redirect to home rather than showing a raw JSON error (this is browser-facing)
    return NextResponse.redirect(`${APP_URL}/?payment_error=missing_params`)
  }

  // ── Call ePays ProcessPayment ─────────────────────────────────────────────
  const result = await processPayment(paymentId)

  if (!result.success) {
    console.error('[payment/callback] processPayment failed:', result.errorCode, { paymentId, orderNumber })
    return NextResponse.redirect(`${APP_URL}/track/${orderNumber}?payment=error`)
  }

  // ── Already handled by a previous callback call — just redirect ───────────
  if (result.alreadyProcessed) {
    const paymentStatus = result.result === 'Completed' ? 'success' : 'failed'
    return NextResponse.redirect(`${APP_URL}/track/${orderNumber}?payment=${paymentStatus}`)
  }

  // ── Update Supabase ───────────────────────────────────────────────────────
  // Use admin client — this request comes from ePays, not a logged-in user
  const supabase = createAdminClient()

  if (result.result === 'Completed') {
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_id:     result.paymentId ?? paymentId,
        payment_amount: result.amount,
      })
      .eq('order_number', orderNumber)

    return NextResponse.redirect(`${APP_URL}/track/${orderNumber}?payment=success`)
  }

  // Failed or empty result (pending/failed)
  await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_id:     result.paymentId ?? paymentId,
    })
    .eq('order_number', orderNumber)

  return NextResponse.redirect(`${APP_URL}/track/${orderNumber}?payment=failed`)
}

export const GET  = handler
export const POST = handler
