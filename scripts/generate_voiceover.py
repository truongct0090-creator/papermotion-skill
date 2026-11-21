#!/usr/bin/env python3
"""Mix pre-rendered sentence-level Vietnamese narration into the rendered MP4."""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

from vieneu import Vieneu

VOICES = {"adam": "Adam", "my_duyen": "Mỹ Duyên"}


def media_duration(path: Path) -> float:
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True, capture_output=True, text=True,
    )
    return float(probe.stdout.strip())


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
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--clips-dir", help="Reuse sentence clips prepared before render.")
    parser.add_argument("--timing-output", help="Optionally export measured voice timing as JSON.")
    args = parser.parse_args()

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    lines = manifest.get("lines", [])
    if not lines:
        raise SystemExit("Voiceover manifest has no lines.")
    for i, line in enumerate(lines):
        if line.get("speaker") not in VOICES:
            raise SystemExit(f"Line {i}: unsupported speaker {line.get('speaker')!r}")
        if not isinstance(line.get("text"), str) or not line["text"].strip():
            raise SystemExit(f"Line {i}: text is required.")
        render_text(manifest, line["text"])

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type",
         "-show_entries", "format=duration", "-of", "json", args.input],
        check=True, capture_output=True, text=True,
    )
    probe_data = json.loads(probe.stdout)
    has_audio = any(s.get("codec_type") == "audio" for s in probe_data.get("streams", []))
    video_duration = float(probe_data["format"]["duration"])

    clip_entries = []
    if args.clips_dir:
        clips_dir = Path(args.clips_dir)
        timing = json.loads((clips_dir / "timing.json").read_text(encoding="utf-8"))
        if len(timing.get("lines", [])) != len(lines):
            raise SystemExit("Prepared timing does not match voiceover manifest line count.")
        for i, line_timing in enumerate(timing["lines"]):
            for segment in line_timing.get("segments", []):
                clip = clips_dir / segment["clip"]
                if not clip.exists():
                    raise SystemExit(f"Prepared voice clip is missing: {clip}")
                clip_entries.append((clip, float(segment["start_sec"]), line["speaker"], segment.get("text", "")))
    else:
        # Compatibility path for older workflows: synthesize each complete dialogue line.
        tts = Vieneu()
        previous_end = 0.0
        gap = float(manifest.get("inter_line_gap_sec", 0.18))
        with tempfile.TemporaryDirectory(prefix="papermotion-voice-") as tmp:
            temp = Path(tmp)
            for i, line in enumerate(lines):
                clip = temp / f"line_{i:03d}.wav"
                spoken_text = render_text(manifest, line["text"])
                tts.save(tts.infer(spoken_text, voice=VOICES[line["speaker"]]), str(clip))
                start = float(line.get("start_sec", 0)) if i == 0 else max(float(line.get("start_sec", 0)), previous_end + gap)
                previous_end = start + media_duration(clip)
                clip_entries.append((clip, start, line["speaker"], spoken_text))
            mix_clips(args, clip_entries, video_duration, has_audio)
            return

    mix_clips(args, clip_entries, video_duration, has_audio)


def mix_clips(args, clip_entries, video_duration: float, has_audio: bool) -> None:
    if not clip_entries:
        raise SystemExit("No voice clips were found to mix.")
    timing_records = []
    with tempfile.TemporaryDirectory(prefix="papermotion-voice-mix-") as tmp:
        temp = Path(tmp)
        inputs = ["-i", args.input]
        base_audio_index = 0
        next_audio_index = 1
        if not has_audio:
            inputs += ["-f", "lavfi", "-t", str(video_duration), "-i",
                       "anullsrc=sample_rate=48000:channel_layout=stereo"]
            base_audio_index = 1
            next_audio_index = 2

        filters = []
        labels = []
        voice_ends = []
        for i, entry in enumerate(clip_entries):
            clip, start_sec = entry[0], entry[1]
            speaker = entry[2] if len(entry) > 2 else None
            spoken_text = entry[3] if len(entry) > 3 else ""
            inputs += ["-i", str(clip)]
            clip_duration = media_duration(clip)
            voice_ends.append(start_sec + clip_duration)
            timing_records.append({
                "index": i,
                "speaker": speaker,
                "start_sec": round(start_sec, 3),
                "end_sec": round(start_sec + clip_duration, 3),
                "duration_sec": round(clip_duration, 3),
                "text": spoken_text,
            })
            delay = round(start_sec * 1000)
            label = f"vo{i}"
            filters.append(f"[{next_audio_index+i}:a]adelay={delay}|{delay},volume=1.0[{label}]")
            labels.append(f"[{label}]")

        required_duration = max(video_duration, max(voice_ends) + 1.25)
        extension = required_duration - video_duration
        if extension > 0.01:
            filters.append(f"[0:v]tpad=stop_mode=clone:stop_duration={extension:.3f}[vout]")
            video_map = "[vout]"
            video_codec = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18"]
        else:
            video_map = "0:v:0"
            video_codec = ["-c:v", "copy"]

        filters.append(
            f"[{base_audio_index}:a]{''.join(labels)}amix=inputs={len(labels)+1}:duration=longest:"
            "dropout_transition=0:normalize=0[aout]"
        )
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        command = [
            "ffmpeg", "-v", "error", "-y", *inputs,
            "-filter_complex", ";".join(filters),
            "-map", video_map, "-map", "[aout]", "-t", f"{required_duration:.3f}",
            *video_codec, "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart", str(output),
        ]
        subprocess.run(command, check=True)
    if args.timing_output:
        timing_path = Path(args.timing_output)
        timing_path.parent.mkdir(parents=True, exist_ok=True)
        timing_path.write_text(json.dumps({
            "schedule_mode": "measured",
            "gap_sec": None,
            "video_duration_sec": round(video_duration, 3),
            "voice_end_sec": round(max(voice_ends, default=0.0), 3),
            "lines": timing_records,
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Voiceover mixed into {args.output} ({len(clip_entries)} sentence clips, final duration {required_duration:.2f}s).")


if __name__ == "__main__":
    main()
