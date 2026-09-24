import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import CreateManagedVendorForm from '@/components/admin/CreateManagedVendorForm'

export default async function EditAdminVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: vendor } = await supabase.from('vendors').select('*').eq('id', id).single()

  if (!vendor) notFound()

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/vendors" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>← Back to vendors</Link>
          <h1 className="mt-3 text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#0f172a' }}>
            Edit {vendor.name}
          </h1>
          <p className="mt-1 text-slate-500">Manage vendor profile, contact details, and invitation email.</p>
        </div>
        <Link href={`/admin/vendors/${vendor.id}/menu`} className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white">
          Manage menu
        </Link>
      </div>
      <CreateManagedVendorForm mode="edit" vendor={vendor} />
    </div>
  )
}
