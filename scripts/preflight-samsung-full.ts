/**
 * Samsung Full runtime preflight: every second, narration cue and all 28 scene entrances.
 * Fails before a full-resolution render if timing, scene mapping or runtime drawing is invalid.
 */
import { readFileSync } from 'node:fs';
import { load, open } from './browser.ts';

interface Timing {
  duration_sec: number;
  max_inter_line_gap_sec: number;
  lines: Array<{
    start_sec: number;
    end_sec: number;
    gap_before_sec?: number;
    segments: Array<{ start_sec: number; duration_sec: number; end_sec: number }>;
  }>;
}
const timing = JSON.parse(readFileSync('out/samsung-full-voice-clips/timing.json', 'utf8')) as Timing;
const name = process.argv[2] ?? 'samsung-full';
const sceneLineIndex = [0, ...Array.from({ length: 27 }, (_, i) => i + 2)];
if (timing.lines.length !== 29 || sceneLineIndex.length !== 28) {
  throw new Error(`Samsung Full timing mismatch: expected 29 voice lines / 28 layouts, got ${timing.lines.length} lines.`);
}
for (let i = 1; i < timing.lines.length; i++) {
  const gap = timing.lines[i].start_sec - timing.lines[i - 1].end_sec;
  if (gap < -0.001) throw new Error(`Narration overlap between lines ${i} and ${i + 1}: ${gap.toFixed(3)}s.`);
  if (gap > 0.5) throw new Error(`Excessive silence between lines ${i} and ${i + 1}: ${gap.toFixed(3)}s.`);
}
for (let i = 0; i < timing.lines.length; i++) {
  const segments = timing.lines[i].segments;
  for (let j = 1; j < segments.length; j++) {
    const gap = segments[j].start_sec - segments[j - 1].end_sec;
    if (gap < -0.001 || gap > 0.5) throw new Error(`Invalid sentence gap in line ${i + 1}, segments ${j}–${j + 1}: ${gap.toFixed(3)}s.`);
  }
}
const session = await open();
try {
  const errors: string[] = [];
  const { fps, frames } = await load(session.page, session.base, name, errors);
  const requested = new Set<number>([0, frames - 1]);
  for (let second = 0; second < timing.duration_sec; second += 1) requested.add(Math.floor(second * fps));
  for (const line of timing.lines) {
    requested.add(Math.ceil((line.start_sec + 0.03) * fps));
    requested.add(Math.ceil((line.start_sec + 0.30) * fps));
    requested.add(Math.floor(((line.start_sec + line.end_sec) / 2) * fps));
    requested.add(Math.floor((line.end_sec - 0.03) * fps));
    for (const segment of line.segments) {
      requested.add(Math.ceil((segment.start_sec + 0.03) * fps));
      requested.add(Math.floor((segment.end_sec - 0.02) * fps));
    }
  }
  const sceneFrames = sceneLineIndex.map((lineIndex, sceneIndex) => ({
    frame: Math.ceil((timing.lines[lineIndex].start_sec + 0.08) * fps),
    scene: sceneIndex + 1,
  }));
  for (const cue of sceneFrames) requested.add(cue.frame);
  const samples = [...requested].filter(n => n >= 0 && n < frames).sort((a,b) => a-b);
  for (let i = 0; i < samples.length; i++) {
    const result = await session.page.evaluate(n => (globalThis as unknown as { probe(frame:number):unknown }).probe(n), samples[i]) as { scene?: number; sceneTitle?: string } | null;
    if (errors.length) throw new Error(`${name} runtime error at frame ${samples[i]}: ${errors.join('; ')}`);
    const sceneCue = sceneFrames.find(cue => cue.frame === samples[i]);
    if (sceneCue && result?.scene !== sceneCue.scene) {
      throw new Error(`Scene timing mismatch at frame ${samples[i]}: expected scene ${sceneCue.scene}, got ${result?.scene ?? 'no scene'}.`);
    }
    if (sceneCue && !result?.sceneTitle) throw new Error(`Scene ${sceneCue.scene} has no title at its entrance.`);
    if ((i + 1) % 50 === 0 || i + 1 === samples.length) {
      console.log(`Samsung Full preflight: ${i + 1}/${samples.length} checkpoints passed (frame ${samples[i]}/${frames - 1}).`);
    }
  }
  console.log(`PASS: ${name}; 28 scene entrances; ${samples.length} checkpoints; 29 voice lines; ${frames} frames; max line gap ${timing.max_inter_line_gap_sec.toFixed(3)}s.`);
} finally {
  await session.close();
}
