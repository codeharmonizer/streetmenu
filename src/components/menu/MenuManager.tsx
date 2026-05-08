'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ImageIcon, X, Check, ChevronUp, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, Vendor, isPaid, FREE_ITEM_LIMIT } from '@/types'
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

  const supabase   = createClient()
  const subscribed = isPaid(vendor)
  const atLimit    = !subscribed && items.length >= FREE_ITEM_LIMIT

  function openAdd() {
    if (atLimit) {
      toast.error(`الخطة المجانية تسمح بـ ${FREE_ITEM_LIMIT} أصناف فقط. اشترك للمزيد.`)
      return
    }
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
        toast.error('فشل رفع الصورة')
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

      if (error) { toast.error('فشل التحديث'); setSaving(false); return }
      setItems(prev => prev.map(i => i.id === editing.id ? data : i))
      toast.success('تم تحديث الصنف')
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(payload)
        .select()
        .single()

      if (error) { toast.error('فشل إضافة الصنف'); setSaving(false); return }
      setItems(prev => [...prev, data])
      toast.success('تمت إضافة الصنف!')
    }

    setSaving(false)
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا الصنف؟')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) { toast.error('فشل الحذف'); return }
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('تم حذف الصنف')
  }

  async function moveItem(index: number, direction: 'up' | 'down') {
    const newItems = [...items]
    const swapIdx  = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= newItems.length) return

    // Swap in local state
    ;[newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]]

    // Assign sequential sort_order values
    const updates = newItems.map((item, i) => ({ id: item.id, sort_order: i }))
    setItems(newItems)

    // Persist to DB
    await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from('menu_items').update({ sort_order }).eq('id', id)
      )
    )
  }

  async function toggleAvailable(item: MenuItem) {
    const { error } = await supabase
      .from('menu_items')
      .update({ available: !item.available })
      .eq('id', item.id)
    if (error) { toast.error('فشل التحديث'); return }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i))
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>القائمة</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {items.length} {items.length === 1 ? 'صنف' : 'أصناف'}
            {!subscribed && (
              <span className="mr-2 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: atLimit ? '#fee2e2' : 'var(--brand-light)', color: atLimit ? '#dc2626' : 'var(--brand)' }}>
                {items.length}/{FREE_ITEM_LIMIT} مجاني
              </span>
            )}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary" disabled={atLimit}
          style={atLimit ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
          <Plus size={16} /> إضافة صنف
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {editing ? 'تعديل الصنف' : 'صنف جديد'}
            </h2>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">الاسم *</label>
                <input className="input" placeholder="مثال: شاورما دجاج" required
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">السعر (د.ب.) *</label>
                <input className="input" type="number" step="0.001" min="0" placeholder="0.500" required
                  value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">الوصف</label>
              <textarea className="input resize-none" rows={2} placeholder="ماذا يحتوي؟"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">الفئة</label>
              <input className="input" placeholder="مثال: سندويشات، مشروبات، حلويات"
                value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
            </div>

            {/* Photo upload */}
            <div>
              <label className="label">الصورة</label>
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
                  {photoPreview ? 'تغيير الصورة' : 'رفع صورة'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                <Check size={15} />
                {saving ? 'جارٍ الحفظ…' : editing ? 'حفظ التغييرات' : 'إضافة صنف'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="font-semibold mb-1">لا توجد أصناف بعد</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>أضف أول صنف لتفعيل قائمتك</p>
          <button onClick={openAdd} className="btn-primary mx-auto">
            <Plus size={15} /> إضافة أول صنف
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
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
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveItem(index, 'up')} disabled={index === 0}
                    className="p-1 rounded hover:bg-[var(--surface-2)] disabled:opacity-20 transition-colors">
                    <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1}
                    className="p-1 rounded hover:bg-[var(--surface-2)] disabled:opacity-20 transition-colors">
                    <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <button onClick={() => toggleAvailable(item)} title={item.available ? 'علّم كنافد' : 'علّم كمتوفر'}>
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
