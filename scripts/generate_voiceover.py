#!/usr/bin/env python3
"""Generate Vietnamese dialogue and schedule it from measured WAV durations."""
import argparse
import json
import subprocess
import tempfile
import wave
from pathlib import Path

from vieneu import Vieneu

VOICES = {"adam": "Adam", "my_duyen": "Mỹ Duyên"}


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wav:
        if wav.getframerate() <= 0:
            raise ValueError(f"Invalid WAV sample rate: {path}")
        return wav.getnframes() / wav.getframerate()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--timing-output")
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

    schedule_mode = data.get("schedule_mode", "anchored")
    if schedule_mode not in ("anchored", "fixed"):
        raise SystemExit("schedule_mode must be 'anchored' or 'fixed'.")
    gap_sec = float(data.get("gap_sec", 0.35))
    if gap_sec < 0:
        raise SystemExit("gap_sec must be non-negative.")

    tts = Vieneu()
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type",
         "-show_entries", "format=duration", "-of", "json", args.input],
        check=True, capture_output=True, text=True
    )
    probe_data = json.loads(probe.stdout)
    has_audio = any(s.get("codec_type") == "audio" for s in probe_data.get("streams", []))
    video_duration = float(probe_data["format"]["duration"])

    with tempfile.TemporaryDirectory(prefix="papermotion-voice-") as tmp:
        temp = Path(tmp)
        clips = []
        for i, line in enumerate(lines):
            clip = temp / f"line_{i:03d}.wav"
            audio = tts.infer(line["text"], voice=VOICES[line["speaker"]])
            tts.save(audio, str(clip))
            clips.append((clip, wav_duration(clip)))

        timings = []
        cursor = 0.0
        for i, (line, (clip, clip_duration)) in enumerate(zip(lines, clips)):
            requested = float(line["start_sec"])
            if schedule_mode == "anchored":
                start = max(requested, cursor + gap_sec if i else requested)
            else:
                start = requested
            end = start + clip_duration
            if i and start < cursor - 0.001:
                previous = timings[-1]
                raise SystemExit(
                    f"Voice overlap: line {i} ({line['speaker']}) starts at {start:.2f}s "
                    f"before line {i-1} ({previous['speaker']}) ends at {cursor:.2f}s. "
                    "Use schedule_mode='anchored' or move the fixed start time."
                )
            timings.append({
                "index": i,
                "speaker": line["speaker"],
                "start_sec": round(start, 3),
                "end_sec": round(end, 3),
                "duration_sec": round(clip_duration, 3),
                "text": line["text"],
            })
            cursor = end

        final_end = timings[-1]["end_sec"]
        if final_end > video_duration:
            raise SystemExit(
                f"Voiceover ends at {final_end:.2f}s, beyond the {video_duration:.2f}s video. "
                "Shorten the narration or extend the pilot before rendering."
            )

        inputs = ["-i", args.input]
        base_audio_index = 0
        next_audio_index = 1
        if not has_audio:
            inputs += ["-f", "lavfi", "-t", str(video_duration), "-i",
                       "anullsrc=sample_rate=48000:channel_layout=stereo"]
            base_audio_index = 1
            next_audio_index = 2

        filters = []
        mix_labels = []
        for i, ((clip, _), timing) in enumerate(zip(clips, timings)):
            inputs += ["-i", str(clip)]
            delay = round(timing["start_sec"] * 1000)
            label = f"vo{i}"
            filters.append(f"[{next_audio_index+i}:a]adelay={delay}|{delay},volume=1.0[{label}]")
            mix_labels.append(f"[{label}]")

        filters.append(
            f"[{base_audio_index}:a]{''.join(mix_labels)}amix=inputs={len(lines)+1}:duration=longest:"
            "dropout_transition=0:normalize=0[aout]"
        )
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        cmd = ["ffmpeg", "-v", "error", "-y", *inputs,
               "-filter_complex", ";".join(filters),
               "-map", "0:v:0", "-map", "[aout]", "-t", str(video_duration),
               "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
               "-movflags", "+faststart", str(output)]
        subprocess.run(cmd, check=True)

        if args.timing_output:
            timing_path = Path(args.timing_output)
            timing_path.parent.mkdir(parents=True, exist_ok=True)
            timing_path.write_text(json.dumps({
                "schedule_mode": schedule_mode,
                "gap_sec": gap_sec,
                "video_duration_sec": round(video_duration, 3),
                "voice_end_sec": round(final_end, 3),
                "lines": timings,
            }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Voiceover mixed into {args.output} ({len(lines)} lines, no overlapping dialogue).")


if __name__ == "__main__":
    main()
