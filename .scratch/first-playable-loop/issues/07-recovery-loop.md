# Make Recovery cache pursuit fair and tempting

Type: `grilling`
Status: `resolved`
Blocked by: 01, 06

## Question

How should random respawning, cache direction and distance, route danger, cache replacement, and reclaimed equipment work so recovery is a meaningful gamble rather than an obvious choice or a frustrating loss?

## Answer

### Recovery contract

- A Recovery cache is always physically reachable, but it is not always strategically worth pursuing. A bad spawn-cache pairing may make recovery a poor time-and-danger bargain, but broken geometry and off-map caches are not intentional outcomes.
- The cache marker is visible as soon as the character spawns. The player may leave the opening pocket before making the guaranteed first catch and attempt the route with only the Rod attack; recovery has no artificial gate.
- Recovery never pauses or extends the 15-minute clock. Traveling does not raise Threat, but the current Run's normal monsters can perceive, pursue, and delay the character.

### Random spawn and distance

- The random spawn is selected from authored opening pockets according to the shortest traversable sprint route to the cache rather than from uniform world coordinates.
- Initial pairing targets are 20% favorable at 45-75 seconds, 60% contested at 75-150 seconds, and 20% poor at 150-240 seconds or with a comparably hazardous route.
- Pairings below 45 seconds are excluded because recovery would be nearly free. Pairings above four minutes are excluded because the cache would stop functioning as a temptation. These are initial playtest targets for [Bound the first-playable content set](08-content-envelope.md), not guarantees that a player will reach the cache in those times.
- Spawn pairing ignores the value of the cached equipment. A powerful cache does not secretly force a worse spawn.

### Player information

- A persistent compass-edge marker shows the cache's bearing and straight-line distance in Fishing and Combat modes.
- The marker identifies the cached Gunfish's species, rarity, evolution, and numerical ranks, plus the cached Rod tier, so the player can judge the reward before committing.
- At short visual range, a world beacon makes the final location unambiguous.
- The marker does not reveal a safe route, danger score, or enemy count. Geography and visible monsters communicate route danger.

### Route danger and collection

- The failed Run's monsters do not persist or guard the cache. The new Run uses its normal freshly seeded population.
- Recovery adds no dedicated guards, cache-triggered encounters, Threat spikes, ambushes, or value-scaled difficulty. Authored geography may make the direct route exposed while a longer route offers cover.
- Monsters ignore the cache, and it cannot be damaged or removed off-screen.
- Reclaiming requires a two-second close-range hold. Movement or damage cancels the hold without partial progress; completion transfers the contents atomically without opening a loot menu.

### Reclaimed equipment

- The recovered Gunfish remains the same individual with its species, rarity, evolution branch, and numerical ranks intact. It returns with one full magazine but no reserve ammunition.
- It enters the unlimited Gunfish arsenal without displacing or firing the currently active Gunfish. Assigning it to a Combat slot remains an exposed, non-pausing player choice.
- A recovered Gunfish is not a catch. If recovery occurs before the first catch, that later catch fills primary and performs its teaching shot only while primary is empty; otherwise it follows the normal later-catch handoff without replacing the assignment.
- The character keeps the higher of the current and recovered Rod tiers. Rod tiers do not add together, and the lower Rod grants no refund.
- Recovery grants no Beer, ammo bundles, Upgrade resource, healing, or other Gunfish from the failed Run's arsenal.
- The recovered Gunfish immediately contributes its current score to Gunfish power, affecting future refills under the existing high-water rule.
- Once recovered, the Gunfish can be evolved, mounted, used as a donor, or preserved through another death if it is active when that death occurs.

### Replacement and loss

- On lethal failure, the character's current Rod and the Gunfish active at the lethal lock become the new Recovery cache. If no Gunfish is active, the cache contains only the Rod.
- The cache is placed at the death location and snapped only to the nearest stable, reachable ground. It is not relocated to a safer region.
- Creating the new cache atomically destroys any older unreclaimed cache, regardless of comparative value. The failure screen shows both the new contents and that the older cache was lost.
- Completing recovery consumes the cache immediately. Dying during the collection hold replaces the still-unrecovered cache under the same newest-only rule.
- A voluntarily abandoned Run, if that action is supported, has the same replacement consequence as death so it cannot reroll a poor spawn for free. Closing and reopening the application should resume the Run rather than create a new spawn.
- An unrecovered cache otherwise persists until reclaimed or replaced by a later failed Run. Persistence after a successful Run is outside this map because victory ends the first playable.
