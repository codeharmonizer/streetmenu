'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Store } from 'lucide-react'
import RelaxedMenuLogo from '@/components/shared/RelaxedMenuLogo'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { createClient } from '@/lib/supabase/client'
import { generateAvailableVendorSlug } from '@/lib/vendor-slugs'
import { useLocale, useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

const PENDING_REGISTRATION_KEY = 'relaxed_menu_pending_registration'

type PendingRegistration = {
  vendorName?: string
  category?: string | null
  email?: string
}

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')
  const [message, setMessage] = useState(locale === 'ar' ? 'جارٍ إكمال الإعداد…' : 'Completing setup…')
  const [failed, setFailed] = useState(false)
  const [setupMode, setSetupMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [setupForm, setSetupForm] = useState({ vendorName: '', category: '' })

  const categoriesAr = ['مطعم', 'أكل شعبي', 'شاحنة طعام', 'مطبخ منزلي', 'مخبز', 'حلويات', 'مشروبات وعصائر', 'مشاوي', 'أخرى']
  const categoriesEn = ['Restaurant', 'Street food', 'Food truck', 'Home kitchen', 'Bakery', 'Sweets', 'Drinks & Juices', 'Grills', 'Other']
  const categories = locale === 'ar' ? categoriesAr : categoriesEn

  const createVendor = useCallback(async (userId: string, vendorName: string, category?: string | null) => {
    const supabase = createClient()
    const slug = await generateAvailableVendorSlug(supabase, vendorName)

    return supabase.from('vendors').insert({
      user_id: userId,
      name: vendorName,
      slug,
      category: category || null,
      plan: 'free',
      is_open: true,
    })
  }, [])

  const finishSetup = useCallback(async (vendorName: string, category?: string | null) => {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setFailed(true)
      setSetupMode(false)
      setMessage(locale === 'ar'
        ? 'يرجى تسجيل الدخول بعد تأكيد بريدك الإلكتروني لإكمال الإعداد.'
        : 'Please sign in after verifying your email to complete setup.')
      return
    }

    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingVendor) {
      localStorage.removeItem(PENDING_REGISTRATION_KEY)
      router.replace('/dashboard')
      router.refresh()
      return
    }

    const { error: vendorError } = await createVendor(user.id, vendorName, category)

    if (vendorError) {
      console.error('Vendor insert error:', vendorError)
      setFailed(true)
      setSetupMode(false)
      setMessage(`${locale === 'ar' ? 'فشل الإعداد' : 'Setup failed'}: ${vendorError.message}`)
      return
    }

    localStorage.removeItem(PENDING_REGISTRATION_KEY)
    toast.success(locale === 'ar' ? 'مرحباً بك في Relaxed Menu!' : 'Welcome to Relaxed Menu!')
    router.replace('/dashboard')
    router.refresh()
  }, [createVendor, locale, router])

  async function handleManualSetup(e: React.FormEvent) {
    e.preventDefault()
    const vendorName = setupForm.vendorName.trim()
    if (!vendorName) return

    setLoading(true)
    await finishSetup(vendorName, setupForm.category || null)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false

    async function completeRegistration() {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (cancelled) return

      if (userError || !user) {
        setFailed(true)
        setMessage(locale === 'ar'
          ? 'يرجى تسجيل الدخول بعد تأكيد بريدك الإلكتروني لإكمال الإعداد.'
          : 'Please sign in after verifying your email to complete setup.')
        return
      }

      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cancelled) return

      if (existingVendor) {
        localStorage.removeItem(PENDING_REGISTRATION_KEY)
        router.replace('/dashboard')
        router.refresh()
        return
      }

      let pending: PendingRegistration | null = null
      try {
        const raw = localStorage.getItem(PENDING_REGISTRATION_KEY)
        pending = raw ? JSON.parse(raw) as PendingRegistration : null
      } catch {
        pending = null
      }

      const vendorName = pending?.vendorName?.trim()

      if (!vendorName) {
        setFailed(false)
        setSetupMode(true)
        setMessage(locale === 'ar'
          ? 'أكمل بيانات مطعمك أو مشروعك الغذائي للمتابعة.'
          : 'Finish your restaurant or food business details to continue.')
        return
      }

      await finishSetup(vendorName, pending?.category || null)
    }

    completeRegistration().catch(error => {
      console.error('Complete registration error:', error)
      if (!cancelled) {
        setFailed(true)
        setMessage(locale === 'ar' ? 'حدث خطأ أثناء إكمال الإعداد.' : 'Something went wrong while completing setup.')
      }
    })

    return () => { cancelled = true }
  }, [finishSetup, locale, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher variant="compact" />
        </div>
        <Link href="/" className="inline-flex items-center gap-2 justify-center mb-8">
          <RelaxedMenuLogo size={36} />
          <span className="font-bold text-xl tracking-wide" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
            Relaxed <span style={{ color: 'var(--brand)' }}>Menu</span>
          </span>
        </Link>
        <div className="card py-8">
          {setupMode || failed ? (
            <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: 'var(--brand)' }} />
          ) : (
            <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--brand)' }} />
          )}
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {setupMode || failed ? t('completeSetup') : t('completingSetup')}
          </h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {message}
          </p>

          {setupMode && (
            <form onSubmit={handleManualSetup} className="space-y-4 text-start">
              <div>
                <label className="label">{t('vendorName')}</label>
                <div className="relative">
                  <Store size={15} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input ps-9"
                    placeholder={locale === 'ar' ? 'مثال: مطبخ أم فاطمة' : 'e.g. Fatima\'s Kitchen'}
                    value={setupForm.vendorName}
                    onChange={e => setSetupForm(prev => ({ ...prev, vendorName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('category')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSetupForm(prev => ({ ...prev, category: cat }))}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-start transition-all"
                      style={{
                        background: setupForm.category === cat ? 'var(--brand)' : 'var(--surface-2)',
                        color: setupForm.category === cat ? 'white' : 'var(--text-primary)',
                        border: `1px solid ${setupForm.category === cat ? 'var(--brand)' : 'var(--border)'}`,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
                {loading ? t('creating') : t('completeSetup')}
              </button>
            </form>
          )}

          {failed && (
            <div className="flex flex-col gap-3">
              <Link href="/login" className="btn-secondary w-full py-3 justify-center">
                {t('loginHere')}
              </Link>
              <Link href="/register" className="btn-primary w-full py-3 justify-center">
                {t('createFree')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}