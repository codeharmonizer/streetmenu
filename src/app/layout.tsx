import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'ScanBite — Scan it. See it. Eat it.',
  description: 'قوائم طعام رقمية وطلبات أونلاين للمطاعم والبسطات. امسح. شاهد. كل.',
  openGraph: {
    title: 'ScanBite',
    description: 'Scan it. See it. Eat it. — Digital menus & online ordering for food businesses.',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale   = await getLocale()
  const messages = await getMessages()
  const dir      = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster
            position={locale === 'ar' ? 'top-right' : 'top-left'}
            toastOptions={{
              style: {
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
