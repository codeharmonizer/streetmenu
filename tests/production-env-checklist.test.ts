import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('production environment checklist', () => {
  it('documents all required production environment variables without secrets', () => {
    expect(existsSync(join(root, '.env.example'))).toBe(true)
    const example = read('.env.example')
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_APP_URL',
      'RESEND_API_KEY',
      'RESEND_FROM_EMAIL',
      'CONTACT_EMAIL',
      'EPAYS_API_VERSION',
      'EPAYS_API_ID',
      'EPAYS_API_MASTER_KEY',
      'EPAYS_TEST_MODE',
      'EPAYS_MODE_TYPE',
      'EPAYS_SETUP_SECRET',
      'EPAYS_MERCHANT_DOMAIN',
    ]

    for (const key of required) {
      expect(example).toContain(`${key}=`)
    }

    expect(example).toContain('https://relaxedmenu.beyounded.com')
    expect(example).not.toMatch(/eyJ|sk_|re_[A-Za-z0-9]|apiMasterKey=\w{12,}/)
  })
})
