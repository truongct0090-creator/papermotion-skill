# Reusable YouTube thumbnail generator

One fixed brand composition, reusable for any topic.

## Run it

1. Open **Actions → Create reusable YouTube thumbnail → Run workflow**.
2. Enter the headline, category label and optional supporting line.
3. For a precise topic-specific subject, provide a direct **HTTPS image URL** in `image_url`. The image is clipped into a layered paper collage on the right. If omitted, the renderer creates an abstract collage with a word derived from the headline; it does not insert Nokia or iPhone artwork.
4. Download the generated 4K PNG from the workflow artifact.

## Locked visual system

- Canvas: **3840 × 2160 (16:9, 4K PNG)**.
- Background: dusty rose **#B08088**, with subtle grain and no outer border.
- Left zone: fixed headline and kicker anchors; each text line sits on its own torn-paper sheet.
- Subtitle: separate paper strips in the protected lower-left safe zone.
- Right zone: topic-specific image collage, or an abstract topic-derived collage when no image URL is supplied.
- Rendering: the repository's actual `src/paper/Paper.ts` engine provides torn edges, fiber texture, shadows, rim light and layered sheets.
- Typography: Noto Sans with Vietnamese glyph support.
- Existing workflow inputs remain unchanged: `title`, `kicker`, `subtitle`, `image_url`, `output_name`.

The default text remains the Nokia pilot for convenience, but the renderer is no longer hard-coded to Nokia or iPhone.

## Local render

Requires Node 22.18+, pnpm and a Playwright Chromium installation.

```bash
pnpm install
pnpm exec playwright-core install chromium
node scripts/create-thumbnail.ts \
  --title "NOKIA ĐÃ THUA NHƯ THẾ NÀO?" \
  --kicker "CÂU CHUYỆN CÔNG NGHỆ" \
  --subtitle "Từ người dẫn đầu đến cú trượt dài" \
  --output out/nokia-thumbnail.png
```

To use a subject image, add `--image-url "https://example.com/subject.jpg"`.
