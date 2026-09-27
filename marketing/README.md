# marketing/
- `clips/` — 4 vertical gameplay clips (1080×1920, H.264), ready to post.
- `make-clips.mjs` + `clips.html` — regenerate clips with new hooks: `npm i -D playwright && npx playwright install chromium && node make-clips.mjs ./clips`. Needs ffmpeg (`brew install ffmpeg`). `clips.html` is the game with a small `window.__dbg` hook so the bot can play it; it is never shipped.
- `UGC_PLAYBOOK.md` — what to post, where, when; how to run the AI avatar pipeline.
- `ugc-scripts.md` — 20 avatar scripts in 4 hook buckets.
