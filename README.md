# Gunfishers

A solo, browser-based first playable of the **risk one more cast** loop. Catch living Gunfish, survive a 15-minute Run, and decide what equipment is worth recovering after failure.

## Run locally

Requires Node.js 20.19+ or 22.12+ and a WebGL-capable browser.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The app has keyboard/mouse controls and a responsive touch keypad. Audio is synthesized locally and starts after an interaction. No remote assets, accounts, services, or network connection are needed after the app is loaded.

```sh
npm test
npm run typecheck
npm run build
```

`dist/` is a static site. Serve it over HTTP rather than opening `index.html` as a file. The build currently emits a non-fatal chunk-size warning for the bundled Three.js renderer.

## Playing

Click **Enter the waterlands** to spawn and start the clock. Place the Lure beside, not directly on, a visible fish. Alternate gentle directional tugs to maintain its Interest. When it bites, react to the taut line, fish movement, and audible snap. A successful hit draws the fish closer; two consecutive misses lose it. The same world continues throughout the Cast and arsenal interface.

| Input                    | Action                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| WASD                     | Move relative to your viewing bearing                               |
| Shift / Space            | Sprint / jump                                                       |
| Click water              | Place the Lure                                                      |
| Arrow keys / hold R      | Gentle directional tugs / reel toward yourself                      |
| Click or E during a bite | Catch on the line snap                                              |
| 1 / 2                    | Cancel and draw Primary / Secondary                                 |
| Q / F                    | Emergency cancel / return to Fishing mode                           |
| Click Combat / Esc       | Capture / release unlimited mouse aiming                            |
| Move mouse               | Look around in Combat mode, including vertical aim                  |
| Left mouse / right mouse | Fire / precision aim; hold fire for Auto Rifle                      |
| R / V in Combat          | Reload / committed, ammunition-free Rod attack                      |
| Hold M                   | Permanently mount the Active Gunfish as an autonomous defender      |
| Hold B                   | Drink Beer to heal                                                  |
| E / hold E nearby        | Collect a physical drop / reclaim a cache or service a defender     |
| Tab                      | Live arsenal: assign slots, upgrade, merge, unpack or drop supplies |
| ?                        | Field guide; does not pause the Run                                 |

On touch screens, tap water to place the Lure, drag to look, and use the onscreen movement/action buttons. Release or move to cancel an exposed hold. Beer repairs damaged defenders before it can fuel them. Ammo bundles must be unpacked in the arsenal to enter class reserves.

## Implemented Loop

- Three visible Gunfish species, three rarities, two evolution branches per species, and both evolution stages.
- Spatial Interest, timing-based catching, irreversible Threat, cancellation, and the heading-preserving Tactical dip.
- Mobile third-person combat, individual magazines, shared reserves, Rod attacks, telegraphed monsters, and cover.
- Unlimited arsenal, two Combat slots, numerical upgrades, Rod tiers, atomic donor merges, and high-water Gunfish power.
- Four monster roles across four pressure phases, legal weighted refills, phase lulls, physical rewards, and eight Supply slots.
- Permanent Mounted Gunfish sacrifice, autonomous evolved fire, durability, repair-first servicing, and Beer fuel.
- Six fishing locations across Reedbeds, Flood Channel, and Sunken Quarry; outer routes, central shortcuts, and traversable Quarry slopes.
- Newest-only Recovery caches, exact equipment identity, interruptible reclaim, failure results, explicit next Run, and immediate victory at the deadline.
- A continuous dawn-to-dawn sky cycle over each 15-minute Run: warm sunrises, blue daylight, pink-gold sunsets, drifting clouds, moonlight, twinkling stars, and a procedural Milky Way. World lighting, fog, and water reflections follow the sky; the cycle resumes with saved Run time.

## Persistence

The entire current Run is stored in browser `localStorage` under `gunfishers.first-playable.v1`, including the seeded random stream and unreclaimed cache. Closing and reopening resumes that Run, not a new spawn. Holds require a fresh input after resuming. A failure creates a cache and requires an explicit next-Run action; victory ends the first playable.

Persistence is local to the browser profile and site origin. Clearing site storage removes it. Storage failures display an onscreen warning. Unsupported or unreadable saves are not overwritten until you explicitly enter a new Run.

The clock advances with visible-tab elapsed time, including slow frames. Hidden tabs suspend the Run and clear held controls, matching close-and-resume behavior; neither the arsenal nor the field guide pauses it.

## Implementation And Tests

- `src/run.ts`: the primary Run seam, seeded simulation, input actions, lifecycle, and serialization.
- `src/content.ts`: authored world, terrain height, baseline tables, legal mixes, and shared catch timing cues.
- `src/economy.ts`: irreversible purchases, donor transactions, identity power, and physical reward generation.
- `src/main.ts`: Three.js world, cameras, keyboard/touch input, audio, HUD, and browser persistence.
- `src/sky.ts`: procedural celestial sky and Run-synchronized sun, moon, ambient, fog, and water lighting.
- `tests/run.test.ts`: deterministic black-box scenarios through `Run`, including exact timing boundaries and multi-Run recovery.

`new Run({ seed, scenario })` accepts authored initial state and optional line-of-sight/damage callbacks. Tests use `act`, `step`, `view`, `save`, `content`, `surfaceHeight`, and `previewEvolution`. There are no separate subsystem test seams or production debug controls. Times are in seconds and positions in metres. Player `y` is jump height relative to terrain; projectile `y` is world-space height.

## Evaluation Notes

This is procedural first-playable presentation, not final art or an acceptance claim about fun, economy yield, or difficulty. The 40-55-resource target and combat-active 15-minute balance still need human playtesting. Browser checks do not replace testing on physical mobile hardware.

Recovery selection targets favorable/contested/poor route bands without inspecting cache value. Authored fishing-pocket pairings support all three bands. For arbitrary death positions without a candidate in the sampled band, selection falls back to another legal 45-240-second route.

The source specification remains `.scratch/first-playable-loop/spec.md`. Existing decision documents and the disposable camera prototype are preserved separately.
