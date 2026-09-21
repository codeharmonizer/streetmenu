import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('Meta Pixel tracking', () => {
  it('installs the Meta Pixel base script in the root layout head with PageView tracking', () => {
    const layout = read('src/app/layout.tsx')

    expect(layout).toContain('MetaPixelEvents')
    expect(layout).toContain('MetaViewContentTracker')
    expect(layout).toContain('MetaInteractionTracker')
    expect(layout).toContain('META_PIXEL_ID')
    expect(layout).toContain("fbq('init', '${META_PIXEL_ID}')")
    expect(layout).toContain("fbq('track', 'PageView')")
    const helper = read('src/lib/meta-pixel.ts')
    expect(helper).not.toContain('em:')
    expect(helper).not.toContain('ph:')
  })

  it('keeps the pixel id centralised and exposes safe browser event helpers without customer data', () => {
    expect(existsSync(join(root, 'src/lib/meta-pixel.ts'))).toBe(true)
    const helper = read('src/lib/meta-pixel.ts')

    expect(helper).toContain("export const META_PIXEL_ID = '1074160848795164'")
    expect(helper).toContain("| 'PageView'")
    expect(helper).toContain("| 'ViewContent'")
    expect(helper).toContain("| 'Lead'")
    expect(helper).toContain("| 'CompleteRegistration'")
    expect(helper).toContain("| 'Subscribe'")
    expect(helper).toContain("| 'Contact'")
    expect(helper).toContain("| 'InitiateCheckout'")
    expect(helper).toContain('trackMetaEvent')
    expect(helper).toContain('trackMetaCustomEvent')
    expect(helper).not.toContain('external_id')
  })

  it('fires ViewContent on public features/pricing, demo menu, and upgrade pricing', () => {
    const landing = read('src/app/page.tsx')
    const demo = read('src/app/demo/page.tsx')
    const upgrade = read('src/app/dashboard/upgrade/page.tsx')

    expect(landing).toContain('data-meta-view-content="features"')
    expect(landing).toContain('data-meta-view-content="pricing"')
    expect(demo).toContain('data-meta-view-content="demo-menu"')
    expect(upgrade).toContain("trackMetaEvent('ViewContent'")
    expect(upgrade).toContain("content_name: 'Upgrade pricing'")
  })

  it('fires Lead after successful contact submissions', () => {
    const contact = read('src/app/contact/page.tsx')

    expect(contact).toContain("trackMetaEvent('Lead'")
    expect(contact).toContain("content_name: 'Contact form'")
    expect(contact).toContain('state?.success')
  })

  it('fires CompleteRegistration only after vendor creation succeeds', () => {
    const complete = read('src/app/register/complete/page.tsx')

    expect(complete).toContain("trackMetaEvent('CompleteRegistration'")
    const creationEventIndex = complete.lastIndexOf("trackMetaEvent('CompleteRegistration'")
    expect(complete.indexOf("const { error: vendorError } = await createVendor")).toBeLessThan(creationEventIndex)
    expect(creationEventIndex).toBeLessThan(complete.lastIndexOf("router.replace('/dashboard')"))
  })

  it('fires Subscribe after successful paid subscription redirects land on the dashboard', () => {
    expect(existsSync(join(root, 'src/components/shared/MetaSubscriptionTracker.tsx'))).toBe(true)
    const tracker = read('src/components/shared/MetaSubscriptionTracker.tsx')
    const dashboardLayout = read('src/app/dashboard/layout.tsx')

    expect(tracker).toContain("subscription === 'success'")
    expect(tracker).toContain("subscription === 'renewed'")
    expect(tracker).toContain("trackMetaEvent('Subscribe'")
    expect(dashboardLayout).toContain('MetaSubscriptionTracker')
  })

  it('tracks high-intent CTA, contact, and checkout interactions without sending customer identifiers', () => {
    expect(existsSync(join(root, 'src/components/shared/MetaInteractionTracker.tsx'))).toBe(true)
    const tracker = read('src/components/shared/MetaInteractionTracker.tsx')
    const upgrade = read('src/app/dashboard/upgrade/page.tsx')

    expect(tracker).toContain('TRACKED_CTA_PATHS')
    expect(tracker).toContain("'/register'")
    expect(tracker).toContain("'/demo'")
    expect(tracker).toContain("'/contact'")
    expect(tracker).toContain("'/dashboard/upgrade'")
    expect(tracker).toContain("trackMetaEvent('Contact'")
    expect(tracker).toContain("trackMetaCustomEvent('CTA_Click'")
    expect(upgrade).toContain("trackMetaEvent('InitiateCheckout'")
    expect(upgrade).toContain("content_name: 'Relaxed Menu Pro'")
    expect(tracker).not.toContain('email:')
    expect(tracker).not.toContain('phone:')
  })
})
