import Link from 'next/link'
import CreateManagedVendorForm from '@/components/admin/CreateManagedVendorForm'

export default function NewAdminVendorPage() {
  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/vendors" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>← Back to vendors</Link>
        <h1 className="mt-3 text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#0f172a' }}>
          Create managed vendor
        </h1>
        <p className="mt-1 text-slate-500">Create a restaurant account and menu without requiring vendor email login yet.</p>
      </div>
      <CreateManagedVendorForm mode="create" />
    </div>
  )
}
