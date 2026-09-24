import { Config } from '@remotion/cli/config'

/**
 * Global render defaults for the Relaxed Menu ad studio.
 * Anything here can still be overridden per-render with CLI flags.
 */

// H.264 / MP4 is what TikTok, Reels and Telegram all accept without re-encoding.
Config.setVideoImageFormat('jpeg')
Config.setCodec('h264')
Config.setPixelFormat('yuv420p')

// CRF 18 keeps text edges crisp on 1080x1920 without exploding the file size.
Config.setCrf(18)

// Vertical social video is 30fps by default (see src/brand/tokens.ts).
Config.setOverwriteOutput(true)

// Renders go to studio/out/, which is gitignored.
Config.setOutputLocation('out/video.mp4')

// Chrome flags: headless GPU rasterisation gives noticeably smoother gradients.
Config.setChromiumOpenGlRenderer('angle')

// Fail loudly instead of silently shipping an ad with a broken image.
Config.setDelayRenderTimeoutInMilliseconds(60_000)

export {}
