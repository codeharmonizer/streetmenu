import type { AdScript } from '../lib/types'

export const relaxedMenuMenuChaosEn: AdScript = {
  id: 'relaxed-menu-menu-chaos-en',
  name: 'Relaxed Menu — Menu Chaos Skit',
  campaign: 'streetmenu-relaxed-menu',
  locale: 'en',
  direction: 'ltr',
  transitionFrames: 8,
  music: { src: 'audio/menu-chaos-beat.wav', volume: 0.052, fadeOutSeconds: 1.2 },
  narration: null,
  cta: {
    headline: 'Stop managing menus like it’s 2005',
    sub: 'Update once. Every customer sees it instantly.',
    button: 'Start free',
    url: 'relaxedmenu.beyounded.com',
  },
  scenes: [
    { id: 'old-price', durationInSeconds: 2.8, kicker: 'Wrong prices?', caption: 'Wrong prices? Awkward.', subCaption: 'Customer sees one price. Staff says another.', emphasis: ['Wrong prices'], media: { kind: 'chaosCard', variant: 'price' }, motion: 'punchZoom', background: 'cream', voiceoverSrc: 'audio/en-sync-fast-01.mp3' },
    { id: 'sold-out', durationInSeconds: 3.0, kicker: 'Sold out?', caption: 'Sold out? Still on the menu.', subCaption: 'Stop selling what is not available.', emphasis: ['Sold out'], media: { kind: 'chaosCard', variant: 'soldOut' }, motion: 'tiltReveal', background: 'night', voiceoverSrc: 'audio/en-sync-fast-02.mp3' },
    { id: 'pdf-chaos', durationInSeconds: 2.6, kicker: 'Menu.pdf chaos', caption: 'PDF_final_FINAL_v7.pdf', subCaption: 'Which one is even correct?', emphasis: ['v7'], media: { kind: 'chaosCard', variant: 'pdf' }, motion: 'kenBurnsIn', background: 'brand', voiceoverSrc: 'audio/en-sync-fast-03.mp3' },
    { id: 'solution', durationInSeconds: 3.6, kicker: 'Relaxed Menu', caption: 'One QR opens a live menu', subCaption: 'No app. No old PDF. No confusion.', emphasis: ['One QR'], media: { kind: 'qrCard', caption: 'Scan the live menu' }, motion: 'riseUp', background: 'cream', voiceoverSrc: 'audio/en-sync-fast-04.mp3' },
    { id: 'soldout-toggle', durationInSeconds: 4.7, kicker: 'Instant updates', caption: 'Update prices. Hide sold-out items.', subCaption: 'Every customer sees the latest version instantly.', emphasis: ['instantly'], media: { kind: 'mockMenu', variant: 'soldOut' }, motion: 'kenBurnsOut', background: 'night', voiceoverSrc: 'audio/en-sync-fast-05.mp3' },
    { id: 'cta', durationInSeconds: 5.1, kicker: 'Scan. View. Order.', caption: 'Relaxed Menu', subCaption: 'Your menu finally works for you.', emphasis: ['Relaxed Menu'], media: { kind: 'logo' }, motion: 'popIn', background: 'brand', transitionOut: 'none', voiceoverSrc: 'audio/en-sync-fast-06.mp3' }
  ],
}
