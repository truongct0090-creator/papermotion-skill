# Four seasons — first render test

A 20-second, 30 fps continuous one-shot walk starring the mauve signature cat from the original Rooftops demo.

- 0–5s: spring meadow, flowers, birdlike synthesized chirps and harp.
- 5–10s: summer greens, sunlight shafts, insect-like ambience and warm mallet.
- 10–15s: autumn foliage, drifting leaves, dry rustle and plucked strings.
- 15–20s: winter hills, snow-covered pines and village, snowfall and music-box tones.
- The cat keeps walking across all four seasons; the original engine `tearWipe` makes the paper-cut transitions.
- All sound is generated offline with the repository's `voice`, `instrument`, and `Mixer` APIs. No voiceover and no external audio assets.

Run with `pnpm render seasons20 --draft --jobs 1`. The dedicated workflow uploads MP4, WAV, cue log and audio inspection image.
