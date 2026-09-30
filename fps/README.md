# Cum of Duty: Modern Wharfare

A browser first-person shooter parody of Call of Duty 4, in the Cock Carousel universe. You are the dick. You are also the gun. Sequel to *Cum of Duty: Wrong Hole* (`/sperm`).

**v3 is real 3D.** The game is still one self-contained `index.html` with no build step needed to deploy, but it now bundles [three.js](https://threejs.org) (MIT licence) inline, so nothing loads from a CDN. Levels are built from the mission grids with walls of different heights (low crates and sandbags are cover you can see over), textured floors, a sky dome with sun or moon, clouds, a horizon silhouette and a spinning carousel landmark, toon shading with ink outlines and real-time shadows. Characters are procedural 3D models: dicks with faces, hats and moustaches, crabs, bees, Condom Troopers, chilis, ice cubes, mousetraps and Imran Jackoff in his fur coat.

The **DICK-47** is a 3D view model: a thick veiny shaft for a barrel, the head for a muzzle, the balls for a magazine, a heart-ring rear sight and a front post on the tip. It's held in camo sleeves and gloves, with your left hand on the shaft. Hip fire, aim-down-sights (you look down the shaft), sprint, crouch, reload (balls drop out, fresh pair in, rack the tip), nut-nade throws and melee.

**Length:** every shot shrinks the DICK-47 a little (9.0" down to 2.7"), and a smaller dick hits softer (down to half damage). Kills sometimes drop **lotion** (+4.5") or, rarely, **the little blue pill** (full size and no shrinkage for 15 s). Eggplants and care packages top you up too. If you're shriveled with no lotion nearby, command air-drops some. The rifle fires faster now and holds 12.

**The enemy:** Condom Troopers are the main bad guys now. Crabs are back alongside them as the rushers. They shoot condoms; each hit rolls one further down you (the WRAPPED meter). Fully wrapped and you're out: WRAPPED, mission failed. Stop getting hit and it slides back off.

**Finding your way:** a yellow chevron path on the ground leads to the objective, a light beacon marks it, the compass points along the route and an on-screen heart shows the distance.

Source: `fps/source/` — run `npm install && npm run build` there, then copy `build/index.html` over `fps/index.html`. Previous versions are in `archive/` (`fps-v1` … `fps-v3.2`, each also a git tag).

**v4.3 look pass.** Art direction came from frames of CoD4 playthroughs: the look and mood only, no assets.
- **Post-processing:** a colour grade (desaturated, contrasty, teal shadows and warm highlights, vignette, fine grain) on every device, plus bloom on desktop.
- **Bootie Camp:** an overcast British base with pines, hills, blue corrugated hangars and telegraph poles, and a plywood killhouse with spray-painted arrows.
- **Pubyat:** grey daytime overcast, straw-coloured grass, Soviet panel blocks and a rusty yellow Ferris wheel behind the carousel. There's a sniper scope when you aim.
- **The ship:** white-painted steel, roofed lower decks, a red emergency-lit crew corridor, grey and rust containers, and lightning.
- **The bridge:** blue sky, mountains and pine forest, with black smoke columns that go grey and ashen for the finale.

**v4.4.** Changes in this update:
- **Less clutter:** no floor arrows or beacon, a rotating minimap (you always face up) with the dashed route and the objective, no kill feed or XP popups, and the objective box shrinks to one line after a few seconds.
- **Quieter radio:** combat barks play at most once every 15 seconds.
- **Weather and effects:** proper 3D rain on the ship, and bloom no longer smears your own muzzle flash.
- **New weapons:**
  - The DILDO-7 rocket launcher: 4 rockets, with more from care packages.
  - The CUM-203 underbarrel grenade launcher: 3 shells.

**v4.5.** Changes in this update:
- **Voices:** every radio line is a real voice clip in `fps/voices/`, made with Kokoro (open-source, Apache-2.0) and a radio filter; each character has their own voice, and the S.A.S. are British. To regenerate them, run `fps/source/voices/gen.py`. Press `O` to turn voices off.
- **The condom attack:** in the ghillie mission's fire-exit run, a Condom Trooper jumps you and tries to wrap you. Mash `X` (or tap) to fight it off.
- **Talking faces:** characters' mouths flap while they talk.
- **Kit:** Prick, Mac, Soup, Gas and Gropes wear plate carriers, pouches and radios, and carry dick-rifles. Mac carries a scoped one.

## Controls

| | Desktop | Phone |
|---|---|---|
| Move / strafe | `W A S D` | left half: drag (virtual joystick) |
| Look (left/right **and up/down**) | mouse (click to lock the pointer), or `← →` / `Q E`, `T`/`B` tilt | right half: drag |
| Shoot | click | right half: tap (hold to keep firing) |
| Aim down sights | hold right-click, or `Z` to toggle | AIM button |
| Reload | `R` | RELOAD button |
| Nut-nade (grenade) | `G` | NUT button |
| CUM-203 underbarrel grenade (explodes on impact) | `X` | GL button |
| Swap to the DILDO-7 rocket launcher and back | `1` / `2`, or the mouse wheel | SWAP button |
| Sprint | hold `SHIFT` | push the joystick all the way forward |
| Crouch | `C` | CROUCH button |
| Jump | `SPACE` | JUMP button |
| Headbutt | `V` / `F`, or just shoot with an enemy in your face | shoot with an enemy in your face |
| Pause | `ESC` / `P` | `II` button |
| Sound | `M`, or the SOUND button on the title | pause menu / title button |
| Character voices on/off | `O` | (follows sound) |
| Night vision (The Bog) | `N` | NVG button |

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
4. **The Bog** (The Bog). About ten minutes, at night, with a full squad: Lt. Vas-Deferens, SSgt. Jiggles, Dooley and Ramirez follow you, move up with you, shoot what they can see, call out contacts and bark about their kills. The enemy shoots back at them too.
   - Briefing behind a burning car, then a push up the street, shopfront by shopfront, until a second lot comes out of the apartments.
   - Lubeview Apartments: no power. **Night vision** (`N` / NVG button) turns it green. Room by room, with a counterattack from behind.
   - The overpass: stand next to the **Z-PUBE** anti-air gun to plant Cum-4, get clear, boom. Then the jets come in.
   - Down into the bog, around the lube puddles (they slow you down), to **WAR PECKER**, an M1 whose main gun is exactly what you'd expect.
   - The **JAVELUBE**: grab the DILDO-7 from the crate by the tank and take out three armoured **Big Meaty Pickups** (globs bounce off; the crate refills).
   - Hold around the tank for two minutes while it rocks itself loose. Its gun fires at the big groups now.
   - Escort it east. It only moves while you're close. "Never tell anyone we pulled the Pecker out of the Bog."
5. **No Rushin'** (a No Russian parody).
   - A silent elevator ride with Imran Jackoff's crew: "Remember... no rushin'."
   - A slow walk (no running) through Terminal 69, fighting off Condom Trooper airport security.
   - The crew walks into the Pleasure Dome, a club full of dancing women. Fade to black: "What happens in the Pleasure Dome stays in the Pleasure Dome."
6. **GAME OVA** (Game Over). Bridge over the Tubes.
   - A much longer truck ride, with the **HUNG-24** chasing you (you can shoot it down) and pursuit trucks unloading crabs.
   - The truck crashes. Get to Prick behind the wreck and **hold for 60 seconds** as they come down the bridge.
   - The tanker blows, then the crawl, the executions, the pistol slide, one slow-motion glob and the credits.

Each mission opens with a typewriter briefing over a "satellite map" (it's a scrotum) and ends with a stats screen: kills, accuracy, time and a rank — Private Parts, Corporal Punishment, Sergeant Sausage, Colonel Angus, Major Wood, General Erection.

## Progression

`localStorage`: `mw_unlocked` (highest mission unlocked; v5 moves old progress past mission 3 up one slot, `mw_v5` marks that as done), `mw_best` (best stats per mission), `mw_diff`. Title screen has New Game / Continue / Mission Select and a difficulty toggle: **Easy** (default) or **Regular** (about 40% more enemies in each wave, slightly more damage).

## Testing

The shipped file has no debug hooks. To bot-test it, inject a `window.__dbg` object at the `//__DBG__` marker in a copy (see `marketing/make-clips-fps.mjs` for the pattern) and drive it with Playwright. The release was checked headless through all five missions, for console errors, portrait rotation, joystick/tap input and the iOS audio-unlock path (same code as `game/index.html`).

`fps/store/` — six portrait App Store-style screenshots (1320×2868). `marketing/clips-fps/` — four vertical gameplay clips.
