# Gunfishers First-Playable Loop

Status: `ready-for-agent`

## Problem Statement

Players need a short, complete experience that proves whether Gunfishers' central promise is compelling: fish for living guns, use the catch against mounting monster pressure, make exposed upgrades and sacrifices, and decide whether equipment lost by a previous character is worth recovering. Without a bounded first-playable specification, implementation could test isolated fishing or shooting mechanics without testing the intended **risk one more cast** tension that connects them.

The first playable must therefore define one coherent Run with enough content, pacing, progression, onboarding, and persistence to expose meaningful choices while remaining small enough to build and evaluate. It must also separate player-visible gameplay rules from later production polish, permanent progression, and playtest analytics.

## Solution

Build a solo-only first playable around a 15-minute Run in one persistent world. A new character begins in an authored opening pocket, immediately sees two safe Tier I Gunfish choices, and learns the authentic fishing interaction while the Run clock and monster simulation remain active. Fishing accumulates visible, irreversible Threat that lets nearby monsters detect the character during a Cast. Landing or drawing a Gunfish moves through a heading-preserving Tactical dip into mobile third-person Combat mode.

The player carries an unlimited Gunfish arsenal, assigns two Combat slots, fights four role-readable monsters, gathers shared Upgrade resource and limited supplies, improves the rod or individual Gunfish, merges duplicate species into branch evolutions, and may permanently commit Gunfish as automated defenders. A four-phase population director raises pressure with time and responds to visible Gunfish power without making Threat a spawn director.

Death ends the Run and replaces any older Recovery cache with the dead character's Rod and active Gunfish. The next character spawns at an authored location and can judge the cache's value, distance, and route risk before pursuing it. Surviving until the timer reaches 00:00 immediately wins and opens results. This complete loop is the first playable; no boss, extraction, permanent metaprogression, or multiplayer system is required.

## User Stories

1. As a player, I want each Run to begin with a new solo character, so that one survival attempt has a clear start and ownership.
2. As a player, I want the 15-minute countdown to begin as soon as my character spawns, so that every choice consumes meaningful Run time.
3. As a player, I want to see the Run clock throughout play, so that I can judge immediate risk against survival time remaining.
4. As a player, I want to begin in an opening pocket with two visible Tier I Gunfish of different species, so that my first build choice is informed rather than random.
5. As a new player, I want enough monster travel time to complete a deliberately slow first catch, so that I can learn without the game disabling its normal systems.
6. As an experienced player, I want to leave the opening pocket or act ahead of tutorial prompts, so that onboarding never becomes a gameplay gate.
7. As a player, I want Gunfish in the water to visibly communicate species and rarity, so that I can choose a target before exposing myself to a Cast.
8. As a player, I want to place a reusable Lure near a chosen Gunfish, so that target selection depends on spatial judgment rather than a menu.
9. As a player, I want to reel and gently tug the Lure rather than steer it freely, so that attraction asks for deliberate control.
10. As a player, I want nearby Gunfish other than my intended target to be able to bite, so that isolating a target matters.
11. As a player, I want an overly close landing or strong movement to scare a Gunfish temporarily, so that careless Lure control has a readable consequence.
12. As a player, I want fish movement, ripples, and sound to communicate Interest, so that I can improve my bite odds without reading a numerical meter.
13. As a player, I want sustained correct Lure placement and movement to make a bite practically certain, so that patient skill is rewarded rather than defeated by unbounded randomness.
14. As a player, I want a bite to begin a Catching challenge, so that landing a Gunfish requires active execution.
15. As a player, I want rarer Gunfish to require smaller timing targets and more successful hits, so that visible rarity predicts catching difficulty.
16. As a player, I want two consecutive misses to lose a hooked Gunfish, so that failure risk is understandable and recoverable between successful hits.
17. As a player, I want the fish, line, rod, animation, audio, and vibration to communicate Catching-challenge progress and timing without counters or progress bars, so that I can read the interaction through the world.
18. As a player, I want catching performance to affect success, exposure time, and Threat but never the Gunfish's rarity, so that the fish I chose remains the reward I can earn.
19. As a player, I want the persistent world and monsters to remain active during every part of a Cast, so that fishing is a genuine survival risk.
20. As a player, I want visible Threat to rise while the Lure is deployed and pulse when I tease a fish, so that fishing greed has an immediate, legible cost.
21. As a player, I want Threat to persist for the rest of the Run, so that repeated fishing creates an irreversible pressure decision.
22. As a player, I want Threat to expand monster detection during a Cast rather than secretly spawn enemies, so that its consequences remain spatial and understandable.
23. As a player, I want landed and lost rare Gunfish to create larger Threat spikes than common ones, so that rarity carries commensurate risk.
24. As a player, I want to cancel any Cast immediately with one action, so that I can abandon greed when danger becomes unacceptable.
25. As a player, I want monster damage to cancel my Cast immediately, so that I cannot ignore combat pressure while fishing.
26. As a player, I want cancellation to preserve Threat already accumulated without adding an outcome spike, so that escape is useful but cannot erase prior risk.
27. As a player, I want drawing my active Gunfish to cancel the Cast on the input frame, so that emergency response feels dependable.
28. As a player, I want Fishing mode to use an elevated angled 3D view, so that fish, nearby terrain, and approaching danger remain spatially readable.
29. As a player, I want the transition into Combat mode to preserve my chosen facing, so that camera movement does not override my intent.
30. As a player, I want the world to slow briefly rather than pause during Tactical dip, so that the transition is readable without removing danger.
31. As a player, I want to aim during Tactical dip and buffer one early shot, so that I can prepare a response before firing unlocks.
32. As a player, I want the reticle and a ready sound to communicate when firing becomes available, so that transition timing does not need explanatory text.
33. As a player, I want incoming attack lanes to remain aligned in world space through camera transitions, so that I do not lose track of danger.
34. As a player, I want returning to Fishing mode to gate conflicting inputs until the camera settles, so that mode changes cannot produce accidental actions.
35. As a player, I want my guaranteed first catch to fill primary, draw, and fire one example shot when primary is empty, so that the fishing-to-combat handoff teaches itself without replacing a Gunfish recovered first.
36. As a player, I want later catches to enter my unlimited Gunfish arsenal with a full magazine, so that catching never forces an immediate discard decision.
37. As a player, I want my previously active Gunfish to redraw after a later catch, so that landing a fish does not unexpectedly replace my combat tool.
38. As a player, I want to assign any carried Gunfish to primary and secondary Combat slots, so that I can build a two-Gunfish real-time kit without limiting collection.
39. As a player, I want to switch primary and secondary Gunfish in real time, so that different species can answer changing combat situations.
40. As a player, I want each Gunfish to retain its own magazine while inactive, so that switching has predictable ammunition consequences.
41. As a player, I want to change slot assignments and buy upgrades anywhere through a non-pausing arsenal interface, so that build decisions remain exposed to the live world.
42. As a player, I want movement and actions constrained while the arsenal interface is open, so that menu use cannot become a safe combat exploit.
43. As a player, I want loose hip fire and slower, tighter precision aim, so that mobility and accuracy are an explicit tradeoff.
44. As a player, I want to move, strafe, and jump while fighting, so that survival depends on readable spatial combat.
45. As a player, I want unlimited sprinting to lower my active Gunfish and block firing, so that escape remains available at the cost of offense.
46. As a player, I want no universal dodge or hard target lock, so that positioning, movement, and manual aim remain central.
47. As a player, I want an always-available Rod attack with strong stagger and committed recovery, so that empty ammunition creates danger rather than helplessness.
48. As a player, I want monster attacks to use visible windups and avoidable geometry rather than touch damage or hitscan attacks, so that taking damage feels attributable.
49. As a player, I want Pursuers to force movement, Ranged monsters to punish exposed aiming, and Siege monsters to pressure stationary defenders, so that enemy roles remain readable.
50. As a player, I want every Gunfish to damage every monster, so that advantages come from visible behavior rather than hidden immunities or hard counters.
51. As a player, I want sustained damage to stagger Pursuer and Ranged-monster attacks, so that offense creates readable openings against those roles.
52. As a player, I want to escape Alerted monsters by gaining distance and breaking line of sight, so that combat has alternatives to mandatory kills.
53. As a player, I want gunfire to alert nearby monsters without increasing Threat, so that fishing disturbance and combat noise remain distinct systems.
54. As a player, I want to begin another Cast while monsters remain Alerted, so that risking one more cast is always my decision.
55. As a player, I want conventional Ammo classes shared through reserve pools, so that ammunition planning matters without requiring one bespoke pool per species.
56. As a player, I want manual and empty-magazine reloads to permit movement but block aiming, firing, and sprinting, so that reload timing creates pressure.
57. As a player, I want switching away to preserve magazine state without completing a reload in the background, so that slot switching cannot bypass reload risk.
58. As a player, I want eight shared Supply slots for Beer and ammo bundles, so that sustain choices compete for bounded carrying capacity.
59. As a player, I want all monster kills to drop physical Upgrade resource and sometimes a need-weighted supply, so that combat can fund survival and progression without guaranteeing sustain.
60. As a player, I want to collect every drop manually, so that rewards remain part of spatial combat rather than arriving remotely.
61. As a player, I want dropped supplies to remain in the world for the Run, so that I can create and revisit field caches.
62. As a player, I want ammo drops to consider every Ammo class in my arsenal, so that carrying breadth has a supply consequence.
63. As a player, I want Beer demand to reflect health and nearby Mounted Gunfish needs, so that supply drops respond to the deficits I can actually address.
64. As a player, I want one Beer to heal me, repair a damaged Mounted Gunfish, or fuel a fully repaired one, so that sustain has competing tactical uses.
65. As a player, I want to place my active Gunfish as a Mounted Gunfish with an interruptible hold, so that I can trade a carried option for positional defense.
66. As a player, I want mounting to permanently remove that Gunfish from my arsenal for the Run, so that automated defense is a meaningful sacrifice.
67. As a player, I want a Mounted Gunfish to preserve its rarity, upgrades, evolution, magazine, and species behavior, so that my investment remains legible after placement.
68. As a player, I want Mounted Gunfish to fight autonomously while I fish, so that catches can be converted into space and time for additional Casts.
69. As a player, I want monsters to prioritize perceived Mounted Gunfish, including unfueled ones, so that defenders can function as both damage sources and sacrificial decoys.
70. As a player, I want a Mounted Gunfish to spend its magazine before using Beer fuel and consume fuel only while firing, so that its remaining value is predictable.
71. As a player, I want servicing to be interruptible and to repair before fueling, so that maintaining a defender is an exposed commitment.
72. As a player, I want destroyed or Run-ended Mounted Gunfish to return nothing, so that deployment cannot be treated as temporary storage.
73. As a player, I want one shared Upgrade resource from every monster role, so that combat progress can support either fishing or Gunfish builds.
74. As a player, I want to improve my rod's Interest gain and catching-target width through two purchasable tiers, so that I can specialize in future catches.
75. As a player, I want to assign up to three numerical ranks per Gunfish among Damage, Fire rate, and Magazine, so that individual catches support focused or mixed builds.
76. As a player, I want upgrade prices to rise by rarity and existing rank, so that concentrating power competes with broad early upgrades.
77. As a player, I want purchases to be immediate and irreversible, so that spending under pressure has lasting Run consequences.
78. As a player, I want to merge same-species Gunfish into one of two evolution branches, so that duplicate catches can change behavior rather than only add inventory breadth.
79. As a player, I want an evolution merge to preview and atomically consume every donor, so that I cannot accidentally sacrifice valuable Gunfish or bank partial progress.
80. As a player, I want Stage II to deepen my irreversible Stage I branch, so that specialization remains coherent.
81. As a player, I want evolved abilities to work automatically when mounted, so that evolution never creates an unusable defender.
82. As a player, I want visible Gunfish power to reflect the two strongest distinct Gunfish I have had during the Run, so that the director's response is understandable.
83. As a player, I want Gunfish power to be a high-water mark, so that sacrificing or mounting strong Gunfish cannot lower future pressure.
84. As a player, I want time to unlock monster roles and Gunfish power to affect only future legal refills, so that stronger gear never transforms existing monsters or introduces roles early.
85. As a player, I want four clearly signaled pressure phases, so that the Run has an escalating arc I can anticipate.
86. As a player, I want a brief replenishment lull at each phase boundary while the clock and active danger continue, so that I receive opportunities rather than guaranteed safety.
87. As a player, I want new monsters to enter unseen, beyond the Threat radius, and as roamers, so that refills do not feel like arbitrary attacks.
88. As a player, I want Alerted monsters to remain in the world until I escape or defeat them, so that the director cannot erase an active pursuit.
89. As a player, I want the final phase to intensify the established roster rather than introduce a boss or new rule, so that the first playable tests mastery of its core loop.
90. As a player, I want three Gunfish species with distinct firing behavior and evolution choices, so that catches create meaningfully different builds.
91. As a player, I want four monsters with distinct behaviors and pressure costs, so that encounters vary without exceeding a readable content set.
92. As a player, I want one connected persistent world with three recognizable regions, so that travel, fishing preference, combat terrain, and recovery routes intersect.
93. As a player, I want each region to favor one Gunfish species without making it exclusive, so that travel influences rather than dictates my arsenal.
94. As a player, I want sheltered locations to favor common catches and exposed hotspots to improve rare-catch odds, so that geography presents a visible risk-reward choice.
95. As a player, I want landed fish to stay depleted for the current Run and reseed next Run, so that movement between fishing locations matters.
96. As a player, I want a visible Recovery cache marker from the moment I spawn, so that recovery can influence my route immediately.
97. As a player, I want the marker to show bearing, distance, and exact cached equipment, so that I can judge whether recovery is worth the time and danger.
98. As a player, I want the route to remain subject to normal geography and monsters without dedicated cache guards, so that recovery risk emerges from the world rather than a scripted tax.
99. As a player, I want the Recovery cache to be physically reachable but not always strategically worthwhile, so that pursuing it is a meaningful wager rather than an obligation.
100. As a player, I want to reclaim a cache through an interruptible two-second hold, so that collection is clear but exposed.
101. As a player, I want recovery to atomically return the same Gunfish with its progression and the higher Rod tier, so that persistent equipment retains identity without stacking duplicate rod value.
102. As a player, I want a recovered Gunfish to enter my arsenal with a full magazine but no reserve ammunition, so that recovery is valuable without restoring all prior resources.
103. As a player, I want recovery before my first catch to preserve the normal first-catch lesson when primary remains empty, so that cache pursuit does not break onboarding.
104. As a player, I want only the active Gunfish and Rod at death to become the newest Recovery cache, so that my final equipment choice determines what can persist.
105. As a player, I want a new failure to visibly replace any older unrecovered cache, so that the newest-only persistence rule is unambiguous.
106. As a player, I want closing and reopening the application to resume my current Run rather than reroll my spawn, so that I cannot avoid a poor recovery route for free.
107. As a player, I want lethal damage before 00:00 to end the Run immediately, so that failure has a decisive boundary.
108. As a player, I want reaching 00:00 alive to lock victory immediately, so that no cleanup encounter or extraction weakens the survival goal.
109. As a player, I want victory to take precedence over lethal damage on the same update, so that the timer boundary is deterministic and fair.
110. As a player, I want an active Cast at 00:00 to end unlanded, so that survival wins the Run without granting an unfinished catch.
111. As a player, I want a short failure tableau to establish the new Recovery cache before results, so that persistence is visible at the moment of loss.
112. As a player, I want victory and failure results to end the Run, so that I can review the outcome before starting another character after failure or finishing the first playable after victory.

## Implementation Decisions

### Run Contract

- The first playable is solo-only. Exactly one character participates in a Run; there is no revive, in-Run respawn, co-op, or multiplayer compatibility requirement.
- A Run lasts exactly 15 minutes. The visible countdown and monster simulation begin immediately when the character spawns.
- After failure results, the player explicitly starts the next Run; only then are a new character and freshly seeded Run-scoped monster population created. Victory results end the first playable and require no continuation behavior.
- Lethal damage before 00:00 immediately locks failure. There is no post-death action window.
- Reaching 00:00 while alive immediately locks victory, halts damage and monster behavior, and opens results after a brief audiovisual release. Victory wins any same-update race with lethal damage.
- A Cast active at 00:00 ends unlanded and contributes no Gunfish to the arsenal.

### Fishing and Threat

- Fish are visible in the world. Appearance communicates Gunfish species and Gunfish rarity before a Cast.
- A Cast begins when the reusable Lure is thrown and ends on landing, cancellation, or failure. Initial placement is aimed; the player reels toward the character and applies bounded directional tugs rather than freely steering the Lure.
- Any nearby interested fish may bite. Landing too close or moving too strongly scares that fish, relocates it, and makes it ignore the Lure for a short cooldown without a discrete Threat spike.
- Gentle movement and correct placement create visible, diegetic Interest through fish response, ripples, animation, and audio. Sustained correct play increases weighted bite odds to a practical guarantee. No numerical Interest meter is shown.
- A bite starts the Catching challenge. Gunfish rarity controls timing-target width and required successful hits. Successful hits reset the miss sequence and add no discrete Threat. Two consecutive misses fail the attempt, create a rarity-scaled Threat spike, and apply a long cooldown to that fish. Progress and failure risk use diegetic cues without hit counters or progress bars.
- Landing creates a rarity-scaled Threat spike. Catching performance never changes the visible fish's species or rarity.
- Threat rises continuously while the Lure is deployed and receives small pulses from teasing input. It is visible, never falls during a Run, and resets at the next Run.
- Threat is a detection radius, not a spawn director. While the rod is out, monsters inside the radius can detect and pursue without normal distance or line-of-sight requirements. Monsters already Alerted remain in pursuit after the rod is stowed.
- A landing or two-miss failure applies its spike, performs one final detection sweep at the enlarged radius, and ends the Cast. The interface does not forecast pending spike size.
- Emergency cancel is available throughout the Cast. Canceling, drawing a Gunfish, or taking damage ends the Cast immediately and stows the rod. Cancellation adds no discrete spike, applies the normal short fish cooldown, and preserves all accumulated Threat.
- Landing ends the Cast and enters Combat mode. The first catch fills primary, draws, and automatically fires one example shot when primary is empty. If Recovery already populated primary, it follows the later-catch handoff. Later catches enter the Gunfish arsenal with one full magazine and redraw the previously active Gunfish.

### Camera and Mode Transition

- Fishing mode uses an elevated oblique 3D camera initially tuned to approximately 55 degrees downward. The reference is the approved Tactical dip direction, not another game's terrain or art style.
- Drawing preserves the player's chosen cast or facing bearing. The Cast ends on the draw-input frame, and the fishing line lingers visually for 100 ms.
- Tactical dip holds the angled view for 100 ms and then moves to the third-person shoulder camera over 580 ms, producing a 680 ms handoff.
- Aim remains available during the handoff. Firing unlocks at 460 ms; at most one early fire input is buffered and released at unlock.
- The persistent world runs at 35% speed during the draw and returns to normal at 680 ms. Ordinary fishing, catching, arsenal use, and other gameplay do not receive this slowdown.
- A hollow-to-solid reticle and ready click communicate the fire lock. An early buffered input pulses the reticle once. Exact timings are not explained through text.
- Attack lanes remain in world space and aligned with the incoming attack through both camera modes and the transition. Shape, fill motion, texture, spatial windup audio, and release audio communicate direction and timing without depending on color alone.
- A restrained screen-edge continuation may represent the off-camera portion of an attack lane but never replaces the world-space telegraph.
- Returning to Fishing mode gates rod and combat input until the reverse transition settles.
- Prototype keyboard, pointer, and mobile keypad controls are evaluation controls and do not define production bindings.

### Character Combat and Arsenal

- Combat mode is a mobile third-person shooter. The character may move, strafe, fire, jump normally, and sprint without a stamina limit.
- Sprint lowers the active Gunfish and blocks aiming and firing. There is no universal dodge.
- Hip fire uses loose accuracy. Precision aim tightens accuracy, narrows the camera, and slows movement. Aim is manual and does not hard-lock a target.
- Monsters cause no contact damage. They softly body-block while character movement slides around their edges. Monster attacks do not impose movement stun; damage interrupts Casts, mounting, drinking, and Mounted Gunfish servicing.
- The Gunfish arsenal has no capacity limit. Any two carried Gunfish may be assigned to primary and secondary Combat slots and switched in real time.
- Slot assignment and progression share one non-pausing arsenal interface. While open, the character may only walk slowly and cannot aim, fire, sprint, reload, fish, mount, drink, service, or interact.
- The Rod attack is always available in Combat mode. It is a repeatable, committed, close-range swing with a forward step, useful damage, strong stagger, and punishable recovery. Its strength does not change with Rod tier.

### Ammunition and Supplies

- Pistol rounds, rifle rounds, and shells are separate Ammo classes. Ammo class is independent of species identity even though each first-playable species uses a different class.
- Every Gunfish retains individual magazine state when inactive. Only the active Gunfish may reload from its class reserve, either manually or automatically when its magazine is empty.
- Reloading permits normal movement and blocks aiming, firing, and sprinting. Firing or sprinting cancels and restarts the reload. Switching slots preserves magazine state but inactive Gunfish never complete a reload in the background.
- The character has eight fixed Supply slots. Each Beer or ammo bundle occupies one slot; Gunfish and Upgrade resource occupy none.
- Each ammo bundle contains exactly two unupgraded base magazines of its class's first-playable species: 16 pistol rounds, 48 rifle rounds, or 10 shells. Bundle yield is independent of rarity and Magazine ranks.
- One Beer heals 35% of maximum character health, repairs 40% of maximum Mounted Gunfish durability, or provides 10 seconds of active firing fuel to a fully repaired Mounted Gunfish.
- Beer use consumes the whole item. Healing and repair discard overflow. Repair never spills into fuel.
- A Mounted Gunfish stores at most 20 seconds of fuel. Excess fuel is discarded.

### Mounted Gunfish

- Holding mount briefly places the active Gunfish on valid nearby ground. Movement or damage cancels placement before commitment.
- Commitment permanently removes the Gunfish from its Combat slot and arsenal. The other assigned slot draws automatically; if none exists, the character becomes unarmed apart from the Rod attack.
- Mounted Gunfish are stationary, autonomous, and unlimited in count. They last until destroyed or the Run ends and cannot be retrieved.
- A Mounted Gunfish preserves species behavior, rarity, numerical upgrades, evolution, durability scaling, and its current magazine.
- It targets the nearest monster in range and line of sight and fires with base hip-fire accuracy. Allied attacks are harmless but continue to collide with world geometry.
- It spends the loaded magazine first, then fires with unlimited ammunition while Beer fuel remains. Fuel is consumed only during active firing.
- Servicing uses a brief close-range hold interrupted by movement or damage before consumption. Each Beer repairs up to 40% of maximum durability; only a later service action on a fully repaired defender may add fuel.
- A monster prioritizes the nearest perceived Mounted Gunfish after seeing it, hearing it fire, or being hit by it. Commitment lasts until that target is destroyed, unreachable, or lost.
- An unfueled Mounted Gunfish remains a valid perceived target and decoy. Destruction returns no Gunfish, ammunition, Beer, or Upgrade resource.

### Monster Combat and Rewards

- Every damaging monster action has a readable windup and can be avoided through movement, jumping, sprinting, spacing, or cover. There are no hitscan monster attacks, passive touch damage, hard counters, hidden damage multipliers, or immunities.
- Pursuers apply fast close-range pressure. Ranged monsters fire avoidable projectiles and receive one bounded, telegraphed reposition when pressured at Rod-attack range. Siege monsters are slow, durable, and use high-impact attacks that naturally threaten Mounted Gunfish.
- Damage accumulated over a short window may interrupt and stagger Pursuer and Ranged-monster attacks. Escalating animation, recoil, sound, and hit effects communicate stagger buildup without a bar.
- Siege frontal armor reduces but never negates damage. Its exposed rear rewards circling and Mounted Gunfish aggro.
- Initial lethality targets a short burst for Pursuers, roughly one committed magazine for the Ranged monster, and several magazines or advantageous positioning for the Siege monster. A few telegraphed hits seriously endanger a 100-health character.
- Gunfire from held and Mounted Gunfish creates a fixed local sound alert and never adds Threat.
- Alerted monsters remain in pursuit after the rod is stowed. Sufficient distance plus broken line of sight for a short readable period returns them to roaming. There are no encounter locks, invulnerable safe zones, or mandatory kill walls.
- Every kill produces a physical, role-scaled Upgrade-resource drop: Pursuers drop 1, the Ranged monster drops 2, and the Siege monster drops 4.
- Every kill independently rolls a supply drop with chance `min(80%, role base + 5 percentage points per empty Supply slot)`. Role bases are 15% for Pursuers, 25% for the Ranged monster, and 40% for the Siege monster.
- Eligible supply-drop types are Beer plus every Ammo class represented anywhere in the current Gunfish arsenal. Each starts with weight 1.
- An Ammo class gains one weight for each bundle-equivalent missing below a target reserve of two bundles.
- Beer gains one weight for each whole Beer-equivalent of unmet character healing, nearby Mounted Gunfish repair, and nearby Mounted Gunfish fuel demand after carried Beer is subtracted. Fuel demand respects the 20-second cap; distant abandoned defenders do not affect local demand.
- Direct, Rod, and Mounted Gunfish kills use identical drop rules. Drops remain where the monster died and require manual collection.
- Upgrade resource has no Supply cost. Beer and ammo require a free compatible Supply slot; the player must consume or drop a supply before collecting another when full.
- Uncollected and manually dropped supplies remain until the Run ends.

### Progression and Economy

- Upgrade resource is Run-scoped, manually collected, and lost unspent when the Run ends. It has no permanent or post-victory use.
- It is spent on the rod or any carried Gunfish through the live arsenal interface. A confirmed purchase is immediate, irreversible, and has no respec, sale, or refund. Mounted Gunfish cannot receive later purchases.
- Each Gunfish accepts three total numerical upgrade ranks, allocated freely among Damage, Fire rate, and Magazine.
- Each Damage rank adds 15% of unupgraded species-and-rarity base damage. Each Fire-rate rank adds 20% of base firing rate. Bonuses are additive.
- Each Magazine rank adds 40% of base capacity, rounded up with at least one added round per rank. Buying capacity grants no free rounds and never changes bundle yield.
- Tier I numerical ranks cost 3, 6, and 9 Upgrade resource, totaling 18. Tier II ranks cost 5, 10, and 15, totaling 30. Tier III ranks cost 8, 16, and 24, totaling 48. Price depends on target rarity and next total rank, not the chosen stat.
- The rod has three linear tiers including its starting tier. Tier II costs 8 Upgrade resource and Tier III costs 20.
- Each purchased Rod tier adds 25% of starting Interest gain and 25% of starting catching-target width. Tier III therefore provides +50% to both, and the complete Rod ladder costs 28 Upgrade resource.
- Rod tiers do not affect Gunfish rarity, Threat, outcome spikes, required successful hits in the Catching challenge, Lure movement, miss rules, or Rod-attack strength.
- Initial tuning targets 40 to 55 manually collected Upgrade resource during a successful, combat-active Run. This supports a full rod ladder or one deeply upgraded low-rarity Gunfish plus smaller choices, not every progression line.

### Gunfish Evolution

- A carried Gunfish can evolve through two stages in the live arsenal interface when all required same-species donors are present.
- Confirmation consumes all selected donors atomically. There is no partial progress, Upgrade-resource cost, refund, or recovery of donor magazines, ranks, rarity value, or prior evolution value.
- The preview makes unusually valuable donors explicit. Mounted Gunfish cannot be donors.
- Stage I consumes 1, 2, or 3 donors for a Tier I, II, or III target and selects one irreversible species-specific branch.
- Stage II deterministically deepens the chosen branch and consumes another 2, 4, or 6 donors by target rarity. Total donor costs are 3, 6, or 9.
- Evolution does not reset numerical ranks or prices. An evolution may alter primary fire or add at most one cooldown-based player action and introduces no consumable or ability meter. Each player-triggered evolution behavior has a deterministic Mounted trigger; passive and primary-fire changes apply directly.
- Initial fish placement and rarity distribution make Stage I on a Tier I target common enough to observe, Stage I on Tier II or III a deliberate pursuit, Stage II on Tier I an uncommon specialization, and Stage II on higher rarities an exceptional high-roll outcome.

| Species | Branch | Stage I | Stage II | Mounted behavior |
| --- | --- | --- | --- | --- |
| Pistol Gunfish | Deadeye | Holding precision aim for 0.6 seconds charges a shot with twice normal damage and high stagger. | Charge time becomes 0.4 seconds; damage becomes 2.5 times normal and penetrates one monster. | Holds aim on the same target, charges, then fires. |
| Pistol Gunfish | Fanfire | Primary fire becomes a controlled two-round burst. | The burst becomes a tighter three-round burst. | Uses the same burst behavior. |
| Auto Rifle Gunfish | Spool | Continuous fire ramps to 50% additional fire rate over 0.75 seconds and resets after 0.4 seconds without firing. | Full speed arrives in 0.4 seconds; full-spool rounds penetrate one target at 60% remaining damage. | Applies directly while firing. |
| Auto Rifle Gunfish | Hammer | Every fifth round is a visible tracer with three times normal stagger. | Every fourth round instead creates a small stagger-only pulse around the hit. | Applies directly while firing. |
| Shotgun Gunfish | Sweeper | Pellets form a horizontal fan and pass through one monster at 50% remaining damage. | Pellets pass through two monsters and gain 25% stagger. | Applies directly. |
| Shotgun Gunfish | Slug | The pellet spread becomes one accurate projectile carrying the full pellet damage total. | After eight metres, the slug gains 30% damage and penetrates one monster. | Applies directly. |

### Gunfish Power

- Each individual Gunfish has a visible additive power score. Rarity contributes 1, 3, or 5 points for Tier I, II, or III; each evolution stage contributes 2; each numerical rank contributes 1. Individual values range from 1 to 12.
- Run Gunfish power is the visible high-water sum of the two strongest distinct Gunfish identities available during the Run. An absent second Gunfish contributes zero; one identity cannot occupy both positions through earlier states.
- Landing, recovery, evolution, and numerical upgrades can raise the high-water value immediately. Consumption, mounting, or loss cannot lower it.
- Bands are Low at 0-7, Middle at 8-15, and High at 16-24. The interface shows both value and band.
- Rod tier, Supply inventory, unspent Upgrade resource, arsenal depth beyond the strongest two, and Mounted durability or fuel do not contribute.

### Run Pacing and Director

- Time alone unlocks monster roles. Gunfish power selects stronger legal population mixes for future refills without unlocking a role early, transforming existing monsters, or applying hidden statistical buffs.
- The director targets living monster count in a moving local region. It does not cap how many monsters can become Alerted or pursue.
- When population first falls below target, one refill timer starts. Additional vacancies do not reset it. At expiry, every current vacancy is filled.
- New monsters appear off-camera, out of line of sight, outside current Threat, and beyond a minimum approach distance. If no valid point exists, the refill waits. New monsters enter as roamers.
- Distant off-screen monsters may be recycled only after they are unalerted. Active pursuits are never despawned.
- The initial population and opening-pocket routes provide the opening margin without suppressing simulation or granting invulnerability.

| Phase | Time | Time-unlocked roles | Local population target | Refill delay |
| --- | --- | --- | ---: | --- |
| 1 | 0:00-2:00 | Pursuer | 2 | 30 to 25 seconds |
| 2 | 2:00-6:00 | Pursuer, Ranged monster | 4 | 25 to 20 seconds |
| 3 | 6:00-11:00 | Pursuer, Ranged monster, Siege monster | 6 | 20 to 15 seconds |
| 4 | 11:00-15:00 | Full roster at peak pressure | 8 | 15 to 10 seconds |

- Pressure rises smoothly inside a phase by shortening refill delay.
- Boundaries at 2:00, 6:00, and 11:00 have strong audiovisual cues and begin a 20-second replenishment lull. The clock, Casts, and active monsters continue normally.
- When a lull ends, all vacancies are filled against the new target. The first Phase 2 refill includes a Ranged monster and the first Phase 3 refill includes a Siege monster.
- Phase 4 adds no boss, elite, or new rule. It uses the highest target, fastest cadence, and costliest established mixes.
- Middle Gunfish power keeps the normal population target. High power adds one monster in every phase.

### Content Envelope

- The first playable contains exactly three Gunfish species: Pistol Gunfish, Auto Rifle Gunfish, and Shotgun Gunfish.
- Gunfish rarity multiplies base damage and Mounted durability by 1.0, 1.2, or 1.4 for Tiers I, II, and III. It does not alter magazine size, reload time, or ammo-bundle yield.
- The Shotgun Gunfish reloads one shell at a time and may be interrupted between shells.

| Species | Base behavior | Damage | Rate | Magazine | Reload | Ammo-bundle yield |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Pistol Gunfish | Accurate semi-automatic generalist | 24 | 4/second | 8 | 1.0 seconds | 16 pistol rounds |
| Auto Rifle Gunfish | Loose hip fire and sustained automatic pressure | 12 | 10/second | 24 | 1.8 seconds | 48 rifle rounds |
| Shotgun Gunfish | Wide eight-pellet spread with strong stagger | 9/pellet | 1/second | 5 | 0.55 seconds/shell | 10 shells |

- The first playable contains exactly four monsters: Skitter and Ramjaw as Pursuers, Spitter as the Ranged monster, and Shellback as the Siege monster.

| Monster | Role | Health | Attack damage | Pressure cost | Behavior |
| --- | --- | ---: | ---: | ---: | --- |
| Skitter | Pursuer | 60 | 20 | 1 | Direct chase with a short telegraphed lunge. |
| Ramjaw | Pursuer | 100 | 35 | 2 | Commits to a long linear charge with punishable recovery. |
| Spitter | Ranged monster | 180 | 25 | 2 | Fires a visible projectile and performs one bounded reposition when pressured. |
| Shellback | Siege monster | 600 | 40 | 4 | Uses slow high-impact attacks, has 35% frontal damage reduction, and exposes its rear. |

- Weighted mixes use `S` for Skitter, `J` for Ramjaw, `R` for Spitter, and `B` for Shellback. Bracketed values are total pressure cost.

| Phase | Low Gunfish power | Middle Gunfish power | High Gunfish power |
| --- | --- | --- | --- |
| 1 | 100% `2S` [2] | 100% `S+J` [3] | 100% `S+2J` [5] |
| 2 | 70% `2S+2R` [6], 30% `S+J+2R` [7] | 30% `2S+2R` [6], 70% `S+J+2R` [7] | 60% `S+J+3R` [9], 40% `2J+3R` [10] |
| 3 | 60% `2S+3R+B` [12], 40% `S+J+3R+B` [13] | 60% `S+J+2R+2B` [15], 40% `2J+2R+2B` [16] | 60% `S+2J+2R+2B` [17], 40% `3J+2R+2B` [18] |
| 4 | 60% `S+2J+3R+2B` [19], 40% `3J+3R+2B` [20] | 60% `S+2J+2R+3B` [21], 40% `3J+2R+3B` [22] | 60% `3J+3R+3B` [24], 40% `S+2J+3R+3B` [23] |

- The selected phase and Gunfish power band choose the table cell. Random weighting varies only between that cell's legal compositions. Phase-boundary role guarantees take precedence.
- Mixed-role populations retain approximately one-third Pursuers. Phase 1 necessarily contains only Pursuers.
- The persistent world is one connected map with Reedbeds, Flood Channel, and Sunken Quarry linked as an outer loop around a riskier central crossing.
- Reedbeds uses dense cover and short sightlines and gives Pistol Gunfish 60% species weight. Flood Channel uses open banks and long firing lanes and gives Auto Rifle Gunfish 60%. Sunken Quarry uses tight approaches, hard cover, and elevation changes and gives Shotgun Gunfish 60%.
- Each non-signature species receives 20% weight in each region. No species is region-exclusive.
- Each region contains one sheltered fishing location and one exposed hotspot, for six locations total. Every location starts a Run with three visible fish; landed fish do not replenish until the next Run.
- Sheltered rarity weights are 80% Tier I, 18% Tier II, and 2% Tier III. Exposed-hotspot weights are 55% Tier I, 35% Tier II, and 10% Tier III.
- Six authored opening pockets sit near the six fishing locations. Each selected pocket offers two isolated Tier I fish of different species.
- Every opening pocket supports a deliberately slow first-catch target of 45 seconds and places the earliest possible damaging contact from the fastest legal initial Pursuer at least 60 seconds after spawn, including attack windup. This provides at least 15 seconds of reserve after a deliberately slow successful catch; repeated failure, stalling, or leaving receives no further protection.
- Region affects geography and fish odds only. Monster mixes remain functions of phase and Gunfish power; Threat remains detection-only.

### Recovery

- On failure, the character's current Rod and the active Gunfish at lethal lock form the new Recovery cache. If no Gunfish is active, the cache contains only the Rod.
- The cache is placed at the death location and may snap only to the nearest stable reachable ground. Creation atomically destroys every older unreclaimed cache regardless of value.
- The failure tableau and results show the new contents and disclose the loss of an older cache.
- An unrecovered cache persists across Runs until it is reclaimed or replaced. Monsters cannot damage or remove it.
- The next Run randomly chooses among authored opening pockets using shortest traversable sprint route to the cache. Initial pairings target 20% favorable at 45-75 seconds, 60% contested at 75-150 seconds, and 20% poor at 150-240 seconds or comparable route hazard.
- Pairings under 45 seconds and over four minutes are excluded. Cache value does not influence spawn selection.
- The cache is always physically reachable, but route time and danger may make pursuit strategically unattractive. The outer loop and central crossing provide covered detours and exposed shortcuts.
- A compass-edge marker is visible from spawn in Fishing and Combat modes. It shows bearing, straight-line distance, cached Gunfish species, rarity, evolution, numerical ranks, and cached Rod tier. A world beacon identifies the cache at short visual range.
- The marker does not reveal a safe route, danger score, or monster count. Recovery creates no dedicated guards, encounters, Threat, ambushes, or value-scaled difficulty.
- The player may pursue recovery before the first catch using only the Rod attack. Recovery never pauses or extends the Run clock and travel never adds Threat.
- Collection is a two-second close-range hold. Movement or damage cancels without partial progress. Completion consumes the cache and transfers all contents atomically without a loot menu.
- The Gunfish remains the same identity with species, rarity, branch, stages, and ranks intact. It returns with one full magazine and no reserve ammunition, enters the arsenal without displacing or firing the active Gunfish, and immediately contributes to Gunfish power.
- Recovery is not a catch. If primary is empty when the guaranteed first catch later lands, that catch still fills primary and performs the teaching shot. Otherwise it uses the later-catch handoff.
- The character keeps the higher of current and recovered Rod tier. Rod tiers do not add; the lower Rod grants no refund.
- Recovery grants no Beer, ammo, Upgrade resource, healing, or other Gunfish from the failed Run.
- A recovered Gunfish may subsequently be assigned, evolved, mounted, consumed as a donor, or preserved by being active at a later death.
- Dying during collection replaces the still-unrecovered cache under the newest-only rule.
- A voluntary Run abandonment, if supported, has the same cache-replacement consequence as death. Closing and reopening the application resumes the current Run rather than creating a new spawn.
- Persistence of an unrecovered cache after a successful Run is not defined because victory ends the first playable.

### Onboarding

- Onboarding is soft-sequenced and contextual. It never pauses the Run clock or simulation, gates legal actions, grants invulnerability, or introduces tutorial-only controls.
- Only one prompt appears at a time using current bound-action glyphs. Completing its action dismisses it permanently. There is no voiceover or modal tutorial.
- Production HUD includes health, Run clock, Threat, ammunition, Combat slots, Gunfish power, and Recovery information when applicable. It excludes diagnostic state names, transition timers, bearing lines, and simulation readouts.
- Spawn prompts `Aim and Cast beside a Gunfish`. Water-conforming projected placement, fish silhouettes, rarity treatment, surface movement, and a rod-ready sound communicate valid targets.
- Lure deployment prompts `Reel close. Use gentle tugs to attract it`. Fish orientation, closing movement, ripples, rising-pitch sounds, recoil, and splash communicate correct and excessive input.
- The first bite prompts `Press [Catch] when the line snaps`. The prompt disappears after one successful timing hit; later hits use the same production cues.
- When primary is empty, first landing animates the catch into primary, labels `Primary: <species>` once, plays a slot-lock sound, and begins Tactical dip without another prompt. If Recovery populated primary first, the catch uses the later-catch arsenal handoff.
- First draw prompts `Hold [Aim] for precision`; the automatic shot demonstrates firing availability, recoil, effects, impact, and ammunition use.
- During the first dangerous Cast, one urgent prompt names a populated Combat slot: `[Primary]: cancel the Cast and draw now`, or `[Secondary]: cancel the Cast and draw now` when only secondary is populated. If neither slot is populated, it instead says `[Cancel]: cancel the Cast now` and uses the always-available emergency-cancel action. It appears when Threat reveals a monster, an Alerted monster approaches, or an attack windup starts while the rod is out.
- The Threat boundary pulses toward the detecting monster, the monster gives a spatialized alert sound, and rod-stow audio confirms cancellation. The urgent text appears only once; permanent gameplay cues remain.
- A later catch animates into the arsenal, labels `Stored in arsenal: <species>` once, preserves both slot portraits, redraws the active Gunfish, and uses a softer storage sound.
- When secondary is empty, onboarding prompts `[Arsenal]: assign the stored Gunfish to Secondary`, then `[Secondary]: switch Gunfish` after assignment. Neither action is forced and the world never pauses.
- On first Rod-attack relevance, onboarding prompts `[Rod Attack]: always available`. Relevance is the first monster entering Rod range or the first empty active magazine. The Rod's ready pose, forward step, impact sound, and strong stagger teach its function; one use dismisses the prompt.

## Testing Decisions

- Use one primary black-box Run seam. Tests drive player-visible actions against a deterministic world, clock, random source, and authored scenario, then assert observable gameplay outputs and persisted Recovery cache state.
- A good test describes behavior in canonical domain terms and remains insensitive to internal module boundaries, data structures, frame-loop organization, rendering implementation, or eventual engine choice.
- The seam must expose controllable time, random selection, player input, spawn geometry, line of sight, and damage outcomes so exact boundary rules can be tested without changing production behavior.
- Assert the first-catch sequence end to end: immediate clock start, authentic Threat, safe travel-time margin, primary assignment and automatic example shot when primary is empty, the Recovery-first exception, and Tactical dip.
- Assert Cast behavior end to end: Interest feedback, rarity-dependent Catching challenge, no hit counters or progress bars, successful-hit miss reset without a discrete Threat spike, landing and loss spikes, final detection sweep, emergency cancellation, and damage interruption.
- Assert Tactical dip externally: input-frame cancellation, 100 ms line linger, 460 ms fire unlock and one-shot buffer, 680 ms transition, 35% world speed, bearing preservation, and persistent attack lanes.
- Assert Combat behavior through movement and action results: sprint tradeoff, aim accuracy tradeoff, manual and automatic reloads, reload interruption, slot switching, Rod attack availability, damage interruption of drinking, monster telegraphs, role-specific stagger, alerts, and disengagement.
- Assert the arsenal as exposed live-world behavior: unlimited storage, two assignments, later-catch handoff, retained magazines, constrained movement and actions while open, and irreversible purchases.
- Assert Mounted Gunfish behavior through placement, interruption, permanent commitment, target selection, magazine and fuel consumption, repair-before-fuel servicing, destruction, and end-of-Run removal.
- Assert economy behavior through physical drops and collection: role rewards, supply probability boundaries, need weighting, eight-slot capacity, field persistence, Upgrade-resource spending, numerical effects, and Rod-tier effects and non-effects.
- Assert evolution behavior through player-visible previews and outcomes: rarity-scaled donor counts, atomic consumption, irreversible branches, deterministic Stage II, preserved upgrades, at most one cooldown-based player action, no consumable or ability meter, and Mounted behavior.
- Assert Gunfish power as a visible high-water output: score components, two-distinct-identity rule, bands, increases from landing/recovery/evolution/upgrades, no decreases from loss or mounting, and effects limited to future refills.
- Assert the director with deterministic scenarios spanning all four phases, phase lulls, target counts, refill timers, role unlocks, off-camera and line-of-sight constraints, boundary guarantees, weighted mix cells, and Alerted-monster protection from recycling.
- Assert terminal races at the Run seam: death before 00:00, victory at 00:00, victory over same-update lethal damage, active Cast cancellation at victory, world halt, explicit next-Run start after failure, and first-playable completion after victory.
- Assert Recovery across two or more Runs: active-equipment capture, empty-active behavior, stable-ground placement, newest-only replacement, marker disclosure, route-band selection independent of value, interrupted and atomic reclaim, exact Gunfish identity, higher-Rod selection, no extra resources, and resume rather than spawn reroll.
- Use authored contract checks for content tables, fishing-location counts and weights, opening-pocket choices and travel margins, Gunfish baselines, monster baselines, legal mixes, and phase values. These checks should read player-facing configuration through the same Run seam rather than duplicate constants in unit tests.
- The existing disposable Three.js Tactical dip prototype is prior art for manual interaction checks covering camera comparison, immediate cancellation, input gates, shot buffering, world slowdown, attack lanes, reset, and narrow-view rendering. Its gameplay shortcuts and diagnostic HUD are not production acceptance behavior.
- No production test framework or module-specific prior art exists yet. Do not introduce separate fishing, combat, progression, director, or recovery test seams unless implementation proves that the agreed Run seam cannot deterministically exercise required external behavior.
- Playtest evidence capture, telemetry, subjective fun thresholds, and tuning pass/fail ranges are separate from implementation acceptance tests and remain out of scope.

## Out of Scope

- Permanent metaprogression, post-victory progression, and the full game's endgame.
- Multiplayer, co-op, revive, respawn, or future multiplayer-compatibility constraints.
- Bosses, elites, extraction, additional final-phase rules, and post-timer cleanup combat.
- Additional Gunfish species, Ammo classes, rods, numerical upgrade categories, monsters, variants, maps, regions, fishing locations, or opening pockets beyond the specified content envelope.
- Narrative, monetization, online services, accounts, leaderboards, and production-scale content.
- Final art, animation, audio, accessibility implementation, input bindings, production polish, and optimization beyond behavior explicitly required for readability.
- Playtest analytics, event schemas, evidence criteria, tuning thresholds, and decisions about whether observed results require tuning or design changes.
- Production implementation choices not required by the player-visible contracts, including engine, framework, module layout, persistence technology, rendering architecture, and deployment.
- Persistence of an unrecovered Recovery cache after a successful Run.
- Voluntary Run abandonment as a required feature; only its consequence is specified if it exists.

## Further Notes

- The first playable is intended to test the complete **risk one more cast** loop, not to validate fishing, combat, progression, or recovery in isolation.
- The resolved decision records are authoritative when prototype shortcuts differ from gameplay rules. In particular, Threat never decreases, kills do not reduce it, drawing or damage cancels a Cast immediately, and later catches enter the Gunfish arsenal.
- Numerical values are initial implementation and tuning anchors. Changing them after playtesting is a tuning activity unless evidence challenges a stated behavioral contract.
- Canonical terms such as Run, Threat, Cast, Gunfish arsenal, Combat slots, Active Gunfish, Mounted Gunfish, Recovery cache, and Gunfish power should remain consistent in implementation, UI copy, tests, and future tickets.
