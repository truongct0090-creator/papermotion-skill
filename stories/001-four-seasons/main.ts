import {
  type RidgeSpec, Camera, Mixer, Stage, degree, drawProps, drawRidge, drawShafts, drawSnow, drawSward,
  fillGradient, instrument, note, noise1, ramp, tearWipe, triad, voice, type Stereo,
} from '../../src';
import { CAT_REST, SIGNATURE_CAT_LOOK, Cat } from '../../examples/rooftops/Cat';
import { createGrassland, meadowWind, type GrasslandPalette } from '../shared/environment/grassland';
import { createWinter, snowfall } from '../shared/environment';
import type { View } from '../../src/camera/Camera';

const W = 1920, H = 1080, DURATION = 20, SEASON_LENGTH = 5;
type Season = 'spring' | 'summer' | 'autumn' | 'winter';
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const ground = (x: number) => 862 + Math.sin(x * 0.0022) * 9 + noise1(x * 0.001, 81) * 8;
const groundRidge: RidgeSpec = { seed: 84, base: 862, amp: 12, freq: 0.0022, color: '#6d7542', tear: 2, shadow: 8 };

const PALETTES: Record<Exclude<Season, 'winter'>, GrasslandPalette> = {
  spring: {
    sky: '#9bc9d5', cloud: '#fff0df', cloudShade: '#e9d5c3', farHill: '#b9c99a', midHill: '#91ad72', nearHill: '#6f9256', ground: '#526c3c',
    grass: [['#405c32', '#8bb45e'], ['#4b6c39', '#a7c86b'], ['#587841', '#bdd47c']],
    treeTrunk: '#76513b', treeLeaves: ['#78a85c', '#8fbd68', '#b2cc76'], treeLight: '#f7d28a',
    flowers: ['#fff2e3', '#f4b7c5', '#f2d36d', '#c9a5d8'], rock: ['#a9a18c', '#918b7b'],
  },
  summer: {
    sky: '#78b6d0', cloud: '#fff5e5', cloudShade: '#d9e2dc', farHill: '#a9bd83', midHill: '#819d58', nearHill: '#657e3d', ground: '#465c2d',
    grass: [['#354c24', '#77933d'], ['#40572a', '#91a84b'], ['#4c6330', '#a9b85a']],
    treeTrunk: '#68452f', treeLeaves: ['#4e7838', '#638c3e', '#7d9b48'], treeLight: '#ffe09b',
    flowers: ['#fff2dc', '#f3d36c', '#f3a58e', '#d7b0d8'], rock: ['#9c927c', '#817967'],
  },
  autumn: {
    sky: '#d6a77d', cloud: '#f7d9b5', cloudShade: '#d9b18f', farHill: '#c99a78', midHill: '#a97955', nearHill: '#79633f', ground: '#65513a',
    grass: [['#4b482b', '#8a8242'], ['#66512c', '#b18a42'], ['#785735', '#c59b50']],
    treeTrunk: '#67452f', treeLeaves: ['#a64f32', '#c06b35', '#d49a45'], treeLight: '#f6c078',
    flowers: ['#e7a05e', '#d9784d', '#d5a84d', '#b66e56'], rock: ['#9c8069', '#806d5c'],
  },
};

export class FourSeasonsScene extends Stage {
  private readonly cat: Cat;
  private readonly cam = new Camera(1180, { width: W, height: H, stiffness: 3.8, damping: 4, handheld: 1.5, ease: 2 });
  private readonly grass = {
    spring: createGrassland(110, -1800, 6200, ground, PALETTES.spring),
    summer: createGrassland(210, -1800, 6200, ground, PALETTES.summer),
    autumn: createGrassland(310, -1800, 6200, ground, PALETTES.autumn),
  };
  private readonly winter = createWinter(410, -1800, 6200, ground);
  private readonly winterSnow = snowfall(420, 0.95, 24);
  private nextFootstep = 310;
  private readonly wind = meadowWind(125, 0.9);

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { duration: DURATION, preroll: 0.7, fps: 30 });
    this.paper.light = { x: -0.65, y: 0.75 };
    this.world.ground = ground;
    this.world.wind = (x, y, t) => this.wind(x, y, t);
    this.cat = new Cat(this.world, 260, ground(260), SIGNATURE_CAT_LOOK);
  }

  protected start(): void { this.cam.snap(this.cat.x + 250, this.cat.root.y - 270); }

  protected update(t: number, dt: number): void {
    Object.assign(this.cat.intent, CAT_REST, {
      speed: t < 0.35 ? 165 * ramp(t, 0, 0.35) : 165, facing: 1, tail: 0.82, blink: 1,
    });
    this.cat.update(dt);
    while (this.cat.x >= this.nextFootstep) {
      this.cue('step', { gain: 0.7, pan: Math.max(-0.8, Math.min(0.8, (this.cat.x - 1400) / 2200)) });
      this.nextFootstep += 82;
    }
  }

  protected lateUpdate(t: number, dt: number): void {
    this.cam.update(this.cat.x + 270, dt, t, this.cat.root.y - 270);
  }

  probe(): Record<string, unknown> {
    return { ...super.probe(), season: SEASONS[Math.min(3, Math.floor(this.time / SEASON_LENGTH))], catX: Math.round(this.cat.x), catY: Math.round(this.cat.root.y), soundtrack: 'procedural-four-season-score' };
  }

  protected draw(t: number): void {
    const index = Math.min(3, Math.floor(t / SEASON_LENGTH));
    this.drawSeason(index, t);
    const local = t - index * SEASON_LENGTH;
    if (index < 3 && local > 4.2) {
      tearWipe(this.ctx, ramp(local, 4.2, 4.95), () => this.drawSeason(index + 1, t), {
        seed: 700 + index * 17, angle: index % 2 ? Math.PI / 2 : 0, tear: 28, paper: '#f4ecdd',
      });
    }
  }

  private drawSeason(index: number, t: number): void {
    const season = SEASONS[index], ctx = this.ctx, paper = this.paper, cam = this.cam;
    const skyStops: Record<Season, [number, string][]> = {
      spring: [[0, '#77b6d0'], [0.55, '#c5d8ce'], [1, '#f0d5b0']],
      summer: [[0, '#4f9fc8'], [0.55, '#a9d0c1'], [1, '#f7d49c']],
      autumn: [[0, '#8c9da9'], [0.55, '#d8b08a'], [1, '#e8bd8d']],
      winter: [[0, '#536b91'], [0.55, '#a4b4d0'], [1, '#e3d9d1']],
    };
    fillGradient(ctx, skyStops[season]);
    if (season === 'winter') {
      cam.layer(ctx, 0.16, v => {
        drawRidge(paper, this.winter.ridges[0], v.from, v.to, 1500);
        drawProps(paper, this.winter.far, v.from, v.to, () => 0, t);
      });
      cam.layer(ctx, 0.38, v => drawRidge(paper, this.winter.ridges[1], v.from, v.to, 1500));
      cam.layer(ctx, 0.62, v => {
        drawRidge(paper, this.winter.ridges[2], v.from, v.to, 1500);
        drawProps(paper, this.winter.village, v.from, v.to, () => 0, t);
      });
      cam.layer(ctx, 1, v => {
        this.drawSnowGround(v.from, v.to);
        this.cat.draw(paper);
      });
      cam.layer(ctx, 0.98, v => drawSnow(ctx, this.winterSnow, v, t));
      return;
    }
    const env = this.grass[season], palette = PALETTES[season];
    const wind = (x: number) => this.wind(x, 0, t).x;
    cam.layer(ctx, 0.04, v => {
      drawRidge(paper, env.hills[0], v.from, v.to, 1500);
      drawProps(paper, env.clouds, v.from, v.to, () => 0, t);
    });
    cam.layer(ctx, 0.16, v => drawRidge(paper, env.hills[1], v.from, v.to, 1500));
    cam.layer(ctx, 0.34, v => {
      drawRidge(paper, env.hills[2], v.from, v.to, 1500);
      drawProps(paper, env.trees, v.from, v.to, wind, t);
    });
    cam.layer(ctx, 0.68, v => drawProps(paper, env.details, v.from, v.to, wind, t));
    cam.layer(ctx, 1, v => {
      drawRidge(paper, { ...env.hills[2], seed: 84, base: 862, amp: 12, color: palette.ground }, v.from, v.to, 1500);
      drawSward(paper, { ...env.sward, tones: palette.grass }, v.from, v.to, wind, t, [this.cat.root]);
      this.cat.draw(paper);
    });
    if (season === 'autumn') cam.layer(ctx, 0.92, v => this.drawFallingLeaves(ctx, v, t));
    if (season === 'summer') cam.layer(ctx, 0.08, v => drawShafts(paper, {
      seed: 919, every: 700, top: -400, length: [1100, 1600], width: [90, 190], angle: 0.12,
      color: [255, 240, 190], alpha: 0.12,
    }, v.from, v.to, t));
  }

  private drawSnowGround(from: number, to: number): void {
    drawRidge(this.paper, {
      seed: 940, base: 862, amp: 12, freq: 0.0022, color: '#e7ebf7', tear: 2,
      bands: [{ offset: 36, color: '#c5cde3', amp: 5 }],
    }, from, to, 1500);
  }

  private drawFallingLeaves(ctx: CanvasRenderingContext2D, v: View, t: number): void {
    ctx.save();
    for (let i = 0; i < 54; i++) {
      const x0 = v.from + ((i * 197 + 83) % Math.max(1, v.to - v.from));
      const y0 = 100 + ((i * 113) % 560);
      const x = x0 + Math.sin(t * 1.3 + i * 2.1) * 42 + t * (9 + i % 7);
      const y = y0 + ((t * (35 + i % 18) + i * 71) % 760);
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.7 + i) * 0.8);
      ctx.fillStyle = ['#b85d37', '#d58b3d', '#e0b45c', '#8d633e'][i % 4];
      ctx.beginPath(); ctx.ellipse(0, 0, 7 + i % 5, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  soundtrack(sampleRate: number): Stereo {
    const mix = new Mixer(this.videoLength, sampleRate)
      .bus('ambience', { gain: 0.72, reverb: 0.12 })
      .bus('music', { gain: 0.62, reverb: 0.4 })
      .bus('steps', { gain: 0.8, reverb: 0.08 });
    const ambience = (at: number, seed: number, filter: 'lowpass' | 'bandpass' | 'highpass', freq: number, level: number, duration = 5, crackle = 0) => {
      mix.add('ambience', at, voice.noise({
        duration, seed, filter, freq, q: 0.7, crackle,
        level: t => level * Math.sin(Math.PI * Math.min(1, t / duration)) ** 0.35,
      }, sampleRate), { gain: 0.8, pan: seed % 2 ? -0.25 : 0.25 });
    };
    ambience(0, 101, 'bandpass', 1500, 0.12, 5, 0.28);
    ambience(5, 201, 'highpass', 4200, 0.045, 5, 0.1);
    ambience(10, 301, 'bandpass', 820, 0.14, 5, 0.72);
    ambience(15, 401, 'lowpass', 260, 0.19, 5, 0.12);

    const motifs = [
      { root: note('G4'), mode: 'major' as const, kind: 'harp' as const },
      { root: note('D4'), mode: 'major' as const, kind: 'mallet' as const },
      { root: note('A4'), mode: 'minor' as const, kind: 'harp' as const },
      { root: note('E4'), mode: 'minor' as const, kind: 'box' as const },
    ];
    const pattern = [0, 2, 4, 6, 4, 2, 1, 4, 5, 3];
    for (let s = 0; s < 4; s++) {
      const m = motifs[s], chord = triad(m.root, m.mode, 0);
      for (const [i, n] of chord.entries()) {
        mix.add('music', s * 5, instrument.pad(n - 12, 4.5, sampleRate, {
          seed: 500 + s * 10 + i, cutoff: s === 3 ? 520 : 1100, attack: 0.8, release: 0.9,
        }), { gain: 0.13, pan: (i - 1) * 0.45 });
      }
      for (let i = 0; i < pattern.length; i++) {
        const at = s * 5 + 0.18 + i * 0.47, midi = degree(m.root, m.mode, pattern[i]);
        const buffer = m.kind === 'harp'
          ? instrument.harp(midi, sampleRate, { seed: 800 + s * 100 + i, decay: 0.55 })
          : m.kind === 'mallet' ? instrument.mallet(midi, sampleRate, { decay: 0.26 })
            : instrument.musicBox(midi, sampleRate, { decay: 0.48 });
        mix.add('music', at, buffer, { gain: 0.23, pan: Math.sin(i * 0.8) * 0.45 });
      }
      mix.add('music', s * 5 + 3.7, instrument.chime(m.root + 24, sampleRate), { gain: 0.16, pan: 0.35 });
    }
    for (let i = 0; i < 5; i++) {
      mix.add('ambience', 0.55 + i * 0.82, instrument.chirp(1700 + i * 90, 2300 + i * 80, 0.22, sampleRate, { vibrato: 9 }), { gain: 0.08, pan: -0.5 + i * 0.22 });
    }
    for (const cue of this.sound.cues) {
      if (cue.name !== 'step') continue;
      const season = Math.min(3, Math.floor(cue.at / SEASON_LENGTH)), at = this.videoTime(cue.at), seed = cue.seed;
      mix.add('steps', at, voice.noise({
        duration: 0.16, seed, filter: 'bandpass', freq: season === 3 ? 1150 : season === 2 ? 1900 : 2500,
        q: 0.85, crackle: season === 3 ? 0.75 : season === 2 ? 0.82 : 0.48, attack: 0.002, decay: 0.07,
      }, sampleRate), { gain: 0.42 * cue.gain, pan: cue.pan });
      mix.add('steps', at, voice.thump({
        duration: 0.12, seed: seed + 1, from: 95, to: 55, sweep: 0.025, decay: 0.045, gain: 0.18,
      }, sampleRate), { gain: 0.2, pan: cue.pan });
    }
    return mix.render({ reverb: { room: 0.72, damp: 0.55 }, master: -1.5, ceiling: -1, fadeIn: 0.5, fadeOut: 1.1 });
  }
}
