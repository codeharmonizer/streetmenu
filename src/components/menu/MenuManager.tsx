'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ImageIcon, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, Vendor } from '@/types'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Props {
  vendor: Vendor
  initialItems: MenuItem[]
}

const EMPTY_FORM = { name: '', description: '', price: '', category: '', available: true }

export default function MenuManager({ vendor, initialItems }: Props) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowForm(true)
  }

  function openEdit(item: MenuItem) {
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      available: item.available,
    })
    setPhotoFile(null)
    setPhotoPreview(item.photo_url)
    setShowForm(true)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let photoUrl = editing?.photo_url || null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${vendor.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('menu-photos')
        .upload(path, photoFile, { upsert: true })

      if (uploadError) {
        toast.error('Photo upload failed')
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('menu-photos').getPublicUrl(path)
      photoUrl = urlData.publicUrl
    }

    const payload = {
      vendor_id: vendor.id,
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category: form.category || null,
      available: form.available,
      photo_url: photoUrl,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('menu_items')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      if (error) { toast.error('Failed to update'); setSaving(false); return }
      setItems(prev => prev.map(i => i.id === editing.id ? data : i))
      toast.success('Item updated')
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(payload)
        .select()
        .single()

      if (error) { toast.error('Failed to add item'); setSaving(false); return }
      setItems(prev => [...prev, data])
      toast.success('Item added!')
    }

    setSaving(false)
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Item removed')
  }

  async function toggleAvailable(item: MenuItem) {
    const { error } = await supabase
      .from('menu_items')
      .update({ available: !item.available })
      .eq('id', item.id)
    if (error) { toast.error('Failed to update'); return }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i))
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>Menu</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {editing ? 'Edit item' : 'New item'}
            </h2>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" placeholder="e.g. Chicken Shawarma" required
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Price (BHD) *</label>
                <input className="input" type="number" step="0.001" min="0" placeholder="0.500" required
                  value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="What's in it?"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" placeholder="e.g. Sandwiches, Drinks, Desserts"
                value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
            </div>

            {/* Photo upload */}
            <div>
              <label className="label">Photo</label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={photoPreview} alt="preview" fill className="object-cover" />
                    <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                      <X size={10} color="white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}>
                    <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <label className="btn-secondary cursor-pointer text-xs">
                  {photoPreview ? 'Change photo' : 'Upload photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                <Check size={15} />
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add item'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="font-semibold mb-1">No items yet</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Add your first dish to go live</p>
          <button onClick={openAdd} className="btn-primary mx-auto">
            <Plus size={15} /> Add first item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              {item.photo_url ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <Image src={item.photo_url} alt={item.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ background: 'var(--surface-2)' }}>🍽️</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{item.name}</p>
                  {item.category && (
                    <span className="badge text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                      {item.category}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                )}
                <p className="text-sm font-bold mt-1" style={{ color: 'var(--brand)' }}>{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleAvailable(item)} title={item.available ? 'Mark sold out' : 'Mark available'}>
                  {item.available
                    ? <ToggleRight size={22} style={{ color: 'var(--brand)' }} />
                    : <ToggleLeft size={22} style={{ color: 'var(--text-muted)' }} />}
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                  <Pencil size={14} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
