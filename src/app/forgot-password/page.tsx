'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import ScanBiteLogo from '@/components/shared/ScanBiteLogo'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function ForgotPasswordInner() {
  const searchParams = useSearchParams()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'expired') {
      toast.error('انتهت صلاحية الرابط. يرجى طلب رابط جديد.')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <ScanBiteLogo size={36} />
            <span className="font-bold text-xl tracking-wide" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
              Scan<span style={{ color: 'var(--brand)' }}>Bite</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            نسيت كلمة المرور؟
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            أدخل بريدك الإلكتروني وسنرسل لك رابط التغيير.
          </p>
        </div>

        {sent ? (
          <div className="card text-center py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--brand-light)' }}>
              <Mail size={28} style={{ color: 'var(--brand)' }} />
            </div>
            <h2 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              تحقق من بريدك!
            </h2>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              أرسلنا رابط إعادة تعيين كلمة المرور إلى:
            </p>
            <p className="font-semibold text-sm mb-6" dir="ltr">{email}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              إذا لم تجده، تحقق من مجلد الرسائل غير المرغوبة.
            </p>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email" required className="input pr-9"
                    placeholder="you@example.com" dir="ltr"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                <ArrowRight size={15} />
                {loading ? 'جارٍ الإرسال…' : 'إرسال رابط الاستعادة'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          تذكرت كلمة المرور؟{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordInner />
    </Suspense>
  )
}
