# Mọt Mọt Studio — YouTube SEO Assistant

This free GitHub Actions workflow analyzes the exact full-quality PaperMotion render artifact and creates a Vietnamese YouTube SEO pack.

## How it finds the video

The existing \`Render PaperMotion video\` workflow uploads its MP4 as a GitHub Actions artifact named \`papermotion-{scene}-full\` when quality is set to \`full\`. Draft artifacts are deliberately ignored.

- **Automatic:** after a successful full render, this workflow starts and downloads the artifact from that exact upstream run.
- **Manual:** open **Actions → Mọt Mọt Studio - YouTube SEO Assistant → Run workflow**. Leave \`render_run_id\` blank to find the newest successful full render, or enter a specific render run ID.

The render artifact currently expires after 7 days. The SEO result artifact is retained for 30 days.

## Output files

- \`youtube_seo.md\`: chosen title, alternatives, description, timeline, hashtags, tags, keyword research and confidence notes.
- \`youtube_description.txt\`: description ready to paste into YouTube.
- \`youtube_tags.txt\`: comma-separated tags.
- \`youtube_seo.json\`: structured result for later automation.
- \`keyword_research.csv\`: suggestions and heuristic scores.

## Free research and limitations

The script uses public YouTube and Google autocomplete suggestions through their public suggestion endpoint, Python standard library, and FFmpeg/ffprobe. It does not use YouTube Data API, paid AI APIs, API keys, or require a third-party account.

Autocomplete is a qualitative signal only. It does **not** provide exact monthly search volume or YouTube Analytics data. The title is selected by transparent local heuristics rather than a generative AI model.

Timeline policy:
- Use voiceover timestamps only when the manifest covers at least 70% of the actual video duration.
- Otherwise map the story's numbered full-episode outline to the video duration and clearly mark the timeline as estimated.
- If no story outline is found, use a generic scaffold and mark it as estimated. Review these chapter labels against the actual video before publishing.

No SEO workflow publishes to YouTube. It only creates downloadable drafts for the channel owner to review.
