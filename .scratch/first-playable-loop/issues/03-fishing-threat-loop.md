# Design the fishing and Threat loop

Type: `grilling`
Status: `resolved`

## Question

What actions and tradeoffs make each cast engaging, determine catch quality, generate and clear Threat, and let the player judge whether to risk finishing or cancel to fight?

## Answer

### Finding and attracting a fish

- Fish are visible in the world, and their appearance reveals both Gunfish species and Gunfish rarity before the player commits.
- A Cast uses a reusable Lure. The player aims the initial placement, reels the Lure toward the character, and makes small directional tugs; the Lure cannot be freely steered.
- Any nearby fish that becomes interested may bite, so placing the Lure to isolate the desired fish matters.
- Landing the Lure too close or moving it too strongly scares a fish. It relocates, ignores the Lure for a short cooldown, and adds no discrete Threat spike.
- Only gentle movement attracts fish. Correct placement and teasing create visible, diegetic Interest cues and escalating weighted bite odds, reaching a practical guarantee after sustained correct play; no numerical Interest meter is shown.

### Catching challenge

- A bite begins a repeated-timing challenge. Rarer Gunfish have smaller timing targets and require more successful hits.
- Catch progress and failure risk are communicated through fish, line, animation, and audio rather than counters or progress bars.
- A successful timing hit resets the consecutive-miss count. Two consecutive misses lose the attempt, create a rarity-scaled Threat spike, and put that fish on a long cooldown.
- Successful timing hits add no discrete Threat. A successful landing creates one rarity-scaled Threat spike.
- The visible fish fixes the landed Gunfish's species and rarity. Catching performance changes only success, elapsed exposure, and Threat, never the reward's quality.

### Threat and interruption

- The world remains fully active throughout aiming, teasing, and the catching challenge.
- Threat rises continuously while the Lure is deployed and receives small pulses from teasing inputs. It never decreases within a Run and resets when the next Run begins.
- Threat is the fishing detection radius, not the monster spawn director. While the rod is out, monsters inside that radius can detect the player without their normal distance and line-of-sight requirements. Monsters already alerted remain in pursuit after the rod is stowed.
- Current accumulated Threat is visible, but the game does not forecast the size of a pending outcome spike.
- Landing a fish or losing it to two consecutive misses applies its rarity-scaled spike, performs one final detection sweep at the enlarged radius, and then ends the Cast.
- A one-button emergency cancel is available throughout a Cast. Canceling or taking monster damage immediately breaks the Cast, stows the rod, and puts the target fish on the normal short cooldown. Neither adds a discrete Threat spike, but all Threat already earned remains.
- Monster population and pressure-costed mix scale independently of Threat through Run time and Gunfish power; their exact spawning and behavior belong to [Design combat as the response to Threat](04-combat-pressure.md) and [Shape the survival Run](05-run-pacing.md).

### Landing and arsenal handoff

- Landing ends the Cast and enters Combat mode rather than leaving the rod ready for another Cast.
- The first catch of every Run fills the primary Combat slot, draws, and automatically fires one example shot during the guaranteed-safe opening.
- Later catches enter the unlimited Gunfish arsenal with one full magazine. The previously active Gunfish is redrawn; landing never forces an immediate assignment or discard choice.
- Combat slots, ammunition, and mounting are defined by [Design combat as the response to Threat](04-combat-pressure.md). Duplicate conversion, evolution, rod improvement, and detailed progression economics remain decisions for [Balance catches, evolution, rods, and monster resources](06-progression-economy.md).
