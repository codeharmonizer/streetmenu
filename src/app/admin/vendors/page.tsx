import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import VendorRow from '@/components/admin/VendorRow'
import { Search } from 'lucide-react'

interface Props {
  searchParams: { q?: string; status?: string }
}

export default async function AdminVendorsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const q = searchParams.q?.toLowerCase() ?? ''
  const status = searchParams.status ?? 'all'

  // Fetch all vendors with scan + review counts
  let query = supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (status === 'active')  query = query.eq('is_active', true)
  if (status === 'disabled') query = query.eq('is_active', false)
  if (status === 'paying') query = query.eq('subscription_status', 'active')
  if (status === 'trial')  query = query.eq('subscription_status', 'trial')

  const { data: vendors } = await query

  // Fetch counts for each vendor
  const [{ data: scans }, { data: reviews }] = await Promise.all([
    supabase.from('scans').select('vendor_id'),
    supabase.from('reviews').select('vendor_id'),
  ])

  const scanCounts = (scans ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.vendor_id] = (acc[s.vendor_id] ?? 0) + 1
    return acc
  }, {})

  const reviewCounts = (reviews ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.vendor_id] = (acc[r.vendor_id] ?? 0) + 1
    return acc
  }, {})

  // Fetch emails from auth.users via admin client
  const adminSupabase = createAdminClient()
  const { data: { users } } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 })
  const emailByUserId = Object.fromEntries((users ?? []).map(u => [u.id, u.email ?? '']))

  const enriched = (vendors ?? [])
    .map(v => ({
      ...v,
      scan_count: scanCounts[v.id] ?? 0,
      review_count: reviewCounts[v.id] ?? 0,
      email: emailByUserId[v.user_id] ?? '',
    }))
    .filter(v => !q || v.name.toLowerCase().includes(q) || v.slug.toLowerCase().includes(q) || v.email.toLowerCase().includes(q))

  const tabs = [
    { label: 'All',      value: 'all',      count: vendors?.length ?? 0 },
    { label: 'Active',   value: 'active',   count: vendors?.filter(v => v.is_active).length ?? 0 },
    { label: 'Disabled', value: 'disabled', count: vendors?.filter(v => !v.is_active).length ?? 0 },
    { label: '💳 Paying', value: 'paying',  count: vendors?.filter(v => v.subscription_status === 'active').length ?? 0 },
    { label: '🔬 Trial',  value: 'trial',   count: vendors?.filter(v => v.subscription_status === 'trial').length ?? 0 },
  ]

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: '#0f172a' }}>
          Vendors
        </h1>
        <p style={{ color: '#64748b' }}>Manage vendor visibility and reviews.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#f1f5f9' }}>
          {tabs.map(tab => (
            <a key={tab.value}
              href={`/admin/vendors?status=${tab.value}${q ? `&q=${q}` : ''}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={status === tab.value
                ? { background: 'white', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#64748b' }}>
              {tab.label}
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: status === tab.value ? '#f1f5f9' : 'transparent', color: '#94a3b8' }}>
                {tab.count}
              </span>
            </a>
          ))}
        </div>

        {/* Search */}
        <form method="get" action="/admin/vendors" className="flex-1 max-w-xs">
          <input type="hidden" name="status" value={status} />
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search vendors…"
              className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border"
              style={{ borderColor: '#e2e8f0', background: 'white', color: '#0f172a' }}
            />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-x-auto" style={{ borderColor: '#e2e8f0' }}>
        {enriched.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold" style={{ color: '#0f172a' }}>No vendors found</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: '#f1f5f9', color: '#94a3b8', background: '#f8fafc' }}>
                <th className="px-4 py-3 text-right whitespace-nowrap">Vendor</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Slug</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Scans</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Reviews</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Joined</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Subscription</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Active</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map(vendor => (
                <VendorRow key={vendor.id} vendor={vendor} email={vendor.email} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs mt-3 text-right" style={{ color: '#94a3b8' }}>
        {enriched.length} vendor{enriched.length !== 1 ? 's' : ''} shown
      </p>
    </div>
  )
}
