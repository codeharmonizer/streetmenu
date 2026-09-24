// Pure helpers for the menu importer. Plain JS so `node` can run the CLI with no build step.
// Slug/username rules mirror src/lib/vendor-slugs.ts and src/lib/vendor-usernames.ts
// (tests/menu-import.test.ts keeps them in sync).

export const FREE_ITEM_LIMIT = 5
const MAX_NAME = 120
const MAX_DESCRIPTION = 500

export function normalizeSlug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function normalizeUsername(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 40)
}

function text(value, max) {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  return trimmed ? trimmed.slice(0, max) : null
}

// Accepts 1.5, "1.500", "1.500 BD", "1,5", "د.ب 1.500" → 1.5
export function parsePrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? Math.round(value * 1000) / 1000 : null
  if (typeof value !== 'string') return null
  const western = value.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', '.')
  const match = western.replace(',', '.').match(/\d+(?:\.\d+)?/)
  if (!match) return null
  const price = Number(match[0])
  return Number.isFinite(price) ? Math.round(price * 1000) / 1000 : null
}

/**
 * Validate a menu spec written by an agent and turn it into DB-ready rows.
 * Returns { vendor, items, warnings } or throws with every problem listed.
 */
export function buildImportPlan(spec, { itemLimit = FREE_ITEM_LIMIT } = {}) {
  const errors = []
  const warnings = []
  const v = spec?.vendor ?? {}

  const name = text(v.name, MAX_NAME)
  if (!name) errors.push('vendor.name is required')

  // Arabic-only names slugify to nothing, so fall back to the Instagram handle.
  const handle = normalizeUsername(String(v.instagram ?? '').replace(/^@/, '').replace(/^.*instagram\.com\//, '').replace(/[/?#].*$/, ''))
  const slug = normalizeSlug(v.slug || '') || normalizeSlug(name || '') || normalizeSlug(handle.replace(/_/g, '-'))
  if (!slug) errors.push('vendor.slug is required when the name has no Latin letters (use the Instagram handle, e.g. "karak-house")')
  const username = normalizeUsername(v.username || '') || handle || normalizeUsername(slug.replace(/-/g, ''))

  const rawItems = Array.isArray(spec?.items) ? spec.items : []
  if (rawItems.length === 0) errors.push('items must contain at least one menu item')

  const items = []
  rawItems.forEach((raw, index) => {
    const label = `items[${index}]`
    const itemName = text(raw?.name, MAX_NAME)
    const price = parsePrice(raw?.price)
    if (!itemName) { errors.push(`${label}.name is required`); return }
    if (price === null) { errors.push(`${label} "${itemName}": price is missing or unreadable (${JSON.stringify(raw?.price)})`); return }
    if (price > 100) warnings.push(`${label} "${itemName}": price ${price} BD looks high — check it is not in fils`)
    items.push({
      name: itemName,
      description: text(raw?.description, MAX_DESCRIPTION),
      price,
      category: text(raw?.category, 60),
      photo: text(raw?.photo, 2000),
      available: raw?.available !== false,
    })
  })

  const seen = new Set()
  for (const item of items) {
    const key = `${item.category ?? ''}::${item.name.toLowerCase()}`
    if (seen.has(key)) warnings.push(`Duplicate item "${item.name}"${item.category ? ` in ${item.category}` : ''}`)
    seen.add(key)
  }

  if (errors.length) throw new Error(`Menu spec is invalid:\n  - ${errors.join('\n  - ')}`)

  // Keep the menu's own order, but group items by category (first appearance wins).
  const categoryOrder = []
  for (const item of items) if (!categoryOrder.includes(item.category)) categoryOrder.push(item.category)
  const ordered = categoryOrder.flatMap(category => items.filter(item => item.category === category))

  let kept = ordered
  if (itemLimit !== Infinity && ordered.length > itemLimit) {
    warnings.push(`Free plan: importing the first ${itemLimit} of ${ordered.length} items. Use --trial-days to import the full menu.`)
    kept = ordered.slice(0, itemLimit)
  }

  return {
    vendor: {
      name,
      slug,
      username: username || 'vendor',
      description: text(v.description, MAX_DESCRIPTION),
      category: text(v.category, 60),
      address: text(v.address, 200),
      phone: text(v.phone, 30)?.replace(/[^\d+]/g, '') || null,
      hours: text(v.hours, 200),
      logo: text(v.logo, 2000),
    },
    items: kept.map((item, sortOrder) => ({ ...item, sort_order: sortOrder })),
    skipped: ordered.length - kept.length,
    warnings,
  }
}

export function outreachMessage({ vendorName, url, language = 'ar' }) {
  if (language === 'en') {
    return `Hi ${vendorName} 👋\nI'm from Relaxed Menu, a Bahraini digital menu platform. I built you a free QR menu to try:\n👉 ${url}\n\nCustomers scan, see your dishes and prices, and order on your WhatsApp. If you like it, I'll drop off a printed QR stand for free 🙏`
  }
  return `هلا ${vendorName} 👋\nأنا من Relaxed Menu — منصة بحرينية للمنيو الرقمي. سويت لكم منيو QR مجاناً عشان تشوفونه:\n👉 ${url}\n\nالزبون يمسح الكود ويشوف الأصناف والأسعار ويطلب على الواتساب مباشرة. إذا عجبكم، أرسل لكم ستاند QR مطبوع هدية 🙏`
}
