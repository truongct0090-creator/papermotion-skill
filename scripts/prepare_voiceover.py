#!/usr/bin/env python3
"""Prepare sentence-level VieNeu clips and export measured animation cue timings."""
import argparse
import json
import re
import wave
from pathlib import Path

from vieneu import Vieneu

VOICES = {"adam": "Adam", "my_duyen": "Mỹ Duyên"}


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as audio:
        return audio.getnframes() / audio.getframerate()


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [part.strip() for part in parts if part.strip()]


def render_text(manifest: dict, text: str) -> str:
    for key, value in manifest.get("variables", {}).items():
        text = text.replace("{{" + str(key) + "}}", str(value))
    unresolved = re.findall(r"{{\\s*([a-zA-Z0-9_]+)\\s*}}", text)
    if unresolved:
        raise SystemExit("Unresolved voiceover template variables: " + ", ".join(unresolved))
    return text

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--clips-dir", required=True)
    parser.add_argument("--timing-module", required=True)
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    lines = data.get("lines", [])
    if not lines:
        raise SystemExit("Voiceover manifest has no lines.")

    clips_dir = Path(args.clips_dir)
    clips_dir.mkdir(parents=True, exist_ok=True)
    tts = Vieneu()
    timing_lines = []
    previous_end = 0.0
    line_gap = float(data.get("inter_line_gap_sec", 0.18))
    sentence_gap = float(data.get("inter_sentence_gap_sec", 0.10))

    for i, line in enumerate(lines):
        if line.get("speaker") not in VOICES:
            raise SystemExit(f"Line {i}: unsupported speaker {line.get('speaker')!r}")
        if not isinstance(line.get("text"), str) or not line["text"].strip():
            raise SystemExit(f"Line {i}: text is required.")
        spoken_text = render_text(data, line["text"])
        sentences = split_sentences(spoken_text)
        requested_start = float(line.get("start_sec", 0))
        cursor = requested_start if i == 0 else max(requested_start, previous_end + line_gap)
        segments = []
        for j, sentence in enumerate(sentences):
            clip = clips_dir / f"line_{i:03d}_seg_{j:02d}.wav"
            audio = tts.infer(sentence, voice=VOICES[line["speaker"]])
            tts.save(audio, str(clip))
            duration = wav_duration(clip)
            end = cursor + duration
            segments.append({
                "index": j,
                "text": sentence,
                "start_sec": round(cursor, 4),
                "duration_sec": round(duration, 4),
                "end_sec": round(end, 4),
                "clip": clip.name,
            })
            cursor = end + (sentence_gap if j < len(sentences) - 1 else 0)
        line_start = segments[0]["start_sec"]
        line_end = segments[-1]["end_sec"]
        timing_lines.append({
            "index": i,
            "speaker": line["speaker"],
            "start_sec": line_start,
            "duration_sec": round(line_end - line_start, 4),
            "end_sec": line_end,
            "segments": segments,
        })
        previous_end = line_end
        print(f"line {i + 1:02d}: {line_start:.2f}s–{line_end:.2f}s; {len(segments)} spoken beats")

    total = round(previous_end + 1.25, 4)
    timing = {"lines": timing_lines, "duration_sec": total}
    (clips_dir / "timing.json").write_text(json.dumps(timing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    module = Path(args.timing_module)
    module.parent.mkdir(parents=True, exist_ok=True)
    module.write_text(
        "/** Generated from measured sentence-level VieNeu WAV durations; do not edit by hand. */\n"
        + "export const STORY_TIMING = "
        + json.dumps(timing, ensure_ascii=False, indent=2)
        + " as const;\n",
        encoding="utf-8",
    )
    print(f"Prepared {sum(len(line['segments']) for line in timing_lines)} sentence clips; animation timeline is {total:.2f}s.")


if __name__ == "__main__":
    main()
