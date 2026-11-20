import { type RainSpec, type Sky, type SnowSpec, starSky } from '../../../src';

/** Deterministic snowfall preset; render it in camera-layer coordinates with drawSnow. */
export function snowfall(seed: number, density = 0.8, drift = 18): SnowSpec {
  return { seed, density, period: 0.42, speed: [90, 220], drift, sway: 18, swayRate: 0.7, size: [1, 3.2], color: '#f4f6ff', alpha: [0.25, 0.82] };
}

/** Storm preset with impact splashes; pass a layer-space floor callback to drawRain. */
export function rainfall(seed: number, intensity: 'light' | 'heavy' = 'heavy'): RainSpec {
  const heavy = intensity === 'heavy';
  return { seed, density: heavy ? 1.8 : 0.75, period: heavy ? 0.18 : 0.42, speed: heavy ? 1050 : 720,
    slant: 0.16, length: heavy ? 30 : 20, width: heavy ? 1.8 : 1.1, rgb: '205, 211, 224',
    alpha: heavy ? [0.12, 0.32] : [0.08, 0.2], splash: { color: 'rgba(190,205,220,0.45)', size: 13, life: 0.32 } };
}

/** Night sky with a faint Milky Way, designed to remain stable during camera pans. */
export function nightSky(seed: number, pole = { x: 960, y: 700 }): Sky {
  return starSky({ seed, pole, radius: 1900, count: 260,
    band: { angle: -0.45, offset: 620, width: 220, stars: 150, clouds: 34 },
    tints: ['215, 228, 255', '255, 250, 240', '255, 226, 190'] });
}
