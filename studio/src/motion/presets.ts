import { interpolate, spring } from 'remotion'
import type { MotionPreset } from '../lib/types'

export interface MotionInput {
  frame: number
  fps: number
  durationInFrames: number
}

export interface MotionOutput {
  transform: string
  opacity: number
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** Springy 0→1 used by most entrances. */
export const enter = ({ frame, fps }: MotionInput, delay = 0, damping = 200) =>
  spring({ frame: frame - delay, fps, config: { damping }, durationInFrames: 22 })

/**
 * Camera moves applied to the media slot. Everything is GPU-cheap
 * (transform + opacity only) so renders stay fast.
 */
export const mediaMotion = (preset: MotionPreset, input: MotionInput): MotionOutput => {
  const { frame, fps, durationInFrames } = input
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], clamp)
  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp)

  switch (preset) {
    case 'kenBurnsIn': {
      const scale = interpolate(progress, [0, 1], [1.04, 1.16])
      const y = interpolate(progress, [0, 1], [0, -22])
      return { transform: `scale(${scale}) translateY(${y}px)`, opacity: fadeIn }
    }
    case 'kenBurnsOut': {
      const scale = interpolate(progress, [0, 1], [1.18, 1.02])
      const y = interpolate(progress, [0, 1], [-18, 6])
      return { transform: `scale(${scale}) translateY(${y}px)`, opacity: fadeIn }
    }
    case 'punchZoom': {
      const s = spring({ frame, fps, config: { damping: 14, mass: 0.6 }, durationInFrames: 18 })
      const drift = interpolate(progress, [0, 1], [0, 0.05])
      return { transform: `scale(${0.82 + s * 0.18 + drift})`, opacity: fadeIn }
    }
    case 'popIn': {
      const s = enter(input, 0, 12)
      return { transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity: s }
    }
    case 'riseUp': {
      const s = enter(input)
      const drift = interpolate(progress, [0, 1], [0, -14])
      return {
        transform: `translateY(${interpolate(s, [0, 1], [90, 0]) + drift}px) scale(${interpolate(s, [0, 1], [0.96, 1])})`,
        opacity: s,
      }
    }
    case 'tiltReveal': {
      const s = enter(input)
      const rot = interpolate(s, [0, 1], [-9, 0])
      const scale = interpolate(progress, [0, 1], [1, 1.06])
      return {
        transform: `perspective(1600px) rotateY(${rot}deg) rotateX(${rot * 0.35}deg) scale(${scale})`,
        opacity: s,
      }
    }
    case 'static':
    default:
      return { transform: 'none', opacity: fadeIn }
  }
}

/** Per-word caption stagger: readable at 30fps, never jittery. */
export const wordMotion = (input: MotionInput, wordIndex: number) => {
  const s = enter(input, 4 + wordIndex * 2, 18)
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
  }
}

/** Fades the last `seconds` of an audio track out to zero. */
export const audioFadeOut = (
  frame: number,
  totalFrames: number,
  fps: number,
  seconds: number,
  baseVolume: number,
) => {
  const fadeFrames = Math.max(1, Math.round(seconds * fps))
  return (
    baseVolume *
    interpolate(frame, [totalFrames - fadeFrames, totalFrames], [1, 0], clamp)
  )
}
