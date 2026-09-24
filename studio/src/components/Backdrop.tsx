import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors } from '../brand/tokens'
import type { SceneBackground } from '../lib/types'

const palettes: Record<SceneBackground, { from: string; to: string; blob: string }> = {
  cream: { from: colors.bg, to: '#EFE7DA', blob: 'rgba(232, 75, 26, 0.13)' },
  brand: { from: colors.brand, to: colors.brandDark, blob: 'rgba(255, 255, 255, 0.18)' },
  night: { from: colors.night, to: colors.nightSoft, blob: 'rgba(232, 75, 26, 0.30)' },
}

/**
 * Slowly drifting gradient + blobs. Gives every scene motion even when the
 * media slot is a still screenshot, which is what keeps a static ad from
 * looking like a slideshow.
 */
export const Backdrop: React.FC<{ variant?: SceneBackground }> = ({ variant = 'cream' }) => {
  const frame = useCurrentFrame()
  const { durationInFrames, width, height } = useVideoConfig()
  const palette = palettes[variant]
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(160deg, ${palette.from} 0%, ${palette.to} 100%)` }}
    >
      <div
        style={{
          position: 'absolute',
          width: width * 1.1,
          height: width * 1.1,
          borderRadius: '50%',
          background: palette.blob,
          filter: 'blur(90px)',
          left: -width * 0.3 + p * 60,
          top: height * 0.06 - p * 70,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: width * 0.9,
          height: width * 0.9,
          borderRadius: '50%',
          background: palette.blob,
          filter: 'blur(110px)',
          right: -width * 0.25 - p * 40,
          bottom: height * 0.04 + p * 90,
        }}
      />
      {/* Fine grain keeps flat brand fills from banding after H.264 encoding. */}
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </AbsoluteFill>
  )
}
