import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const text = `
العميل: هذا السعر صحيح؟
صاحب المطعم: لا، هذا منيو قديم.
وهذا الطبق موجود؟ خلص من أمس.
وبعدها واتساب: النهائي، النهائي النهائي، نسخة رقم سبعة.
كفاية فوضى.
مع ريلاكسد مينو: كيو آر واحد، منيو محدث، وسعر يتغير فوراً.
ريلاكسد مينو. امسح، شاهد، اطلب.
`.trim();

writeFileSync('/Users/altenativeone/Developer/streetmenu/studio/scripts/menu-chaos-voice-smooth.txt', text, 'utf8');

const variants = [
  { voice: 'ar-BH-LailaNeural', rate: '+36%', file: 'menu-chaos-ar-voice-smooth-laila.mp3' },
  { voice: 'ar-BH-AliNeural', rate: '+38%', file: 'menu-chaos-ar-voice-smooth-ali.mp3' },
  { voice: 'ar-AE-FatimaNeural', rate: '+36%', file: 'menu-chaos-ar-voice-smooth-fatima.mp3' },
];

for (const variant of variants) {
  const out = `/Users/altenativeone/Developer/streetmenu/studio/public/audio/${variant.file}`;
  console.log(`Generating ${variant.voice} ${variant.rate} -> ${out}`);
  const result = spawnSync('/Users/altenativeone/.hermes/bin/uv', [
    'run', '--with', 'edge-tts', 'python', '-m', 'edge_tts',
    '--voice', variant.voice,
    '--rate', variant.rate,
    '--text', text,
    '--write-media', out,
  ], { stdio: 'inherit' });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}
