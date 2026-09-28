# Seed Team Six — App Store assets

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

## Why the character is allowed in frame

The swimmer is an abstract wiggly cell with a face and a helmet. It is not anatomy, and a live
App Store game rated 9+ uses an anthropomorphic sperm cell as its protagonist. The art is the
strongest asset this build has, so it is unchanged and it appears in every shot.

## What is deliberately not in the pictures

- **The rope-descent reveal.** That scene fades in two cheeks and a dark opening. Not used.
- **The delivery room ending.** A cartoon birth, no nudity, but suggestive framing. Not used.
- **Tunnel interiors are shown abstractly.** Out of context they read as coloured caves, which is
  the point.

The six shots are: the title screen, the first-person briefing in the helicopter, mission one,
mission two, the egg at the finish, and the death screen.

## IP position

Nothing in this build or its metadata refers to any existing franchise. The title, the captain,
every quote and every line of radio chatter are original. The earlier build's franchise-derived
title, signature line, character name and third-party quotes were all replaced — see the commit
"IP cleanup: retitle to Seed Team Six".

## Metadata notes

- `name.txt` is `Seed Team Six`, which parodies elite-unit naming generically. No franchise echo and
  no anatomy word.
- The subtitle and description use innuendo only. The word "tunnel" does the work that anatomy
  words used to.
- In-game text was toned separately in the store build; the web build at `/sperm` keeps every joke.
