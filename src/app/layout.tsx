import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getAppUrl } from '@/lib/app-url'

const appUrl = getAppUrl()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'ScanBite — قوائم QR رقمية وطلبات أونلاين للمطاعم في البحرين',
  description: 'ScanBite يساعد المطاعم والكافيهات والبسطات في البحرين على إنشاء قائمة طعام رقمية برمز QR، استقبال طلبات أونلاين، عرض تقييمات الزبائن، وتتبع مسح القائمة. QR digital menus and online ordering for Bahrain food businesses.',
  keywords: [
    'ScanBite',
    'سكان بايت',
    'قائمة QR',
    'قائمة كيو آر',
    'منيو QR',
    'منيو رقمي',
    'قائمة طعام رقمية',
    'قائمة مطعم رقمية',
    'طلبات أونلاين للمطاعم',
    'طلبات مطاعم اونلاين',
    'رمز QR للمطاعم',
    'منيو مطاعم البحرين',
    'قوائم مطاعم البحرين',
    'مطاعم البحرين',
    'بسطات البحرين',
    'QR menu Bahrain',
    'digital menu Bahrain',
    'restaurant QR code menu',
    'online ordering Bahrain',
  ],
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
    title: 'ScanBite — قوائم QR رقمية وطلبات أونلاين',
    description: 'أنشئ منيو QR لمطعمك أو بسطتك. الزبائن يمسحون، يتصفحون، يطلبون، ويقيّمون بدون تحميل تطبيق.',
    url: appUrl,
    siteName: 'ScanBite',
    type: 'website',
    locale: 'ar_BH',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanBite — قوائم QR رقمية وطلبات أونلاين',
    description: 'قوائم طعام رقمية برمز QR وطلبات أونلاين للمطاعم والكافيهات والبسطات في البحرين.',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${appUrl}/#software`,
      name: 'ScanBite',
      alternateName: ['سكان بايت', 'منيو QR للمطاعم', 'قائمة QR للمطاعم', 'منيو QR', 'قائمة QR', 'قائمة طعام رقمية'],
      url: `${appUrl}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'ScanBite يساعد المطاعم والكافيهات والبسطات في البحرين على إنشاء قائمة طعام رقمية برمز QR، استقبال طلبات أونلاين، عرض تقييمات الزبائن، وتتبع مسح القائمة. QR-code digital menus and online ordering for Bahrain food businesses.',
      keywords: 'قائمة QR, منيو QR, منيو رقمي, قائمة طعام رقمية, طلبات أونلاين للمطاعم, مطاعم البحرين, بسطات البحرين, QR menu Bahrain, digital menu Bahrain, restaurant online ordering',
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
      alternateName: ['سكان بايت', 'منيو QR للمطاعم', 'قائمة QR للمطاعم'],
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
      alternateName: ['سكان بايت', 'منيو QR للمطاعم', 'قائمة QR للمطاعم'],
      url: `${appUrl}/`,
      inLanguage: ['ar-BH', 'en'],
      description: 'قوائم QR رقمية وطلبات أونلاين للمطاعم والكافيهات والبسطات في البحرين. QR-code digital menus and online ordering for Bahrain food businesses.',
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
