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

No original story has been added yet. The first GitHub Actions run uses the existing `demo`
scene as a smoke test of the headless rendering pipeline. It does not require an AI API.

## Shared environment kit

Before implementing a story scene, read [the shared environment kit](shared/environment/README.md). It contains reusable, parameterized recipes for meadow, underwater, winter, city, weather and night-sky environments, mapped to the original PaperMotion demos and public engine APIs. The original `examples/` remain untouched reference scenes.
