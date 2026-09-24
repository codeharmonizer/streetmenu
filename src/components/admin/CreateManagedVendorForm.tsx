'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Vendor } from '@/types'
import { createManagedVendor, updateManagedVendor, uploadAdminVendorImage } from '@/app/admin/vendors/actions'
import { normalizeVendorSlug } from '@/lib/vendor-slugs'
import { normalizeVendorUsername } from '@/lib/vendor-usernames'

type Props = {
  vendor?: Vendor
  mode: 'create' | 'edit'
}

export default function CreateManagedVendorForm({ vendor, mode }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(vendor?.name ?? '')
  const [username, setUsername] = useState(vendor?.username ?? '')
  const [slug, setSlug] = useState(vendor?.slug ?? '')
  const [logoUrl, setLogoUrl] = useState(vendor?.logo_url ?? '')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  function syncHandles(nextName: string) {
    setName(nextName)
    if (!vendor && !username) setUsername(normalizeVendorUsername(nextName))
    if (!vendor && !slug) setSlug(normalizeVendorSlug(nextName))
  }

  async function handleLogoUpload(file: File) {
    if (!vendor?.id) {
      toast.error('Create the vendor first, then upload the logo from edit mode.')
      return
    }

    setUploadingLogo(true)
    const formData = new FormData()
    formData.set('file', file)
    formData.set('kind', 'logo')
    const result = await uploadAdminVendorImage(vendor.id, formData)
    setUploadingLogo(false)

    if (!result.ok || !result.publicUrl) {
      toast.error(result.ok ? 'Logo upload failed' : result.error)
      return
    }

    setLogoUrl(result.publicUrl)
    toast.success('Logo uploaded')
  }

  function submit(formData: FormData) {
    formData.set('username', normalizeVendorUsername(username || name))
    formData.set('slug', normalizeVendorSlug(slug || name))
    formData.set('logo_url', logoUrl)

    startTransition(async () => {
      const result = mode === 'create'
        ? await createManagedVendor(formData)
        : await updateManagedVendor(vendor!.id, formData)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(result.inviteSent
        ? 'Vendor saved and invite email sent'
        : mode === 'create' ? 'Vendor created' : 'Vendor updated')
      router.push(result.vendorId ? `/admin/vendors/${result.vendorId}/edit` : '/admin/vendors')
      router.refresh()
    })
  }

  return (
    <form action={submit} className="space-y-6 max-w-3xl">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Restaurant name *</span>
          <input name="name" required value={name} onChange={e => syncHandles(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Username *</span>
          <input name="username" required value={username} onChange={e => setUsername(normalizeVendorUsername(e.target.value))} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
          <span className="text-xs text-slate-400">Internal handle; email/login can be attached later.</span>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Public menu slug *</span>
          <input name="slug" required value={slug} onChange={e => setSlug(normalizeVendorSlug(e.target.value))} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
          <span className="text-xs text-slate-400">/m/{slug || 'restaurant-slug'}</span>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Vendor email later/invite</span>
          <input name="invited_email" type="email" defaultValue={vendor?.invited_email ?? ''} className="mt-1 w-full rounded-xl border px-4 py-2.5" placeholder="owner@example.com" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Phone / WhatsApp</span>
          <input name="phone" defaultValue={vendor?.phone ?? ''} className="mt-1 w-full rounded-xl border px-4 py-2.5" placeholder="+973..." />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Category</span>
          <input name="category" defaultValue={vendor?.category ?? ''} className="mt-1 w-full rounded-xl border px-4 py-2.5" placeholder="Restaurant, Café, Bakery..." />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Description</span>
        <textarea name="description" defaultValue={vendor?.description ?? ''} rows={3} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Address</span>
          <input name="address" defaultValue={vendor?.address ?? ''} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Hours</span>
          <input name="hours" defaultValue={vendor?.hours ?? ''} className="mt-1 w-full rounded-xl border px-4 py-2.5" placeholder="10:00 AM - 11:00 PM" />
        </label>
      </div>

      <input type="hidden" name="logo_url" value={logoUrl} />
      {mode === 'edit' && (
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">Logo</p>
          {logoUrl && <img src={logoUrl} alt="Vendor logo" className="mb-3 h-20 w-20 rounded-2xl object-cover" />}
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
          {uploadingLogo && <p className="text-xs text-slate-400 mt-2">Uploading…</p>}
        </div>
      )}

      <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 text-sm text-orange-900">
        This creates a managed vendor without requiring email login. Add an email later to invite/activate vendor self-service.
      </div>

      <button disabled={pending} className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
        {pending ? 'Saving…' : mode === 'create' ? 'Create vendor' : 'Save vendor'}
      </button>
    </form>
  )
}
