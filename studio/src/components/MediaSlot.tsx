import React from 'react'
import { Img, Video, staticFile } from 'remotion'
import { colors, fonts } from '../brand/tokens'
import type { SceneMedia } from '../lib/types'
import { Logo } from './Logo'

const phoneFrame: React.CSSProperties = {
  width: 520,
  height: 900,
  borderRadius: 58,
  padding: 18,
  background: '#111',
  boxShadow: '0 34px 90px rgba(0,0,0,0.34)',
  border: '10px solid #28231F',
  overflow: 'hidden',
}

const MockMenu: React.FC<{ variant?: 'menu' | 'soldOut' | 'orders' }> = ({ variant = 'menu' }) => (
  <div style={phoneFrame}>
    <div style={{ borderRadius: 42, background: colors.surface, height: '100%', padding: 34, fontFamily: fonts.body }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 28, color: colors.brand }}>مطعم محلي</div>
          <div style={{ marginTop: 8, fontWeight: 900, fontSize: 44, color: colors.ink }}>منيو اليوم</div>
        </div>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: colors.brand, color: colors.surface, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 28 }}>QR</div>
      </div>
      {['Machboos Chicken', 'Grilled Halloumi', 'Iced Karak'].map((item, idx) => {
        const sold = variant === 'soldOut' && idx === 1
        return (
          <div key={item} style={{ marginTop: 24, padding: 24, borderRadius: 26, background: sold ? '#F4F0E9' : colors.brandLight, opacity: sold ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18 }}>
              <div style={{ fontWeight: 900, fontSize: 30, color: colors.ink }}>{item}</div>
              <div style={{ fontWeight: 900, fontSize: 28, color: colors.brand }}>{sold ? 'Sold out' : '2.900 BD'}</div>
            </div>
            <div style={{ marginTop: 10, height: 12, width: `${70 - idx * 10}%`, borderRadius: 20, background: sold ? colors.border : colors.brand300 }} />
          </div>
        )
      })}
      <div style={{ marginTop: 34, padding: 22, borderRadius: 24, background: colors.ink, color: colors.surface, fontSize: 28, fontWeight: 900, textAlign: 'center' }}>
        {variant === 'soldOut' ? 'Updated live' : 'Scan. View. Order.'}
      </div>
    </div>
  </div>
)

const ChaosCard: React.FC<{ variant: 'price' | 'soldOut' | 'pdf' }> = ({ variant }) => {
  const content = {
    price: {
      top: 'Printed menu',
      main: 'Old price',
      badge: '2.500 BD',
      crossed: '3.200 BD',
      note: 'Customer sees one price. Staff says another.',
    },
    soldOut: {
      top: 'Kitchen update',
      main: 'Sold out',
      badge: 'Still visible',
      crossed: 'Grilled Halloumi',
      note: 'The menu keeps selling what you do not have.',
    },
    pdf: {
      top: 'WhatsApp menu',
      main: 'PDF_final_FINAL_v7.pdf',
      badge: 'Which one?',
      crossed: 'FINAL_v8.pdf',
      note: 'Too many files. No single source of truth.',
    },
  }[variant]

  return (
    <div style={{ width: 650, minHeight: 660, borderRadius: 46, padding: 38, background: colors.surface, boxShadow: '0 34px 90px rgba(0,0,0,0.28)', fontFamily: fonts.body, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -70, top: -70, width: 220, height: 220, borderRadius: 999, background: colors.brandLight }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 30, color: colors.brand, textTransform: 'uppercase' }}>{content.top}</div>
        <div style={{ padding: '12px 18px', borderRadius: 999, background: colors.brand, color: colors.surface, fontWeight: 900, fontSize: 24 }}>{content.badge}</div>
      </div>
      <div style={{ position: 'relative', marginTop: 44, padding: 34, borderRadius: 34, background: colors.brandLight, border: `3px solid ${colors.brand300}` }}>
        <div style={{ fontWeight: 900, fontSize: variant === 'pdf' ? 44 : 70, lineHeight: 1.02, color: colors.ink }}>{content.main}</div>
        <div style={{ marginTop: 22, fontWeight: 900, fontSize: 38, color: colors.inkSoft, textDecoration: 'line-through', opacity: 0.82 }}>{content.crossed}</div>
      </div>
      <div style={{ position: 'relative', marginTop: 34, padding: 26, borderRadius: 28, background: colors.ink, color: colors.surface, fontWeight: 900, fontSize: 32, lineHeight: 1.18 }}>
        {content.note}
      </div>
      <div style={{ position: 'relative', marginTop: 26, display: 'flex', gap: 14 }}>
        {['No live update', 'Old info', 'Manual fixes'].map((chip) => (
          <div key={chip} style={{ padding: '12px 16px', borderRadius: 999, background: '#F4F0E9', color: colors.ink, fontWeight: 900, fontSize: 22 }}>{chip}</div>
        ))}
      </div>
    </div>
  )
}

export const MediaSlot: React.FC<{ media: SceneMedia }> = ({ media }) => {
  if (media.kind === 'logo') {
    return <Logo size={260} lockup dark />
  }
  if (media.kind === 'mockMenu') {
    return <MockMenu variant={media.variant} />
  }
  if (media.kind === 'screenshot') {
    const img = <Img src={staticFile(media.src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    return media.frame === 'bare' ? img : <div style={phoneFrame}>{img}</div>
  }
  if (media.kind === 'video') {
    return (
      <Video
        src={staticFile(media.src)}
        startFrom={Math.round((media.startFromSeconds ?? 0) * 30)}
        volume={media.volume ?? 0}
        style={{ width: 680, height: 900, objectFit: media.fit ?? 'cover', borderRadius: 44, boxShadow: '0 34px 90px rgba(0,0,0,0.34)' }}
      />
    )
  }
  if (media.kind === 'qrCard') {
    return (
      <div style={{ width: 560, height: 660, borderRadius: 46, background: colors.surface, display: 'grid', placeItems: 'center', boxShadow: '0 34px 90px rgba(0,0,0,0.28)', fontFamily: fonts.body }}>
        <Logo size={200} />
        <div style={{ fontSize: 32, fontWeight: 900, color: colors.ink }}>{media.caption ?? 'Scan to view menu'}</div>
      </div>
    )
  }
  if (media.kind === 'chaosCard') {
    return <ChaosCard variant={media.variant} />
  }
  return (
    <div style={{ width: 650, minHeight: 620, padding: 46, borderRadius: 44, background: 'rgba(255,255,255,0.9)', border: `4px dashed ${colors.brand}`, boxShadow: '0 34px 90px rgba(0,0,0,0.22)', fontFamily: fonts.body }}>
      <div style={{ fontWeight: 900, fontSize: 42, color: colors.ink }}>{media.label}</div>
      <div style={{ marginTop: 24, fontWeight: 700, fontSize: 28, lineHeight: 1.28, color: colors.inkSoft }}>{media.hint ?? 'Drop generated clip here later and replace this placeholder in the script.'}</div>
    </div>
  )
}
