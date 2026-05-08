'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react'
import { sendUpgradeRequest } from './actions'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

export default function UpgradePage() {
  const t = useTranslations('upgrade')
  const [phone,   setPhone]   = useState('')
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) { toast.error(t('phoneRequired')); return }
    setLoading(true)
    const result = await sendUpgradeRequest(phone.trim(), note.trim())
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center py-14">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--brand-light)' }}>
            <CheckCircle size={32} style={{ color: 'var(--brand)' }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('successTitle')}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('successDesc')}
          </p>
          <Link href="/dashboard" className="btn-primary mx-auto">
            {t('backBtn')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Back */}
      <Link href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowRight size={14} className="rtl:rotate-0 ltr:rotate-180" /> {t('backToDashboard')}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {t('desc')}
        </p>
      </div>

      {/* What you get */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--brand-light)', border: '1px solid #ffd4a8' }}>
        <p className="font-bold mb-3" style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
          {t('whatYouGet')}
        </p>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {[t('feature1'), t('feature2'), t('feature3')].map(f => (
            <li key={f} className="flex items-center gap-2">
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>✓</span> {f}
            </li>
          ))}
        </ul>
        <p className="text-lg font-black mt-4" style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
          {t('price')}
        </p>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone */}
          <div>
            <label className="label">{t('phoneLabel')} *</label>
            <div className="relative">
              <Phone size={15} className="absolute start-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }} />
              <input
                type="tel"
                required
                className="input ps-9"
                placeholder={t('phonePlaceholder')}
                dir="ltr"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {t('phoneHint')}
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="label">{t('noteLabel')}</label>
            <div className="relative">
              <MessageSquare size={15} className="absolute start-3 top-3"
                style={{ color: 'var(--text-muted)' }} />
              <textarea
                rows={3}
                className="input resize-none ps-9"
                placeholder={t('notePlaceholder')}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? t('sending') : t('submitBtn')}
          </button>
        </form>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
        {t('emailNote')}
      </p>
    </div>
  )
}
