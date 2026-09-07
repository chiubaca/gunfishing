# Teach the Fishing-to-Combat handoff

Type: `grilling`
Status: `resolved`
Blocked by: 02, 03, 04

## Question

During the guaranteed-safe opening and first dangerous Cast, what minimum prompts, visual cues, and audio teach the angled Fishing view, immediate emergency cancellation, heading-preserving Tactical dip, delayed fire availability, first-catch primary assignment, later-catch arsenal storage, Combat-slot switching, precision aim, Rod attacks, and incoming attack lanes without relying on the prototype's diagnostic HUD, and what slow first-catch completion target should set the opening pocket's monster travel-time margin?

## Answer

### Onboarding rules

- Use a soft-sequenced tutorial, not gameplay gates. The Run timer and monster simulation begin immediately, and the player may leave the opening pocket or act ahead of prompts.
- Show one contextual prompt at a time with the player's current bound-action glyphs. Completing an action dismisses its prompt permanently.
- Use no voiceover, modal tutorial, pause, invulnerability, or tutorial-only controls.
- Retain only production HUD elements such as health, Run clock, Threat, ammunition, and Combat slots. Do not rely on diagnostic state labels, transition timers, heading lines, or simulation readouts.

### Guaranteed-safe opening

| Beat | Prompt | Visual and audio |
| --- | --- | --- |
| Spawn | `Aim and Cast beside a Gunfish` | Begin directly in the elevated angled Fishing view, facing two visible Tier I choices. The projected Lure landing point conforms to the water surface. Fish silhouettes, rarity treatment, surface movement, and a short rod-ready sound establish valid targets. |
| Lure deployed | `Reel close. Use gentle tugs to attract it` | Interested fish turn toward the Lure, close distance, and produce increasingly frequent ripples and rising-pitch water sounds. Strong movement makes the fish recoil with a sharp splash. No Interest meter appears. |
| First bite | `Press [Catch] when the line snaps` | The fish, line, rod bend, controller vibration, and synchronized sound provide the timing cue. The prompt disappears after the first successful hit; later hits rely on the same cues. No progress bar or hit counter appears. |
| First landing | None | The catch visibly collapses into the primary Combat-slot portrait, labelled once as `Primary: <species>`, followed by a slot-lock sound. It immediately draws through Tactical dip. |
| First draw | `Hold [Aim] for precision` | The automatic example shot demonstrates recoil, muzzle effect, projectile impact, ammunition use, and the moment firing becomes available. Holding precision aim narrows the camera and tightens the reticle while visibly slowing movement. |

The opening remains mechanically authentic. Misses, fish behavior, Threat accumulation, and the Run clock use ordinary rules; safety comes from authored distance rather than disabled systems.

### Tactical dip

- Preserve the player's Fishing bearing throughout the handoff.
- End the Cast on the draw-input frame and let the line linger visually for the established 100 ms.
- Dip to the shoulder camera over the established 680 ms total handoff while the world continues at 35% speed.
- Represent the 460 ms fire lock with a hollow reticle that visibly closes. Play a short Gunfish-ready click when it becomes solid.
- If Fire is pressed early, pulse the reticle once to acknowledge the buffered shot and release that single shot at 460 ms.
- Do not explain these timings with text.

### First dangerous Cast

A Cast becomes dangerous for onboarding when Threat reveals a monster, an already-Alerted monster approaches, or an attack windup begins while the rod is out. Show one urgent prompt:

> `[Primary]: cancel the Cast and draw now`

- The populated Combat-slot action ends the Cast immediately and begins Tactical dip.
- The Threat boundary pulses toward the detecting monster, the monster gives a spatialized alert sound, and the rod-stow sound confirms cancellation on the input frame.
- Ignoring the prompt does not pause or weaken the monster. Taking damage still cancels the Cast under the ordinary rule.
- After the first occurrence, never repeat the text prompt. Threat pulses, monster audio, and attack telegraphs remain permanent gameplay cues.

### Incoming attack lanes

- Draw attack telegraphs in world space from the monster through the threatened area, using shape, fill motion, and texture as well as color.
- Fill the lane toward impact so timing remains readable from either camera angle, and keep it fixed to the attack's world direction throughout Tactical dip.
- Play a spatialized windup sound from the attacker and a distinct release sound.
- Add a restrained screen-edge continuation only when part of the lane is outside the camera. Never replace the world-space lane with a diagnostic arrow or text label.

### Later catches and arsenal

- Animate each later Gunfish into the Gunfish arsenal rather than either Combat slot, show `Stored in arsenal: <species>` once, keep both slot portraits unchanged, and redraw the previously active Gunfish. Use a softer storage sound distinct from the first-catch primary lock.
- When the secondary slot is empty, show `[Arsenal]: assign the stored Gunfish to Secondary`.
- After assignment, show `[Secondary]: switch Gunfish`. Switching once dismisses the prompt.
- Slot portraits and active-slot emphasis provide the lasting explanation. Do not force an inventory visit or pause the world.

### Rod attack

Show `[Rod Attack]: always available` when a monster first enters Rod-attack range or the active Gunfish first reaches an empty magazine, whichever occurs first. The Rod's ready pose, forward step, impact sound, and strong stagger teach its function. The prompt disappears after one use and never pauses combat.

### Opening timing target

- Use 45 seconds from gaining control to landing the first Gunfish as the deliberately slow onboarding target.
- Author each opening pocket so the earliest possible damaging contact from any initial Phase 1 monster is at least 60 seconds after spawn. Calculate this from the fastest legal Pursuer route and include its attack windup.
- This leaves at least 15 seconds of reserve after a deliberately slow successful catch. Players who fail repeatedly, stall, or leave the opening pocket receive no further protection.
