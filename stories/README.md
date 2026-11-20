# Video stories

This folder is reserved for the original video stories we develop together.

## Organization

Create one folder per story, using a short stable slug:

```text
stories/
  001-riverside-grandfather/
    README.md       # approved script, beats, scene notes and production decisions
    main.ts         # PaperMotion Stage implementation (when ready to render)
  002-next-story/
    README.md
    main.ts
```

Keep each story self-contained. The README is the canonical human-readable script; `main.ts`
implements it as a PaperMotion scene. Once a story is ready, register it as a lazy-loaded entry
in `examples/catalog.ts` so the GitHub Actions renderer can select it.

The existing `examples/` directory contains upstream/reference demos. Do not overwrite those
examples with our original stories.

## Current status

- `002-nokia`: first episode in development. A 10-scene, 2-minute draft is rendered by the dedicated `Test Nokia 10-scene pilot` workflow before the full 26-scene episode is approved.
- `001-four-seasons`: reusable animation and environment test story.

The Nokia pilot uses the shared open-source VieNeu-TTS voices and the PaperMotion renderer.

## Shared environment kit

Before implementing a story scene, read [the shared environment kit](shared/environment/README.md). It contains reusable, parameterized recipes for meadow, underwater, winter, city, weather and night-sky environments, mapped to the original PaperMotion demos and public engine APIs. The original `examples/` remain untouched reference scenes.
