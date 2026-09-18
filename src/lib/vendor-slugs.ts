import { slugify } from '@/lib/utils'

export function normalizeVendorSlug(value: string): string {
  return slugify(value).slice(0, 80)
}

export function buildAvailableSlug(nameOrSlug: string, existingSlugs: string[]): string {
  const base = normalizeVendorSlug(nameOrSlug) || 'menu'
  const taken = new Set(existingSlugs.map(slug => slug.toLowerCase()))

  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

type SlugLookupClient = {
  from: (table: 'vendors') => {
    select: (columns: string) => {
      ilike: (column: string, pattern: string) => PromiseLike<{ data: Array<{ slug: string }> | null; error: { message: string } | null }>
    }
  }
}

export async function generateAvailableVendorSlug(supabase: SlugLookupClient, vendorName: string): Promise<string> {
  const base = normalizeVendorSlug(vendorName) || 'menu'
  const { data, error } = await supabase
    .from('vendors')
    .select('slug')
    .ilike('slug', `${base}%`)

  if (error) throw new Error(error.message)

  const suffixPattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+$`)
  const matchingSlugs = (data ?? [])
    .map(row => row.slug)
    .filter(slug => slug === base || suffixPattern.test(slug))

  return buildAvailableSlug(base, matchingSlugs)
}
