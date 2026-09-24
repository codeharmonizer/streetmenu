# Relaxed Menu Ad Video Studio

Local Remotion studio for producing vertical TikTok/Reels ads for Streetmenu / Relaxed Menu.

## What this gives us

- Repeatable 1080×1920 ad renders instead of one-off scripts.
- Arabic + English script files.
- TikTok/Reels safe-area rules baked into the template.
- Real Relaxed Menu logo and local fonts, so renders do not depend on the network.
- Placeholder slots for character clips from Kling, Runway, Pika, Hailuo/MiniMax, or filmed iPhone footage.
- Product UI mock slots that can be replaced with screenshots/video captures later.

## Commands

```bash
cd /Users/altenativeone/Developer/streetmenu/studio
npm run studio          # preview/edit in Remotion Studio
npm run compositions    # list available videos
npm run typecheck       # TypeScript validation
npm run bench           # fast smoke render, first 30 frames
npm run render:ar       # Arabic vertical MP4
npm run render:en       # English vertical MP4
npm run render:square   # square Arabic variant
```

Outputs are written to `studio/out/`.

## Main files

- `src/scripts/relaxedMenuMenuChaos.ar.ts` — Arabic comedy skit script.
- `src/scripts/relaxedMenuMenuChaos.en.ts` — English variant.
- `src/components/AdVideo.tsx` — timeline renderer.
- `src/components/SceneFrame.tsx` — per-scene layout.
- `src/components/MediaSlot.tsx` — product screenshots, AI character clips, placeholders, logo moments.
- `src/brand/tokens.ts` — colors, fonts, safe area, brand URL.
- `public/brand/` — real Relaxed Menu brand assets.
- `public/fonts/` — local render fonts.

## Character-video workflow

1. Write or edit a script in `src/scripts/*.ts`.
2. For each `placeholder` media slot, generate a 3–4 second clip in Kling/Runway/Pika/Hailuo.
3. Save the clip in `studio/public/clips/`.
4. Replace the scene media with:

```ts
media: { kind: 'video', src: 'clips/owner-old-menu.mp4', fit: 'cover' }
```

5. Run `npm run studio` to check timing and captions.
6. Run `npm run render:ar` for the final MP4.

## Prompt pattern for generated character clips

Use short scene-level prompts, not one long movie prompt:

```text
Vertical 9:16 realistic social media ad, Bahraini restaurant owner at a small counter,
stressed comedic expression, holding many printed menus, customer points at old price,
warm restaurant lighting, handheld TikTok style, 3 seconds, no text, no subtitles.
```

Keep text out of generated clips. Remotion adds captions, logo, CTA, and safe-area placement.
