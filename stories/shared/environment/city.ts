import { type PropSet, building, scatter } from '../../../src';

export interface CityPalette {
  far: string[]; mid: string[]; near: string[];
  farWindow: string; midWindow: string; nearWindow: string;
}

/** Three deterministic skyline depths, adapted from the rooftops and storm-town demos. */
export function createCitySkyline(seed: number, from: number, to: number, palette: CityPalette): {
  far: PropSet; mid: PropSet; near: PropSet;
} {
  return {
    far: scatter({ seed: seed + 1, from, to, spacing: [60, 150], ground: () => 790, flex: 0,
      makers: [{ make: building({ width: [60, 140], height: [90, 240], colors: palette.far, window: palette.farWindow, lit: 0.06 }), weight: 1 }] }),
    mid: scatter({ seed: seed + 2, from, to, spacing: [90, 200], ground: () => 860, flex: 0,
      makers: [{ make: building({ width: [90, 180], height: [120, 280], colors: palette.mid, window: palette.midWindow, lit: 0.1 }), weight: 1 }] }),
    near: scatter({ seed: seed + 3, from, to, spacing: [140, 260], ground: () => 980, flex: 0,
      makers: [{ make: building({ width: [140, 240], height: [160, 320], colors: palette.near, window: palette.nearWindow, lit: 0.12 }), weight: 1 }] }),
  };
}
