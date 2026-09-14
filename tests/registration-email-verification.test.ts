import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('registration email verification flow', () => {
  it('does not create a vendor before the email verification callback completes', () => {
    const register = read('src/app/register/page.tsx')

    expect(register).toContain('PENDING_REGISTRATION_KEY')
    expect(register).toContain("const emailRedirectTo = `${window.location.origin}/auth/callback?next=/register/complete`")
    expect(register).toContain("localStorage.setItem(PENDING_REGISTRATION_KEY")
    expect(register).not.toContain("supabase.from('vendors').insert")
  })

  it('continues setup immediately when Supabase reports the signup email is already confirmed', () => {
    const register = read('src/app/register/page.tsx')

    expect(register).toContain('const { data: authData, error: authError } = await supabase.auth.signUp')
    expect(register).toContain('authData.session || authData.user?.email_confirmed_at')
    expect(register).toContain("router.push('/register/complete')")
  })

  it('recovers existing auth-only registrations by signing in and completing setup', () => {
    const register = read('src/app/register/page.tsx')

    expect(register).toContain('isAlreadyRegisteredError(authError)')
    expect(register).toContain('supabase.auth.signInWithPassword')
    expect(register).toContain("router.push('/register/complete')")
    expect(register).toContain('supabase.auth.resend')
    expect(register).toContain('emailRedirectTo')
  })

  it('sends logged-in users with no vendor back through setup completion', () => {
    const login = read('src/app/login/page.tsx')

    expect(login).toContain(".from('vendors')")
    expect(login).toContain(".eq('user_id', user.id)")
    expect(login).toContain("router.push('/register/complete')")
  })

  it('creates the vendor only on the post-confirmation completion page', () => {
    expect(existsSync(join(root, 'src/app/register/complete/page.tsx'))).toBe(true)
    const complete = read('src/app/register/complete/page.tsx')

    expect(complete).toContain("supabase.auth.getUser()")
    expect(complete).toContain("localStorage.getItem(PENDING_REGISTRATION_KEY)")
    expect(complete).toContain("supabase.from('vendors').insert")
    expect(complete).toContain("localStorage.removeItem(PENDING_REGISTRATION_KEY)")
    expect(complete).toContain("router.replace('/dashboard')")
  })

  it('has English and Arabic copy for the email confirmation step', () => {
    const en = read('messages/en.json')
    const ar = read('messages/ar.json')

    expect(en).toContain('"checkEmailTitle"')
    expect(en).toContain('Verify your email')
    expect(ar).toContain('"checkEmailTitle"')
    expect(ar).toContain('تحقق من بريدك الإلكتروني')
  })
})
