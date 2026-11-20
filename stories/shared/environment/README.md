# Shared PaperMotion environment kit

This is the reusable environment layer for original historical stories. It composes the **public engine API**; it does not fork the renderer, physics, camera, transition, or weather implementations.

## Coverage mapped from the original demos

| Visual system | Reusable entry point | Engine primitives |
|---|---|---|
| Meadow, grass, flowers, trees, clouds, rolling hills | `createGrassland`, `meadowWind` | `RidgeSpec`, `flora`, `scatter`, `SwardSpec`, `drawSward`, `drawProps`, `pushBend` |
| Underwater, seabed, coral, kelp-like plants, light rays, currents | `createUnderwater` | `RidgeSpec`, `flora.coral`, `flora.tuft`, `drawShafts`, `World.wind`, `Particles`, `Swimmer`, `School` |
| Snow hills, snow-capped conifers, village silhouettes | `createWinter`, `snowfall` | `drawRidge`, `scatter`, `drawSnow`, `Tracks`, `Particles`, `Roller` |
| Night skyline and rooftops | `createCitySkyline`, `nightSky` | `building`, `scatter`, `Surface`, `World.chain/link`, `drawSky` |
| Rain, splashes, puddles, dripping edges | `rainfall` | `drawRain`, `drawRipples`, `drawDrips`, `Particles` |
| Fire, embers, smoke and warm light | Engine `Fire` | `Fire.update`, `Fire.draw`, `Fire.glow`, `Fire.embers` |
| Paper material, depth and atmosphere | Engine directly | `Paper.sheet/piece/blob/ribbon/layer/inside/clip`, `Camera.layer`, `drawShafts`, `grade/grain/wash/vignette` |
| Characters, movement and contact | Engine directly | `Skeleton`, `Gait`, `Strand`, `Hair`, `Leap`, `World`, `Particles`, `Beats`, `Edit`, `Camera` |

## Rendering contract

- Keep the original one-shot camera and continuous simulation. Use `Camera.layer` for depth and `Camera.toLayer` for placing objects in parallax space.
- Draw environment in the same layer coordinate system in which it was scattered. Use `drawProps(paper, set, view.from, view.to, wind, t, pushers)`; pass character feet/body points as pushers so grass and props bend around contact.
- Use `drawSward` for dense grass carpets and `drawProps` for individual flowers, trees, rocks and reeds. Both support wind and character interaction.
- Use `drawSnow` / `drawRain` in the camera layer's current context. Supply a floor callback to rain for roofs, ground, puddles or shelters.
- Use `drawShafts` for sunbeams through water, windows or foliage. Use `Fire` for a physically animated paper flame, embers, smoke and glow.
- Use `Paper.sheet` to keep a character or prop reading as one cut-paper silhouette; use paper layers for haze, glow and depth.
- Keep all random placement seeded. Never use `Math.random` or wall-clock time.

## Important boundaries

This kit reuses generic environment techniques and parameterized engine primitives, not the reference films' casts, exact compositions, story beats or complete scenes. Story-specific houses, fences, branches, lamps, boats and historical landmarks belong in that story's own folder. When a new reusable behavior is needed, add a generic primitive to `src/`, export it from `src/index.ts`, and test it. Do not copy an entire demo scene into a new story.

## Example

```ts
import { drawProps, drawRidge, drawSward, drawShafts, drawSky, drawSnow } from '../../../src';
import { createGrassland, meadowWind, nightSky, snowfall } from '../shared/environment';

const environment = createGrassland(120, -1200, 5200, x => 900 + Math.sin(x * 0.002) * 8);
const wind = meadowWind(121, 0.8);
const sky = nightSky(122);

// In Stage.update: this.world.wind = (x, y, t) => wind(x, y, t);
// In Camera.layer: drawRidge(...); drawProps(..., x => wind(x, 0, t).x, t, [hero.feet]);
// In the same layer: drawSward(..., x => wind(x, 0, t).x, t, [hero.feet]);
// Draw snow/rain in paper.context, and drawSky in the desired camera layer.
```
