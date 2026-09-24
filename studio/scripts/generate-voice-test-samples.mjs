import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = '/Users/altenativeone/Developer/streetmenu/studio';
const outDir = `${root}/voice-tests/arabic-menu-chaos`;
mkdirSync(outDir, { recursive: true });

const text = 'العميل: هذا السعر صحيح؟ صاحب المطعم: لا، هذا منيو قديم. كفاية فوضى. مع ريلاكسد مينو، كيو آر واحد ومنيو محدث فوراً.';

const variants = [
  { id: '01-bahrain-laila', voice: 'ar-BH-LailaNeural', rate: '+22%', pitch: '+0Hz' },
  { id: '02-bahrain-ali', voice: 'ar-BH-AliNeural', rate: '+25%', pitch: '+0Hz' },
  { id: '03-uae-fatima', voice: 'ar-AE-FatimaNeural', rate: '+22%', pitch: '+0Hz' },
  { id: '04-kuwait-noura', voice: 'ar-KW-NouraNeural', rate: '+22%', pitch: '+0Hz' },
  { id: '05-saudi-zariyah', voice: 'ar-SA-ZariyahNeural', rate: '+22%', pitch: '+0Hz' },
];

for (const v of variants) {
  const raw = `${outDir}/${v.id}-raw.mp3`;
  const clean = `${outDir}/${v.id}-clean.wav`;
  console.log(`Generating ${v.id}: ${v.voice}`);
  let r = spawnSync('/Users/altenativeone/.hermes/bin/uv', [
    'run', '--with', 'edge-tts', 'python', '-m', 'edge_tts',
    '--voice', v.voice,
    '--rate', v.rate,
    '--pitch', v.pitch,
    '--text', text,
    '--write-media', raw,
  ], { stdio: 'inherit' });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);

  // Light cleanup only: remove low rumble/high hiss and normalize loudness. No heavy denoise that adds artifacts.
  const ff = spawnSync('/Users/altenativeone/.hermes/bin/uv', [
    'run', '--with', 'imageio-ffmpeg', 'python', '-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'
  ], { encoding: 'utf8' });
  const ffmpeg = ff.stdout.trim();
  r = spawnSync(ffmpeg, [
    '-y', '-i', raw,
    '-af', 'highpass=f=80,lowpass=f=10500,loudnorm=I=-17:TP=-1.5:LRA=8',
    '-ar', '48000', '-ac', '1', clean,
  ], { stdio: 'inherit' });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
}
