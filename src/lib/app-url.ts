const CANONICAL_APP_URL = 'https://relaxedmenu.beyounded.com'

const LEGACY_APP_HOSTS = new Set([
  'scanbite-menu.vercel.app',
  'streetmenu-ten.vercel.app',
])

function cleanUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

export function getAppUrl(): string {
  const configured = cleanUrl(process.env.NEXT_PUBLIC_APP_URL ?? '')
  if (!configured) return CANONICAL_APP_URL

  try {
    const url = new URL(configured)
    if (LEGACY_APP_HOSTS.has(url.hostname)) return CANONICAL_APP_URL
    return configured
  } catch {
    return CANONICAL_APP_URL
  }
}

export function getMerchantDomain(): string {
  const configured = (process.env.EPAYS_MERCHANT_DOMAIN ?? '').trim()
  if (configured && !LEGACY_APP_HOSTS.has(configured)) return configured
  return new URL(getAppUrl()).hostname
}
