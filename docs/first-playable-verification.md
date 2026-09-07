# First-Playable Verification

## Automated Contract Checks

`npm test` exercises 57 scenarios through the primary Run seam. Coverage includes:

- Spatial lure placement, gentle versus strong input, catching outcomes, final Threat sweeps, and first/later-catch handoffs.
- Tactical dip boundaries, shot buffering, world slowdown, real-time countdown, and reverse-transition gates.
- Movement, ammunition, reload interruption, cover, Rod stagger, Spitter reposition interruption, alerts, and disengagement.
- Purchases, atomic evolution, identity-based power, supplies, permanent mounting, magazine/fuel use, and repair-first servicing.
- Authored content, all pressure phases, replenishment lulls, legal unseen refills, high-Threat refills, opening approach margins, and map connectivity.
- Failure, newest-only Recovery, reclaim interruptions, save/resume, and deterministic victory precedence.
- Quarry surface heights, traversable ramps, jump offsets, vertical aiming, and elevation-aware projectiles.

`npm run build` performs TypeScript checking and the Vite production build. Three.js produces a non-fatal warning for a minified JavaScript chunk over 500 kB.

## Browser Checks

Checked in headless Chromium using `agent-browser` at desktop and 390 x 844 portrait sizes. Some checks use deterministic authored Run saves to isolate an interaction, not production debug controls.

| Check | Observed result |
| --- | --- |
| Initial load | Procedural WebGL world, start screen, visible opening pair, HUD, and controls render |
| Portrait layout | Both opening choices remain visible; keypad, HUD, field guide, and results fit |
| Touch placement without a move event | Lure uses the tap coordinates rather than stale pointer coordinates |
| First-catch loop | Gentle alternating tugs produce a bite; three inputs reacting to audible snap cues land a Pistol Gunfish |
| Teaching handoff | Enters Combat mode and fires one example shot, leaving 7 of 8 pistol rounds |
| Live arsenal | Rod purchase and Damage rank spend 11 resource; timer continues |
| Ammo unpacking | One pistol bundle grants 16 reserve rounds |
| Evolution | Valuable Tier II donor warning shown; confirmation consumes donor and preserves the target identity and Damage rank |
| Mounting | Holding M removes the evolved Primary permanently, preserves its loaded magazine and branch, and draws Secondary |
| Resume | Reload retains character position, arsenal identities, mounted defender, and elapsed Run time |
| Failure | Results disclose the new Recovery cache and offer an explicit next Run |
| Victory | Authored near-deadline Run reaches 00:00, shows completion results, and offers no next-Run action |
| Runtime errors | Clean final QA browser session reports no page errors |

## Review Follow-Ups Resolved

Code and browser review found and fixed interrupted Spitter maneuver state, Rod attacks through cover, high-Threat refill starvation, same-update terminal processing, stale touch coordinates, mismatched rarity cues, floating-point tug classification, frame-time truncation, restored hold completion, stale models across Runs, and entity-owned GPU resource leaks.

## Not Established

These checks do not establish subjective fun, 40-55-resource balance, a combat-active 15-minute survival rate, audio quality on real speakers, or physical-device touch ergonomics. Those remain human playtesting and tuning work, not claimed acceptance evidence. Recovery band availability for arbitrary death positions uses the legal-route fallback documented in the README.
