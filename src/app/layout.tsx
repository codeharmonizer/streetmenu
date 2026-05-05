import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'StreetMenu — Scan. See. Eat.',
  description: 'QR-powered menus for street food vendors, food trucks, and home cooks.',
  openGraph: {
    title: 'StreetMenu',
    description: 'Scan the QR code to see what\'s cooking nearby.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
