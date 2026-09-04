/**
 * ePays payment gateway client — server-only, never import from client components.
 *
 * API version: 3.3
 * Docs: https://epays.io  |  Live API: https://api.epays.io
 *
 * Auth model (two-level):
 *   Master credentials  → apiId + apiMasterKey  (merchant management calls)
 *   Gateway credentials → apiId + apiKey + merchantGateway  (payment calls)
 *
 *   For Relaxed Menu we use apiMasterKey directly in Initiate (single-merchant mode,
 *   matching the PHP sample's master flow in initiate_payment.php).
 *   If ePays later provides a dedicated apiKey + merchantGateway, set those env
 *   vars and they will take precedence automatically.
 *
 * Key endpoints:
 *   POST /API/Initiate        — create a payment session, get redirect URL
 *   POST /API/ProcessPayment  — verify result after user returns from payment page
 */

import { getAppUrl, getMerchantDomain } from '@/lib/app-url'

const BASE_URLS: Record<string, string> = {
  localhost: 'https://localhost:7124',
  localip:   'https://192.168.100.115:8081',
  test:      'https://testapi.epays.io',
  live:      'https://api.epays.io',
}

// ---------------------------------------------------------------------------
// Config — read from env vars
// ---------------------------------------------------------------------------
function getConfig() {
  const modeType = process.env.EPAYS_MODE_TYPE ?? 'live'

  return {
    apiUrl:          BASE_URLS[modeType] ?? BASE_URLS.live,
    apiVersion:      process.env.EPAYS_API_VERSION      ?? '3.3',
    apiId:           process.env.EPAYS_API_ID            ?? '',
    apiMasterKey:    process.env.EPAYS_API_MASTER_KEY    ?? '',
    // Gateway-scoped (optional — only needed if ePays provides them separately)
    apiKey:          process.env.EPAYS_API_KEY           ?? '',
    merchantGateway: process.env.EPAYS_MERCHANT_GATEWAY  ?? '',
    testMode:        Number(process.env.EPAYS_TEST_MODE  ?? 0),
    modeType,
  }
}

// ---------------------------------------------------------------------------
// Base envelope — mirrors PayAPI.php amendData()
// Only includes a field if it has a non-empty value (avoids sending blanks)
// ---------------------------------------------------------------------------
function basePayload(cfg: ReturnType<typeof getConfig>): Record<string, string> {
  const appUrl = getAppUrl()
  // EPAYS_MERCHANT_DOMAIN must match exactly what is registered in ePays dashboard
  const domain = getMerchantDomain()

  const payload: Record<string, string> = {
    apiVersion:     cfg.apiVersion,
    apiId:          cfg.apiId,
    merchantDomain: domain,
    merchantUrl:    appUrl,
    testMode:       String(cfg.testMode),
  }

  // Send apiMasterKey when present (master-merchant flow)
  if (cfg.apiMasterKey) payload.apiMasterKey = cfg.apiMasterKey

  // Send apiKey + merchantGateway only when both are provided (gateway flow)
  if (cfg.apiKey)           payload.apiKey          = cfg.apiKey
  if (cfg.merchantGateway)  payload.merchantGateway = cfg.merchantGateway

  return payload
}

// ---------------------------------------------------------------------------
// Low-level POST helper — form-encoded, matches PHP cURL sample exactly
// ---------------------------------------------------------------------------
async function epaysPost<T>(
  endpoint: string,
  data: Record<string, string | number>,
): Promise<T> {
  const cfg = getConfig()
  const url = `${cfg.apiUrl}${endpoint}`

  const merged: Record<string, string> = {}
  for (const [k, v] of Object.entries({ ...basePayload(cfg), ...data })) {
    merged[k] = String(v)
  }

  console.log(`[ePays] POST ${url}`, {
    apiId:          merged.apiId,
    merchantDomain: merged.merchantDomain,
    hasMasterKey:   !!merged.apiMasterKey,
    hasApiKey:      !!merged.apiKey,
    testMode:       merged.testMode,
    endpoint,
  })

  let res: Response
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams(merged),
      cache:   'no-store',
    })
  } catch (networkErr) {
    console.error(`[ePays] Network error reaching ${url}:`, networkErr)
    throw new Error('GATEWAY_UNREACHABLE')
  }

  const text = await res.text()
  console.log(`[ePays] Response ${res.status}:`, text.slice(0, 300))

  if (!res.ok) {
    throw new Error(`GATEWAY_HTTP_${res.status}`)
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('GATEWAY_INVALID_JSON')
  }
}

// ---------------------------------------------------------------------------
// Initiate Payment
// ---------------------------------------------------------------------------
export interface InitiatePaymentInput {
  amount:         number   // BHD, 3 decimal places
  description:    string
  orderNumber:    string   // stored in udf2 — echoed back in callback
  notifyUrl:      string
  lang?:          'en' | 'ar'
  fullName:       string
  mobile?:        string
  email?:         string
  country?:       string
  city?:          string
  customerIp?:    string
  customerAgent?: string
}

export interface InitiatePaymentResult {
  success:      boolean
  redirectUrl?: string
  errorCode?:   string
}

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  type ApiResponse = { status: string; redirect?: string; errorCode?: string }

  let res: ApiResponse
  try {
    res = await epaysPost<ApiResponse>('/API/Initiate', {
      lang:          input.lang          ?? 'ar',
      amount:        input.amount,
      description:   input.description,
      notifyUrl:     input.notifyUrl,
      udf2:          input.orderNumber,
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
    const code = err instanceof Error ? err.message : 'GATEWAY_UNREACHABLE'
    console.error('[ePays] initiatePayment threw:', code)
    return { success: false, errorCode: code }
  }

  if (res.status === 'SUCCESS' && res.redirect) {
    return { success: true, redirectUrl: res.redirect }
  }

  console.error('[ePays] initiatePayment API failure:', res)
  return { success: false, errorCode: res.errorCode ?? 'INITIATE_FAILED' }
}

// ---------------------------------------------------------------------------
// Process Payment
// ---------------------------------------------------------------------------
export interface ProcessPaymentResult {
  success:          boolean
  result?:          string
  paymentId?:       string
  orderNumber?:     string
  amount?:          number
  alreadyProcessed: boolean
  responseCode?:    string
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
    const code = err instanceof Error ? err.message : 'GATEWAY_UNREACHABLE'
    console.error('[ePays] processPayment threw:', code)
    return { success: false, alreadyProcessed: false, errorCode: code }
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
    result:           d.result,
    paymentId:        d.paymentId,
    orderNumber:      d.udf2,
    amount:           d.amount,
    alreadyProcessed: d.processed > 0,
    responseCode:     d.responseCode,
    responseDesc:     d.responseDesc,
  }
}
