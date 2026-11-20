# Vietnamese voiceover standard

All original story scripts use **VieNeu-TTS v3 Turbo** (open-source, local inference; no paid TTS API key).

## Default voices
- `adam` → built-in preset **Adam**: male Southern Vietnamese voice; default narrator/storyteller.
- `my_duyen` → built-in preset **Mỹ Duyên**: female Southern Vietnamese voice; use only for dialogue, questions, reactions, or another character's point of view when the script needs it. Do not force this voice into every film.

Use the exact preset names above. Keep narration, dialogue, music, ambience, and effects as separate layers until final mix. Existing PaperMotion procedural `voice()` effects are sound design, not spoken narration.

## Story manifest

Place a `voiceover.json` beside each story's `README.md` and `main.ts`:

```json
{
  "lines": [
    { "start_sec": 0.8, "speaker": "adam", "text": "Ngày ấy, ở một vùng đất xa xôi..." },
    { "start_sec": 5.2, "speaker": "my_duyen", "text": "Chuyện gì đã xảy ra vậy?" },
    { "start_sec": 6.4, "speaker": "adam", "text": "Đó là khởi đầu của một sai lầm..." }
  ]
}
```

- `start_sec` is the intended start time in seconds from the beginning of the film.
- `speaker` must be `adam` or `my_duyen`.
- Write short, natural phrases and split long narration into manageable lines.
- Review generated audio and adjust wording/timing before final export.

## GitHub Actions

The renderer accepts an optional `voiceover_manifest` path. When supplied, the workflow installs the CPU-compatible VieNeu SDK, generates speech, and mixes it with the scene's existing soundtrack. No GPU, API key, or paid service is required. The first run downloads the model weights from the public model host and may take longer; GitHub-hosted runner CPU speed and available disk space can affect render time.

Run from **Actions → Render PaperMotion video**, set the manifest path (for example `stories/002-my-story/voiceover.json`), and choose full quality for final output.

The repository includes a GitHub Actions smoke test that synthesizes both presets and uploads short WAV samples for review.

Workflow setup uses the runner's local pip cache only when a dependency manifest is present.

The voice test also checks the generated WAV metadata with FFmpeg/ffprobe.
