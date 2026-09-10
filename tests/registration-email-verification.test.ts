import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('registration email verification flow', () => {
  it('does not create a vendor before the email verification callback completes', () => {
    const register = read('src/app/register/page.tsx')

    expect(register).toContain('PENDING_REGISTRATION_KEY')
    expect(register).toContain("emailRedirectTo: `${window.location.origin}/auth/callback?next=/register/complete`")
    expect(register).toContain("localStorage.setItem(PENDING_REGISTRATION_KEY")
    expect(register).not.toContain("supabase.from('vendors').insert")
    expect(register).not.toContain('signInWithPassword')
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
