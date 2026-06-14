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

// Monthly subscription price in BHD
const SUBSCRIPTION_PRICE_BHD = 3.000

export async function POST(req: NextRequest) {
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

  // ── 3. Build URLs ─────────────────────────────────────────────────────────
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scanbite-menu.vercel.app'
  // vendorId in notifyUrl so the callback can identify who paid (no session there)
  const notifyUrl = `${appUrl}/api/payment/callback?vendorId=${vendor.id}`

  const customerIp    = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const customerAgent = req.headers.get('user-agent') ?? ''

  // ── 4. Call ePays /API/Initiate ───────────────────────────────────────────
  const result = await initiatePayment({
    amount:        SUBSCRIPTION_PRICE_BHD,
    description:   `ScanBite Pro — 1 month subscription (${vendor.name})`,
    orderNumber:   vendor.id,   // stored in udf2, echoed back in callback
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
