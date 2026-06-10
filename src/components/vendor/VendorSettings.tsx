'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vendor } from '@/types'
import { Save, ToggleLeft, ToggleRight, Camera, X } from 'lucide-react'
import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import HoursBuilder from './HoursBuilder'

export default function VendorSettings({ vendor: initial }: { vendor: Vendor }) {
  const [vendor,      setVendor]      = useState(initial)
  const [saving,      setSaving]      = useState(false)
  const [logoFile,    setLogoFile]    = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initial.logo_url)
  const supabase = createClient()
  const t  = useTranslations('settings')
  const tc = useTranslations('common')

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side size check (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('uploadFailed') + ' (> 5 MB)')
      return
    }
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
      // Use a timestamp so each upload is a unique path — avoids upsert/policy issues
      const ext  = logoFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${vendor.id}/logo-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('menu-photos')
        .upload(path, logoFile, {
          upsert:      false,
          contentType: logoFile.type || `image/${ext}`,
        })

      if (uploadError) {
        console.error('Logo upload error:', uploadError)
        toast.error(`${t('uploadFailed')}: ${uploadError.message}`)
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
        name:        vendor.name,
        description: vendor.description,
        category:    vendor.category,
        address:     vendor.address,
        phone:       vendor.phone,
        hours:       vendor.hours,
        logo_url:    logoUrl,
      })
      .eq('id', vendor.id)

    if (error) {
      toast.error(t('saveFailed'))
    } else {
      setVendor(v => ({ ...v, logo_url: logoUrl }))
      setLogoFile(null)
      toast.success(t('saveSuccess'))
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

  async function toggleOrdersEnabled() {
    const next = !vendor.orders_enabled
    const { error } = await supabase
      .from('vendors')
      .update({ orders_enabled: next })
      .eq('id', vendor.id)
    if (!error) {
      setVendor(v => ({ ...v, orders_enabled: next }))
      toast.success(t('saveSuccess'))
    } else {
      toast.error(t('saveFailed'))
    }
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
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('desc')}</p>
      </div>

      {/* Open/closed toggle */}
      <div className="card flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold">{t('isOpenLabel')}</p>
        </div>
        <button onClick={toggleOpen} className="flex items-center gap-2 text-sm font-medium">
          {vendor.is_open
            ? <ToggleRight size={28} style={{ color: 'var(--brand)' }} />
            : <ToggleLeft  size={28} style={{ color: 'var(--text-muted)' }} />}
        </button>
      </div>

      {/* Online ordering toggle */}
      <div className="card flex items-center justify-between mb-6">
        <div>
          <p className="font-semibold">{t('ordersEnabledLabel')}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('ordersEnabledDesc')}</p>
        </div>
        <button onClick={toggleOrdersEnabled} className="flex items-center gap-2 text-sm font-medium flex-shrink-0 ms-4">
          {vendor.orders_enabled
            ? <ToggleRight size={28} style={{ color: 'var(--brand)' }} />
            : <ToggleLeft  size={28} style={{ color: 'var(--text-muted)' }} />}
        </button>
      </div>

      <form onSubmit={handleSave} className="card space-y-5">

        {/* ── Logo upload ── */}
        <div>
          <label className="label">{t('logo')}</label>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {logoPreview ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden relative">
                  <Image src={logoPreview} alt={t('logo')} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white"
                  style={{ background: 'var(--brand)' }}>
                  {getInitials(vendor.name)}
                </div>
              )}
              {logoPreview && (
                <button type="button" onClick={removeLogo}
                  className="absolute -top-2 -start-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: '#ef4444' }}>
                  <X size={12} color="white" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="btn-secondary cursor-pointer text-xs gap-2">
                <Camera size={14} />
                {logoPreview ? t('changeLogo') : t('uploadLogo')}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                PNG / JPG · max 5 MB
              </p>
            </div>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--border)' }} />

        {/* ── Basic info ── */}
        {field(`${t('vendorName')} *`, 'name')}

        <div>
          <label className="label">{t('description')}</label>
          <textarea className="input resize-none" rows={3}
            placeholder={t('descPlaceholder')}
            value={vendor.description || ''}
            onChange={e => setVendor(v => ({ ...v, description: e.target.value }))} />
        </div>

        {field(t('category'), 'category')}
        {field(t('address'),  'address',  t('addressPlaceholder'))}
        {field(t('phone'),    'phone',    t('phonePlaceholder'), 'tel')}

        {/* ── Working hours builder ── */}
        <div>
          <label className="label">{t('hours')}</label>
          <HoursBuilder
            value={vendor.hours}
            onChange={formatted => setVendor(v => ({ ...v, hours: formatted }))}
          />
          {/* Show resulting string so user can see what will be saved */}
          {vendor.hours && (
            <p className="text-xs mt-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
              {vendor.hours}
            </p>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={15} />
          {saving ? tc('saving') : t('save')}
        </button>
      </form>
    </div>
  )
}
