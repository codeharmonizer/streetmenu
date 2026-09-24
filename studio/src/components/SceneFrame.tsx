import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fonts } from '../brand/tokens'
import type { Scene } from '../lib/types'
import { mediaMotion } from '../motion/presets'
import { Backdrop } from './Backdrop'
import { Caption } from './Caption'
import { Logo } from './Logo'
import { MediaSlot } from './MediaSlot'
import { SafeArea } from './SafeArea'

export const SceneFrame: React.FC<{
  scene: Scene
  direction: 'rtl' | 'ltr'
  showWatermark: boolean
}> = ({ scene, direction, showWatermark }) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const motion = mediaMotion(scene.motion ?? 'riseUp', { frame, fps, durationInFrames })
  const dark = scene.background === 'brand' || scene.background === 'night'
  const isBeforeBrandReveal = ['old-paper-menu', 'sold-out-chaos', 'whatsapp-pdf', 'old-price', 'sold-out', 'pdf-chaos'].includes(scene.id)
  const shouldShowWatermark = showWatermark && !isBeforeBrandReveal
  return (
    <AbsoluteFill>
      <Backdrop variant={scene.background ?? 'cream'} />
      {shouldShowWatermark ? (
        <div style={{ position: 'absolute', top: 58, right: 58, opacity: 0.86 }}>
          <Logo size={74} lockup={false} />
        </div>
      ) : null}
      <SafeArea style={{ justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fonts.body, fontWeight: 900, fontSize: 30, color: dark ? 'rgba(255,255,255,0.82)' : colors.brand, textTransform: direction === 'ltr' ? 'uppercase' : undefined }} dir={direction}>
          {scene.kicker}
        </div>
        <div style={{ alignSelf: 'center', transform: motion.transform, opacity: motion.opacity }}>
          <MediaSlot media={scene.media} />
        </div>
        <Caption text={scene.caption} subText={scene.subCaption} emphasis={scene.emphasis} direction={direction} light={dark} />
      </SafeArea>
    </AbsoluteFill>
  )
}
