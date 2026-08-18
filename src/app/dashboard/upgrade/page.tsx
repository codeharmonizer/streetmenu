'use client'

import { useState }         from 'react'
import Link                 from 'next/link'
import { useSearchParams }  from 'next/navigation'
import {
  ArrowRight, CheckCircle, CreditCard,
  Zap, BarChart2, Infinity, XCircle,
} from 'lucide-react'
import toast               from 'react-hot-toast'
import { useTranslations, useLocale } from 'next-intl'

const FEATURES = [
  { icon: Infinity,  key: 'feature1' },
  { icon: BarChart2, key: 'feature2' },
  { icon: CheckCircle, key: 'feature3' },
]

export default function UpgradePage() {
  const t      = useTranslations('upgrade')
  const locale = useLocale()
  const searchParams = useSearchParams()

  const [paying, setPaying] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly')

  const paymentParam = searchParams.get('payment') // 'failed' | 'error'

  async function handlePay() {
    if (paying) return
    setPaying(true)
    try {
      const res  = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ billingPeriod }),
      })
      const data = await res.json()

      if (!res.ok || !data.redirectUrl) {
        toast.error(locale === 'ar' ? 'حدث خطأ، حاول مجدداً.' : 'Something went wrong. Please try again.')
        return
      }

      // Redirect vendor to ePays payment page
      window.location.href = data.redirectUrl
    } catch {
      toast.error(locale === 'ar' ? 'فشل الاتصال بالشبكة.' : 'Network error. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">

      {/* Back */}
      <Link href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowRight size={14} className="rtl:rotate-0 ltr:rotate-180" />
        {t('backToDashboard')}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand)' }}>
            <Zap size={18} color="white" />
          </div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            {t('title')}
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {locale === 'ar'
            ? 'ادفع الآن واحصل على وصول فوري لجميع ميزات Pro.'
            : 'Pay now and get instant access to all Pro features.'}
        </p>
      </div>

      {/* Payment failed/error banner */}
      {(paymentParam === 'failed' || paymentParam === 'error') && (
        <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <XCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#991b1b' }}>
              {locale === 'ar' ? 'لم تكتمل عملية الدفع' : 'Payment was not completed'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>
              {locale === 'ar' ? 'يمكنك المحاولة مرة أخرى.' : 'You can try again below.'}
            </p>
          </div>
        </div>
      )}

      {/* Features card */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: 'var(--brand-light)', border: '1px solid #ffd4a8' }}>
        <p className="font-bold mb-4" style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
          {t('whatYouGet')}
        </p>
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <Icon size={15} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)' }}>{t(key as never)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing + CTA card */}
      <div className="card">
        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className="rounded-2xl p-4 text-center transition-all"
            style={{
              border: billingPeriod === 'monthly' ? '2px solid var(--brand)' : '1px solid var(--border)',
              background: billingPeriod === 'monthly' ? 'var(--brand-light)' : 'transparent',
            }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {locale === 'ar' ? 'شهرياً' : 'Monthly'}
            </p>
            <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)' }}>
              3 BD
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {locale === 'ar' ? '/ شهر' : '/ month'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBillingPeriod('yearly')}
            className="rounded-2xl p-4 text-center transition-all relative"
            style={{
              border: billingPeriod === 'yearly' ? '2px solid var(--brand)' : '1px solid var(--border)',
              background: billingPeriod === 'yearly' ? 'var(--brand-light)' : 'transparent',
            }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
              style={{ background: 'var(--brand)', color: 'white' }}>
              {locale === 'ar' ? 'وفّر شهرين' : 'Save 2 months'}
            </span>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {locale === 'ar' ? 'سنوياً' : 'Yearly'}
            </p>
            <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)' }}>
              30 BD
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {locale === 'ar' ? '/ سنة · بدلاً من 36 د.ب' : '/ year · instead of BD 36'}
            </p>
          </button>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
          style={{ borderRadius: 14 }}>
          <CreditCard size={18} />
          {paying
            ? (locale === 'ar' ? 'جارٍ التوجيه للدفع…' : 'Redirecting to payment…')
            : billingPeriod === 'yearly'
              ? (locale === 'ar' ? 'اشترك سنوياً · ادفع 30 د.ب' : 'Subscribe Yearly · Pay BD 30.000')
              : (locale === 'ar' ? 'اشترك شهرياً · ادفع 3 د.ب' : 'Subscribe Monthly · Pay BD 3.000')}
        </button>

        <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          {locale === 'ar'
            ? 'ستُوجَّه إلى بوابة الدفع الآمنة ePays. يُفعَّل اشتراكك فور اكتمال الدفع.'
            : 'You\'ll be redirected to the secure ePays payment gateway. Subscription activates instantly after payment.'}
        </p>
      </div>

    </div>
  )
}
