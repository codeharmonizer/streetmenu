import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { ensureFonts } from './brand/fonts'
import { format, square } from './brand/tokens'
import { AdVideo } from './components/AdVideo'
import { buildTimeline } from './lib/timeline'
import type { AdVideoProps } from './lib/types'
import { relaxedMenuMenuChaosAr } from './scripts/relaxedMenuMenuChaos.ar'
import { relaxedMenuMenuChaosEn } from './scripts/relaxedMenuMenuChaos.en'

void ensureFonts()

const AdVideoComponent = AdVideo as unknown as React.FC<Record<string, unknown>>

const props = (script: AdVideoProps['script']): AdVideoProps => ({
  script,
  showSafeAreaGuides: false,
  musicSrcOverride: null,
  showWatermark: true,
})

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="RelaxedMenuAd-AR"
      component={AdVideoComponent}
      width={format.width}
      height={format.height}
      fps={format.fps}
      durationInFrames={buildTimeline(relaxedMenuMenuChaosAr, format.fps).totalFrames}
      defaultProps={props(relaxedMenuMenuChaosAr)}
    />
    <Composition
      id="RelaxedMenuAd-EN"
      component={AdVideoComponent}
      width={format.width}
      height={format.height}
      fps={format.fps}
      durationInFrames={buildTimeline(relaxedMenuMenuChaosEn, format.fps).totalFrames}
      defaultProps={props(relaxedMenuMenuChaosEn)}
    />
    <Composition
      id="RelaxedMenuAd-AR-Square"
      component={AdVideoComponent}
      width={square.width}
      height={square.height}
      fps={square.fps}
      durationInFrames={buildTimeline(relaxedMenuMenuChaosAr, square.fps).totalFrames}
      defaultProps={props(relaxedMenuMenuChaosAr)}
    />
  </>
)

registerRoot(RemotionRoot)
