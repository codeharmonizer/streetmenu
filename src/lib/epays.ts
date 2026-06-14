/**
 * ePays payment gateway client — server-only, never import from client components.
 *
 * API version: 3.3
 * Docs: https://epays.io  |  Test base: https://testapi.epays.io
 *
 * Auth model:
 *   Every request includes apiId + apiKey (gateway-scoped) plus common envelope
 *   fields (apiVersion, merchantDomain, merchantUrl, testMode).
 *
 * Key endpoints used by ScanBite:
 *   POST /API/Initiate        — create a payment session, get redirect URL
 *   POST /API/ProcessPayment  — verify result after user returns from payment page
 */

const BASE_URLS: Record<string, string> = {
  localhost: 'https://localhost:7124',
  localip:   'https://192.168.100.115:8081',
  test:      'https://testapi.epays.io',
  live:      'https://api.epays.io',
}

// ---------------------------------------------------------------------------
// Internal config — read once per request from env vars
// ---------------------------------------------------------------------------
function getConfig() {
  const modeType = process.env.EPAYS_MODE_TYPE ?? 'test'

  return {
    apiUrl:          BASE_URLS[modeType] ?? BASE_URLS.test,
    apiVersion:      process.env.EPAYS_API_VERSION      ?? '3.3',
    apiId:           process.env.EPAYS_API_ID            ?? '',
    apiKey:          process.env.EPAYS_API_KEY           ?? '',
    merchantGateway: process.env.EPAYS_MERCHANT_GATEWAY  ?? '',
    testMode:        Number(process.env.EPAYS_TEST_MODE  ?? 1),
    modeType,
  }
}

// Common envelope fields sent with every request
function basePayload(cfg: ReturnType<typeof getConfig>) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scanbite-menu.vercel.app'
  const domain = new URL(appUrl).hostname

  return {
    apiVersion:      cfg.apiVersion,
    apiId:           cfg.apiId,
    apiKey:          cfg.apiKey,
    merchantGateway: cfg.merchantGateway,
    merchantDomain:  domain,
    merchantUrl:     appUrl,
    testMode:        String(cfg.testMode),
  }
}

// ---------------------------------------------------------------------------
// Low-level POST helper (form-encoded, matching ePays PHP sample exactly)
// ---------------------------------------------------------------------------
async function epaysPost<T>(
  endpoint: string,
  data: Record<string, string | number>,
): Promise<T> {
  const cfg  = getConfig()
  const url  = `${cfg.apiUrl}${endpoint}`

  const merged: Record<string, string> = {}
  for (const [k, v] of Object.entries({ ...basePayload(cfg), ...data })) {
    merged[k] = String(v)
  }

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(merged),
    // next.js fetch — no caching for payment calls
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`ePays HTTP ${res.status} on ${endpoint}`)
  }

  return res.json() as T
}

// ---------------------------------------------------------------------------
// Initiate Payment
// ---------------------------------------------------------------------------
export interface InitiatePaymentInput {
  amount:        number   // BHD, 3 decimal places
  description:   string   // shown on payment page
  orderNumber:   string   // stored in udf2 — returned as-is in callback
  notifyUrl:     string   // where ePays redirects user after payment
  lang?:         'en' | 'ar'
  // Customer
  fullName:      string
  mobile?:       string
  email?:        string
  country?:      string
  city?:         string
  customerIp?:   string
  customerAgent?: string
}

export interface InitiatePaymentResult {
  success:      boolean
  redirectUrl?: string   // send user here to complete payment
  errorCode?:   string
}

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  type ApiResponse = { status: string; redirect?: string; errorCode?: string }

  let res: ApiResponse
  try {
    res = await epaysPost<ApiResponse>('/API/Initiate', {
      lang:          input.lang     ?? 'ar',
      amount:        input.amount,
      description:   input.description,
      notifyUrl:     input.notifyUrl,
      udf2:          input.orderNumber,          // our reference, echoed back in callback
      fullName:      input.fullName,
      email:         input.email         ?? '',
      mobile:        input.mobile        ?? '',
      phone:         input.mobile        ?? '',
      country:       input.country       ?? 'BH',
      city:          input.city          ?? 'Manama',
      state:         '',
      zipCode:       '',
      addressLine1:  '',
      addressLine2:  '',
      customerAgent: input.customerAgent ?? '',
      customerIp:    input.customerIp    ?? '',
      customerNote:  '',
    })
  } catch (err) {
    console.error('[ePays] initiatePayment error:', err)
    return { success: false, errorCode: 'GATEWAY_UNREACHABLE' }
  }

  if (res.status === 'SUCCESS' && res.redirect) {
    return { success: true, redirectUrl: res.redirect }
  }

  return { success: false, errorCode: res.errorCode ?? 'INITIATE_FAILED' }
}

// ---------------------------------------------------------------------------
// Process Payment (called in callback after user returns from payment page)
// ---------------------------------------------------------------------------
export interface ProcessPaymentResult {
  success:          boolean
  result?:          'Completed' | 'Failed' | ''
  paymentId?:       string
  orderNumber?:     string   // from udf2
  amount?:          number
  alreadyProcessed: boolean  // ePays processed flag > 0 → we already handled this
  responseDesc?:    string
  errorCode?:       string
}

export async function processPayment(
  paymentId: string,
): Promise<ProcessPaymentResult> {
  type ApiResponse = {
    status:     string
    errorCode?: string
    data?: {
      paymentId:    string
      udf2:         string
      result:       string
      amount:       number
      processed:    number
      responseCode: string
      responseDesc: string
    }
  }

  let res: ApiResponse
  try {
    res = await epaysPost<ApiResponse>('/API/ProcessPayment', { paymentId })
  } catch (err) {
    console.error('[ePays] processPayment error:', err)
    return { success: false, alreadyProcessed: false, errorCode: 'GATEWAY_UNREACHABLE' }
  }

  if (res.status !== 'SUCCESS' || !res.data) {
    return {
      success:          false,
      alreadyProcessed: false,
      errorCode:        res.errorCode ?? 'PROCESS_FAILED',
    }
  }

  const d = res.data
  return {
    success:          true,
    result:           d.result as 'Completed' | 'Failed' | '',
    paymentId:        d.paymentId,
    orderNumber:      d.udf2,
    amount:           d.amount,
    alreadyProcessed: d.processed > 0,
    responseDesc:     d.responseDesc,
  }
}
