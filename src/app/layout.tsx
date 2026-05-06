import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'StreetMenu — امسح. شاهد. كل.',
  description: 'قوائم طعام رقمية بالرمز QR لأصحاب البسطات وشاحنات الطعام والمطابخ المنزلية.',
  openGraph: {
    title: 'StreetMenu',
    description: 'امسح رمز QR لترى ما يُطبخ قريباً.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <Toaster
          position="top-right"
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
      </body>
    </html>
  )
}
