# Cum of Duty: Modern Wharfare

A browser first-person shooter parody of Call of Duty 4, in the Cock Carousel universe. You are the dick. You are also the gun. Sequel to *Cum of Duty: Wrong Hole* (`/sperm`).

One file, no build step, no libraries, no external assets: `index.html` is a Canvas 2D raycaster (Wolfenstein-style pseudo-3D) with every wall, sprite and HUD element drawn procedurally and every sound made from Web Audio oscillators. 960×540 virtual resolution, letterboxed; portrait phones get the rotated canvas, same as Slide Rush.

## Controls

| | Desktop | Phone |
|---|---|---|
| Move / strafe | `W A S D` | left half: drag (virtual joystick) |
| Look | mouse (click to lock the pointer) or `← →` / `Q E` | right half: drag |
| Shoot | click or `SPACE` | right half: tap (hold to keep firing) |
| Reload ("pump") | `R` | RELOAD button, bottom right |
| Headbutt | `V` / `F` — or just shoot with an enemy in your face | shoot with an enemy in your face |
| Pause | `ESC` / `P` | `II` button, top center |
| Sound | `M` | pause menu |

Generous auto-aim (about a 15° cone), big enemies, slow projectiles. It is much easier than CoD on purpose. Health is CoD-style: 100 HP, regenerates after 3 seconds without damage, jam-smear on the screen instead of blood, red vignette when low.

**Killstreaks** — 3: *Ultrasound online* (enemies on the minimap). 5: *Care Package* (a crate of eggplants, full heal). 7: *Precision Hairstrike* (a giant pube falls and wipes the room).

**Enemies** — Crab (melee rusher), Bee (fast, erratic, shoots stingers), Mousetrap (sits still, lunges), Condom Trooper (wraps you: slow for 2 s), Chili (throws hot sauce, area denial), Ice Cube (mini-boss: "shrinkage" halves your damage while near), and Imran Jackoff.

## Missions

1. **Bootie Camp** — Camp Wetstone. Tutorial: Sarge (mustached drill-sergeant dick) walks you through shooting targets, pumping (reload), eating eggplants and practice crabs, then the timed Cargo Ship course.
2. **All Girthed Up** — The Bush, 15 years ago. Ghillie-suit stealth through tall grass that is clearly pubes. Slow Condom Trooper patrols, mousetraps in the grass, then one long shot at Imran Jackoff from the overlook ("one shot, one squirt"), then run to the LZ.
3. **Crew Expandable** — cargo ship MV Blue Balls. Tight steel corridors, crabs everywhere, grab the package in the hold, then a 75-second escape while the deck tilts, ending with the jump to the helicopter.
4. **No Rushin'** — a fertility clinic waiting room. Take a number (69), survive three waves of Condom Troopers and bees while they call 4, 5, 6..., ride the escalator up, fight the moving walkway that's going the wrong way, make the deposit in Room 69.
5. **GAME OVA** — Bridge over the Tubes. On-rails in the back of the truck shooting pursuers; the bridge blows; you crawl in slow-mo while Soup, Gas and Gropes go down one by one; Imran Jackoff (huge, one-armed, fur coat) walks up; Captain Prick slides you a pistol; one slow-motion glob; helicopter rescue; end credits over sad oscillator piano with a mid-credits tease for Modern Wharfare 2.

Each mission opens with a typewriter briefing over a "satellite map" (it's a scrotum) and ends with a stats screen: kills, accuracy, time and a rank — Private Parts, Corporal Punishment, Sergeant Sausage, Colonel Angus, Major Wood, General Erection.

## Progression

`localStorage`: `mw_unlocked` (highest mission unlocked), `mw_best` (best stats per mission), `mw_diff`. Title screen has New Game / Continue / Mission Select and a difficulty toggle: **Easy** (default) or **Regular** (about 40% more enemies in each wave, slightly more damage).

## Testing

The shipped file has no debug hooks. To bot-test it, inject a `window.__dbg` object at the `//__DBG__` marker in a copy (see `marketing/make-clips-fps.mjs` for the pattern) and drive it with Playwright. The release was checked headless through all five missions, for console errors, portrait rotation, joystick/tap input and the iOS audio-unlock path (same code as `game/index.html`).

`fps/store/` — six portrait App Store-style screenshots (1320×2868). `marketing/clips-fps/` — four vertical gameplay clips.
