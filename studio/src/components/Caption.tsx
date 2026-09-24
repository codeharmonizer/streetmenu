import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fonts } from '../brand/tokens'
import { wordMotion } from '../motion/presets'

export const Caption: React.FC<{
  text: string
  subText?: string
  emphasis?: string[]
  direction: 'rtl' | 'ltr'
  light?: boolean
}> = ({ text, subText, emphasis = [], direction, light = false }) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const words = text.split(' ')
  return (
    <div dir={direction} style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 900,
          fontSize: 74,
          lineHeight: 1.04,
          letterSpacing: -1.4,
          color: light ? colors.surface : colors.ink,
          textShadow: light ? '0 8px 36px rgba(0,0,0,0.32)' : 'none',
        }}
      >
        {words.map((word, index) => {
          const motion = wordMotion({ frame, fps, durationInFrames }, index)
          const clean = word.replace(/[؟?.,،…]/g, '')
          const isHot = emphasis.some((item) => item.includes(clean) || clean.includes(item))
          return (
            <span
              key={`${word}-${index}`}
              style={{
                display: 'inline-block',
                marginInlineStart: index === 0 ? 0 : 12,
                color: isHot ? colors.brand300 : 'inherit',
                ...motion,
              }}
            >
              {word}
            </span>
          )
        })}
      </div>
      {subText ? (
        <div
          style={{
            marginTop: 22,
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 38,
            lineHeight: 1.25,
            color: light ? 'rgba(255,255,255,0.88)' : colors.inkSoft,
          }}
        >
          {subText}
        </div>
      ) : null}
    </div>
  )
}
