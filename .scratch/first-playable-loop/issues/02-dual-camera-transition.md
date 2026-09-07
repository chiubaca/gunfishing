# Prototype the dual-camera mode transition

Type: `prototype`
Status: `resolved`
Blocked by: 01

## Question

What camera motion, controls, target orientation, cancellation timing, and danger telegraph make the transition from top-down Fishing mode to third-person Combat mode fast, readable, and non-disorienting?

## Comments

- 2026-09-05: Human feedback prefers Tactical dip (B), with Fishing / explore viewing at a slight angle, Animal Crossing-style, rather than directly overhead. Updated B to an elevated oblique view (approximately 55 degrees downward) and made it the default on URLs without a variant. This is a viewing adjustment, not an exploration mechanic or a final ticket resolution; remaining interaction details await evaluation.

- 2026-09-05: Rebuilt the prototype with Three.js at the user's request: real 3D geometry and camera transitions, raycast casting/shooting, and actual slowed simulation in Tactical dip. Browser smoke checks passed for all three transitions and mobile-width WebGL rendering. Human evaluation remains pending.

- 2026-09-05: [Interactive dual-camera transition prototype](../prototypes/dual-camera-transition/README.md) created with Threat-lock arc, Tactical dip, and Matched hard cut variants. Awaiting human evaluation before recording a decision.

## Answer

The user approved Tactical dip (B), with its revised angled Fishing view, on 2026-09-05.

- Fishing mode uses an elevated oblique 3D view, inspired by Animal Crossing, rather than a directly overhead camera. The approved prototype looks down approximately 55 degrees; this is the initial camera tuning, not a requirement to reproduce Animal Crossing's terrain or art.
- Drawing the active Gunfish preserves the player's chosen cast/facing bearing rather than automatically turning toward a monster.
- The camera holds the angled view for 100 ms, then dips to the third-person shoulder over 580 ms, for a 680 ms handoff.
- Drawing cancels the current Cast on the input frame. The fishing line may linger visually for 100 ms, but the Cast has already ended.
- Aim remains available during the draw; firing unlocks at 460 ms. An early fire input buffers at most one shot.
- The world continues moving at 35% speed during the draw, returning to normal at the end of the 680 ms handoff. This transition-only slowdown does not pause ordinary fishing, the Catching challenge, or loadout decisions.
- World-space attack lanes preserve incoming danger direction through the transition and into Combat mode.
- Returning to Fishing mode gates rod and combat inputs until the reverse transition settles.
- The prototype's desktop keys and mobile aim keypad are evaluation controls, not a decision on final movement or input bindings.

Primary reference: [Three.js Tactical dip prototype and controls](../prototypes/dual-camera-transition/README.md), variant B. The alternative variants remain available for comparison, not as selected designs.

Prototype shortcuts do not supersede [Design the fishing and Threat loop](03-fishing-threat-loop.md): Threat never decreases during a Run; emergency cancellation stows the rod; landing a catch enters Combat mode. The prototype's simplified catch, manual cancel, and kill-related Threat behavior are not approved gameplay rules.
