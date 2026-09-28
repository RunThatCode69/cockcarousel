# Cum of Duty: Modern Wharfare

A browser first-person shooter parody of Call of Duty 4, in the Cock Carousel universe. You are the dick. You are also the gun. Sequel to *Cum of Duty: Wrong Hole* (`/sperm`).

**v3 is real 3D.** The game is still one self-contained `index.html` with no build step needed to deploy, but it now bundles [three.js](https://threejs.org) (MIT licence) inline, so nothing loads from a CDN. Levels are built from the mission grids with walls of different heights (low crates and sandbags are cover you can see over), textured floors, a sky dome with sun or moon, clouds, a horizon silhouette and a spinning carousel landmark, toon shading with ink outlines and real-time shadows. Characters are procedural 3D models: dicks with faces, hats and moustaches, crabs, bees, Condom Troopers, chilis, ice cubes, mousetraps and Imran Jackoff in his fur coat.

The **DICK-47** is a 3D view model: a thick veiny shaft for a barrel, the head for a muzzle, the balls for a magazine, a heart-ring rear sight and a front post on the tip. It's held in camo sleeves and gloves, with your left hand on the shaft. Hip fire, aim-down-sights (you look down the shaft), sprint, crouch, reload (balls drop out, fresh pair in, rack the tip), nut-nade throws and melee.

**Length:** every shot shrinks the DICK-47 a little (9.0" down to 2.7"), and a smaller dick hits softer (down to half damage). Kills sometimes drop **lotion** (+4.5") or, rarely, **the little blue pill** (full size and no shrinkage for 15 s). Eggplants and care packages top you up too. If you're shriveled with no lotion nearby, command air-drops some. The rifle fires faster now and holds 12.

**The enemy:** Condom Troopers are the main bad guys now. Crabs are back alongside them as the rushers. They shoot condoms; each hit rolls one further down you (the WRAPPED meter). Fully wrapped and you're out: WRAPPED, mission failed. Stop getting hit and it slides back off.

**Finding your way:** a yellow chevron path on the ground leads to the objective, a light beacon marks it, the compass points along the route and an on-screen heart shows the distance.

Source: `fps/source/` — run `npm install && npm run build` there, then copy `build/index.html` over `fps/index.html`. Previous versions are in `archive/` (`fps-v1` … `fps-v3.2`, each also a git tag).

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

**Enemies** — Crab (melee rusher), Bee (fast, erratic, shoots stingers), Mousetrap (sits still, lunges), Condom Trooper (shoots condoms; see WRAPPED above), Chili (throws hot sauce, area denial), Ice Cube (mini-boss: "shrinkage" halves your damage while near), and Imran Jackoff.

## v2 detail pass

Vertical look (Duke3D-style y-shearing), aim-down-sights through a red-dot with a heart reticle, sprint, crouch and a 3-per-mission nut-nade. The DICK-47 is held in camo sleeves and gloves with a stock, receiver, rail, red dot and foregrip; it lags behind your look, kicks your view on recoil and brightens the scene on each shot. Sprites are shaded and cast ground shadows, walls have baked occlusion, each level has its own colour grade, desktop gets film grain. HUD: CoD4 intro card, compass, world objective marker with distance, hit markers, `+69` XP popups, kill feed, stance icon, grenade count.

Sound: filtered-noise gunshots and explosions, footsteps, a music track per level (march, night crickets, tense pulse, elevator muzak, chase drums) and ambient beds (wind, sea, room tone, fire). On iPhones it loops a silent `<audio>` element on the first touch so the ringer switch doesn't mute the game.

The version before this pass is saved as `archive/fps-v1.html` and git tag `fps-v1`.

## Missions

v4 made every mission several times longer (about 5 minutes each for a first play-through). Each one follows the beats of its Call of Duty 4 original.

1. **Bootie Camp** (F.N.G.). S.A.S. HQ, Crotchenhill.
   - Sarge walks you through hip fire, aiming down sights, pumping (reload), eggplants and practice Condom Troopers.
   - THE COURSE: hurdles, a barbed-wire crawl, the tyre run and pop-ups, against the clock.
   - The **grenade pit**: lob nut-nades over a wall; you can't shoot through it.
   - **THE PIT**, Captain Prick's timed plywood killhouse. Pop-up targets appear room by room. Don't shoot Nan (+3 s). Nut-nade the third room before you go in (+3 s if you walk in without one). Prick's record is 19.2 s.
2. **All Girthed Up** (All Ghillied Up / One Shot, One Kill). Pubyat, 15 years ago. Captain MacMillilitre follows you the whole way.
   - A synchronised kill ("you take the left").
   - Past the farmhouse: leave the three inside.
   - The graveyard, where a chopper flies over and you must get down in the grass.
   - **The convoy**: trucks and rubbers march past a metre away. Move and you're dead.
   - Around the chlamydia zones (they hurt, and the ticking gets faster as you get close).
   - Through the Pubyat Heights apartments to the overlook, and one shot at Jackoff in the plaza.
   - The HUNG-24 attack chopper strafes you down the fire exit.
   - **Hold the carousel for 100 seconds** while Mac, with a crab-bitten leg, covers the road.
   - A tandem-rotor Chinook ("Big Bird") flares in and drops its rear ramp. You run up it, sit down, and watch Pubyat fall away out of the back.
3. **Crew Expandable** (Crew Expendable). MV Blue Balls.
   - Ride in ("Crew?" "Expendable.") and fast-rope onto the helipad.
   - Sweep the deck with minigun support from the chopper.
   - The bridge, where they're asleep.
   - Crew quarters, doors on both sides.
   - The hold, a maze of container lanes with an **eggplant detector** that ticks faster as you close in.
   - The package. Then jets hit the ship: a 110-second run back up through the flooding, tilting, lurching ship to the ramp. Jump.
4. **No Rushin'** (plus Death From Above). The fertility clinic.
   - Take a number, survive the waiting room, ride the escalator, make the deposit.
   - Then "Meanwhile, three miles up": the **Sonogram-130**, a grayscale thermal gunship.
     - Slew with WASD or the stick, orbit with the mouse, 25mm SPERM (rapid) or 105mm NUTS (`R` swaps).
     - Cover Prick, Soup and Gas across the car park to the FREE CANDY van.
     - Rubber trucks unload troops. Friendlies blink. Three friendly-fire hits and the mission fails.
5. **GAME OVA** (Game Over). Bridge over the Tubes.
   - A much longer truck ride, with the **HUNG-24** chasing you (you can shoot it down) and pursuit trucks unloading crabs.
   - The truck crashes. Get to Prick behind the wreck and **hold for 60 seconds** as they come down the bridge.
   - The tanker blows, then the crawl, the executions, the pistol slide, one slow-motion glob and the credits.

Each mission opens with a typewriter briefing over a "satellite map" (it's a scrotum) and ends with a stats screen: kills, accuracy, time and a rank — Private Parts, Corporal Punishment, Sergeant Sausage, Colonel Angus, Major Wood, General Erection.

## Progression

`localStorage`: `mw_unlocked` (highest mission unlocked), `mw_best` (best stats per mission), `mw_diff`. Title screen has New Game / Continue / Mission Select and a difficulty toggle: **Easy** (default) or **Regular** (about 40% more enemies in each wave, slightly more damage).

## Testing

The shipped file has no debug hooks. To bot-test it, inject a `window.__dbg` object at the `//__DBG__` marker in a copy (see `marketing/make-clips-fps.mjs` for the pattern) and drive it with Playwright. The release was checked headless through all five missions, for console errors, portrait rotation, joystick/tap input and the iOS audio-unlock path (same code as `game/index.html`).

`fps/store/` — six portrait App Store-style screenshots (1320×2868). `marketing/clips-fps/` — four vertical gameplay clips.
