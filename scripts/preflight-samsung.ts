/**
 * Samsung pilot runtime preflight, sampling every second and every narration cue.
 * This deliberately exercises the real Nokia Full camera, cat rig, torn-paper reveals and transitions.
 */
import { readFileSync } from 'node:fs';
import { load, open } from './browser.ts';

interface Timing {
  duration_sec: number;
  lines: Array<{
    start_sec: number;
    end_sec: number;
    segments: Array<{ start_sec: number; duration_sec: number; end_sec: number }>;
  }>;
}
const timing = JSON.parse(readFileSync('out/samsung-voice-clips/timing.json', 'utf8')) as Timing;
const name = process.argv[2] ?? 'samsung-pilot';
const session = await open();
try {
  const errors: string[] = [];
  const { fps, frames } = await load(session.page, session.base, name, errors);
  const requested = new Set<number>([0, frames - 1]);
  for (let second = 0; second < timing.duration_sec; second += 1) requested.add(Math.floor(second * fps));
  for (const line of timing.lines) {
    requested.add(Math.ceil((line.start_sec + 0.03) * fps));
    requested.add(Math.ceil((line.start_sec + 0.90) * fps));
    requested.add(Math.floor(((line.start_sec + line.end_sec) / 2) * fps));
    requested.add(Math.floor((line.end_sec - 0.03) * fps));
    for (const segment of line.segments) {
      requested.add(Math.ceil((segment.start_sec + 0.03) * fps));
      requested.add(Math.ceil((segment.start_sec + Math.min(0.30, segment.duration_sec * 0.5)) * fps));
    }
  }
  const samples = [...requested].filter(n => n >= 0 && n < frames).sort((a,b) => a-b);
  for (let i = 0; i < samples.length; i++) {
    await session.page.evaluate(n => (globalThis as unknown as { probe(frame:number):unknown }).probe(n), samples[i]);
    if (errors.length) throw new Error(`${name} runtime error at frame ${samples[i]}: ${errors.join('; ')}`);
    if ((i + 1) % 20 === 0 || i + 1 === samples.length) {
      console.log(`Samsung preflight: ${i + 1}/${samples.length} checkpoints passed (frame ${samples[i]}/${frames - 1}).`);
    }
  }
  console.log(`PASS: ${name}; ${samples.length} checkpoints; ${timing.lines.length} voice lines; ${frames} frames.`);
} finally {
  await session.close();
}
