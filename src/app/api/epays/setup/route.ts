/**
 * GET  /api/epays/setup          — list available payment gateways
 * POST /api/epays/setup?gateway=ID — subscribe to a gateway, returns apiKey + merchantGateway
 *
 * ONE-TIME SETUP ENDPOINT — protected by EPAYS_SETUP_SECRET env var.
 * Call this once to get the gateway credentials, then add them to Vercel env vars.
 * Delete or disable this route after setup is complete.
 *
 * Usage:
 *   1. GET  /api/epays/setup?secret=YOUR_SECRET  → see available gateways
 *   2. POST /api/epays/setup?secret=YOUR_SECRET&gateway=GATEWAY_ID  → subscribe + get keys
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl, getMerchantDomain } from '@/lib/app-url'

const BASE_URLS: Record<string, string> = {
  test: 'https://testapi.epays.io',
  live: 'https://api.epays.io',
}

function getMasterConfig() {
  const modeType = process.env.EPAYS_MODE_TYPE ?? 'live'
  return {
    apiUrl:       BASE_URLS[modeType] ?? BASE_URLS.live,
    apiVersion:   process.env.EPAYS_API_VERSION   ?? '3.3',
    apiId:        process.env.EPAYS_API_ID         ?? '',
    apiMasterKey: process.env.EPAYS_API_MASTER_KEY ?? '',
    testMode:     process.env.EPAYS_TEST_MODE      ?? '0',
  }
}

async function masterPost(endpoint: string, extra: Record<string, string> = {}) {
  const cfg    = getMasterConfig()
  const appUrl = getAppUrl()
  // EPAYS_MERCHANT_DOMAIN must match exactly what is registered in ePays dashboard
  const domain = getMerchantDomain()

  const body = new URLSearchParams({
    apiVersion:     cfg.apiVersion,
    apiId:          cfg.apiId,
    apiMasterKey:   cfg.apiMasterKey,
    merchantDomain: domain,
    merchantUrl:    appUrl,
    testMode:       cfg.testMode,
    ...extra,
  })

  const res  = await fetch(`${cfg.apiUrl}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache:   'no-store',
  })
  const text = await res.text()
  try { return { status: res.status, data: JSON.parse(text) } }
  catch { return { status: res.status, data: text } }
}

// ── Shared auth check ─────────────────────────────────────────────────────────
function checkSecret(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!process.env.EPAYS_SETUP_SECRET || secret !== process.env.EPAYS_SETUP_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  return null
}

// ── GET: list all available gateways ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const denied = checkSecret(req)
  if (denied) return denied

  // Get all gateways (both available and already subscribed/activated)
  const [available, activated] = await Promise.all([
    masterPost('/API/GetGatewayList', { listType: 'gateway' }),
    masterPost('/API/GetGatewayList', { listType: 'activatedGateway' }),
  ])

  return NextResponse.json({
    instructions: [
      '1. Look at availableGateways below and pick a gatewayId',
      '2. POST /api/epays/setup?secret=YOUR_SECRET&gateway=GATEWAY_ID',
      '3. Copy apiKey + merchantGateway from the response into Vercel env vars',
      '4. Set EPAYS_API_KEY and EPAYS_MERCHANT_GATEWAY in Vercel, then redeploy',
    ],
    availableGateways:  available,
    activatedGateways:  activated,
  })
}

// ── POST: subscribe to a gateway, return the credentials ─────────────────────
export async function POST(req: NextRequest) {
  const denied = checkSecret(req)
  if (denied) return denied

  const gatewayId = req.nextUrl.searchParams.get('gateway')
  if (!gatewayId) {
    return NextResponse.json({ error: 'missing ?gateway=ID param' }, { status: 400 })
  }

  const result = await masterPost('/API/SubscriptionGateway', {
    gatewayId,
    action: 'Subscribe',
  })

  if (result.data?.status !== 'SUCCESS') {
    return NextResponse.json({ error: 'subscription_failed', raw: result }, { status: 502 })
  }

  const licence = result.data?.data ?? {}

  return NextResponse.json({
    success: true,
    message: 'Gateway subscribed! Add these to Vercel Environment Variables, then redeploy:',
    envVars: {
      EPAYS_API_KEY:          licence.apiKey          ?? '(not returned)',
      EPAYS_MERCHANT_GATEWAY: String(licence.merchantGateway ?? '(not returned)'),
    },
    rawResponse: result.data,
  })
}
