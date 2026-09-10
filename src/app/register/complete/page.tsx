'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import RelaxedMenuLogo from '@/components/shared/RelaxedMenuLogo'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
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

      const raw = localStorage.getItem(PENDING_REGISTRATION_KEY)
      const pending = raw ? JSON.parse(raw) as PendingRegistration : null
      const vendorName = pending?.vendorName?.trim()

      if (!vendorName) {
        setFailed(true)
        setMessage(locale === 'ar'
          ? 'لم نجد بيانات مطعمك. يرجى إعادة التسجيل.'
          : 'We could not find your business details. Please register again.')
        return
      }

      const baseSlug = slugify(vendorName)
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

      const { error: vendorError } = await supabase.from('vendors').insert({
        user_id: user.id,
        name: vendorName,
        slug,
        category: pending?.category || null,
        plan: 'free',
        is_open: true,
      })

      if (cancelled) return

      if (vendorError) {
        console.error('Vendor insert error:', vendorError)
        setFailed(true)
        setMessage(`${locale === 'ar' ? 'فشل الإعداد' : 'Setup failed'}: ${vendorError.message}`)
        return
      }

      localStorage.removeItem(PENDING_REGISTRATION_KEY)
      toast.success(locale === 'ar' ? 'مرحباً بك في Relaxed Menu!' : 'Welcome to Relaxed Menu!')
      router.replace('/dashboard')
      router.refresh()
    }

    completeRegistration().catch(error => {
      console.error('Complete registration error:', error)
      if (!cancelled) {
        setFailed(true)
        setMessage(locale === 'ar' ? 'حدث خطأ أثناء إكمال الإعداد.' : 'Something went wrong while completing setup.')
      }
    })

    return () => { cancelled = true }
  }, [locale, router])

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
          {failed ? (
            <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: 'var(--brand)' }} />
          ) : (
            <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--brand)' }} />
          )}
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {failed ? t('completeSetup') : t('completingSetup')}
          </h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {message}
          </p>
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
