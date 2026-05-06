'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QrCode, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل…</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [verified,  setVerified]  = useState(false)
  const [done,      setDone]      = useState(false)

  /* ── On mount: exchange the token_hash from the URL ── */
  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type       = searchParams.get('type') as 'recovery' | null

    if (!token_hash || type !== 'recovery') {
      toast.error('رابط غير صالح أو منتهي الصلاحية.')
      setVerifying(false)
      return
    }

    const supabase = createClient()
    supabase.auth
      .verifyOtp({ token_hash, type: 'recovery' })
      .then(({ error }) => {
        if (error) {
          toast.error('انتهت صلاحية الرابط. يرجى طلب رابط جديد.')
        } else {
          setVerified(true)
        }
        setVerifying(false)
      })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
      return
    }
    if (password !== confirm) {
      toast.error('كلمتا المرور غير متطابقتين.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <QrCode size={20} color="white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>StreetMenu</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            تعيين كلمة مرور جديدة
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            اختر كلمة مرور قوية لحسابك.
          </p>
        </div>

        {verifying ? (
          <div className="card text-center py-10">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>جارٍ التحقق من الرابط…</p>
          </div>

        ) : done ? (
          <div className="card text-center py-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--brand-light)' }}>
              <CheckCircle size={28} style={{ color: 'var(--brand)' }} />
            </div>
            <h2 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              تم تغيير كلمة المرور!
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              سيتم تحويلك لتسجيل الدخول…
            </p>
          </div>

        ) : !verified ? (
          <div className="card text-center py-10">
            <p className="font-semibold mb-3">رابط غير صالح</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              انتهت صلاحية رابط إعادة التعيين أو أنه غير صحيح.
            </p>
            <Link href="/forgot-password" className="btn-primary mx-auto">
              طلب رابط جديد
            </Link>
          </div>

        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* New password */}
              <div>
                <label className="label">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="input pr-9 pl-9"
                    placeholder="8 أحرف على الأقل"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => setShowPw(v => !v)}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="label">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="input pr-9"
                    placeholder="أعد كتابة كلمة المرور"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'جارٍ الحفظ…' : 'حفظ كلمة المرور'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>
            ← العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
