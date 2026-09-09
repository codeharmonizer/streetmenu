import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('public menu order UX', () => {
  it('renders a language switcher directly on the public menu page', () => {
    const page = read('src/app/m/[slug]/page.tsx')
    expect(page).toContain("import LanguageSwitcher from '@/components/shared/LanguageSwitcher'")
    expect(page).toContain('<LanguageSwitcher variant="compact"')
  })

  it('stores returning customer info after a successful order and pre-fills future orders', () => {
    const client = read('src/components/menu/PublicMenuClient.tsx')
    expect(client).toContain('SM_CUSTOMER_KEY')
    expect(client).toContain('localStorage.getItem(SM_CUSTOMER_KEY)')
    expect(client).toContain('localStorage.setItem(SM_CUSTOMER_KEY')
    expect(client).toContain('setCustomerName(savedCustomer.name')
    expect(client).toContain('setCustomerPhone(savedCustomer.phone')
  })

  it('keeps cart building available when online ordering is off but blocks final confirmation', () => {
    const client = read('src/components/menu/PublicMenuClient.tsx')
    const messages = read('messages/en.json')

    expect(client).not.toContain('{ordersEnabled && item.available && (')
    expect(client).not.toContain('{ordersEnabled && cartCount > 0 && (')
    expect(client).toContain("disabled={isPending || cartItems.length === 0 || !ordersEnabled}")
    expect(client).toContain("{!ordersEnabled && (")
    expect(client).toContain("tc('ordersTurnedOffByRestaurant')")
    expect(messages).toContain('"ordersTurnedOffByRestaurant": "Online Orders are Turned Off by Restaurant"')
  })
})
