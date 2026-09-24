import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = '/Users/altenativeone/Developer/streetmenu/studio';
const outDir = `${root}/public/audio/menu-chaos-scenes`;
mkdirSync(outDir, { recursive: true });

const voice = 'ar-BH-AliNeural';
const rate = '+30%';

const scenes = [
  {
    id: 'old-paper-menu',
    file: '01-old-paper-menu.mp3',
    text: 'العميل: هذا السعر صحيح؟ صاحب المطعم: لا، هذا منيو قديم.',
  },
  {
    id: 'sold-out-chaos',
    file: '02-sold-out-chaos.mp3',
    text: 'الزبون: وهذا الطبق موجود؟ صاحب المطعم: خلص من أمس.',
  },
  {
    id: 'whatsapp-pdf',
    file: '03-whatsapp-pdf.mp3',
    text: 'وبعدها واتساب: المنيو النهائي، النهائي النهائي، نسخة رقم سبعة.',
  },
  {
    id: 'solution-reveal',
    file: '04-qr-reveal.mp3',
    text: 'كفاية فوضى. مع ريلاكسد مينو، كيو آر واحد يفتح المنيو المحدث فوراً.',
  },
  {
    id: 'sold-out-toggle',
    file: '05-live-update.mp3',
    text: 'عدّل السعر، أو حط الطبق غير متوفر بثانية. كل الزبائن يشوفون التحديث فوراً.',
  },
  {
    id: 'cta',
    file: '06-cta.mp3',
    text: 'ريلاكسد مينو. امسح. شاهد. اطلب.',
  },
];

writeFileSync(`${root}/scripts/menu-chaos-scene-voiceovers.json`, JSON.stringify(scenes, null, 2), 'utf8');

for (const scene of scenes) {
  const out = `${outDir}/${scene.file}`;
  console.log(`Generating ${scene.id} -> ${out}`);
  const result = spawnSync('/Users/altenativeone/.hermes/bin/uv', [
    'run', '--with', 'edge-tts', 'python', '-m', 'edge_tts',
    '--voice', voice,
    '--rate', rate,
    '--text', scene.text,
    '--write-media', out,
  ], { stdio: 'inherit' });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}
