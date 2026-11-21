#!/usr/bin/env python3
"""Prepare sentence-level VieNeu clips and export measured animation cue timings."""
import argparse
import json
import re
import subprocess
import wave
from pathlib import Path

from vieneu import Vieneu

VOICES = {"adam": "Adam", "my_duyen": "Mỹ Duyên"}


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as audio:
        return audio.getnframes() / audio.getframerate()


def trim_wav_silence(path: Path) -> None:
    """Trim only leading/trailing low-level silence; preserve short natural breaths."""
    trimmed = path.with_name(path.stem + ".trim.wav")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(path),
        "-af", "silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.035,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.06,areverse",
        "-c:a", "pcm_s16le", str(trimmed),
    ], check=True)
    duration = wav_duration(trimmed)
    if duration <= 0.20:
        raise SystemExit(f"Voice clip became implausibly short after silence trim: {path} ({duration:.3f}s)")
    trimmed.replace(path)


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [part.strip() for part in parts if part.strip()]


def render_text(manifest: dict, text: str) -> str:
    for key, value in manifest.get("variables", {}).items():
        text = text.replace("{{" + str(key) + "}}", str(value))
    unresolved = re.findall(r"{{\s*([a-zA-Z0-9_]+)\s*}}", text)
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
    schedule_mode = data.get("schedule_mode", "anchored")
    scene_line_indices = data.get("scene_line_indices", [])
    scene_durations = data.get("scene_durations_sec", [])
    target_duration = data.get("target_duration_sec")
    if scene_line_indices or scene_durations:
        if len(scene_line_indices) != len(scene_durations) or not scene_line_indices or scene_line_indices[0] != 0:
            raise SystemExit("Scene timing requires matching scene_line_indices / scene_durations_sec arrays starting at voice line 0.")
        if sorted(scene_line_indices) != scene_line_indices or len(set(scene_line_indices)) != len(scene_line_indices):
            raise SystemExit("scene_line_indices must be strictly increasing and unique.")
        if scene_line_indices[-1] >= len(lines) or any(float(d) <= 0 for d in scene_durations):
            raise SystemExit("Invalid scene timing metadata.")
        scene_starts = []
        elapsed = 0.0
        for duration in scene_durations:
            scene_starts.append(round(elapsed, 4))
            elapsed += float(duration)
        if target_duration is not None and abs(elapsed - float(target_duration)) > 0.01:
            raise SystemExit(f"Scene durations total {elapsed:.2f}s but target_duration_sec is {target_duration}.")
        scene_start_by_line = dict(zip(scene_line_indices, scene_starts))
    else:
        scene_start_by_line = {}
    trim_silence = bool(data.get("trim_silence", False))
    if schedule_mode not in ("anchored", "sequential"):
        raise SystemExit("schedule_mode must be 'anchored' or 'sequential'.")
    if not (0 <= line_gap <= 0.5 and 0 <= sentence_gap <= 0.5):
        raise SystemExit("Narration gaps must be between 0 and 0.5 seconds.")

    for i, line in enumerate(lines):
        if line.get("speaker") not in VOICES:
            raise SystemExit(f"Line {i}: unsupported speaker {line.get('speaker')!r}")
        if not isinstance(line.get("text"), str) or not line["text"].strip():
            raise SystemExit(f"Line {i}: text is required.")
        spoken_text = render_text(data, line["text"])
        sentences = split_sentences(spoken_text)
        requested_start = float(scene_start_by_line.get(i, line.get("start_sec", 0)))
        if i == 0:
            cursor = requested_start
        elif schedule_mode == "sequential":
            cursor = previous_end + line_gap
        else:
            cursor = max(requested_start, previous_end + line_gap)
        gap_before = max(0.0, cursor - previous_end) if i else cursor
        segments = []
        for j, sentence in enumerate(sentences):
            clip = clips_dir / f"line_{i:03d}_seg_{j:02d}.wav"
            audio = tts.infer(sentence, voice=VOICES[line["speaker"]])
            tts.save(audio, str(clip))
            if trim_silence:
                trim_wav_silence(clip)
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
            "gap_before_sec": round(gap_before, 4),
            "segments": segments,
        })
        previous_end = line_end
        print(f"line {i + 1:02d}: {line_start:.2f}s–{line_end:.2f}s; {len(segments)} spoken beats")

    tail = (float(target_duration) - previous_end) if target_duration is not None else float(data.get("tail_duration_sec", 1.25))
    if tail < -0.02:
        raise SystemExit(f"Measured narration overruns target timeline by {-tail:.2f}s; do not speed up or cut narration.")
    total = round(previous_end + max(0.0, tail), 4)
    if target_duration is not None and abs(total - float(target_duration)) > 0.02:
        raise SystemExit(f"Measured timeline {total:.2f}s does not match target {target_duration}s.")
    scene_start_set = set(scene_line_indices)
    gaps = [timing_lines[i]["gap_before_sec"] for i in range(1, len(timing_lines))]
    max_line_gap = max(gaps, default=0.0)
    max_intra_scene_gap = max((timing_lines[i]["gap_before_sec"] for i in range(1, len(timing_lines)) if i not in scene_start_set), default=0.0)
    max_inter_scene_gap = max((timing_lines[i]["gap_before_sec"] for i in range(1, len(timing_lines)) if i in scene_start_set), default=0.0)
    max_sentence_gap = sentence_gap if any(len(line["segments"]) > 1 for line in timing_lines) else 0.0
    timing = {"lines": timing_lines, "duration_sec": total,
              "schedule_mode": schedule_mode, "max_inter_line_gap_sec": round(max_line_gap, 4),
              "max_intra_scene_gap_sec": round(max_intra_scene_gap, 4),
              "max_inter_scene_gap_sec": round(max_inter_scene_gap, 4),
              "scene_line_indices": scene_line_indices,
              "scene_durations_sec": scene_durations,
              "scene_starts_sec": scene_starts if scene_line_indices else [],
              "inter_sentence_gap_sec": round(max_sentence_gap, 4)}
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
