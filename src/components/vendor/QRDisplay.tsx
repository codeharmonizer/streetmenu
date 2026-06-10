'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, ExternalLink } from 'lucide-react'
import { Vendor } from '@/types'
import toast from 'react-hot-toast'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  vendor: Vendor
  menuUrl: string
}

export default function QRDisplay({ vendor, menuUrl }: Props) {
  const qrRef  = useRef<SVGSVGElement>(null)
  const locale = useLocale()
  const t      = useTranslations('publicMenu')
  const isAr   = locale === 'ar'

  function copyLink() {
    navigator.clipboard.writeText(menuUrl)
    toast.success(t('copySuccess'))
  }

  function downloadQR() {
    const svg = qrRef.current
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 80

    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const img = new window.Image()
    img.onload = () => {
      ctx.drawImage(img, 40, 40, size - 80, size - 80)

      ctx.fillStyle = '#1a1814'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(vendor.name, size / 2, size - 20)

      ctx.fillStyle = '#6b6760'
      ctx.font = '13px sans-serif'
      ctx.fillText('Scan to view menu', size / 2, size + 10)

      const link = document.createElement('a')
      link.download = `${vendor.slug}-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {isAr ? 'رمز QR' : 'QR Code'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isAr
            ? 'اطبعه وضعه في مطعمك أو بسطتك. الزبائن يمسحونه لرؤية قائمتك.'
            : 'Print and place it at your restaurant or stall. Customers scan it to see your menu.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Card */}
        <div className="card flex flex-col items-center text-center">
          <div className="p-6 rounded-2xl mb-4" style={{ background: 'var(--surface-2)' }}>
            <QRCodeSVG
              ref={qrRef}
              value={menuUrl}
              size={200}
              level="H"
              fgColor="var(--text-primary)"
              bgColor="transparent"
              imageSettings={{
                src: '/logo-mark.png',
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>
          <p className="font-bold mb-0.5">{vendor.name}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isAr ? 'امسح لرؤية القائمة' : 'Scan to view menu'}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="card">
            <p className="font-semibold mb-1">{isAr ? 'رابط قائمتك' : 'Your menu link'}</p>
            <p className="text-xs mb-3 break-all" style={{ color: 'var(--text-muted)' }}>{menuUrl}</p>
            <div className="flex gap-2">
              <button onClick={copyLink} className="btn-secondary text-xs flex-1">
                <Copy size={13} /> {isAr ? 'نسخ الرابط' : 'Copy link'}
              </button>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex-1">
                <ExternalLink size={13} /> {isAr ? 'فتح' : 'Open'}
              </a>
            </div>
          </div>

          <button onClick={downloadQR} className="btn-primary w-full">
            <Download size={16} /> {isAr ? 'تحميل رمز QR (PNG)' : 'Download QR Code (PNG)'}
          </button>

          <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--brand-light)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--brand)' }}>
              {isAr ? '💡 نصيحة للطباعة' : '💡 Print tip'}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isAr
                ? 'اطبع بحجم 5×5 سم على الأقل لسهولة المسح. الصقه بغلاف لامع لحمايته.'
                : 'Print at minimum 5×5 cm for easy scanning. Laminate it so it\'s weather-resistant.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
