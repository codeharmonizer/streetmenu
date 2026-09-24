import React from 'react'
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import type { AdVideoProps } from '../lib/types'
import { buildTimeline } from '../lib/timeline'
import { audioFadeOut } from '../motion/presets'
import { SafeAreaGuides } from './SafeArea'
import { SceneFrame } from './SceneFrame'

export const AdVideo: React.FC<AdVideoProps> = ({
  script,
  showSafeAreaGuides,
  musicSrcOverride,
  showWatermark,
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()
  const timeline = buildTimeline(script, fps)
  const music = musicSrcOverride ? { src: musicSrcOverride, volume: 0.22, fadeOutSeconds: 1.4 } : script.music

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {music?.src ? (
        <Audio
          src={staticFile(music.src)}
          volume={() => audioFadeOut(frame, timeline.totalFrames, fps, music.fadeOutSeconds ?? 1.2, music.volume ?? 0.2)}
          startFrom={Math.round((music.startFromSeconds ?? 0) * fps)}
        />
      ) : null}
      {script.narration?.src ? (
        <Audio
          src={staticFile(script.narration.src)}
          volume={script.narration.volume ?? 1}
          startFrom={Math.round((script.narration.startFromSeconds ?? 0) * fps)}
        />
      ) : null}
      {timeline.entries.map((entry) => (
        <Sequence key={entry.scene.id} from={entry.from} durationInFrames={entry.durationInFrames}>
          {entry.scene.voiceoverSrc ? (
            <Audio src={staticFile(entry.scene.voiceoverSrc)} volume={1} />
          ) : null}
          <SceneFrame scene={entry.scene} direction={script.direction} showWatermark={showWatermark} />
        </Sequence>
      ))}
      {showSafeAreaGuides ? <SafeAreaGuides /> : null}
    </AbsoluteFill>
  )
}
