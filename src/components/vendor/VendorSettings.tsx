'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vendor } from '@/types'
import { Save, ToggleLeft, ToggleRight, Camera, X } from 'lucide-react'
import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function VendorSettings({ vendor: initial }: { vendor: Vendor }) {
  const [vendor, setVendor] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initial.logo_url)
  const supabase = createClient()

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    setVendor(v => ({ ...v, logo_url: null }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let logoUrl = vendor.logo_url

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${vendor.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('menu-photos')
        .upload(path, logoFile, { upsert: true })

      if (uploadError) {
        toast.error('فشل رفع الصورة')
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('menu-photos').getPublicUrl(path)
      logoUrl = urlData.publicUrl
    } else if (logoPreview === null) {
      logoUrl = null
    }

    const { error } = await supabase
      .from('vendors')
      .update({
        name: vendor.name,
        description: vendor.description,
        category: vendor.category,
        address: vendor.address,
        phone: vendor.phone,
        hours: vendor.hours,
        logo_url: logoUrl,
      })
      .eq('id', vendor.id)

    if (error) toast.error('فشل الحفظ')
    else {
      setVendor(v => ({ ...v, logo_url: logoUrl }))
      setLogoFile(null)
      toast.success('تم حفظ الإعدادات!')
    }
    setSaving(false)
  }

  async function toggleOpen() {
    const { error } = await supabase
      .from('vendors')
      .update({ is_open: !vendor.is_open })
      .eq('id', vendor.id)
    if (!error) setVendor(v => ({ ...v, is_open: !v.is_open }))
  }

  function field(label: string, key: keyof Vendor, placeholder?: string, type = 'text') {
    return (
      <div>
        <label className="label">{label}</label>
        <input
          type={type}
          className="input"
          placeholder={placeholder}
          value={(vendor[key] as string) || ''}
          onChange={e => setVendor(v => ({ ...v, [key]: e.target.value }))}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>الإعدادات</h1>
        <p style={{ color: 'var(--text-secondary)' }}>حدّث ملف بسطتك الظاهر للزبائن.</p>
      </div>

      {/* Open/closed toggle */}
      <div className="card flex items-center justify-between mb-6">
        <div>
          <p className="font-semibold">حالة البسطة</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {vendor.is_open ? 'الزبائن يمكنهم رؤية قائمتك' : 'القائمة مخفية عن الزبائن'}
          </p>
        </div>
        <button onClick={toggleOpen} className="flex items-center gap-2 text-sm font-medium">
          {vendor.is_open
            ? <><ToggleRight size={28} style={{ color: 'var(--brand)' }} /> مفتوح</>
            : <><ToggleLeft size={28} style={{ color: 'var(--text-muted)' }} /> مغلق</>}
        </button>
      </div>

      <form onSubmit={handleSave} className="card space-y-4">

        {/* Logo upload */}
        <div>
          <label className="label">صورة البسطة</label>
          <div className="flex items-center gap-4">
            {/* Avatar preview */}
            <div className="relative flex-shrink-0">
              {logoPreview ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden relative">
                  <Image src={logoPreview} alt="شعار البسطة" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white"
                  style={{ background: 'var(--brand)' }}>
                  {getInitials(vendor.name)}
                </div>
              )}
              {logoPreview && (
                <button type="button" onClick={removeLogo}
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: '#ef4444' }}>
                  <X size={12} color="white" />
                </button>
              )}
            </div>

            {/* Upload button */}
            <div className="flex flex-col gap-2">
              <label className="btn-secondary cursor-pointer text-xs gap-2">
                <Camera size={14} />
                {logoPreview ? 'تغيير الصورة' : 'رفع صورة'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                PNG أو JPG، حجم أقصى 2 ميغابايت
              </p>
            </div>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--border)' }} />

        {field('اسم البسطة *', 'name', 'مثال: مطبخ أم فاطمة')}
        <div>
          <label className="label">الوصف</label>
          <textarea className="input resize-none" rows={3}
            placeholder="أخبر الزبائن عما يميز طعامك…"
            value={vendor.description || ''}
            onChange={e => setVendor(v => ({ ...v, description: e.target.value }))} />
        </div>
        {field('الفئة', 'category', 'مثال: أكل شعبي، مطبخ منزلي')}
        {field('العنوان / الموقع', 'address', 'مثال: بالقرب من البوابة 3، بلوك 320')}
        {field('الهاتف / واتساب', 'phone', '+973 3XXX XXXX', 'tel')}
        {field('ساعات العمل', 'hours', 'مثال: الجمعة–السبت 6 م–12 م')}

        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={15} />
          {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  )
}
