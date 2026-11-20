import {
  type PropSet, type RidgeSpec, type ShaftSpec, type V, fbm1, flora, noise1, ridgeHeight, scatter,
} from '../../../src';

export interface UnderwaterPalette {
  far: string; mid: string; near: string; sand: string; sandBands: string[];
  coral: string[]; coralTip: string; kelp: string[];
}

export interface UnderwaterEnvironment {
  seabed: RidgeSpec;
  ridges: RidgeSpec[];
  shafts: ShaftSpec[];
  midLife: PropSet;
  seabedLife: PropSet;
  groundY: (x: number) => number;
  current: (x: number, y: number, t: number) => V;
}

const DEFAULT_PALETTE: UnderwaterPalette = {
  far: '#2a6a82', mid: '#225a73', near: '#1b4a63', sand: '#b3a07a',
  sandBands: ['#a4916e', '#917f60'], coral: ['#dd7660', '#e89a5c', '#9d6fae'],
  coralTip: '#f6c89a', kelp: ['#2c6a7d', '#306f80'],
};

/** Underwater recipe: layered paper water, living reef, kelp-like flora and volumetric paper-light shafts. */
export function createUnderwater(seed: number, from: number, to: number,
  palette: UnderwaterPalette = DEFAULT_PALETTE): UnderwaterEnvironment {
  const seabed: RidgeSpec = { seed: seed + 1, base: 1010, amp: 26, freq: 0.0012, color: palette.sand, tear: 2.5, shadow: 14,
    bands: palette.sandBands.map((color, i) => ({ offset: 60 + i * 80, color, amp: 20 })),
    patches: { color: '#c1af88', size: [60, 140], every: 260 } };
  const ridges: RidgeSpec[] = [
    { seed: seed + 2, base: 850, amp: 120, freq: 0.0016, octaves: 4, color: palette.far, tear: 3, shadow: 6 },
    { seed: seed + 3, base: 915, amp: 70, freq: 0.002, color: palette.mid, tear: 3, shadow: 8 },
    { seed: seed + 4, base: 965, amp: 50, freq: 0.0026, color: palette.near, tear: 3, shadow: 10 },
  ];
  const midLife = scatter({ seed: seed + 5, from, to, spacing: [70, 200], ground: x => ridgeHeight(ridges[1], x), flex: 0.8,
    makers: [
      { make: flora.tuft({ blades: [3, 6], height: [60, 120], width: 8, colors: palette.kelp }), weight: 3 },
      { make: flora.coral({ height: [50, 90], colors: ['#3b6a84', '#3f6788'], depth: 2 }), weight: 2 },
    ] });
  const seabedLife = scatter({ seed: seed + 6, from, to, spacing: [60, 170], ground: x => ridgeHeight(seabed, x), flex: 1,
    makers: [
      { make: flora.coral({ height: [70, 130], colors: palette.coral, tip: palette.coralTip, light: '#ffe2c4', depth: 3 }), weight: 3 },
      { make: flora.tuft({ blades: [7, 11], height: [22, 40], width: 9, colors: palette.coral }), weight: 2 },
      { make: flora.rock({ size: [14, 30], colors: ['#5d6d70', '#4e5d62'] }), weight: 2 },
    ] });
  const shafts: ShaftSpec[] = [
    { seed: seed + 7, every: 260, top: -900, length: [2900, 3400], width: [60, 150], angle: 0.22, color: [210, 250, 238], alpha: 0.3 },
    { seed: seed + 8, every: 900, top: -900, length: [1700, 2300], width: [110, 220], angle: 0.22, color: [225, 255, 244], alpha: 0.13 },
  ];
  const current = (x: number, y: number, t: number): V => ({
    x: 16 + Math.sin(t * 1.3) * 24 + fbm1(t * 0.3 + x * 0.001, seed + 9) * 14,
    y: noise1(t * 0.5 + x * 0.002 + y * 0.001, seed + 10) * 8,
  });
  return { seabed, ridges, shafts, midLife, seabedLife, groundY: x => ridgeHeight(seabed, x), current };
}
