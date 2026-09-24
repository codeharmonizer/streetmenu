/**
 * Brand tokens mirrored from src/app/globals.css and tailwind.config.js.
 * Keep these in sync with the web app so ads and product look like one brand.
 */

export const colors = {
  brand: '#E84B1A',
  brandLight: '#FDF1EB',
  brandDark: '#C43D15',
  brand300: '#FFB470',
  brand500: '#FF6B00',

  bg: '#F5F0E8',
  surface: '#FFFFFF',
  surface2: '#EDE8DF',
  border: '#DDD8CE',

  ink: '#1A1A1A',
  inkSoft: '#666660',
  inkMuted: '#999990',

  night: '#141210',
  nightSoft: '#241E19',

  success: '#1E9E62',
  warning: '#E5A400',
} as const

export const fonts = {
  display: "'BebasNeue', 'Cairo', sans-serif",
  /** Cairo covers Arabic + Latin, so it is the safe default for captions. */
  body: "'Cairo', sans-serif",
  arabic: "'Cairo', sans-serif",
} as const

/** Canonical vertical social format. */
export const format = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const

export const square = {
  width: 1080,
  height: 1080,
  fps: 30,
} as const

/**
 * Safe margins for 1080x1920. TikTok/Reels overlay their own UI on top of the
 * frame; nothing readable should live outside this box.
 * Values are for the canonical format and get scaled for other sizes by
 * `getSafeArea()`.
 */
export const safeAreaBase = {
  top: 220,
  bottom: 430,
  left: 80,
  /** Right side holds the like/comment/share rail on TikTok and Reels. */
  right: 190,
} as const

export const getSafeArea = (width: number, height: number) => {
  const sx = width / format.width
  const sy = height / format.height
  return {
    top: Math.round(safeAreaBase.top * sy),
    bottom: Math.round(safeAreaBase.bottom * sy),
    left: Math.round(safeAreaBase.left * sx),
    right: Math.round(safeAreaBase.right * sx),
  }
}

export const brandUrl = 'relaxedmenu.beyounded.com'
export const brandNameEn = 'Relaxed Menu'
export const brandNameAr = 'ريلاكسد مينو'
