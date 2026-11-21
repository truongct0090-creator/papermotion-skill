#!/usr/bin/env python3
"""Free heuristic Vietnamese YouTube SEO pack generator. No API keys or paid AI."""
from __future__ import annotations
import argparse, csv, json, re, subprocess, time, urllib.parse, urllib.request
from collections import Counter
from pathlib import Path

STOP = set("và là của cho với từ một những các trong khi đã đang được bị như nào sao vì gì thế thì mà hay rất hơn nhất vào ra đến về tại theo nếu không có còn từng người hãng năm ngày thời".split())
TRIGGERS = ["vì sao", "như thế nào", "điều gì", "bí mật", "sự thật", "thất bại", "lịch sử", "hành trình"]
CHANNEL = "Mọt Mọt Studio"

def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()

def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; MottoMottoSEO/1.0)"})
    with urllib.request.urlopen(req, timeout=12) as response:
        return json.load(response)

def suggestions(query: str, source: str):
    params = {"client": "firefox", "q": query}
    if source == "youtube":
        params["ds"] = "yt"
    url = "https://suggestqueries.google.com/complete/search?" + urllib.parse.urlencode(params)
    try:
        data = fetch_json(url)
        return [clean(x) for x in data[1] if isinstance(x, str)]
    except Exception as exc:
        print(f"Autocomplete {source} unavailable for {query!r}: {exc}")
        return []

def probe(path: Path) -> dict:
    raw = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
        "format=duration:stream=codec_type,width,height,r_frame_rate", "-of", "json", str(path)], text=True)
    data = json.loads(raw)
    video = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), {})
    return {"duration": float(data.get("format", {}).get("duration", 0)),
            "width": video.get("width"), "height": video.get("height"), "fps": video.get("r_frame_rate")}

def find_story(root: Path, scene: str):
    dirs = [p for p in (root / "stories").glob("*") if p.is_dir()]
    tokens = set(re.findall(r"[a-z0-9]+", scene.lower())) - {"pilot", "full", "draft"}
    ranked = []
    for folder in dirs:
        base = re.sub(r"^\d+-", "", folder.name.lower())
        overlap = len(tokens & set(re.findall(r"[a-z0-9]+", base)))
        if overlap:
            ranked.append((overlap, folder))
    if not ranked:
        return None, "", None
    folder = sorted(ranked, key=lambda x: (-x[0], x[1].name))[0][1]
    readme, manifest = folder / "README.md", folder / "voiceover.json"
    return folder, readme.read_text(encoding="utf-8") if readme.exists() else "", manifest if manifest.exists() else None

def outline_beats(readme: str):
    match = re.search(r"##\s+Dàn ý bản đầy đủ.*?(?=\n##\s+|\Z)", readme, re.S | re.I)
    section = match.group(0) if match else readme
    beats = []
    for line in section.splitlines():
        m = re.match(r"\s*\d+\.\s+(.+)", line)
        if m:
            beats.append(clean(m.group(1)))
    return beats

def manifest_lines(path: Path | None):
    if not path:
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return sorted(data.get("lines", []), key=lambda x: float(x.get("start_sec", 0)))
    except Exception:
        return []

def fmt_time(seconds: float) -> str:
    seconds = max(0, int(seconds))
    return f"{seconds//3600:02d}:{(seconds%3600)//60:02d}:{seconds%60:02d}" if seconds >= 3600 else f"{seconds//60:02d}:{seconds%60:02d}"

def timeline(duration: float, lines: list, beats: list):
    chapters = []
    if lines and float(lines[-1].get("start_sec", 0)) >= duration * 0.70:
        for item in lines:
            t = float(item.get("start_sec", 0))
            text = clean(item.get("text", ""))
            if text and t < duration:
                chapters.append((t, re.split(r"[.!?]", text)[0][:68].strip()))
        source, estimated = "voiceover timestamps", False
    elif beats:
        count = min(len(beats), 14)
        chapters = [(duration * i / count, beats[i][:68]) for i in range(count)]
        source, estimated = "story outline evenly mapped to video duration", True
    else:
        labels = ["Mở đầu và câu hỏi lớn", "Bối cảnh và thời kỳ hoàng kim", "Bước ngoặt của câu chuyện",
                  "Những lựa chọn quan trọng", "Hệ quả và thay đổi", "Di sản và kết luận"]
        chapters = [(duration * i / len(labels), label) for i, label in enumerate(labels)]
        source, estimated = "generic chapter scaffold", True
    compact = []
    for t, label in chapters:
        if not compact or t - compact[-1][0] >= 20:
            compact.append((t, label))
    if not compact or compact[0][0] > 3:
        compact.insert(0, (0, "Mở đầu"))
    return compact, source, estimated

def phrase_candidates(text: str):
    words = re.findall(r"[\wÀ-ỹ]+", text.lower(), flags=re.UNICODE)
    counts = Counter()
    for n in (2, 3, 4):
        for i in range(len(words) - n + 1):
            gram = words[i:i+n]
            if gram[0] in STOP or gram[-1] in STOP or sum(w not in STOP for w in gram) < 2:
                continue
            phrase = " ".join(gram)
            if len(phrase) >= 7:
                counts[phrase] += 1
    return [p for p, _ in counts.most_common(25)]

def title_options(topic: str, story_title: str):
    return [
        f"Vì Sao {topic} Từ Đỉnh Cao Lại Đánh Mất Vị Thế?",
        f"{topic} Đã Đánh Mất Ngôi Vương Như Thế Nào?",
        f"Điều Gì Khiến {topic} Tụt Lại Phía Sau?",
        f"Sự Thật Đằng Sau Câu Chuyện {topic}",
        f"{story_title}: Hành Trình Từ Đỉnh Cao Đến Bước Ngoặt",
        f"Chuyện Gì Đã Xảy Ra Với {topic}?",
        f"{topic} Và Bước Ngoặt Thay Đổi Cả Ngành",
        f"Lịch Sử {topic}: Bài Học Đắt Giá Của Một Đế Chế",
    ]

def title_score(title: str, keywords: list):
    low, score = title.lower(), 0
    if 42 <= len(title) <= 78: score += 25
    elif 30 <= len(title) <= 90: score += 15
    if keywords and keywords[0].lower() in low: score += 35
    score += min(20, sum(1 for trigger in TRIGGERS if trigger in low) * 10)
    if "?" in title: score += 10
    if len(title) > 95: score -= 20
    return score

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--artifact", required=True)
    ap.add_argument("--repo-root", default=".")
    ap.add_argument("--out", default="seo-output")
    args = ap.parse_args()
    video, root, out = Path(args.video), Path(args.repo_root), Path(args.out)
    if not video.is_file():
        raise SystemExit(f"Video not found: {video}")
    out.mkdir(parents=True, exist_ok=True)
    scene = args.artifact.removeprefix("papermotion-").removesuffix("-full")
    meta = probe(video)
    _, readme, manifest_path = find_story(root, scene)
    lines, beats = manifest_lines(manifest_path), outline_beats(readme)
    heading = re.search(r"^#\s+(.+)$", readme, re.M)
    story_title = clean(heading.group(1)) if heading else scene.replace("-", " ").title()
    topic_match = re.search(r"(?i)(?:tập\s+\d+\s*[—:-]\s*)?([^:—|]+)", story_title)
    topic = clean(topic_match.group(1)).strip(" —:-") if topic_match else scene.replace("-", " ").title()
    corpus = story_title + "\n" + readme + "\n" + " ".join(clean(x.get("text", "")) for x in lines)
    seeds = [topic, story_title, scene.replace("-", " ").replace("pilot", "").strip()] + phrase_candidates(corpus)[:8]
    research = {}
    for seed in dict.fromkeys(s for s in seeds if len(s) >= 3):
        for source in ("youtube", "google"):
            for phrase in suggestions(seed, source):
                key = phrase.casefold()
                entry = research.setdefault(key, {"keyword": phrase, "youtube_suggestions": 0, "google_suggestions": 0, "seed": seed})
                entry["youtube_suggestions" if source == "youtube" else "google_suggestions"] += 1
        time.sleep(0.15)
    for entry in research.values():
        entry["score"] = min(100, entry["youtube_suggestions"] * 14 + entry["google_suggestions"] * 8 +
                             (20 if topic.lower() in entry["keyword"].lower() else 0))
        entry["signal"] = "Autocomplete signal; not search-volume data"
    ranked = sorted(research.values(), key=lambda x: (-x["score"], x["keyword"].lower()))
    keyword_list = list(dict.fromkeys([topic] + [x["keyword"] for x in ranked if x["keyword"].lower() != topic.lower()]))[:25]
    options = title_options(topic, story_title)
    selected = max(options, key=lambda x: title_score(x, keyword_list))
    chapters, timeline_source, estimated = timeline(meta["duration"], lines, beats)
    hashtags = []
    for word in [topic, "LichSuCongNghe", "CongNghe", "MotMotStudio"]:
        tag = "#" + re.sub(r"[^\wÀ-ỹ]", "", word.replace(" ", ""), flags=re.UNICODE)
        if len(tag) > 1 and tag not in hashtags: hashtags.append(tag)
    tags = []
    for tag in [topic, story_title, *keyword_list, "lịch sử công nghệ", "câu chuyện công nghệ", CHANNEL]:
        tag = clean(tag).strip(" ,")
        if tag and tag.lower() not in {x.lower() for x in tags}: tags.append(tag)
    tag_string = ", ".join(tags)
    while len(tag_string) > 480 and tags:
        tags.pop()
        tag_string = ", ".join(tags)
    intro = f"Trong video này, {CHANNEL} kể lại {story_title.lower()} — từ bối cảnh ban đầu, những bước ngoặt quan trọng đến bài học phía sau câu chuyện."
    if lines:
        intro = clean(lines[0].get("text", "")) + f" Cùng {CHANNEL} nhìn lại {story_title.lower()} qua những cột mốc đáng chú ý."
    description = [intro, "", "⏱️ NỘI DUNG VIDEO",
                   *[f"{fmt_time(t)} {label}" for t, label in chapters], "",
                   "Nếu yêu thích những câu chuyện lịch sử, công nghệ và các thương hiệu từng thay đổi thế giới, hãy đăng ký Mọt Mọt Studio để theo dõi các tập tiếp theo.",
                   "", " ".join(hashtags)]
    md = ["# YouTube SEO — Mọt Mọt Studio", "", f"**Video:** {video.name}",
          f"**Thời lượng:** {fmt_time(meta['duration'])}", f"**Chủ đề nhận diện:** {story_title}", "",
          "## Tiêu đề được chọn", "", f"**{selected}**", "", "## Các phương án đã cân nhắc",
          *[f"- {x} (điểm nội bộ: {title_score(x, keyword_list)}/100)" for x in sorted(options, key=lambda x: -title_score(x, keyword_list))],
          "", "## Mô tả để dán vào YouTube", "", *description, "", "## Thẻ tag", "", f"\`{tag_string}\`", "",
          "## Nghiên cứu từ khóa", "", "| Từ khóa | YouTube gợi ý | Google gợi ý | Điểm tín hiệu |",
          "|---|---:|---:|---:|"]
    md += [f"| {x['keyword']} | {x['youtube_suggestions']} | {x['google_suggestions']} | {x['score']} |" for x in ranked[:20]]
    md += ["", "## Ghi chú độ tin cậy", "", f"- Nguồn timeline: {timeline_source}.",
           "- Timeline ước lượng theo dàn ý; cần xem lại video trước khi đăng." if estimated else "- Timeline dựng từ timestamp lời thoại.",
           "- Điểm từ khóa là tín hiệu gợi ý công khai, KHÔNG phải lượng tìm kiếm/tháng hay số liệu YouTube Analytics.",
           "- Tiêu đề được tạo và chấm bằng quy tắc miễn phí, không gọi mô hình AI/API trả phí.",
           "- Cần kiểm tra nội dung lịch sử và nguồn dẫn trước khi xuất bản.", ""]
    (out / "youtube_seo.md").write_text("\n".join(md), encoding="utf-8")
    (out / "youtube_description.txt").write_text("\n".join(description) + "\n", encoding="utf-8")
    (out / "youtube_tags.txt").write_text(tag_string + "\n", encoding="utf-8")
    with (out / "keyword_research.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["keyword", "youtube_suggestions", "google_suggestions", "score", "seed", "signal"])
        writer.writeheader()
        writer.writerows(ranked)
    payload = {"channel": CHANNEL, "video": video.name, "artifact": args.artifact, "scene": scene,
               "duration_seconds": meta["duration"], "resolution": [meta["width"], meta["height"]],
               "story_title": story_title, "selected_title": selected, "title_options": options,
               "description": "\n".join(description), "tags": tag_string, "hashtags": hashtags,
               "keywords": ranked, "timeline": [{"seconds": t, "time": fmt_time(t), "label": label} for t, label in chapters],
               "timeline_estimated": estimated, "timeline_source": timeline_source}
    (out / "youtube_seo.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"SEO pack created for {video.name}; duration {fmt_time(meta['duration'])}; {len(ranked)} keyword suggestions; timeline estimated={estimated}")

if __name__ == "__main__":
    main()
