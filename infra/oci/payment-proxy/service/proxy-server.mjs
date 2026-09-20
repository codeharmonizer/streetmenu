#!/usr/bin/env node
import http from 'node:http'

const DEFAULT_PORT = 3001
const LIVE_EPAYS_API_BASE_URL = 'https://api.epays.io'
const TEST_EPAYS_API_BASE_URL = 'https://testapi.epays.io'
const ALLOWED_ENDPOINTS = new Set(['/API/Initiate', '/API/ProcessPayment'])

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function getTargetBaseUrl(mode) {
  const explicitBaseUrl = process.env.EPAYS_API_BASE_URL?.trim()
  if (explicitBaseUrl) return trimTrailingSlash(explicitBaseUrl)

  const normalizedMode = (mode || process.env.EPAYS_MODE_TYPE || 'live').toLowerCase()
  return normalizedMode === 'test' ? TEST_EPAYS_API_BASE_URL : LIVE_EPAYS_API_BASE_URL
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

function sendText(res, status, body) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

function isAuthorized(req) {
  const secret = process.env.PAYMENT_PROXY_SECRET
  if (!secret) return false
  const expected = `Bearer ${secret}`
  return req.headers.authorization === expected
}

async function readRequestBody(req) {
  const chunks = []
  let size = 0
  const maxBytes = Number(process.env.MAX_BODY_BYTES || 64 * 1024)

  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) {
      const error = new Error('BODY_TOO_LARGE')
      error.status = 413
      throw error
    }
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}

async function forwardToEpays(endpoint, body, req) {
  const mode = req.headers['x-epays-mode']
  const targetUrl = `${getTargetBaseUrl(Array.isArray(mode) ? mode[0] : mode)}${endpoint}`

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'accept': 'application/json, text/plain, */*',
      'user-agent': 'RelaxedMenu-OCI-Payment-Proxy/1.0',
    },
    body,
    cache: 'no-store',
  })

  const text = await response.text()
  return {
    status: response.status,
    contentType: response.headers.get('content-type') || 'application/json; charset=utf-8',
    text,
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url || '/', 'http://localhost')

  if (req.method === 'GET' && url.pathname === '/health') {
    sendText(res, 200, 'ok\n')
    return
  }

  if (req.method !== 'POST' || !ALLOWED_ENDPOINTS.has(url.pathname)) {
    sendJson(res, 404, { error: 'not_found' })
    return
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: 'unauthorized' })
    return
  }

  const contentType = req.headers['content-type'] || ''
  if (!String(contentType).toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    sendJson(res, 415, { error: 'unsupported_media_type' })
    return
  }

  try {
    const body = await readRequestBody(req)
    const upstream = await forwardToEpays(url.pathname, body, req)
    res.writeHead(upstream.status, {
      'content-type': upstream.contentType,
      'cache-control': 'no-store',
    })
    res.end(upstream.text)
  } catch (err) {
    const status = Number(err?.status || 502)
    const code = err instanceof Error ? err.message : 'proxy_error'
    console.error('[payment-proxy] request failed', { endpoint: url.pathname, code })
    sendJson(res, status, { error: code })
  }
}

export function createServer() {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error('[payment-proxy] unhandled error', err)
      sendJson(res, 500, { error: 'internal_error' })
    })
  })
}

export { getTargetBaseUrl, handleRequest }

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || DEFAULT_PORT)
  const server = createServer()
  server.listen(port, '127.0.0.1', () => {
    console.log(`[payment-proxy] listening on 127.0.0.1:${port}`)
  })
}
