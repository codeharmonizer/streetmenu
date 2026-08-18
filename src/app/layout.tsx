import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getAppUrl } from '@/lib/app-url'

const appUrl = getAppUrl()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'ScanBite — QR Digital Menus & Online Ordering in Bahrain',
  description: 'ScanBite creates QR-code digital menus, online ordering, customer reviews, and scan analytics for restaurants, cafés, food trucks, and small food businesses in Bahrain.',
  alternates: {
    canonical: '/',
    types: {
      'text/markdown': '/llms.txt',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    title: 'ScanBite — QR Digital Menus & Online Ordering',
    description: 'Create a QR menu for your restaurant or food business. Customers scan, browse, order, review, and track orders without installing an app.',
    url: appUrl,
    siteName: 'ScanBite',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanBite — QR Digital Menus & Online Ordering',
    description: 'QR-code digital menus and online ordering for restaurants, cafés, food trucks, and small food businesses in Bahrain.',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${appUrl}/#software`,
      name: 'ScanBite',
      url: `${appUrl}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'ScanBite creates QR-code digital menus, online ordering, customer reviews, and scan analytics for restaurants, cafés, food trucks, and small food businesses in Bahrain.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BHD',
        description: 'Free plan available for creating a QR digital menu.',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${appUrl}/#organization`,
      name: 'ScanBite',
      url: `${appUrl}/`,
      parentOrganization: {
        '@type': 'Organization',
        name: 'Beyounded',
        url: 'https://beyounded.com/',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${appUrl}/#website`,
      name: 'ScanBite',
      url: `${appUrl}/`,
      inLanguage: ['ar-BH', 'en'],
      description: 'QR-code digital menus and online ordering for Bahrain food businesses.',
      publisher: {
        '@id': `${appUrl}/#organization`,
      },
    },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale   = await getLocale()
  const messages = await getMessages()
  const dir      = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
