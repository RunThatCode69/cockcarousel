# Cum of Duty: Modern Wharfare

A browser first-person shooter parody of Call of Duty 4, in the Cock Carousel universe. You are the dick. You are also the gun. Sequel to *Cum of Duty: Wrong Hole* (`/sperm`).

**v3 is real 3D.** The game is still one self-contained `index.html` with no build step needed to deploy, but it now bundles [three.js](https://threejs.org) (MIT licence) inline, so nothing loads from a CDN. Levels are built from the mission grids with walls of different heights (low crates and sandbags are cover you can see over), textured floors, a sky dome with sun or moon, clouds, a horizon silhouette and a spinning carousel landmark, toon shading with ink outlines and real-time shadows. Characters are procedural 3D models: dicks with faces, hats and moustaches, crabs, bees, Condom Troopers, chilis, ice cubes, mousetraps and Imran Jackoff in his fur coat.

The **DICK-47** is a 3D view model: a thick veiny shaft for a barrel, the head for a muzzle, the balls for a magazine, a heart-ring rear sight and a front post on the tip. It's held in camo sleeves and gloves, with your left hand on the shaft. Hip fire, aim-down-sights (you look down the shaft), sprint, crouch, reload (balls drop out, fresh pair in, rack the tip), nut-nade throws and melee.

**The enemy:** Condom Troopers are the main bad guys now. They shoot condoms; each hit rolls one further down you (the WRAPPED meter). Fully wrapped and you're out: WRAPPED, mission failed. Stop getting hit and it slides back off.

**Finding your way:** a yellow chevron path on the ground leads to the objective, a light beacon marks it, the compass points along the route and an on-screen heart shows the distance.

Source: `fps/source/` — run `npm install && npm run build` there, then copy `build/index.html` over `fps/index.html`. Previous versions: `archive/fps-v1.html` (tag `fps-v1`, the first raycaster) and `archive/fps-v2.html` (tag `fps-v2`, raycaster with ADS, nades and music).

## Controls

| | Desktop | Phone |
|---|---|---|
| Move / strafe | `W A S D` | left half: drag (virtual joystick) |
| Look (left/right **and up/down**) | mouse (click to lock the pointer), or `← →` / `Q E`, `T`/`B` tilt | right half: drag |
| Shoot | click | right half: tap (hold to keep firing) |
| Aim down sights | hold right-click, or `Z` to toggle | AIM button |
| Reload | `R` | RELOAD button |
| Nut-nade (grenade) | `G` | NUT button |
| Sprint | hold `SHIFT` | push the joystick all the way forward |
| Crouch | `C` | CROUCH button |
| Jump | `SPACE` | JUMP button |
| Headbutt | `V` / `F`, or just shoot with an enemy in your face | shoot with an enemy in your face |
| Pause | `ESC` / `P` | `II` button |
| Sound | `M`, or the SOUND button on the title | pause menu / title button |

Generous auto-aim (about a 15° cone), big enemies, slow projectiles. It is much easier than CoD on purpose. Health is CoD-style: 100 HP, regenerates after 3 seconds without damage, jam-smear on the screen instead of blood, red vignette when low.

**Killstreaks** — 3: *Ultrasound online* (enemies on the minimap). 5: *Care Package* (a crate of eggplants, full heal). 7: *Precision Hairstrike* (a giant pube falls and wipes the room).

**Enemies** — Crab (melee rusher), Bee (fast, erratic, shoots stingers), Mousetrap (sits still, lunges), Condom Trooper (wraps you: slow for 2 s), Chili (throws hot sauce, area denial), Ice Cube (mini-boss: "shrinkage" halves your damage while near), and Imran Jackoff.

## v2 detail pass

Vertical look (Duke3D-style y-shearing), aim-down-sights through a red-dot with a heart reticle, sprint, crouch and a 3-per-mission nut-nade. The DICK-47 is held in camo sleeves and gloves with a stock, receiver, rail, red dot and foregrip; it lags behind your look, kicks your view on recoil and brightens the scene on each shot. Sprites are shaded and cast ground shadows, walls have baked occlusion, each level has its own colour grade, desktop gets film grain. HUD: CoD4 intro card, compass, world objective marker with distance, hit markers, `+69` XP popups, kill feed, stance icon, grenade count.

Sound: filtered-noise gunshots and explosions, footsteps, a music track per level (march, night crickets, tense pulse, elevator muzak, chase drums) and ambient beds (wind, sea, room tone, fire). On iPhones it loops a silent `<audio>` element on the first touch so the ringer switch doesn't mute the game.

The version before this pass is saved as `archive/fps-v1.html` and git tag `fps-v1`.

## Missions

1. **Bootie Camp** — S.A.S. HQ, Crotchenhill. Sarge walks you through hip fire, aiming down sights, pumping (reload), eggplants and practice Condom Troopers, then THE COURSE: jump the hurdles, crawl under the barbed wire, high-knee the tyre run, shoot the pop-ups, hit the flag. Your time earns a Recommended Difficulty (SOFT → THROBBING).
2. **All Girthed Up** — The Bush, 15 years ago. Ghillie-suit stealth through tall grass that is clearly pubes. Slow Condom Trooper patrols, mousetraps in the grass, then one long shot at Imran Jackoff from the overlook ("one shot, one squirt"), then run to the LZ as the helicopter comes in, climb aboard and lift out over the treeline.
3. **Crew Expandable** — cargo ship MV Blue Balls. Tight steel corridors, crabs everywhere, grab the package in the hold, then a 75-second escape while the deck tilts, ending with the jump to the helicopter.
4. **No Rushin'** — a fertility clinic waiting room. Take a number (69), survive three waves of Condom Troopers and bees while they call 4, 5, 6..., ride the escalator up, fight the moving walkway that's going the wrong way, make the deposit in Room 69.
5. **GAME OVA** — Bridge over the Tubes. On-rails in the back of the truck shooting pursuers; the bridge blows; you crawl in slow-mo while Soup, Gas and Gropes go down one by one; Imran Jackoff (huge, one-armed, fur coat) walks up; Captain Prick slides you a pistol; one slow-motion glob; helicopter rescue; end credits over sad oscillator piano with a mid-credits tease for Modern Wharfare 2.

Each mission opens with a typewriter briefing over a "satellite map" (it's a scrotum) and ends with a stats screen: kills, accuracy, time and a rank — Private Parts, Corporal Punishment, Sergeant Sausage, Colonel Angus, Major Wood, General Erection.

## Progression

`localStorage`: `mw_unlocked` (highest mission unlocked), `mw_best` (best stats per mission), `mw_diff`. Title screen has New Game / Continue / Mission Select and a difficulty toggle: **Easy** (default) or **Regular** (about 40% more enemies in each wave, slightly more damage).

## Testing

The shipped file has no debug hooks. To bot-test it, inject a `window.__dbg` object at the `//__DBG__` marker in a copy (see `marketing/make-clips-fps.mjs` for the pattern) and drive it with Playwright. The release was checked headless through all five missions, for console errors, portrait rotation, joystick/tap input and the iOS audio-unlock path (same code as `game/index.html`).

`fps/store/` — six portrait App Store-style screenshots (1320×2868). `marketing/clips-fps/` — four vertical gameplay clips.
