# RULES OF ENGORGEMENT — build spec

> **Status:** this spec replaces the earlier five-mission FPS spec entirely. Do not build from that
> one and do not copy anything out of the current `fps/index.html`, which is a private build with
> known trademark problems. Start clean from this document.

> **Title is provisional.** `RULES OF ENGORGEMENT` is the working name. Alternates, both clean:
> `FRIENDLY FIRE` and `FULL SALUTE`. Confirm with the owner before it goes anywhere public.

---

## The one rule

**Parody the genre, never the product.**

Free to use, because they belong to the genre and nobody owns them: mission briefings, a typewriter
location-and-timestamp card, a gravelly drill sergeant, killstreak callouts, night-vision levels,
convoy levels, breach-and-clear, regenerating health, a rank ladder, radio chatter, and real
military jargon like *Oscar Mike*, *going dark*, *danger close*, *on the rope*.

Not free, and not to appear anywhere in this build: any specific franchise's name, its characters'
names or designs, its verbatim dialogue, its mission titles, its weapon model names, and any scene
recreated beat for beat.

**The tell:** if a moment only lands because the player recognises it from one particular game,
it is borrowed. Cut it and invent a replacement. Every name, line and set piece below was written
for this game and owes nothing to anything.

---

## Premise

A company called **DRY CORP** is draining the world of moisture. Their founder, **Doctor Raw**,
believes friction builds character. He has built a machine large enough to dehumidify a continent
and he has mounted it on a fairground ride, because he is a showman.

You are **Recruit Nubbins**, the least promising graduate in the history of Camp Sandpaper. Your
job is to put the moisture back.

That premise exists to do one thing: make water the ammunition, dryness the damage, and a drought
the doomsday device. Everything else follows from it, and none of it comes from anywhere else.

---

## Cast

All original. None of these is a play on an existing character's name.

| Name | Role | Voice |
|---|---|---|
| **Drill Sergeant Gristle** | Trains you in Mission 1, radios in later | Furious about posture. Has never once been impressed. Calls you "Nubbins" like it is a medical diagnosis. |
| **Recruit Nubbins** | The player | Says almost nothing. When he does, it is a question nobody wants to answer. |
| **Hen** | Radio handler, callsign HEN | Bored, maternal, eating something in every transmission. Reads objectives like a shopping list. |
| **Corporal Slick** | Squadmate, Missions 3–5 | Over-confident, permanently greased, dies in a way that is entirely his own fault and survives anyway. |
| **Doctor Raw** | Antagonist | Sunburnt, flaking, silk dressing gown. Talks about hydration the way a villain talks about world peace. |

**Gristle's register, for reference:**
- "Nubbins. That is not a firing stance. That is a man waiting for a bus."
- "You will hydrate when I tell you to hydrate."
- "I have seen wetter deserts. Move."

---

## Missions

Five missions. Each one parodies a genre *convention*, never a particular level.

### 1. BASIC CHAFING
**Camp Sandpaper — 06:00**
The boot-camp tutorial. Gristle walks you through move, look, shoot, pump (reload), and sprint,
each gated behind a shooting-range target that insults you when you miss. Then the obstacle course:
a timed run through tyres, a crawl under a low net, and a wall you are absolutely not tall enough
for. Gristle's time to beat is deliberately impossible and he mentions it forever.

*Convention parodied:* the training level that will not let you continue until you look up.

### 2. DRY RUN
**DRY CORP Reservoir 9 — 02:40, no moon**
Night infiltration of the last public lubricant reserve. Green night-vision wash, a silenced
sidearm, and patrolling Chapstick Troopers who you can drop one at a time if you are patient.
Getting spotted does not fail the mission, it just makes the rest of it loud and much funnier.
Ends with you opening every valve in the place and standing in the flood.

*Convention parodied:* the stealth level, and the fact that nobody actually plays it stealthily.

### 3. ROAD RASH
**The Chapped Flats — midday**
You are in the bed of a truck behind a mounted hose, chasing a DRY CORP tanker convoy across
cracked ground. On rails: you aim and fire, the truck drives. Corporal Slick drives badly and
narrates his own skill. Tankers burst into a spray that briefly turns the desert green behind you.

*Convention parodied:* the vehicle turret sequence.

### 4. DEEP CLEAN
**DRY CORP Tower, floors 1–9 — 14:15**
Breach and clear, up an office building. Open-plan floors, cubicle cover, a break room, a server
room that is far too warm. Enemies are corporate: interns with leaf blowers, a facilities team with
industrial dehumidifiers, and an HR floor that is wall-to-wall hand sanitiser. The lift plays music
between floors and the squad comments on it.

*Convention parodied:* the vertical building assault, and the office-satire level.

### 5. THE LAST DROP
**The Carousel — golden hour**
Doctor Raw has mounted the dehumidifier on a carousel and started it spinning. You ride it. He
rides it. The whole climax is a rotating duel: he passes in and out of sight behind the ride's
poles and painted horses while the platform turns, the music speeds up, and the sky gets drier and
browner every lap.

You cannot beat him by shooting him, and the game lets you waste a lot of ammunition learning that.
The win is mechanical: three valve wheels are spaced around the carousel's centre column, and you
have to reach and turn each one during the window when your side of the ride faces it. Turning the
third one reverses the machine.

Then the ending. The dehumidifier inhales, coughs, and turns the sky over the whole park into one
enormous downpour. Everybody gets soaked. Doctor Raw's peeling sunburn rehydrates and he looks,
for the first time, comfortable. Credits over rain on a tin roof.

*Convention parodied:* the doomsday device and the final boss. **Deliberately not** a scripted
crawl, a handed-over pistol, or a slow-motion last shot. If the build starts drifting toward any
of those, stop and re-read this paragraph.

---

## Killstreaks

Announced by Hen in the same flat voice she uses for everything. All four are original and tied to
the water premise.

| Kills | Callout | Effect |
|---|---|---|
| 3 | "Moisture sensor's up." | Enemies appear on the minimap for 20 s |
| 5 | "Bucket incoming. Mind your head." | A bucket drops: full heal, splash knockdown around you |
| 7 | "Sprinklers." | The level's sprinkler system fires: every visible enemy is soaked and stunned 3 s |
| 10 | "Monsoon. You earned it." | Screen-wide downpour for 8 s: all enemies drop, you take no damage |

Streak resets on death. Show the callout as a banner card sliding in from the left, the way the
level banner already works in Slide Rush.

---

## Enemies

| Enemy | Behaviour |
|---|---|
| **Dust Mite** | Small, fast, melee. Rushes in a straight line. Dies to anything. |
| **Chapstick Trooper** | The standard rifleman. Waxy, slow to aim, telegraphs every shot. |
| **Sander** | Heavy. Slow walk, shoots a cone of grit. Takes four hits. |
| **Static Cling** | Latches on, halves your speed for 2 s, does no damage. Pure nuisance. |
| **Desiccant Drone** | Flies, drops silica packets that leave a dry patch you should not stand in. |
| **The Hairdryer** | Mini-boss. Knockback cone, has to be flanked. Appears in Missions 3 and 4. |
| **Doctor Raw** | Mission 5 only. Cannot be killed by damage. See above. |

No gore. Enemies do not bleed, they **dry out**: on hit they go chalky and pale, and on death they
crumble into a puff of dust and a small empty bottle.

---

## Weapons

Innuendo, never anatomy. All invented.

- **The Squirter** — starting sidearm. Infinite ammo, weak, fires a slow arc.
- **Pump Action** — the shotgun. Reloading is called *pumping* and Gristle says so constantly.
- **The Drencher** — the rifle. Full auto, the workhorse from Mission 3 on.
- **Aloe Launcher** — lobbed grenade, heals you if you stand in your own splash.
- **Mounted Hose** — Mission 3 only, fixed to the truck.

---

## Feel

The design goal is **"much easier than the real thing"**, and it is not a joke setting, it is the
whole point. Someone who has never played a shooter should finish this.

- **Auto-aim:** roughly a 15° cone. If an enemy is near your crosshair, you hit them.
- **Enemies are large and slow.** Projectiles are visible and travel slowly enough to sidestep.
- **Health:** 100 HP, regenerates fully after 3 s without damage. Damage shows as the screen going
  chalky and desaturated at the edges, not red.
- **Death** costs you the last checkpoint and a line of abuse from Gristle. Nothing else.
- **Difficulty toggle** on the title screen: *Easy* (default) and *Regular* (about 40% more enemies
  per wave, slightly faster projectiles). No harder setting exists, and the menu says so.

---

## Presentation

Match the other two games exactly. Same visual family, same joke density.

- **Font:** Lilita One, with a websafe fallback stack.
- **Palette:** candy. Heavy dark outlines on everything, cartoon faces on objects that should not
  have faces.
- **Briefings:** typewriter text over a stylised satellite map, location and timestamp card first.
- **Mission end:** a stats card — kills, accuracy, time — and a rank.

**Ranks** (original, innuendo only): Recruit Nubbins → Private Stiffy → Corporal Chafe →
Sergeant Slick → Lieutenant Lather → Major Moist → General Lubrication.

---

## Technical

Non-negotiable, because it matches how the rest of the site is built.

- **One self-contained HTML file.** No build step, no libraries, no external assets.
- **Canvas 2D raycaster**, Wolfenstein-style pseudo-3D. 960×540 virtual resolution, letterboxed.
- **All art drawn procedurally.** Walls, sprites, HUD, weapons. Nothing loaded from disk.
- **All audio from Web Audio oscillators.** No samples. Include the iOS unlock path already used in
  `game/index.html`: silent buffer on first touch, resume on every touch and on `visibilitychange`,
  and set `navigator.audioSession.type = 'playback'` so the ringer switch does not mute it.
- **Portrait rotation:** when `innerHeight > innerWidth * 1.1`, rotate the canvas 90° and map
  pointer coordinates through the rotation. Same code as the other two games.
- **Progression in localStorage**, under fresh keys: `roe_unlocked`, `roe_best`, `roe_diff`.
- **Ship no debug hooks.** For bot-testing, inject a `window.__dbg` object at a `//__DBG__` marker
  in a *copy* of the file and drive it with headless Chrome.

### Controls

| | Desktop | Phone |
|---|---|---|
| Move / strafe | `W A S D` | Left half: drag — virtual joystick |
| Look | Mouse with pointer lock, or `← →` | Right half: drag |
| Shoot | Click or `SPACE` | Right half: tap, hold to keep firing |
| Pump (reload) | `R` | PUMP button, bottom right |
| Pause | `ESC` / `P` | Pause button, top centre |
| Mute | `M` | Pause menu |

One-thumb play has to work. A player holding a phone in one hand should be able to finish
Mission 1 without ever using a second thumb.

---

## If this ever goes to a store

It is a private build today. Should that change, two things are already true and one is not:

- The cast, missions, dialogue and title in this spec are original, so there is no trademark work
  to redo.
- There is no gore and no fluid. Enemies dry out and crumble.
- **The store images would still be the problem.** Apple guideline 2.3.8 requires icon, screenshots
  and previews to suit a 4+ audience regardless of the app's own rating. Crude words in the name are
  fine; anatomy in the pictures is not. Plan any store imagery around the water, the desert, the
  carousel and the HUD, and keep the character out of frame.
