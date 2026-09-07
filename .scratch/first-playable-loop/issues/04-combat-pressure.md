# Design combat as the response to Threat

Type: `grilling`
Status: `resolved`
Blocked by: 03

## Question

How should Threat become monster encounters, and which movement, aiming, ammunition, enemy-role, and drop rules make caught Gunfish satisfying while preserving pressure to return to fishing?

## Answer

### Threat and encounter boundaries

- Threat never spawns monsters. Population and pressure-costed mix remain independent Run-pacing concerns; during a Cast, accumulated Threat lets monsters already inside its detection radius find the character without normal distance or line-of-sight requirements.
- Held and Mounted Gunfish fire creates a fixed local sound alert but never adds Threat. Once alerted, a monster remains in pursuit after the rod is stowed.
- Combat has no encounter lock. The player may start another Cast while monsters are alerted or fighting Mounted Gunfish, and character damage still cancels that Cast immediately.
- The player can end pursuit by gaining sufficient distance and remaining out of line of sight for a short, readable period. Monsters then return to roaming; there are no invulnerable safe zones or mandatory kill walls.

### Character combat and arsenal

- Combat mode supports normal movement and strafing while firing, unrestricted standard jumping, and unlimited sprinting. Sprint lowers the active Gunfish and prevents aiming or firing. There is no universal dodge.
- Hip fire is loose. Holding precision aim tightens accuracy, narrows the camera, and slows movement; aiming remains manual rather than hard-locking a target.
- Monsters cause no contact damage. They softly body-block the character, but movement slides around their edges and monster attacks never impose movement stun. Damage still interrupts Casts, mounting, drinking, and turret servicing.
- The Gunfish arsenal has no carrying limit. The player assigns any two arsenal Gunfish to primary and secondary Combat slots and switches between those slots in real time.
- Slot assignments can change anywhere through an inventory that does not pause the world. The character can only walk slowly while it is open and cannot aim, fire, sprint, reload, mount, drink, service, or interact.
- The guaranteed first catch fills primary, draws, and performs its already-decided example shot. Every later catch enters the arsenal with one full magazine; the previously active Gunfish is redrawn rather than the catch being auto-equipped or forcing a discard choice.
- The always-available Rod attack is one repeatable, committed close-range swing with a forward step, useful damage, strong stagger, and punishable recovery. It is viable against every role and provides an ammunition-free combat path, but exposes the player to melee danger.

### Ammunition and reloading

- Gunfish share a small set of conventional ammo-class reserves. Beer and class-specific ammo bundles occupy one shared set of standard Supply slots; each Beer or bundle consumes one slot.
- Every Gunfish retains its individual magazine state when inactive. Only the active Gunfish can reload from its class reserve, manually or automatically when empty; inactive Gunfish never finish a reload in the background.
- Reloading permits normal movement but blocks aiming, firing, and sprinting. Firing or sprinting cancels and restarts the reload, while switching slots preserves the magazine's current state.
- Exact ammo classes, bundle yields, magazine sizes, and Supply-slot capacity are tuning and content decisions, not additional combat rules.

### Mounted Gunfish

- Holding mount briefly places the active Gunfish on any valid nearby ground. Movement or damage cancels before committing it. The Gunfish permanently leaves its Combat slot and arsenal; the other assigned slot draws automatically, or the character becomes unarmed if none is assigned.
- Mounted Gunfish are stationary, fully autonomous, continue fighting while the character fishes, and have no hard count limit. They last until destroyed or the current Run ends and can never be retrieved.
- A Mounted Gunfish preserves species behavior, rarity, numerical upgrades, and evolution. Player-triggered evolution abilities must define a simple automatic trigger for the Mounted form.
- It tracks the nearest monster in range and line of sight but fires with the species' base hip-fire accuracy rather than its precision-aim profile. Allied attacks are harmless in both directions and still collide normally with world geometry.
- The Mounted Gunfish first spends whatever rounds remained in its magazine. It then has unlimited ammunition only while fueled by Beer, with each Beer providing a fixed amount of active firing time and no fuel spent while idle.
- Servicing requires a brief close-range hold that movement or damage interrupts before Beer is consumed. Beer always repairs missing durability before it can add fuel to a fully repaired turret.
- A monster must perceive a Mounted Gunfish by sight, its gunfire, or being hit before turret priority applies. It then prefers the nearest perceived Mounted Gunfish over the character and stays committed until that target is destroyed, unreachable, or lost.
- An unfueled Mounted Gunfish remains a valid priority target and sacrificial decoy until destroyed. Destruction returns no Gunfish, ammunition, Beer, or upgrade resources.

### Enemy roles and lethality

- Every damaging monster action has a readable windup and can be avoided through strafing, jumping, sprinting, spacing, or cover. There are no hitscan monster attacks or passive touch damage.
- Pursuers are fast close-range pressure. Damage accumulated over a short window can interrupt and stagger their telegraphed attacks.
- Ranged monsters use visible avoidable projectiles. Their attacks use the same damage-based interruption and escalating stagger tells; when pressured in rod range, they get one bounded, telegraphed reposition rather than retreating forever.
- Siege monsters are slow and durable. Their slow high-impact attacks naturally punish stationary turrets without hidden turret-damage bonuses; frontal armor reduces but never negates damage, while an exposed rear rewards circling or using turret aggro.
- All Gunfish damage all roles. Practical advantages come from visible behavior and anatomy - range, spread, fire rate, stagger, penetration, and weak angles - rather than hard counters, elements, immunities, or hidden role multipliers.
- Stagger buildup is communicated by escalating animation, recoil, sound, and hit effects rather than a bar.
- Initial lethality targets fast, role-scaled kills: Pursuers fall to a short burst, Ranged monsters to roughly one committed magazine, and Siege monsters require advantageous positioning or several magazines. A few clearly telegraphed hits seriously endanger the character.

### Drops and sustain

- Every monster kill guarantees a physical, role-scaled amount of upgrade resources. A separate need-weighted chance produces one physical Beer or ammo-bundle drop; shortage and monster toughness raise that chance rather than every kill guaranteeing supply.
- Ammo selection considers every ammo class represented in the current Gunfish arsenal, not only the Combat slots. Beer demand considers missing character health plus repair and fuel deficits on nearby Mounted Gunfish; abandoned distant turrets do not affect local drops.
- Direct, Rod, and Mounted Gunfish kills use the same drop rules. Turret kills do not grant remote income; rewards remain where the monster died.
- Every drop requires manual interaction. Upgrade resources have no Supply-slot cost. Beer and ammo require a free compatible Supply slot; when full, the player must separately consume or drop a carried supply before collecting another.
- Uncollected and manually dropped supplies remain on the ground until the Run ends, allowing spatial field caches rather than automatic replacement or expiration.

These decisions supersede the two-Gunfish carrying cap and post-catch discard choice recorded by [Design the fishing and Threat loop](03-fishing-threat-loop.md). Exact escalation belongs to [Shape the survival Run](05-run-pacing.md); capacities, yields, evolutions, and prices belong to [Balance catches, evolution, rods, and monster resources](06-progression-economy.md); concrete species and monster counts belong to [Bound the first-playable content set](08-content-envelope.md).
