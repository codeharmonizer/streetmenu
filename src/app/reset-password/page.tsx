'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import ScanBiteLogo from '@/components/shared/ScanBiteLogo'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

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
            <ScanBiteLogo size={36} />
            <span className="font-bold text-xl tracking-wide" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
              Scan<span style={{ color: 'var(--brand)' }}>Bite</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            تعيين كلمة مرور جديدة
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            اختر كلمة مرور قوية لحسابك.
          </p>
        </div>

        {done ? (
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
