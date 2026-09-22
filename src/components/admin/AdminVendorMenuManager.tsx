'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import type { MenuItem, Vendor } from '@/types'
import { createAdminMenuItem, deleteAdminMenuItem, updateAdminMenuItem, uploadAdminVendorImage } from '@/app/admin/vendors/actions'

type Props = {
  vendor: Vendor
  initialItems: MenuItem[]
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  photo_url: '',
  sort_order: '0',
  available: true,
}

export default function AdminVendorMenuManager({ vendor, initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  function edit(item: MenuItem) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      category: item.category ?? '',
      photo_url: item.photo_url ?? '',
      sort_order: String(item.sort_order),
      available: item.available,
    })
  }

  function reset() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function upload(file: File) {
    setUploading(true)
    const data = new FormData()
    data.set('file', file)
    data.set('kind', 'item')
    const result = await uploadAdminVendorImage(vendor.id, data)
    setUploading(false)

    if (!result.ok || !result.publicUrl) {
      toast.error(result.ok ? 'Image upload failed' : result.error)
      return
    }

    setForm(prev => ({ ...prev, photo_url: result.publicUrl! }))
    toast.success('Image uploaded')
  }

  function submit(data: FormData) {
    data.set('available', String(form.available))
    data.set('photo_url', form.photo_url)

    startTransition(async () => {
      const result = editingId
        ? await updateAdminMenuItem(vendor.id, editingId, data)
        : await createAdminMenuItem(vendor.id, data)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(editingId ? 'Menu item updated' : 'Menu item created')
      window.location.reload()
    })
  }

  async function remove(itemId: string) {
    if (!window.confirm('Delete this menu item?')) return
    const result = await deleteAdminMenuItem(vendor.id, itemId)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setItems(prev => prev.filter(item => item.id !== itemId))
    toast.success('Menu item deleted')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form action={submit} className="rounded-2xl border bg-white p-5 space-y-4 h-fit">
        <h2 className="font-black text-xl">{editingId ? 'Edit menu item' : 'Add menu item'}</h2>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Name *</span>
          <input name="name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Price *</span>
          <input name="price" required type="number" min="0" step="0.001" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Category</span>
          <input name="category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea name="description" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Sort order</span>
          <input name="sort_order" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
          Available
        </label>
        <input type="hidden" name="photo_url" value={form.photo_url} />
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Photo</p>
          {form.photo_url && <img src={form.photo_url} alt="Item" className="mb-3 h-24 w-24 rounded-2xl object-cover" />}
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
          {uploading && <p className="text-xs text-slate-400 mt-2">Uploading…</p>}
        </div>
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {pending ? 'Saving…' : editingId ? 'Save item' : 'Add item'}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button>}
        </div>
      </form>

      <div className="rounded-2xl border bg-white overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No menu items yet.</div>
        ) : (
          <div className="divide-y">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                {item.photo_url ? <img src={item.photo_url} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <div className="h-16 w-16 rounded-xl bg-slate-100" />}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.category || 'Uncategorised'} · {Number(item.price).toFixed(3)} BHD · {item.available ? 'Available' : 'Hidden'}</p>
                </div>
                <button onClick={() => edit(item)} className="rounded-lg border px-3 py-1.5 text-sm font-semibold">Edit</button>
                <button onClick={() => remove(item.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
