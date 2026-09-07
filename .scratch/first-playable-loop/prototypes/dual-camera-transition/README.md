# Dual-camera transition prototype

Disposable Three.js browser prototype for comparing three ways to move from Fishing mode to Combat mode. This replaces the former 2D perspective simulation, not production game code. The user approved revised variant B with angled Fishing view on 2026-09-05; the canonical decision is in [Prototype the dual-camera mode transition](../../issues/02-dual-camera-transition.md). Prototype gameplay shortcuts are not approved rules.

Run from the repository root:

```bash
python3 -m http.server 4173 --directory .scratch/first-playable-loop/prototypes/dual-camera-transition
```

Then open <http://localhost:4173/?variant=b>. Tactical dip is the default when no variant is supplied and the user's preferred direction. Its Fishing view is elevated and angled approximately 55 degrees downward, inspired by the requested Animal Crossing-style view; A/C retain overhead views for comparison.

No build, npm install, or runtime other than the static server is required. A WebGL-capable browser and internet access are required: the page imports pinned Three.js `0.169.0` from jsDelivr. All meshes are generated locally in the page; there are no external models or textures.

## Controls

- On mobile/touch devices, hold the on-screen AIM arrows to move the reticle, then use Cast or the separate Fire button. The keypad aims; it does not move the stationary character. Draw, Cancel, More danger, and the variant switcher remain available as touch buttons.

- Click open water or press `F` to cast at the pointer (initially over water). The camera ray must hit water first; shore, landmarks, and monsters block casts.
- Press `Space` to draw or sheathe the active Gunfish.
- Move the pointer to aim; click in Combat mode to fire. A camera ray selects the aim point and a muzzle ray checks cover. Hits remove monsters; scenery and sky shots do not. The red reticle indicates an actual monster ray intersection, not automatic damage to the bearing lock.
- Press `C` to cancel a catch, `T` to increase danger, and `R` to reset.
- Use the bottom switcher or the left/right arrow keys to compare variants.

## Variants

- `?variant=a`: 420 ms eased threat-bearing orbit. The camera rotates toward the highest-threat living monster; aim unlocks at 120 ms and fire at 260 ms. The world-space ring and arrow retain danger direction.
- `?variant=b`: 100 ms overhead hold followed by a 580 ms shoulder dip, preserving cast heading. Aim is immediate; fire unlocks at 460 ms. Enemy movement, bobbing, water animation, and the simulation clock actually run at 35% for the draw's 680 ms; camera and input timing stay on real time. World-space attack lanes persist afterward.
- `?variant=c`: shoulder cut on the input frame with a 140 ms fading flash. Facing is preserved and aim/fire are immediate. Projected edge chevrons indicate off-screen living monsters.

Drawing cancels a cast or hooked catch immediately, with only B's visual line lingering for 100 ms. Early fire buffers at most one shot and releases through the real raycast path. Sheathing gates both rod and combat input until its reverse transition completes. Reset and variant changes restore all enemy positions, living status, threat, camera, timers, and buffered input; no delayed callbacks survive reset.

One perspective camera views the same water, shore, dock, player, Gunfish, and monster geometry throughout. The orange-roof lighthouse, stone arch, yellow buoy, and shoreline trees provide asymmetric spatial landmarks. The player is stationary by design; cast direction establishes heading for B/C, while combat pointer movement aims within the current camera view rather than rotating it.

The live-state panel exposes camera, catch, control, target, world speed, and transition timing. Fishing only reaches a test hook state; there is no catch reward, inventory, enemy damage to the player, or full game loop. This remains disposable comparison code, not a validated design.

## Manual Comparison

Cast, draw while the line is running, aim and click during each handoff, then sheathe. Confirm cancellation, input gates, the one-shot buffer, and visible scenery occlusion. Compare B's monster/water speed against A/C. Shoot monsters, increase danger, then reset or switch variants to confirm identical starting enemies. Repeat on a narrow viewport. Browser verification and user feedback are pending.
