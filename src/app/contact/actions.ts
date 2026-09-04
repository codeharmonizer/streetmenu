'use server'

import { Resend } from 'resend'

/** Normalise the from address.
 *  Handles three env var formats:
 *    "onboarding@resend.dev"            → unchanged
 *    "Relaxed Menu <onboarding@resend.dev>" → unchanged
 *    "Relaxed Menu onboarding@resend.dev" → "Relaxed Menu <onboarding@resend.dev>"
 */
function getFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim()
  if (!raw) return 'onboarding@resend.dev'
  if (raw.includes('<')) return raw          // already correct
  if (!raw.includes(' ')) return raw         // plain email, fine
  // "Display Name email@domain" — wrap email in angle brackets
  const lastSpace = raw.lastIndexOf(' ')
  const name  = raw.slice(0, lastSpace)
  const email = raw.slice(lastSpace + 1)
  return `${name} <${email}>`
}

export async function sendContactEmail(_: { error?: string; success?: boolean }, formData: FormData) {
  const name    = (formData.get('name')    as string)?.trim()
  const email   = (formData.get('email')   as string)?.trim()
  const subject = (formData.get('subject') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!name || !email || !subject || !message) {
    return { error: 'يرجى ملء جميع الحقول' }
  }

  if (!process.env.RESEND_API_KEY) {
    return { error: 'خدمة البريد غير مهيأة. يرجى المحاولة لاحقاً.' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: getFromAddress(),
      to:   process.env.CONTACT_EMAIL!,
      replyTo: email,
      subject: `[Relaxed Menu] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#ff6b00">رسالة جديدة من Relaxed Menu</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b6760;width:100px">الاسم</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b6760">البريد</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b6760">الموضوع</td><td style="padding:8px 0">${subject}</td></tr>
          </table>
          <hr style="margin:16px 0;border:none;border-top:1px solid #e8e6e0"/>
          <p style="white-space:pre-wrap;line-height:1.6">${message}</p>
        </div>
      `,
    })
    return { success: true }
  } catch {
    return { error: 'فشل إرسال الرسالة. حاول مجدداً.' }
  }
}
