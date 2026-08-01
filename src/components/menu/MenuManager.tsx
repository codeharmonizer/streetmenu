'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, ImageIcon, X, Check, ChevronUp, ChevronDown, EyeOff, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, Vendor, isPaid, FREE_ITEM_LIMIT } from '@/types'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useTranslations, useLocale } from 'next-intl'
import CategoryTabs, { categorySectionId } from './CategoryTabs'

interface Props {
  vendor: Vendor
  initialItems: MenuItem[]
}

const EMPTY_FORM = { name: '', description: '', price: '', category: '', available: true }

export default function MenuManager({ vendor, initialItems }: Props) {
  const [items,        setItems]        = useState<MenuItem[]>(initialItems)
  const [showForm,     setShowForm]     = useState(false)
  const [editing,      setEditing]      = useState<MenuItem | null>(null)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [photoFile,    setPhotoFile]    = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving,       setSaving]       = useState(false)

  const t          = useTranslations('menu')
  const locale     = useLocale()
  const isAr       = locale === 'ar'
  const supabase   = createClient()
  const subscribed = isPaid(vendor)
  const atLimit    = !subscribed && items.length >= FREE_ITEM_LIMIT

  // Unique existing categories derived from current items
  const existingCategories = useMemo(() => {
    const cats = items.map(i => i.category).filter(Boolean) as string[]
    return [...new Set(cats)]
  }, [items])

  const visibleCategories = useMemo(() => {
    const cats = items.map(i => i.category || 'Other')
    return [...new Set(cats)]
  }, [items])

  const groupedItems = useMemo(() => {
    return visibleCategories.reduce<Record<string, MenuItem[]>>((acc, category) => {
      acc[category] = items.filter(item => (item.category || 'Other') === category)
      return acc
    }, {})
  }, [items, visibleCategories])

  function openAdd() {
    if (atLimit) {
      toast.error(t('limitReached', { limit: FREE_ITEM_LIMIT }))
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
      name:        item.name,
      description: item.description || '',
      price:       item.price.toString(),
      category:    item.category || '',
      available:   item.available,
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
      const ext  = photoFile.name.split('.').pop()
      const path = `${vendor.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('menu-photos')
        .upload(path, photoFile, { upsert: true })

      if (uploadError) {
        toast.error(t('uploadFailed'))
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('menu-photos').getPublicUrl(path)
      photoUrl = urlData.publicUrl
    }

    const payload = {
      vendor_id:   vendor.id,
      name:        form.name,
      description: form.description || null,
      price:       parseFloat(form.price),
      category:    form.category || null,
      available:   form.available,
      sort_order:  editing?.sort_order ?? items.length,
      photo_url:   photoUrl,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('menu_items')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      if (error) { toast.error(t('updateFailed')); setSaving(false); return }
      setItems(prev => prev.map(i => i.id === editing.id ? data : i))
      toast.success(t('updated'))
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(payload)
        .select()
        .single()

      if (error) { toast.error(t('addFailed')); setSaving(false); return }
      setItems(prev => [...prev, data])
      toast.success(t('added'))
    }

    setSaving(false)
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) { toast.error(t('deleteFailed')); return }
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success(t('deleted'))
  }

  async function moveItem(index: number, direction: 'up' | 'down') {
    const newItems = [...items]
    const swapIdx  = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= newItems.length) return

    ;[newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]]

    const reordered = newItems.map((item, i) => ({ ...item, sort_order: i }))
    const updates = reordered.map((item, i) => ({ id: item.id, sort_order: i }))
    setItems(reordered)

    await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from('menu_items').update({ sort_order }).eq('id', id)
      )
    )
  }

  async function moveCategory(category: string, direction: 'up' | 'down') {
    const currentIndex = visibleCategories.indexOf(category)
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (currentIndex < 0 || swapIndex < 0 || swapIndex >= visibleCategories.length) return

    const nextCategories = [...visibleCategories]
    ;[nextCategories[currentIndex], nextCategories[swapIndex]] = [nextCategories[swapIndex], nextCategories[currentIndex]]

    const reordered = nextCategories
      .flatMap(cat => groupedItems[cat] ?? [])
      .map((item, index) => ({ ...item, sort_order: index }))
    const updates = reordered.map(item => ({ id: item.id, sort_order: item.sort_order }))

    setItems(reordered)

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
    if (error) { toast.error(t('updateStatusFailed')); return }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i))
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {items.length === 1 ? `1 ${t('oneItem')}` : t('itemsCount', { count: items.length })}
            {!subscribed && (
              <span className="ms-2 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: atLimit ? '#fee2e2' : 'var(--brand-light)', color: atLimit ? '#dc2626' : 'var(--brand)' }}>
                {t('freeLimit', { count: items.length, limit: FREE_ITEM_LIMIT })}
              </span>
            )}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary" disabled={atLimit}
          style={atLimit ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
          <Plus size={16} /> {t('addItem')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {editing ? t('editItem') : t('newItem')}
            </h2>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('itemName')} *</label>
                <input className="input" placeholder={t('itemNamePlaceholder')} required
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">{t('price')} *</label>
                <input className="input" type="number" step="0.001" min="0" placeholder={t('pricePlaceholder')} required
                  value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">{t('description')}</label>
              <textarea className="input resize-none" rows={2} placeholder={t('descriptionPlaceholder')}
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('category')}</label>
              <input className="input" placeholder={t('categoryPlaceholder')}
                value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
              {existingCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {existingCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, category: cat }))}
                      className="text-xs px-2.5 py-1 rounded-full transition-colors"
                      style={{
                        background: form.category === cat ? 'var(--brand)' : 'var(--surface-2)',
                        color:      form.category === cat ? 'white'        : 'var(--text-secondary)',
                        border:     `1px solid ${form.category === cat ? 'var(--brand)' : 'var(--border)'}`,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Photo upload */}
            <div>
              <label className="label">{t('photo')}</label>
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
                  {photoPreview ? t('changePhoto') : t('uploadPhoto')}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                <Check size={15} />
                {saving ? t('saveChanges') : editing ? t('saveChanges') : t('addBtn')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                {/* uses common cancel */}
                ✕
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items by category */}
      {items.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="font-semibold mb-1">{t('emptyTitle')}</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{t('emptyDesc')}</p>
          <button onClick={openAdd} className="btn-primary mx-auto">
            <Plus size={15} /> {t('addFirst')}
          </button>
        </div>
      ) : (
        <>
          <CategoryTabs
            categories={visibleCategories}
            sectionPrefix="vendor-menu-category"
          />
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <section
                key={category}
                id={categorySectionId('vendor-menu-category', category)}
                data-category={category}
                className="scroll-mt-28"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-bold text-sm uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                    {category}
                  </h2>
                  {visibleCategories.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Move ${category} up`}
                        onClick={() => moveCategory(category, 'up')}
                        disabled={visibleCategories.indexOf(category) === 0}
                        className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${category} down`}
                        onClick={() => moveCategory(category, 'down')}
                        disabled={visibleCategories.indexOf(category) === visibleCategories.length - 1}
                        className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoryItems.map(item => {
                    const index = items.findIndex(i => i.id === item.id)
                    return (
                      <div key={item.id} className="card overflow-hidden p-0 group"
                        style={{ borderRadius: 16, display: 'block' }}>

                        {/* ── Photo — padding-top trick for a reliable square ── */}
                        <div className="relative w-full" style={{ paddingTop: '100%' }}>
                          <div className="absolute inset-0">
                            {item.photo_url ? (
                              <Image
                                src={item.photo_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl"
                                style={{ background: 'var(--surface-2)' }}>🍽️</div>
                            )}

                            {/* Dim overlay when unavailable */}
                            {!item.available && (
                              <div className="absolute inset-0 flex items-center justify-center"
                                style={{ background: 'rgba(0,0,0,0.45)' }}>
                                <span className="text-white text-xs font-bold px-2 py-1 rounded-lg"
                                  style={{ background: 'rgba(0,0,0,0.55)' }}>
                                  {isAr ? 'نفد' : 'Sold out'}
                                </span>
                              </div>
                            )}

                            {/* Availability toggle — top-end corner */}
                            <button
                              onClick={() => toggleAvailable(item)}
                              title={item.available ? t('markUnavailable') : t('markAvailable')}
                              className="absolute top-2 end-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                              style={{ background: item.available ? 'var(--brand)' : '#6b7280', color: 'white' }}>
                              {item.available ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>

                            {/* Reorder arrows — top-start corner */}
                            <div className="absolute top-2 start-2 flex flex-col gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                              <button onClick={() => moveItem(index, 'up')} disabled={index === 0}
                                className="w-6 h-6 rounded-full flex items-center justify-center shadow-md disabled:opacity-30"
                                style={{ background: 'rgba(255,255,255,0.9)' }}>
                                <ChevronUp size={11} style={{ color: 'var(--text-primary)' }} />
                              </button>
                              <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1}
                                className="w-6 h-6 rounded-full flex items-center justify-center shadow-md disabled:opacity-30"
                                style={{ background: 'rgba(255,255,255,0.9)' }}>
                                <ChevronDown size={11} style={{ color: 'var(--text-primary)' }} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ── Card body ── */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="font-bold text-sm leading-snug" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>{item.name}</p>
                            <p className="font-black text-sm flex-shrink-0 ms-1" style={{ color: 'var(--brand)' }}>
                              {formatPrice(item.price, locale)}
                            </p>
                          </div>

                          {item.description && (
                            <p className="text-xs mt-0.5 mb-2" style={{
                              color: 'var(--text-secondary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>{item.description}</p>
                          )}

                          {/* ── Actions bar ── */}
                          <div className="flex items-center justify-between mt-2 pt-2"
                            style={{ borderTop: '1px solid var(--border)' }}>
                            {/* status pill */}
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: item.available ? 'var(--brand-light)' : 'var(--surface-2)',
                                color: item.available ? 'var(--brand)' : 'var(--text-muted)',
                              }}>
                              {item.available ? (isAr ? '● متوفر' : '● In stock') : (isAr ? '○ نفد' : '○ Sold out')}
                            </span>

                            {/* edit / delete */}
                            <div className="flex gap-1">
                              <button onClick={() => openEdit(item)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-2)]">
                                <Pencil size={13} style={{ color: 'var(--text-secondary)' }} />
                              </button>
                              <button onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-50">
                                <Trash2 size={13} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
