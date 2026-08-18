/**
 * POST /api/payment/initiate
 *
 * Initiates a vendor subscription payment via ePays.
 * The vendor must be authenticated — vendor ID is read from their session.
 *
 * Returns { redirectUrl } for the client to navigate to the ePays payment page.
 * Never exposes API keys to the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }             from '@/lib/supabase/server'
import { initiatePayment }          from '@/lib/epays'
import { getAppUrl }                from '@/lib/app-url'

type BillingPeriod = 'monthly' | 'yearly'

const SUBSCRIPTION_PLANS: Record<BillingPeriod, { amount: number; months: number; label: string }> = {
  monthly: { amount: 3.000, months: 1, label: '1 month' },
  yearly:  { amount: 30.000, months: 12, label: '12 month' },
}

async function getBillingPeriod(req: NextRequest): Promise<BillingPeriod> {
  try {
    const body = await req.json()
    return body?.billingPeriod === 'yearly' ? 'yearly' : 'monthly'
  } catch {
    return 'monthly'
  }
}

export async function POST(req: NextRequest) {
  const billingPeriod = await getBillingPeriod(req)
  const plan = SUBSCRIPTION_PLANS[billingPeriod]

  // ── 1. Authenticate vendor ────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // ── 2. Load vendor ────────────────────────────────────────────────────────
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, name, subscription_status, subscription_expires_at')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return NextResponse.json({ error: 'vendor_not_found' }, { status: 404 })
  }

  // ── 3. Create local subscription order before leaving our app ─────────────
  const { data: subscriptionOrder, error: orderError } = await supabase
    .from('subscription_orders')
    .insert({
      vendor_id: vendor.id,
      amount:    plan.amount,
      status:    'pending',
    })
    .select('id')
    .single()

  if (orderError || !subscriptionOrder) {
    console.error('[payment/initiate] failed to create local subscription order:', orderError, 'vendor:', vendor.id)
    return NextResponse.json({ error: 'order_create_failed' }, { status: 500 })
  }

  console.log('[payment/initiate] created subscription order:', {
    orderId:  subscriptionOrder.id,
    vendorId: vendor.id,
  })

  // ── 4. Build URLs ─────────────────────────────────────────────────────────
  const appUrl    = getAppUrl()
  // orderId is our local payment attempt id. ePays also stores it in udf2.
  const notifyUrl = `${appUrl}/api/payment/callback?orderId=${subscriptionOrder.id}`

  const customerIp    = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const customerAgent = req.headers.get('user-agent') ?? ''

  // ── 5. Call ePays /API/Initiate ───────────────────────────────────────────
  const result = await initiatePayment({
    amount:        plan.amount,
    description:   `ScanBite Pro — ${plan.label} subscription (${vendor.name})`,
    orderNumber:   subscriptionOrder.id,   // stored in udf2, echoed back by ProcessPayment
    notifyUrl,
    fullName:      vendor.name,
    email:         user.email ?? '',
    customerIp,
    customerAgent,
  })

  if (!result.success) {
    console.error('[payment/initiate] ePays error:', result.errorCode, 'vendor:', vendor.id)
    return NextResponse.json({ error: result.errorCode }, { status: 502 })
  }

  return NextResponse.json({ redirectUrl: result.redirectUrl })
}
