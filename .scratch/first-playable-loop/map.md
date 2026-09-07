# Gunfishers first-playable loop

Label: `wayfinder:map`

## Destination

A decision-ready gameplay design for a 15–30 minute first playable that can test whether fishing for living guns, fighting with the catch, upgrading under pressure, and recovering lost equipment form a compelling survival loop.

## Notes

- This is a planning effort. Production implementation, content creation, and polish are outside the map; cheap prototypes are allowed only to answer a design question.
- Use `/grilling` and `/domain-modeling` for design decisions, and `/prototype` for interaction questions that need something concrete to react to.
- The defining player tension is **risk one more cast**: fishing greed raises visible Threat and forces decisions to finish, cancel, fight, upgrade, relocate, or pursue the Recovery cache.
- A Run starts with a safe guaranteed Gunfish catch. Fishing then raises Threat and attracts monsters.
- Fishing mode uses an elevated, angled 3D view. Drawing a Gunfish cancels the catch and transitions to third-person Combat mode.
- A character carries an unlimited Gunfish arsenal and assigns primary and secondary Combat slots. Gunfish can be permanently committed as Run-scoped automated defenders.
- Death fails the Run. Only the active Gunfish and rod survive as the newest Recovery cache in the persistent world; the next random spawn sees its direction and distance.
- Surviving the timer opens a victory/results screen and ends the first playable.
- Canonical terms live in [`CONTEXT.md`](../../CONTEXT.md).

## Decisions so far

- [Prototype the dual-camera mode transition](issues/02-dual-camera-transition.md) - Tactical dip is approved: angled Fishing view and a heading-preserving shoulder transition with brief slowdown and persistent danger lanes.

- [Choose the first-playable player format](issues/01-player-format.md) — The first playable is solo-only: each character gets a full Run, death ends it without respawning, and the player explicitly starts the next Run after results.
- [Design the fishing and Threat loop](issues/03-fishing-threat-loop.md) — Spatial, diegetic fishing targets visible Gunfish while irreversible per-Run Threat makes every outcome and future Cast more dangerous.
- [Design combat as the response to Threat](issues/04-combat-pressure.md) - Mobile, role-readable combat uses a two-slot unlimited arsenal, conventional supplies, and disposable Beer-serviced Mounted Gunfish to turn catches into offense, defense, or escape.
- [Shape the survival Run](issues/05-run-pacing.md) - A visible 15-minute, four-phase arc escalates an ambient local population through timed role unlocks, bounded response to Gunfish power, brief boundary lulls, and immediate terminal beats.
- [Balance catches, evolution, rods, and monster resources](issues/06-progression-economy.md) - Shared escalating-cost progression supports rod, specialist, generalist, and Mounted builds while duplicate sacrifice, supply limits, and visible Gunfish power constrain snowballing.
- [Make Recovery cache pursuit fair and tempting](issues/07-recovery-loop.md) - Recovery is an informed, newest-only equipment wager shaped by spawn distance, route pressure, transparent value, and atomic reclaim and replacement rules.
- [Bound the first-playable content set](issues/08-content-envelope.md) - Three Gunfish species, four monsters, weighted phase-and-power mixes, and a three-region six-site world form the minimum varied content envelope.
- [Teach the Fishing-to-Combat handoff](issues/09-mode-onboarding.md) - Soft-sequenced contextual prompts, production cues, and a 45-second catch target teach the handoff without pausing or suppressing the live Run.

## Not yet specified

None.

## Out of scope

- [Define playtest evidence and tuning thresholds](issues/10-playtest-evidence.md) - Deferred until playtesting becomes an active concern; this map will not specify evidence capture or tuning thresholds.
- Permanent metaprogression, post-victory progression, and the full game's endgame.
- Multiplayer, co-op, and future multiplayer-compatibility constraints for the first playable; the player format is solo-only.
- Narrative, monetization, online services, and production-scale content.
- Production implementation beyond disposable prototypes used to resolve a decision.
