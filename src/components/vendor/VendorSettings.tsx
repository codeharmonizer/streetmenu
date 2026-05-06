'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vendor } from '@/types'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VendorSettings({ vendor: initial }: { vendor: Vendor }) {
  const [vendor, setVendor] = useState(initial)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('vendors')
      .update({
        name: vendor.name,
        description: vendor.description,
        category: vendor.category,
        address: vendor.address,
        phone: vendor.phone,
        hours: vendor.hours,
      })
      .eq('id', vendor.id)

    if (error) toast.error('فشل الحفظ')
    else toast.success('تم حفظ الإعدادات!')
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
