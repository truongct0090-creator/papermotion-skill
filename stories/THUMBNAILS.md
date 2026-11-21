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
- If no image URL is supplied, the generator draws a classic Nokia-style candy-bar phone illustration.

## Locked visual system

- Canvas: **2560 × 1440 (16:9, 2K QHD)**.
- Left zone: kicker at a fixed anchor, large headline beneath it, optional subtitle in a separate lower-left safe zone.
- Right zone: hero visual on a fixed paper-collage panel; it does not enter the headline zone.
- Palette: deep navy, aged-paper cream, muted red.
- Typography: Noto Sans with Vietnamese glyph support.
- Paper texture, torn-paper silhouette, offset print shadow and framing stay consistent.

Only the words and right-side hero image change between topics. Do not move the title anchors, resize the safe zones, or change the palette when adding a topic.

## Local render

```bash
python -m pip install pillow
python scripts/create_thumbnail.py \
  --title "NOKIA ĐÃ THUA NHƯ THẾ NÀO?" \
  --kicker "CÂU CHUYỆN CÔNG NGHỆ" \
  --output out/nokia-thumbnail.png
```

To use another subject image, add `--image-url 'https://…'` with a direct image URL.
