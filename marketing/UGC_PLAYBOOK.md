# Cock Carousel — launch marketing + AI UGC playbook

## The plan in one line
Market the **web game tonight** (cockcarousel.com/game already works on any phone), so the App Store link drops into an audience that already exists when Apple approves in 1–2 days.

## Tonight (before the app is even approved)
1. Post the 4 gameplay clips in `clips/` to TikTok, Reels and Shorts (one platform-native upload each, not cross-posted links). Caption formula: hook line + "link in bio" + 3 tags: `#mobilegame #dumbgames #indiegame`.
2. Bio link → cockcarousel.com. Add an "App Store — coming this week" line on the site; swap it for the real badge on approval.
3. Reply to every comment in the first hour with the game. Comments are the algorithm's fuel on day one.

## AI UGC (the "runs itself" content engine)
Two content types, both fully automatable:

**A. Gameplay clips (already automated).** `node make-clips.mjs ./clips` records fresh vertical clips with new hook text every run. Edit the `HOOKS` list to change the lines. Run it in a scheduled task daily → 4 new posts/day, zero effort.

**B. AI avatar reaction videos.** A fake-person talking head reacts to the game, then it cuts to gameplay. Tools that do this from a script (as of 2026: Arcads, Creatify, HeyGen UGC, Captions.ai — pick whichever you already pay for):
- Upload one of the clips as the "product" video.
- Paste a script from `ugc-scripts.md` (20 ready to go).
- Pick a 20-something avatar, casual bedroom/car setting, phone-camera look. Export 9:16, 15–25 s.
- Generate 3 variants per script (different avatar/setting). Post the best, keep the rest for the next day.

Rules that keep it working: the first frame must show the character (thumbnail = the joke), the hook must be spoken AND on screen in the first 1.5 s, gameplay by second 3, no music louder than the voice.

## Posting cadence (first 7 days)
| Day | TikTok | Reels | Shorts |
|---|---|---|---|
| 1–2 | 3 gameplay | 2 gameplay | 2 gameplay |
| 3–7 | 2 avatar + 2 gameplay | 2 avatar + 1 gameplay | 1 avatar + 1 gameplay |
Same clip, different hook = different post. Never repost identical files.

## What to track (weekly, 5 min)
- Views → downloads: App Store Connect → Analytics → Sources. If TikTok is >60% of installs, double down there and drop the weakest platform.
- Which hook bucket wins: "POV/dumbest" vs "therapist/relax" vs "rate it" vs "level name" jokes. Kill the two worst, write 5 new ones in the winning bucket.
- The comment "what's it called?" appearing means the name isn't readable on screen — make the URL text bigger.

## Automation options (say the word)
- **Daily clip drop**: scheduled task that runs make-clips with 4 fresh hooks and drops them in `marketing/clips/YYYY-MM-DD/`.
- **Daily scripts**: scheduled task that writes 5 new avatar scripts a day into `ugc-scripts.md` based on which buckets performed.
- **Auto-posting**: needs a scheduler with an API (Buffer, Metricool, Later). Connect one and the daily drop can post itself.
