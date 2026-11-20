import {
  type PropSet, type RidgeSpec, type SwardSpec, flora, noise1, ridgeHeight, scatter,
} from '../../../src';

export interface GrasslandPalette {
  sky: string; cloud: string; cloudShade: string;
  farHill: string; midHill: string; nearHill: string; ground: string;
  grass: [string, string][]; treeTrunk: string; treeLeaves: string[]; treeLight: string;
  flowers: string[]; rock: string[];
}

export interface GrasslandEnvironment {
  hills: RidgeSpec[];
  clouds: PropSet;
  trees: PropSet;
  details: PropSet;
  sward: SwardSpec;
  groundY: (x: number) => number;
}

const DEFAULT_PALETTE: GrasslandPalette = {
  sky: '#e8b995', cloud: '#fbe0bf', cloudShade: '#f2c8a2',
  farHill: '#d49a7c', midHill: '#b99069', nearHill: '#8f8a52', ground: '#52613a',
  grass: [['#3c4a22', '#72813a'], ['#43522a', '#84933f'], ['#4b5a2c', '#98a247'], ['#536130', '#aeb052']],
  treeTrunk: '#6a4a3a', treeLeaves: ['#6f7a3e', '#7f8a45', '#94984f'], treeLight: '#f6c27a',
  flowers: ['#f7efdc', '#f2e2c4', '#e9b44c', '#e58f6a'], rock: ['#b39a7c', '#a58c70'],
};

/** Reusable golden-hour meadow recipe, based on the demo's layered hills, sward and wind-bent flora. */
export function createGrassland(seed: number, from: number, to: number, ground: (x: number) => number,
  palette: GrasslandPalette = DEFAULT_PALETTE): GrasslandEnvironment {
  const hills: RidgeSpec[] = [
    { seed: seed + 1, base: 700, amp: 70, freq: 0.0014, color: palette.farHill, tear: 3, shadow: 0 },
    { seed: seed + 2, base: 760, amp: 60, freq: 0.002, color: palette.midHill, tear: 3, shadow: 4 },
    { seed: seed + 3, base: 820, amp: 40, freq: 0.0026, color: palette.nearHill, tear: 3, shadow: 6,
      fringe: { color: palette.ground, height: 10, spacing: 9 } },
  ];
  const clouds = scatter({ seed: seed + 4, from, to, spacing: [650, 1000],
    ground: x => 170 + noise1(x * 0.004, seed + 5) * 70,
    makers: [{ make: flora.cloud({ width: [160, 280], color: palette.cloud, shade: palette.cloudShade }), weight: 1 }] });
  const trees = scatter({ seed: seed + 6, from, to, spacing: [120, 300], ground: () => 830, flex: 0.4,
    makers: [
      { make: flora.tree({ height: [160, 260], canopy: [60, 95], trunk: palette.treeTrunk, leaves: palette.treeLeaves, light: palette.treeLight, loose: false }), weight: 3 },
      { make: flora.pine({ height: [170, 260], width: [60, 90], trunk: palette.treeTrunk, leaves: palette.treeLeaves.slice(0, 2) }), weight: 1 },
    ] });
  const details = scatter({ seed: seed + 7, from, to, spacing: [30, 110], ground: x => ground(x) + 4, flex: 1.2,
    makers: [
      { make: flora.rock({ size: [5, 11], colors: palette.rock }), weight: 0.6 },
      { make: flora.flower({ height: [10, 28], petals: palette.flowers, stem: palette.ground, size: [5, 8] }), weight: 1.5 },
      { make: flora.bush({ size: [22, 34], colors: palette.treeLeaves }), weight: 0.5 },
    ] });
  const sward: SwardSpec = {
    seed: seed + 8, ground: x => ground(x) + 8, density: 110, height: [14, 40], width: [4, 7],
    tones: palette.grass, depth: 8, lean: -0.1, flex: 0.7, rows: 2,
    accent: { color: 'rgba(40, 52, 20, 0.8)', share: 0.07 },
  };
  return { hills, clouds, trees, details, sward, groundY: ground };
}

/** Smooth, deterministic meadow breeze. Pass the returned function to drawProps and World.wind. */
export function meadowWind(seed: number, strength = 1): (x: number, y: number, t: number) => { x: number; y: number } {
  return (x, y, t) => ({ x: strength * (18 + noise1(t * 0.55 + x * 0.001, seed) * 26), y: noise1(t * 0.4 + x * 0.002 + y * 0.001, seed + 1) * 5 });
}

export function grasslandGround(ridges: RidgeSpec[], x: number): number {
  const ridge = ridges[ridges.length - 1];
  return ridgeHeight(ridge, x);
}
