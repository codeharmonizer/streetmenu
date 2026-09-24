import { loadFont } from '@remotion/fonts'
import { staticFile } from 'remotion'

/**
 * Fonts are shipped locally in public/fonts so renders never depend on the
 * network (and never produce a frame with a fallback font in it).
 *
 * Cairo carries the Arabic captions, Bebas Neue the Latin display headlines.
 */
const faces = [
  { family: 'Cairo', weight: '400', file: 'Cairo-400.ttf' },
  { family: 'Cairo', weight: '700', file: 'Cairo-700.ttf' },
  { family: 'Cairo', weight: '900', file: 'Cairo-900.ttf' },
  { family: 'BebasNeue', weight: '400', file: 'BebasNeue-400.ttf' },
] as const

export const fontsReady: Promise<void> = Promise.all(
  faces.map((face) =>
    loadFont({
      family: face.family,
      url: staticFile(`fonts/${face.file}`),
      weight: face.weight,
      format: 'truetype',
    }),
  ),
).then(() => undefined)

/** Call at module scope of every composition entry so the Studio preloads too. */
export const ensureFonts = () => fontsReady
