# Slide Rush — App Store assets

Everything here follows Apple guideline 2.3.8: *"Metadata should be appropriate for all audiences,
so make sure your app and in-app purchase icons, screenshots, and previews adhere to a 4+ age rating
even if your app is rated higher."*

The working rule: **the crudeness lives in the words, never in the pictures.**

## What's here

| Path | What |
|---|---|
| `icon-1024.png` | 1024×1024 app icon |
| `screenshots/*.png` | Six 1320×2868 portrait screenshots |
| `metadata/*.txt` | Name, subtitle, promotional text, keywords, release notes, description |

All images are rendered from the game's own canvas code by
`tools/make-store-assets.py`, not drawn by hand, so they stay in sync with the build.

## What is deliberately not in the pictures

**The protagonist.** He is a cartoon penis, so he does not appear in the icon or in any screenshot.
Research found no live App Store game with a penis character in its store imagery and no case of a
censor bar surviving 2.3.8, so he is simply out of frame. The screenshots show the slide, the
hazards, the weather, the eggplants and the HUD.

**The carousel riders.** The background carousel has small riders of the same character. The icon
uses the ride with the riders switched off; the gameplay screenshots are framed at points on the
track where the carousel is not on screen.

Both are handled by render-time flags (`__HIDE`, `__NORIDERS`) that exist only in the screenshot
harness. The shipped build is untouched.

## The honest caveat

Screenshots that exclude a game's own main character are a compromise, not a fix. If a reviewer
pushes back on them, the real answer is to reskin the protagonist for the store build into something
non-anatomical, and re-render from that. That is a product decision, not a metadata one.

## Metadata notes

- **`name.txt` is the one item worth a second look.** "Cock Carousel" is a crude word in the app
  name, which comparable live apps support ("Am I The Dick?" at 13+). It is still the single most
  likely thing to draw a reviewer's attention. The safe fallback is to name the app `Slide Rush` and
  keep Cock Carousel as the developer name.
- Description and keywords use register words — rude, dumb, spicy, wrong — and contain no anatomy.
- The level names (Shrinkage Slopes, Thunder Thighs, Hot Sauce Hollow) are innuendo and stay.

## Still to decide

The in-game milestone jokes were left exactly as they are, on instruction. A handful are explicit
enough to move an honest age-rating questionnaire toward the top tier. They are listed in the
handover notes; toning roughly five lines would likely drop the rating a step.
