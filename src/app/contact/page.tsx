'use client'

import { useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { QrCode, Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { sendContactEmail } from './actions'
import toast from 'react-hot-toast'

type FormState = { error?: string; success?: boolean }
const INITIAL: FormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full py-3">
      <Send size={15} />
      {pending ? 'جارٍ الإرسال…' : 'إرسال الرسالة'}
    </button>
  )
}

export default function ContactPage() {
  const [state, action] = useFormState(sendContactEmail, INITIAL)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <QrCode size={20} color="white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>ScanBite</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>تواصل معنا</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>سنرد عليك في أقرب وقت ممكن.</p>
        </div>

        {state?.success ? (
          /* Success state */
          <div className="card text-center py-10">
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#16a34a' }} />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>تم إرسال رسالتك!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              شكراً لتواصلك معنا. سنرد عليك قريباً.
            </p>
            <Link href="/" className="btn-primary mx-auto">
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <div className="card">
            <form action={action} className="space-y-4">

              {/* Name */}
              <div>
                <label className="label">الاسم *</label>
                <div className="relative">
                  <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input name="name" type="text" required className="input pr-9"
                    placeholder="اسمك الكريم" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label">البريد الإلكتروني *</label>
                <div className="relative">
                  <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input name="email" type="email" required className="input pr-9"
                    placeholder="you@example.com" dir="ltr" />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="label">الموضوع *</label>
                <input name="subject" type="text" required className="input"
                  placeholder="كيف يمكننا مساعدتك؟" />
              </div>

              {/* Message */}
              <div>
                <label className="label">الرسالة *</label>
                <div className="relative">
                  <MessageSquare size={15} className="absolute right-3 top-3" style={{ color: 'var(--text-muted)' }} />
                  <textarea name="message" required rows={5} className="input resize-none pr-9"
                    placeholder="اكتب رسالتك هنا…" />
                </div>
              </div>

              <SubmitButton />
            </form>
          </div>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--brand)' }}>← العودة للرئيسية</Link>
        </p>
      </div>
    </div>
  )
}
