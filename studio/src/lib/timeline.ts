import type { AdScript, Scene } from './types'

export interface TimelineEntry {
  scene: Scene
  index: number
  durationInFrames: number
  /** Frames of the transition that follows this scene (0 for the last one). */
  transitionFrames: number
  /** Absolute start frame on the final timeline, transitions accounted for. */
  from: number
}

export interface Timeline {
  entries: TimelineEntry[]
  totalFrames: number
}

const MIN_SCENE_FRAMES = 12

/**
 * Turns seconds into frames and resolves the overlap introduced by
 * transitions, so `calculateMetadata` and the renderer agree on the length.
 *
 * With TransitionSeries, each transition eats `transitionFrames` from the
 * total, because the outgoing and incoming scenes overlap for that long.
 */
export const buildTimeline = (script: AdScript, fps: number): Timeline => {
  const entries: TimelineEntry[] = []
  let cursor = 0

  script.scenes.forEach((scene, index) => {
    const durationInFrames = Math.max(
      MIN_SCENE_FRAMES,
      Math.round(scene.durationInSeconds * fps),
    )
    const isLast = index === script.scenes.length - 1
    const kind = scene.transitionOut ?? 'fade'
    const transitionFrames =
      isLast || kind === 'none'
        ? 0
        : // A transition can never be longer than the shorter of its neighbours.
          Math.min(
            script.transitionFrames,
            Math.floor(durationInFrames / 2),
            Math.floor(
              Math.max(
                MIN_SCENE_FRAMES,
                Math.round((script.scenes[index + 1]?.durationInSeconds ?? 1) * fps),
              ) / 2,
            ),
          )

    entries.push({ scene, index, durationInFrames, transitionFrames, from: cursor })
    cursor += durationInFrames - transitionFrames
  })

  const last = entries[entries.length - 1]
  const totalFrames = last ? last.from + last.durationInFrames : fps

  return { entries, totalFrames }
}

export const scriptDurationInSeconds = (script: AdScript, fps: number): number =>
  buildTimeline(script, fps).totalFrames / fps
