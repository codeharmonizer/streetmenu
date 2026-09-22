import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminVendorMenuManager from '@/components/admin/AdminVendorMenuManager'

export default async function AdminVendorMenuPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const [{ data: vendor }, { data: items }] = await Promise.all([
    supabase.from('vendors').select('*').eq('id', params.id).single(),
    supabase
      .from('menu_items')
      .select('*')
      .eq('vendor_id', params.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  if (!vendor) notFound()

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/vendors" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>← Back to vendors</Link>
          <h1 className="mt-3 text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#0f172a' }}>
            Manage menu: {vendor.name}
          </h1>
          <p className="mt-1 text-slate-500">Add categories, menu items, prices, photos, availability, and sort order.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/m/${vendor.slug}`} target="_blank" className="rounded-xl border bg-white px-4 py-2.5 text-sm font-bold text-slate-700">
            View public menu
          </Link>
          <Link href={`/admin/vendors/${vendor.id}/edit`} className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white">
            Edit vendor
          </Link>
        </div>
      </div>
      <AdminVendorMenuManager vendor={vendor} initialItems={items ?? []} />
    </div>
  )
}
