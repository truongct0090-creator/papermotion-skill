/**
 * Fast runtime preflight for a long-form scene before spending time on full-resolution encoding.
 * It advances the real stage through the complete timeline but draws only transition/cue checkpoints.
 */
import { readFileSync } from 'node:fs';
import { load, open } from './browser.ts';

interface MeasuredTiming {
  lines: Array<{
    start_sec: number;
    end_sec: number;
    segments: Array<{ start_sec: number; duration_sec: number }>;
  }>;
}
const STORY_TIMING = JSON.parse(readFileSync('out/nokia-voice-clips/timing.json', 'utf8')) as MeasuredTiming;

const name = process.argv[2] ?? 'nokia-full';
const session = await open();
try {
  const errors: string[] = [];
  const { fps, frames } = await load(session.page, session.base, name, errors);
  const requested = new Set<number>([0, frames - 1]);

  for (const line of STORY_TIMING.lines) {
    // Exercise both sides of every paper-tear transition and the interior of each scene.
    requested.add(Math.ceil((line.start_sec + 0.03) * fps));
    requested.add(Math.ceil((line.start_sec + 0.90) * fps));
    requested.add(Math.floor(((line.start_sec + line.end_sec) / 2) * fps));
    requested.add(Math.floor((line.end_sec - 0.03) * fps));

    // Exercise every sentence cue used to time object reveals, not just scene boundaries.
    for (const segment of line.segments) {
      requested.add(Math.ceil((segment.start_sec + 0.03) * fps));
      requested.add(Math.ceil((segment.start_sec + Math.min(0.30, segment.duration_sec * 0.5)) * fps));
    }
  }

  const samples = [...requested].filter(n => n >= 0 && n < frames).sort((a, b) => a - b);
  let checked = 0;
  for (const frame of samples) {
    const probe = await session.page.evaluate(n =>
      (globalThis as unknown as { probe(frame: number): unknown }).probe(n), frame);
    if (errors.length) throw new Error(`${name} runtime error at frame ${frame}: ${errors.join('; ')}`);
    checked++;
    if (checked % 20 === 0 || checked === samples.length) {
      console.log(`Preflight: ${checked}/${samples.length} checkpoints passed (frame ${frame}/${frames - 1}).`);
    }
    void probe;
  }
  console.log(`PASS: ${name} runtime preflight completed; ${checked} checkpoints, ${STORY_TIMING.lines.length} scenes, ${frames} frames.`);
} finally {
  await session.close();
}
