import { type PropMaker, type PropSet, type RidgeSpec, building, pick, ridgeHeight, scatter, within } from '../../../src';
import type { Paper } from '../../../src';

/** Reusable snow-covered conifer maker, generalized from the snow demo's tiered paper pines. */
export function snowyPine(o: { height: [number, number]; width: [number, number]; colors: string[]; snow: string }): PropMaker {
  return (r, x, y, seed) => {
    const h = within(r, o.height), w = within(r, o.width), color = pick(r, o.colors), tiers = 3 + Math.floor(r() * 2);
    return {
      x, y,
      draw(paper: Paper, sway: number) {
        paper.tube([{ x, y: y + 4 }, { x, y: y - h * 0.25 }], w * 0.1, w * 0.08, '#2c2a40', { seed, tear: 0.6, shadow: 3 });
        for (let i = 0; i < tiers; i++) {
          const k = i / tiers, base = y - h * (0.15 + k * 0.62), ww = w * (1 - k * 0.6), tip = base - h * 0.4;
          const shift = sway * h * 0.05 * (1 + k);
          paper.piece([{ x: x - ww / 2 + shift * 0.5, y: base }, { x: x + ww / 2 + shift * 0.5, y: base }, { x: x + shift, y: tip }], color, { seed: seed + 5 + i, tear: 1.2, shadow: 5 });
          paper.piece([{ x: x - ww * 0.47 + shift * 0.5, y: base - 2 }, { x: x - ww * 0.12 + shift * 0.6, y: base - 7 }, { x: x + ww * 0.3 + shift * 0.5, y: base - 4 }, { x: x + ww * 0.47 + shift * 0.5, y: base }, { x: x - ww * 0.47 + shift * 0.5, y: base + 3 }], o.snow, { seed: seed + 20 + i, tear: 1, shadow: 0, edge: false });
          paper.piece([{ x: x + shift - ww * 0.1, y: tip + h * 0.1 }, { x: x + shift, y: tip }, { x: x + shift + ww * 0.1, y: tip + h * 0.1 }, { x: x + shift, y: tip + h * 0.13 }], o.snow, { seed: seed + 40 + i, tear: 0.6, shadow: 0, edge: false });
        }
      },
    };
  };
}

export interface WinterEnvironment {
  ridges: RidgeSpec[];
  far: PropSet;
  village: PropSet;
}

/** Winter hills, snow-capped forests and a warm-window village, using deterministic scatter. */
export function createWinter(seed: number, from: number, to: number, ground: (x: number) => number): WinterEnvironment {
  const ridges: RidgeSpec[] = [
    { seed: seed + 1, base: 560, amp: 70, freq: 0.0025, color: '#8f9acb', tear: 3, bands: [{ offset: 90, color: '#7f8bbd', amp: 30 }] },
    { seed: seed + 2, base: 690, amp: 40, freq: 0.004, color: '#aab3d9', tear: 2.5 },
    { seed: seed + 3, base: 830, amp: 45, freq: 0.003, color: '#c7cee8', tear: 2 },
  ];
  const far = scatter({ seed: seed + 4, from, to, spacing: [26, 70], ground: x => ridgeHeight(ridges[1], x) + 6,
    makers: [{ make: snowyPine({ height: [70, 120], width: [40, 60], colors: ['#65709e', '#5c6794'], snow: '#c9d1ec' }), weight: 1 }] });
  const village = scatter({ seed: seed + 5, from, to, spacing: [110, 150], ground: x => ground(x) + 10,
    makers: [{ make: building({ width: [70, 120], height: [45, 70], colors: ['#6d6a95', '#7a7098', '#636390'], window: '#ffcf7a', lit: 0.35 }), weight: 1 }] });
  return { ridges, far, village };
}
