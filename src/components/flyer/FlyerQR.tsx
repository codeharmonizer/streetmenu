'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function FlyerQR({ url }: { url: string }) {
  return (
    <QRCodeSVG
      value={url}
      size={164}
      bgColor="white"
      fgColor="#1a1814"
      level="H"
      includeMargin={false}
    />
  )
}
