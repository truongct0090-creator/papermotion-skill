#!/usr/bin/env python3
"""Generate Vietnamese narration/dialogue with VieNeu-TTS and mix it into a rendered MP4."""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path

from vieneu import Vieneu

VOICES = {"adam": "Adam", "my_duyen": "Mỹ Duyên"}

def media_duration(path: Path) -> float:
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True, capture_output=True, text=True
    )
    return float(probe.stdout.strip())


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
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type",
         "-show_entries", "format=duration", "-of", "json", args.input],
        check=True, capture_output=True, text=True
    )
    probe_data = json.loads(probe.stdout)
    has_audio = any(s.get("codec_type") == "audio" for s in probe_data.get("streams", []))
    duration = float(probe_data["format"]["duration"])

    with tempfile.TemporaryDirectory(prefix="papermotion-voice-") as tmp:
        temp = Path(tmp)
        inputs = ["-i", args.input]
        base_audio_index = 0
        next_audio_index = 1
        if not has_audio:
            inputs += ["-f", "lavfi", "-t", str(duration), "-i",
                       "anullsrc=sample_rate=48000:channel_layout=stereo"]
            base_audio_index = 1
            next_audio_index = 2
        filters = []
        mix_labels = []
        voice_ends = []
        for i, line in enumerate(lines):
            clip = temp / f"line_{i:03d}.wav"
            audio = tts.infer(line["text"], voice=VOICES[line["speaker"]])
            tts.save(audio, str(clip))
            inputs += ["-i", str(clip)]
            start_sec = float(line["start_sec"])
            voice_ends.append(start_sec + media_duration(clip))
            delay = round(start_sec * 1000)
            label = f"vo{i}"
            filters.append(f"[{next_audio_index+i}:a]adelay={delay}|{delay},volume=1.0[{label}]")
            mix_labels.append(f"[{label}]")

        required_duration = max(duration, max(voice_ends) + 1.25)
        extension = required_duration - duration
        if extension > 0.01:
            filters.append(f"[0:v]tpad=stop_mode=clone:stop_duration={extension:.3f}[vout]")
            video_map = "[vout]"
        else:
            video_map = "0:v:0"

        filters.append(
            f"[{base_audio_index}:a]{''.join(mix_labels)}amix=inputs={len(lines)+1}:duration=longest:"
            "dropout_transition=0:normalize=0[aout]"
        )
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        cmd = ["ffmpeg", "-v", "error", "-y", *inputs,
               "-filter_complex", ";".join(filters),
               "-map", video_map, "-map", "[aout]", "-t", f"{required_duration:.3f}",
               "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
               "-movflags", "+faststart", str(output)]
        subprocess.run(cmd, check=True)
    print(f"Voiceover mixed into {args.output} ({len(lines)} lines, final duration {required_duration:.2f}s; speech is never clipped).")

if __name__ == "__main__":
    main()
