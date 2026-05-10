'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QrCode, Mail, Lock, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useTranslations, useLocale } from 'next-intl'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

export default function RegisterPage() {
  const router  = useRouter()
  const t       = useTranslations('auth')
  const locale  = useLocale()
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({
    email: '',
    password: '',
    vendorName: '',
    category: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      toast.error(authError.message)
      setLoading(false)
      return
    }

    let userId = authData.user?.id
    if (!userId) {
      toast.error(locale === 'ar'
        ? 'يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك ثم تسجيل الدخول.'
        : 'Please verify your email then sign in.')
      setLoading(false)
      router.push('/login')
      return
    }

    if (!authData.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError || !signInData.user) {
        toast.error(locale === 'ar'
          ? 'تم إنشاء الحساب! يرجى تسجيل الدخول لإكمال الإعداد.'
          : 'Account created! Please sign in to finish setup.')
        setLoading(false)
        router.push('/login')
        return
      }
      userId = signInData.user.id
    }

    const baseSlug = slugify(form.vendorName)
    const slug     = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

    const { error: vendorError } = await supabase.from('vendors').insert({
      user_id:  userId,
      name:     form.vendorName,
      slug,
      category: form.category || null,
      plan:     'free',
      is_open:  true,
    })

    if (vendorError) {
      console.error('Vendor insert error:', vendorError)
      toast.error(`${locale === 'ar' ? 'فشل الإعداد' : 'Setup failed'}: ${vendorError.message}`)
      setLoading(false)
      return
    }

    toast.success(locale === 'ar' ? 'مرحباً بك في StreetMenu!' : 'Welcome to StreetMenu!')
    router.push('/dashboard')
    router.refresh()
  }

  const categoriesAr = ['مطعم', 'أكل شعبي', 'شاحنة طعام', 'مطبخ منزلي', 'مخبز', 'حلويات', 'مشروبات وعصائر', 'مشاوي', 'أخرى']
  const categoriesEn = ['Restaurant', 'Street food', 'Food truck', 'Home kitchen', 'Bakery', 'Sweets', 'Drinks & Juices', 'Grills', 'Other']
  const categories   = locale === 'ar' ? categoriesAr : categoriesEn

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-2">
            <LanguageSwitcher variant="compact" />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <QrCode size={20} color="white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>StreetMenu</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {step === 1 ? t('registerTitle') : (locale === 'ar' ? 'إعداد حسابك' : 'Set up your account')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {step === 1
              ? (locale === 'ar' ? 'مجاني دائماً. لا حاجة لبطاقة ائتمان.' : 'Always free. No credit card needed.')
              : (locale === 'ar' ? 'أخبر الزبائن عن مطعمك أو بسطتك.' : 'Tell customers about your restaurant or business.')}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: s <= step ? 'var(--brand)' : 'var(--border)' }} />
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="label">{t('email')}</label>
                  <div className="relative">
                    <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="email" className="input ps-9" dir="ltr" placeholder="you@example.com"
                      value={form.email} onChange={e => update('email', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label">{t('password')}</label>
                  <div className="relative">
                    <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="password" className="input ps-9"
                      placeholder={locale === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
                      value={form.password} onChange={e => update('password', e.target.value)} minLength={8} required />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label">{t('vendorName')}</label>
                  <div className="relative">
                    <Store size={15} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="text" className="input ps-9"
                      placeholder={locale === 'ar' ? 'مثال: مطبخ أم فاطمة' : 'e.g. Fatima\'s Kitchen'}
                      value={form.vendorName} onChange={e => update('vendorName', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label">{t('category')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button key={cat} type="button"
                        onClick={() => update('category', cat)}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-start transition-all"
                        style={{
                          background: form.category === cat ? 'var(--brand)' : 'var(--surface-2)',
                          color:      form.category === cat ? 'white' : 'var(--text-primary)',
                          border:     `1px solid ${form.category === cat ? 'var(--brand)' : 'var(--border)'}`,
                        }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading
                ? t('creating')
                : step === 1
                  ? t('next')
                  : t('createAccount')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          {t('haveAccount')}{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>{t('loginHere')}</Link>
        </p>
      </div>
    </div>
  )
}
