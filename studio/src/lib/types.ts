/**
 * The ad "script" is the single source of truth for a video: copy, timing,
 * media slots and motion. Templates only know how to *render* a script, so a
 * new ad is a new data file, not a new React component.
 */

export type MotionPreset =
  | 'kenBurnsIn'
  | 'kenBurnsOut'
  | 'punchZoom'
  | 'popIn'
  | 'riseUp'
  | 'tiltReveal'
  | 'static'

export type TransitionKind = 'fade' | 'slideUp' | 'wipe' | 'none'

export type SceneBackground = 'cream' | 'brand' | 'night'

export type SceneMedia =
  /** A product screenshot (PNG/JPG/SVG) in public/screenshots. */
  | { kind: 'screenshot'; src: string; frame?: 'phone' | 'bare' }
  /** The built-in React mock of the public QR menu — always on-brand, no asset needed. */
  | { kind: 'mockMenu'; variant?: 'menu' | 'soldOut' | 'orders' }
  /** An MP4/MOV clip: character shots from Kling / Runway / Pika, or b-roll. */
  | { kind: 'video'; src: string; volume?: number; startFromSeconds?: number; fit?: 'cover' | 'contain' }
  /** A labelled empty slot, so the ad renders end-to-end before the clip exists. */
  | { kind: 'placeholder'; label: string; hint?: string }
  /** Big animated logo moment. */
  | { kind: 'logo' }
  /** Scan-me card with the QR block from the brand mark. */
  | { kind: 'qrCard'; caption?: string }
  /** Product-led problem visuals; no external character/video model needed. */
  | { kind: 'chaosCard'; variant: 'price' | 'soldOut' | 'pdf' }

export interface Scene {
  /** Stable id — also used as the React key and in render logs. */
  id: string
  durationInSeconds: number
  /** Primary caption, in the script's own language. */
  caption: string
  /** Optional second line (e.g. the English gloss under an Arabic caption). */
  subCaption?: string
  /** Small label above the caption: "1/3", "مجاناً", "NEW"… */
  kicker?: string
  /** Words inside `caption` that get the brand highlight treatment. */
  emphasis?: string[]
  media: SceneMedia
  motion?: MotionPreset
  background?: SceneBackground
  transitionOut?: TransitionKind
  /** Per-scene voiceover file in public/audio (one file per line is easiest to re-cut). */
  voiceoverSrc?: string | null
  /** Notes for whoever generates the character clip — shown on placeholders only. */
  note?: string
}

export interface AdCta {
  headline: string
  sub?: string
  button: string
  url: string
}

export interface AdMusic {
  /** Path inside public/, e.g. "audio/track.mp3". */
  src: string
  volume?: number
  fadeOutSeconds?: number
  startFromSeconds?: number
}

export interface AdNarration {
  /** Path inside public/, e.g. "audio/voiceover.mp3". */
  src: string
  volume?: number
  startFromSeconds?: number
}

export interface AdScript {
  id: string
  /** Human name shown in the Remotion sidebar and docs. */
  name: string
  campaign: string
  locale: 'ar' | 'en'
  direction: 'rtl' | 'ltr'
  /** Default cross-scene transition length in frames. */
  transitionFrames: number
  scenes: Scene[]
  cta: AdCta
  music?: AdMusic | null
  narration?: AdNarration | null
}

export interface AdVideoProps {
  script: AdScript
  /** Dashed overlay showing the TikTok/Reels safe box. Off for final renders. */
  showSafeAreaGuides: boolean
  /** Overrides script.music without editing the script file (handy from the CLI). */
  musicSrcOverride: string | null
  /** Top-right watermark logo. Turn off for platforms that penalise it. */
  showWatermark: boolean
}
