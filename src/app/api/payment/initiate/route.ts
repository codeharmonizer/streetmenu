/**
 * POST /api/payment/initiate
 *
 * Body: { orderNumber: string }
 *
 * Loads the order from Supabase, calls ePays /API/Initiate,
 * marks the order as payment_status='pending_payment',
 * and returns { redirectUrl } for the client to navigate to.
 *
 * Never exposes API keys — this runs server-side only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }             from '@/lib/supabase/server'
import { initiatePayment }          from '@/lib/epays'

export async function POST(req: NextRequest) {
  // ── 1. Parse & validate body ──────────────────────────────────────────────
  let body: { orderNumber?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { orderNumber } = body
  if (!orderNumber) {
    return NextResponse.json({ error: 'missing_order_number' }, { status: 400 })
  }

  // ── 2. Load order from Supabase ───────────────────────────────────────────
  const supabase = await createClient()

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, order_number, total, customer_name, customer_phone, payment_status')
    .eq('order_number', orderNumber)
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 })
  }

  // Idempotency guard — don't re-initiate an already paid order
  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'already_paid' }, { status: 400 })
  }

  // ── 3. Build notifyUrl ────────────────────────────────────────────────────
  // ePays redirects the user's browser here after payment, with ?paymentId=XXX appended.
  // We embed orderNumber in the URL so we can match back without a session.
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scanbite-menu.vercel.app'
  const notifyUrl = `${appUrl}/api/payment/callback?orderNumber=${orderNumber}`

  // Pass customer IP & UA for fraud scoring (ePays uses these)
  const customerIp    = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const customerAgent = req.headers.get('user-agent') ?? ''

  // ── 4. Call ePays /API/Initiate ───────────────────────────────────────────
  const result = await initiatePayment({
    amount:        order.total,
    description:   `Order ${orderNumber} — ScanBite`,
    orderNumber,
    notifyUrl,
    fullName:      order.customer_name   ?? 'Customer',
    mobile:        order.customer_phone  ?? '',
    customerIp,
    customerAgent,
  })

  if (!result.success) {
    console.error('[payment/initiate] ePays error:', result.errorCode, 'order:', orderNumber)
    return NextResponse.json({ error: result.errorCode }, { status: 502 })
  }

  // ── 5. Mark order as payment initiated ───────────────────────────────────
  await supabase
    .from('orders')
    .update({ payment_status: 'pending_payment' })
    .eq('id', order.id)

  // ── 6. Return redirect URL to client ─────────────────────────────────────
  return NextResponse.json({ redirectUrl: result.redirectUrl })
}
