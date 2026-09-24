# Kling Prompt Pack — Relaxed Menu Arabic Comedy Skit

Use these clips to replace the placeholder cards in the Remotion animatic.

## Video settings

- Format: vertical 9:16
- Duration: generate each clip around 3–4 seconds; keep performances fast because the approved animatic is 21 seconds
- Style: realistic funny social/TikTok restaurant skit
- Location: small casual restaurant/café in Bahrain/GCC
- Do not add text, captions, logos, watermarks, or readable UI inside Kling clips
- Keep camera phone-like but polished: handheld, warm lighting, expressive acting

## Character continuity

Owner: Bahraini/GCC restaurant owner, early 30s to early 40s, friendly but stressed, casual restaurant uniform or apron.  
Customer: GCC customer, casual clothing, confused but friendly.

Try to reuse the same character description in each Kling generation for consistency.

## Clip 01 — Old printed menu

Filename after export:
`studio/public/clips/01-old-paper-menu.mp4`

Prompt:
```text
Vertical 9:16 realistic funny social media ad. A Bahraini/GCC restaurant owner in a small casual restaurant stands behind the counter wearing a simple apron, holding several old printed menus. A customer points at a price on the printed menu and looks confused. The owner reacts with a stressed funny expression, as if the printed menu is outdated. Warm restaurant lighting, handheld TikTok style, natural comedic acting, polished but realistic, no text, no subtitles, no logos, no watermark.
```

## Clip 02 — Sold-out item

Filename:
`studio/public/clips/02-sold-out-chaos.mp4`

Prompt:
```text
Vertical 9:16 realistic restaurant comedy skit. Same Bahraini/GCC restaurant owner and same customer at a small café counter. Customer points at a dish on the printed menu and asks if it is available. Owner freezes awkwardly, then gives an embarrassed smile because the dish is sold out. Funny timing, warm casual restaurant atmosphere, handheld TikTok style, no text, no subtitles, no logos, no watermark.
```

## Clip 03 — WhatsApp PDF chaos

Filename:
`studio/public/clips/03-whatsapp-pdf.mp4`

Prompt:
```text
Vertical 9:16 comedic social ad. Same restaurant owner sits at a small desk or counter, overwhelmed by a smartphone and many printed papers around him, representing too many menu PDF versions being sent on WhatsApp. He scrolls quickly and looks confused and stressed. Chaotic funny energy, Gulf/Bahrain restaurant vibe, handheld TikTok style, no readable text on screen, no subtitles, no logos, no watermark.
```

## Clip 04 — QR reveal

Filename:
`studio/public/clips/04-qr-reveal.mp4`

Prompt:
```text
Vertical 9:16 modern restaurant table scene. Same customer scans a QR code card on the table with a phone. The same restaurant owner watches and looks relieved and confident. Clean modern casual restaurant, warm lighting, polished social ad look, gentle handheld movement, customer smiles as the menu opens on the phone. No readable text, no subtitles, no logos, no watermark.
```

## Clip 05 — Happy live update

Filename:
`studio/public/clips/05-live-update.mp4`

Prompt:
```text
Vertical 9:16 realistic social ad. Same restaurant owner is now calm and smiling, using a tablet or laptop behind the counter to update the digital menu. Customer browses the phone menu happily at the table. Modern small restaurant, upbeat ending, warm lighting, handheld but polished, natural acting, no readable text, no subtitles, no logos, no watermark.
```

## Current synced animatic

`/Users/altenativeone/Developer/streetmenu/social-assets/arabic-comedy/relaxed-menu-arabic-menu-chaos-animatic-v4-synced.mp4`

## Remotion replacement mapping

After Kling exports are saved in `studio/public/clips/`, replace each placeholder scene media with:

```ts
media: { kind: 'video', src: 'clips/01-old-paper-menu.mp4', fit: 'cover' }
media: { kind: 'video', src: 'clips/02-sold-out-chaos.mp4', fit: 'cover' }
media: { kind: 'video', src: 'clips/03-whatsapp-pdf.mp4', fit: 'cover' }
media: { kind: 'video', src: 'clips/04-qr-reveal.mp4', fit: 'cover' }
media: { kind: 'video', src: 'clips/05-live-update.mp4', fit: 'cover' }
```
