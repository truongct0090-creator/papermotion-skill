# Mọt Mọt Studio — PaperMotion historical-story standard

This is the reusable production contract for every future historical brand story.

## Source of truth

- **Visual and animation master:** `stories/002-nokia/main.ts` on `fix/nokia-papermotion-restored`.
- **Engine:** public primitives in `src/`; never reimplement camera, paper rendering, rig, physics, choreography, transitions, audio or finishing when the repo already provides them.
- **Reference examples:** use the original demos as implementation references for proven engine patterns:
  - `examples/rooftops/Cat.ts` — the recurring Mọt Mọt mascot rig and appearance.
  - `examples/rooftops/main.ts` — cat intent, gait, leap, landing and camera-follow choreography.
  - `examples/demo/*` — paper stage, camera layers, props, title and sound primitives.
  - `examples/rain/*` — weather, environmental interaction, layered sets and character motion.
  - `examples/snow/*` — paper props, physical interaction, tracks and continuous movement.
  - `examples/hands/*`, `examples/embers/*`, `examples/light/*` — paper materials, lighting, particles, fire, atmospheric depth and expressive reveal patterns.
  - `examples/kite/*` — wind, steering, intent-based movement and ballistic leaps.
- Reuse generic engine components and techniques. Keep story-specific sets and objects original to each brand; do not transplant unrelated demo characters or scenes.

## Fixed style contract (must match Nokia Full)

1. 1920×1080 master canvas, 30 fps, PaperMotion one-shot camera movement.
2. Cat starts at world `(470, 890)`; ground at `y=890`; use the same `SIGNATURE_CAT_LOOK` and `Cat` rig.
3. Camera: width/height 1920×1080, stiffness 4, damping 4, handheld 0; initial zoom 1.15 and cut at canvas center. Follow target `cat.x + 500`, y=610, zoom 1.15 in regular scenes; intro zoom 1.75/offset 260; ending zoom 1.28/offset 360.
4. Cat moves continuously at the same Nokia Full pace and jumps at scene boundaries; feet stay on the ground plane. No static presenter pose and no independent screen-space cat layer.
5. Paper materials, light, edge color, shadow color, layered parallax environment, grain, vignette and `tearWipe` scene transitions are inherited from Nokia Full.
6. Every hero prop group appears through Nokia Full's deterministic `paperFlyIn` torn-paper reveal, anchored to measured narration cues. Do not substitute horizontal sliding, fade-only pop-ins or a scene transition used as a prop reveal.
7. Title: one line, Nokia Full position and scale (`x=110,y=142,size=50,maxWidth=650`), auto-fit to remain one line.
8. Subtitle: two lines only, Nokia Full position and style (`x=114,y=220,size=25,maxWidth=650`). Explicitly validate exactly two rendered lines.
9. Text safe zone remains `x=80..780,y=70..440`; props, torn edges and shadows must remain to the right of `x=800`.
10. Props, mascot action, camera beats and sound cues must align to actual sentence-level WAV timing. Adam leads; Mỹ Duyên is a separate emphasis voice and never overlaps Adam.
11. Keep deterministic seeds. No random runtime motion, image-generation assets or unrelated character rigs.

## Reusable story workflow

1. Research and approve the story facts and the 10-scene pilot script.
2. Store dialogue in `stories/<story>/voiceover.json`; separate speakers into distinct lines.
3. Run `scripts/prepare_voiceover.py` to synthesize sentence clips and generate the measured `voiceoverTiming.ts`.
4. Map dialogue lines to scene starts explicitly. Multiple speakers may belong to one visual scene.
5. Build story-specific paper props using `Paper` and engine primitives; reveal every hero group with `paperFlyIn` at its measured cue.
6. Run typecheck, tests and a runtime preflight across every scene, transition and cue.
7. Render a 10-scene review pilot first. Inspect the actual MP4 and contact sheet before approval.
8. Only after pilot approval, extend to 26 content scenes + 2 mascot layouts and render the full master.
9. Verify final duration, 1920×1080, 30 fps, audio stream, voice overlap and MP4 playback before reporting completion.

## Samsung implementation

Samsung pilot must use the exact Nokia Full cat, camera, environment, typography, safe zone, transition and torn-paper reveal code. Only its story metadata, narration and Samsung-specific objects differ. The 10-scene pilot remains a review build; it is not permission to render the 28-layout full film.
