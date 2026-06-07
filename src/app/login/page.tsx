'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import ScanBiteLogo from '@/components/shared/ScanBiteLogo'

export default function LoginPage() {
  const router = useRouter()
  const t      = useTranslations('auth')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo + lang switcher */}
        <div className="text-center mb-8">
          <div className="flex justify-end mb-2">
            <LanguageSwitcher variant="compact" />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <ScanBiteLogo size={36} />
            <span className="font-bold text-xl tracking-wide" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
              Scan<span style={{ color: 'var(--brand)' }}>Bite</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t('loginTitle')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('loginDesc')}</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">{t('email')}</label>
              <div className="relative">
                <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input ps-9"
                  dir="ltr"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">{t('password')}</label>
              <div className="relative">
                <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input ps-9 pe-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute end-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? t('loggingIn') : t('loginBtn')}
            </button>
          </form>
          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/forgot-password" style={{ color: 'var(--brand)' }}>
              {t('forgotPassword')}
            </Link>
          </p>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          {t('noAccount')}{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--brand)' }}>
            {t('createFree')}
          </Link>
        </p>
      </div>
    </div>
  )
}
