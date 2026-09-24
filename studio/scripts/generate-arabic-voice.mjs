import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const text = `
العميل: هذا السعر صحيح؟
صاحب المطعم: لا، هذا منيو قديم.
وهذا الطبق موجود؟ خلص من أمس.
وبعدها واتساب: النهائي، النهائي النهائي، نسخة رقم سبعة.
كفاية فوضى.
مع ريلاكسد مينو: QR واحد، منيو محدث، وسعر يتغير فوراً.
ريلاكسد مينو. امسح. شاهد. اطلب.
`.trim();

writeFileSync('/Users/altenativeone/Developer/streetmenu/studio/scripts/menu-chaos-voice.txt', text, 'utf8');

const out = '/Users/altenativeone/Developer/streetmenu/studio/public/audio/menu-chaos-ar-voice-bahrain.mp3';
const result = spawnSync('/Users/altenativeone/.hermes/bin/uv', [
  'run', '--with', 'edge-tts', 'python', '-m', 'edge_tts',
  '--voice', 'ar-BH-AliNeural',
  '--rate', '+45%',
  '--text', text,
  '--write-media', out,
], { stdio: 'inherit' });
process.exit(result.status ?? 1);
