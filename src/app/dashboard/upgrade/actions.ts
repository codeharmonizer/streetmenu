'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

function getFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim()
  if (!raw) return 'onboarding@resend.dev'
  if (raw.includes('<')) return raw
  if (!raw.includes(' ')) return raw
  const lastSpace = raw.lastIndexOf(' ')
  return `${raw.slice(0, lastSpace)} <${raw.slice(lastSpace + 1)}>`
}

export async function sendUpgradeRequest(phone: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مسجّل الدخول' }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('name, slug, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!vendor) return { error: 'لم يتم العثور على بيانات حسابك' }

  if (!process.env.RESEND_API_KEY) return { error: 'خدمة البريد غير مهيأة' }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from:    getFromAddress(),
      to:      process.env.CONTACT_EMAIL!,
      replyTo: user.email!,
      subject: `[StreetMenu] طلب ترقية — ${vendor.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#ff6b00">🚀 طلب ترقية اشتراك جديد</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <tr><td style="padding:8px 0;color:#6b6760;width:120px">اسم المطعم / البسطة</td>
                <td style="padding:8px 0;font-weight:600">${vendor.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b6760">البريد الإلكتروني</td>
                <td style="padding:8px 0"><a href="mailto:${user.email}">${user.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b6760">رقم الجوال</td>
                <td style="padding:8px 0;font-weight:600;color:#ff6b00">${phone}</td></tr>
            <tr><td style="padding:8px 0;color:#6b6760">الرابط العام</td>
                <td style="padding:8px 0"><a href="${process.env.NEXT_PUBLIC_APP_URL}/m/${vendor.slug}">/m/${vendor.slug}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b6760">الحالة الحالية</td>
                <td style="padding:8px 0">${vendor.subscription_status}</td></tr>
          </table>
          ${note ? `
          <hr style="margin:16px 0;border:none;border-top:1px solid #e8e6e0"/>
          <p style="color:#6b6760;margin-bottom:8px">ملاحظة من الزبون:</p>
          <p style="white-space:pre-wrap;line-height:1.6">${note}</p>
          ` : ''}
        </div>
      `,
    })
    return { success: true }
  } catch {
    return { error: 'فشل إرسال الطلب. حاول مجدداً.' }
  }
}
