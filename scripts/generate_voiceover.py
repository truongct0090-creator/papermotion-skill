#!/usr/bin/env python3
"""Generate Vietnamese narration/dialogue with VieNeu-TTS and mix it into a rendered MP4."""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path

from vieneu import Vieneu

VOICES = {"adam": "Adam", "my_duyen": "Mỹ Duyên"}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    lines = data.get("lines", [])
    if not lines:
        raise SystemExit("Voiceover manifest has no lines.")
    for i, line in enumerate(lines):
        if line.get("speaker") not in VOICES:
            raise SystemExit(f"Line {i}: speaker must be one of {', '.join(VOICES)}")
        if not isinstance(line.get("start_sec"), (int, float)) or line["start_sec"] < 0:
            raise SystemExit(f"Line {i}: start_sec must be a non-negative number.")
        if not isinstance(line.get("text"), str) or not line["text"].strip():
            raise SystemExit(f"Line {i}: text is required.")

    tts = Vieneu()  # Open-source v3 Turbo; automatically uses CPU/ONNX when no CUDA GPU exists.
    with tempfile.TemporaryDirectory(prefix="papermotion-voice-") as tmp:
        temp = Path(tmp)
        inputs = ["-i", args.input]
        filters = []
        mix_labels = []
        for i, line in enumerate(lines):
            clip = temp / f"line_{i:03d}.wav"
            audio = tts.infer(line["text"], voice=VOICES[line["speaker"]])
            tts.save(audio, str(clip))
            inputs += ["-i", str(clip)]
            delay = round(float(line["start_sec"]) * 1000)
            label = f"vo{i}"
            filters.append(f"[{i+1}:a]adelay={delay}|{delay},volume=1.0[{label}]")
            mix_labels.append(f"[{label}]")

        filters.append(
            f"[0:a]{''.join(mix_labels)}amix=inputs={len(lines)+1}:duration=longest:"
            "dropout_transition=0:normalize=0[aout]"
        )
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        cmd = ["ffmpeg", "-v", "error", "-y", *inputs,
               "-filter_complex", ";".join(filters),
               "-map", "0:v:0", "-map", "[aout]",
               "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
               "-movflags", "+faststart", str(output)]
        subprocess.run(cmd, check=True)
    print(f"Voiceover mixed into {args.output} ({len(lines)} lines).")

if __name__ == "__main__":
    main()
