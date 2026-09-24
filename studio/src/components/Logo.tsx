import React from 'react'
import { Img, staticFile } from 'remotion'
import { colors, brandNameEn } from '../brand/tokens'

export const Logo: React.FC<{ size?: number; lockup?: boolean; dark?: boolean }> = ({
  size = 132,
  lockup = false,
  dark = false,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.18 }}>
    <Img src={staticFile('brand/logo-icon.svg')} style={{ width: size, height: size }} />
    {lockup ? (
      <div
        style={{
          fontFamily: 'Cairo, sans-serif',
          fontWeight: 900,
          fontSize: size * 0.34,
          letterSpacing: -1,
          color: dark ? colors.surface : colors.ink,
          lineHeight: 1,
        }}
      >
        {brandNameEn}
      </div>
    ) : null}
  </div>
)
