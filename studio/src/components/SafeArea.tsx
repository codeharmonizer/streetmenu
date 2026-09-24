import React from 'react'
import { useVideoConfig } from 'remotion'
import { getSafeArea } from '../brand/tokens'

/**
 * Positions children inside the platform-safe box (TikTok/Reels chrome sits
 * outside of it). Every text layer in the template goes through this.
 */
export const SafeArea: React.FC<{
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ children, style }) => {
  const { width, height } = useVideoConfig()
  const safe = getSafeArea(width, height)

  return (
    <div
      style={{
        position: 'absolute',
        top: safe.top,
        bottom: safe.bottom,
        left: safe.left,
        right: safe.right,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Dashed debug overlay — toggled by the `showSafeAreaGuides` prop. */
export const SafeAreaGuides: React.FC = () => {
  const { width, height } = useVideoConfig()
  const safe = getSafeArea(width, height)

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
      <div
        style={{
          position: 'absolute',
          top: safe.top,
          bottom: safe.bottom,
          left: safe.left,
          right: safe.right,
          border: '3px dashed rgba(232, 75, 26, 0.85)',
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: safe.top + 8,
          left: safe.left + 8,
          font: "500 24px 'Cairo', sans-serif",
          color: 'rgba(232, 75, 26, 0.9)',
        }}
      >
        safe area {width}×{height}
      </div>
    </div>
  )
}
