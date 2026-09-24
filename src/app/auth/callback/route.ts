import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        await createAdminClient()
          .from('vendors')
          .update({
            user_id: user.id,
            vendor_status: 'active',
            activated_at: new Date().toISOString(),
            last_admin_action_at: new Date().toISOString(),
          })
          .eq('invited_email', user.email.toLowerCase())
          .or(`user_id.is.null,user_id.eq.${user.id}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Exchange failed — send to forgot-password with an error hint
  return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
}
