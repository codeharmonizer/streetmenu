import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getAppUrl } from '@/lib/app-url'
import MetaInteractionTracker from '@/components/shared/MetaInteractionTracker'
import MetaPixelEvents from '@/components/shared/MetaPixelEvents'
import MetaViewContentTracker from '@/components/shared/MetaViewContentTracker'
import { META_PIXEL_ID } from '@/lib/meta-pixel'

const appUrl = getAppUrl()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Relaxed Menu — QR Menu, Restaurant Menu & Food Menu for Bahrain',
  description: 'Relaxed Menu helps restaurants, cafés, stalls, and food businesses create a QR menu, restaurant menu, digital menu, food menu, online ordering, reviews, and menu scan analytics. قوائم QR رقمية وطلبات أونلاين للمطاعم في البحرين.',
  keywords: [
    'Relaxed Menu',
    'ريلاكسد منيو',
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
    'QR menu',
    'digital menu Bahrain',
    'digital menu',
    'restaurant menu',
    'restaurant QR code menu',
    'restaurant digital menu',
    'food menu',
    'online food menu',
    'menu for restaurant',
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
    title: 'Relaxed Menu — QR Menu, Restaurant Menu & Food Menu',
    description: 'Create a QR menu, restaurant menu, digital menu, or food menu for your restaurant, café, stall, or food business. قوائم QR رقمية وطلبات أونلاين للمطاعم.',
    url: appUrl,
    siteName: 'Relaxed Menu',
    type: 'website',
    locale: 'ar_BH',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relaxed Menu — QR Menu, Restaurant Menu & Food Menu',
    description: 'QR menu, restaurant menu, digital menu, food menu, and online ordering for restaurants, cafés, stalls, and food businesses.',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${appUrl}/#software`,
      name: 'Relaxed Menu',
      alternateName: ['ريلاكسد منيو', 'منيو QR للمطاعم', 'قائمة QR للمطاعم', 'منيو QR', 'قائمة QR', 'قائمة طعام رقمية', 'QR menu', 'restaurant menu', 'food menu', 'digital menu'],
      url: `${appUrl}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Relaxed Menu helps restaurants, cafés, stalls, and food businesses create a QR menu, restaurant menu, digital menu, food menu, online ordering, customer reviews, and menu scan analytics.',
      keywords: 'Relaxed Menu, QR menu, restaurant menu, food menu, digital menu, online food menu, restaurant QR code menu, restaurant digital menu, menu for restaurant, قائمة QR, منيو QR, منيو رقمي, قائمة طعام رقمية, طلبات أونلاين للمطاعم, مطاعم البحرين, بسطات البحرين, QR menu Bahrain, digital menu Bahrain, restaurant online ordering',
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
      name: 'Relaxed Menu',
      alternateName: ['ريلاكسد منيو', 'منيو QR للمطاعم', 'قائمة QR للمطاعم', 'QR menu', 'restaurant menu', 'food menu'],
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
      name: 'Relaxed Menu',
      alternateName: ['ريلاكسد منيو', 'منيو QR للمطاعم', 'قائمة QR للمطاعم', 'QR menu', 'restaurant menu', 'food menu', 'digital menu'],
      url: `${appUrl}/`,
      inLanguage: ['ar-BH', 'en'],
      description: 'Relaxed Menu is a QR menu, restaurant menu, digital menu, food menu, and online ordering website for restaurants, cafés, stalls, and food businesses. قوائم QR رقمية وطلبات أونلاين للمطاعم والكافيهات والبسطات في البحرين.',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Suspense fallback={null}>
            <MetaPixelEvents />
            <MetaViewContentTracker />
            <MetaInteractionTracker />
          </Suspense>
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
