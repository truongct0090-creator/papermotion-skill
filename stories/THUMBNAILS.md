# Reusable YouTube thumbnail generator

One locked thumbnail composition for PaperMotion stories and future topics.

## Run it

1. Open **Actions → Create reusable YouTube thumbnail → Run workflow**.
2. Enter the headline, category label, optional supporting line, and optionally a direct HTTPS hero-image URL.
3. Download the generated PNG from the workflow artifact.

The first preset is Nokia:
- Headline: **NOKIA ĐÃ THUA NHƯ THẾ NÀO?**
- Kicker: **CÂU CHUYỆN CÔNG NGHỆ**
- Supporting line: optional
- The default right-side composition pairs a recognizable classic Nokia candy-bar phone with a shadowy, question-mark iPhone silhouette to create a curiosity hook.

## Locked visual system

- Canvas: **3840 × 2160 (16:9, 4K PNG)**.
- Background: muted rose **#B08088**, with subtle paper grain and no outer frame.
- Left zone: larger kicker and headline at fixed anchors; optional subtitle stays in its lower-left safe zone.
- Right zone: Nokia phone plus a dark, deliberately mysterious iPhone silhouette with a large question mark.
- Typography: Noto Sans with Vietnamese glyph support; high-contrast cream text and dark red accents.
- Paper-cut collage shapes and the overall left-text/right-visual balance stay consistent.

Only the words and optional supporting hero image change between topics. Keep the title anchors, safe zones, color palette, and object balance fixed when adding a topic. The output is a 4K PNG; file size depends on image complexity and does not by itself determine sharpness.

## Local render

```bash
python -m pip install pillow
python scripts/create_thumbnail.py \
  --title "NOKIA ĐÃ THUA NHƯ THẾ NÀO?" \
  --kicker "CÂU CHUYỆN CÔNG NGHỆ" \
  --output out/nokia-thumbnail.png
```

To use another subject image, add `--image-url 'https://…'` with a direct image URL.
