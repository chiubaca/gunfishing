# Gunfishers first-playable loop

Label: `wayfinder:map`

## Destination

A decision-ready gameplay design for a 15–30 minute first playable that can test whether fishing for living guns, fighting with the catch, upgrading under pressure, and recovering lost equipment form a compelling survival loop.

## Notes

- This is a planning effort. Production implementation, content creation, and polish are outside the map; cheap prototypes are allowed only to answer a design question.
- Use `/grilling` and `/domain-modeling` for design decisions, and `/prototype` for interaction questions that need something concrete to react to.
- The defining player tension is **risk one more cast**: fishing greed raises visible Threat and forces decisions to finish, cancel, fight, upgrade, relocate, or pursue the Recovery cache.
- A Run starts with a safe guaranteed Gunfish catch. Fishing then raises Threat and attracts monsters.
- Fishing mode is 3D top-down. Drawing a Gunfish quickly cancels the catch and transitions to third-person Combat mode.
- A character equips two Gunfish. Duplicate catches can either evolve a matching Gunfish or improve the rod; monster resources buy numerical Gunfish upgrades.
- Death fails the Run. Only the active Gunfish and rod survive as the newest Recovery cache in the persistent world; the next random spawn sees its direction and distance.
- Surviving the timer opens a victory/results screen and ends the first playable.
- Canonical terms live in [`CONTEXT.md`](../../CONTEXT.md).

## Decisions so far

## Not yet specified

- The exact feedback and onboarding burden created by switching between Fishing mode and Combat mode; sharpen after the interaction prototype.
- Playtest instrumentation and tuning targets; sharpen once the content and pacing envelope is known.

## Out of scope

- Permanent metaprogression, post-victory progression, and the full game's endgame.
- Narrative, monetization, online services, and production-scale content.
- Production implementation beyond disposable prototypes used to resolve a decision.
