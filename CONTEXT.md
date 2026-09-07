# Gunfishers

Gunfishers is a survival roguelike about catching living weapons, using them against monsters, and risking recovery of equipment lost by earlier characters.

## Language

**Gunfish**:
A fish that functions as a usable gun after it is caught. Gunfish species determine the weapon, such as a Pistol Gunfish or Peashooter Gunfish.
_Avoid_: Gun, weapon fish

**Gunfish rarity**:
A visible one-of-three tier belonging to an individual Gunfish that affects its catching difficulty and is preserved when landed. Catching performance cannot raise or lower it.
_Avoid_: Catch quality

**Run**:
A single timed survival attempt, beginning when a new character spawns and ending in success when the timer expires or in failure when that character dies.
_Avoid_: Life, session

**Persistent world**:
The map whose designated persistent state carries across Runs, including recoverable equipment dropped by dead characters. Living monster population is Run-scoped and is freshly seeded when each Run begins.
_Avoid_: Run, level

**Threat**:
Visible local disturbance accumulated by fishing. While the rod is out, higher Threat lets nearby monsters detect and pursue the player from farther away, even without line of sight; alerted monsters remain in pursuit after the rod is stowed. Threat does not determine which monsters spawn, is not increased by gunfire, never decreases during a Run, and resets when the next Run begins.
_Avoid_: Random encounter rate

**Alerted monster**:
A monster actively pursuing the character or a perceived Mounted Gunfish after detecting the character through normal sight or proximity, hearing local gunfire, or responding to Threat during a Cast. Stowing the rod does not clear the alert; the monster disengages only after sufficient distance and broken line of sight.
_Avoid_: Spawned encounter

**Fishing mode**:
The elevated, angled 3D mode used while the character has their rod out, rather than a directly overhead view.
_Avoid_: Combat view

**Cast**:
A single fishing attempt, beginning when the player throws the Lure and ending when a Gunfish is landed or the attempt is canceled or failed. The persistent world remains active throughout.
_Avoid_: Fishing session

**Opening pocket**:
The authored area where a character begins a Run, with two isolated common Gunfish available nearby. Monsters do not spawn until the player lands their first Gunfish of the Run, even if they leave the pocket. The Run clock continues throughout.
_Avoid_: Tutorial safe zone

**Lure**:
The reusable end of the fishing line that the player places and gently moves to attract visible fish. Casting does not consume it.
_Avoid_: Bait

**Rod attack**:
The character's ammunition-free melee attack in Combat mode. It is always available as one committed close-range swing with useful damage and strong stagger, allowing melee combat or escape when Gunfish ammunition is scarce.
_Avoid_: Emergency shove

**Interest**:
A visible fish behavior state showing receptiveness to the current Lure. Sustained correct placement and gentle movement raise the fish's weighted bite odds without exposing a numerical meter.
_Avoid_: Bite meter

**Catching challenge**:
The repeated timing sequence that begins when a fish bites. A box swings left and right across a visible target; pressing Catch while its center is inside the target scores a hit. Gunfish rarity controls target size and required hits. Two consecutive mistimed presses fail the challenge; waiting for another pass does not count as a miss.
_Avoid_: Fishing minigame

**Combat mode**:
The third-person shooter mode entered when the character draws the active Gunfish.
_Avoid_: Fishing view

**Recovery cache**:
A character's Rod and active Gunfish, with their upgrades intact, left at the failure location in the persistent world. It remains until reclaimed or replaced by the next failed Run; only the newest Recovery cache is available.
_Avoid_: Corpse, grave

**Gunfish arsenal**:
All Gunfish carried by the character during a Run. The arsenal has no capacity limit. Gunfish are assigned from it to the primary and secondary Combat slots through an inventory that does not pause the persistent world. A Gunfish committed as a Mounted Gunfish leaves the arsenal permanently.
_Avoid_: Gunfish loadout, Catch inventory

**Combat slots**:
The primary and secondary Gunfish assignments available for immediate real-time switching in Combat mode. Assignments can be changed from the Gunfish arsenal at any time, but the persistent world remains active while the inventory is open.
_Avoid_: Carrying limit

**Active Gunfish**:
The Gunfish currently held from one of the Combat slots. It is the only Gunfish preserved in the Recovery cache when the character dies.
_Avoid_: Equipped loadout

**Mounted Gunfish**:
A Gunfish permanently removed from the Gunfish arsenal and placed in the world as a stationary automated defender. It preserves the species behavior, rarity, upgrades, and evolution of the carried Gunfish. Monsters that perceive it prioritize attacking it over the character. It spends its loaded magazine first, then fires unlimited ammunition while fueled by Beer. It lasts until destroyed or the current Run ends and cannot be retrieved.
_Avoid_: Permanent turret

**Beer**:
A shared combat consumable used to restore the character's health or service a Mounted Gunfish. On a damaged Mounted Gunfish, Beer restores durability; only a fully repaired one can receive Beer as firing fuel. Turret fuel is spent only during active firing, not while the turret is idle.
_Avoid_: Health potion, Turret ammo

**Ammo class**:
One of a small number of reserve-ammunition pools. An Ammo class is independent of species identity and may serve one or multiple Gunfish species. Ammunition is carried in class-specific bundles rather than tracked as inventory weight per round.
_Avoid_: Ammo type per Gunfish

**Supply slot**:
One of the character's eight units of shared carrying capacity, used by either one Beer or one ammo bundle. Gunfish and Upgrade resource do not occupy Supply slots.
_Avoid_: Weight, Gunfish slot

**Upgrade resource**:
The single Run-scoped resource dropped by every monster role and spent on either rod improvements or numerical upgrades to an individual Gunfish.
_Avoid_: Role-specific currency, Rod currency

**Pursuer**:
A fast close-range monster role that forces the character to keep moving and creates openings for other monsters.
_Avoid_: Contact-damage enemy

**Ranged monster**:
A monster role that attacks from distance and punishes exposed precision aiming with avoidable projectiles.
_Avoid_: Hitscan enemy

**Attack lane**:
A world-space telegraph showing the area and timing of an incoming monster attack. It remains aligned with the attack through camera transitions and communicates through shape and motion rather than color alone.
_Avoid_: Diagnostic arrow

**Siege monster**:
A slow, durable monster role that pressures and destroys Mounted Gunfish.
_Avoid_: Boss

**Gunfish evolution**:
A two-stage change to an individual Gunfish's firing behavior or special ability, created by atomically merging a rarity-scaled number of same-species Gunfish. Stage I selects one of two species-specific branches; Stage II deepens that branch. It is distinct from a numerical upgrade bought with Upgrade resource.
_Avoid_: Stat upgrade, rod evolution

**Numerical upgrade**:
One of up to three ranks allocated to an individual Gunfish's Damage, Fire rate, or Magazine. Numerical upgrades are bought with Upgrade resource and remain distinct from Gunfish evolution.
_Avoid_: Gunfish evolution, Rod tier

**Rod tier**:
One of the rod's three linear Run-scoped progression levels. Higher tiers improve Interest gain and catching-target width without changing Gunfish rarity, Threat rules, or Rod-attack strength.
_Avoid_: Rod evolution, Numerical upgrade

**Gunfish power**:
The visible Run-scoped high-water sum of the two strongest distinct Gunfish the character has had available; an absent second Gunfish contributes zero. Rarity contributes 1, 3, or 5 points, each evolution stage contributes 2, and each numerical upgrade rank contributes 1. Low power is 0-7, Middle is 8-15, and High is 16-24. It never decreases during a Run and raises the pressure budget for future mixes of time-unlocked monsters independently of Threat and timed escalation; additional Gunfish beyond the strongest two do not raise it.
_Avoid_: Arsenal size, Threat, gear score
