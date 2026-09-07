# Bound the first-playable content set

Type: `grilling`
Status: `resolved`
Blocked by: 02, 05, 06, 07

## Question

What minimum set of Gunfish species, evolutions, rods, upgrades, monsters with pressure costs, monster mixes weighted by phase and Gunfish power, fishing locations, and map regions can express the full loop and produce meaningfully different Runs within the first-playable scope?

## Answer

### Minimum envelope

- Include three Gunfish species: Pistol Gunfish, Auto Rifle Gunfish, and Shotgun Gunfish.
- Give them three separate Ammo classes: pistol rounds, rifle rounds, and shells. Ammo classes remain independent of species identity so future species may share these pools.
- Include one rod with the already-decided three Rod tiers. Damage, Fire rate, and Magazine remain the only numerical Gunfish upgrades.
- Include four monsters: two Pursuers, one Ranged monster, and one Siege monster.
- Use one connected persistent-world map containing three regions, six fishing locations, and six authored opening pockets.
- Do not add extra rods, Gunfish species, monster variants, elites, bosses, maps, or region-specific director rules to the first playable.

### Gunfish baselines

| Species | Base behavior | Damage | Rate | Magazine | Reload | Ammo-bundle yield |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Pistol Gunfish | Accurate semi-automatic generalist | 24 | 4/second | 8 | 1.0 seconds | 16 pistol rounds |
| Auto Rifle Gunfish | Loose hip fire and sustained automatic pressure | 12 | 10/second | 24 | 1.8 seconds | 48 rifle rounds |
| Shotgun Gunfish | Wide eight-pellet spread with strong stagger | 9/pellet | 1/second | 5 | 0.55 seconds/shell | 10 shells |

- The Shotgun reloads shell by shell and may be interrupted between shells.
- Gunfish rarity multiplies base damage and Mounted durability by 1.0, 1.2, or 1.4 for Tiers I, II, and III. It does not alter magazine size, reload time, or ammo-bundle yield.
- Each ammo bundle contains exactly two unupgraded base magazines. Rarity and Magazine ranks never alter its yield.
- These values are initial tuning anchors, using character maximum health of 100.

### Gunfish evolutions

| Species | Branch | Stage I | Stage II | Mounted behavior |
| --- | --- | --- | --- | --- |
| Pistol Gunfish | Deadeye | Holding precision aim for 0.6 seconds charges a shot with twice normal damage and high stagger. | Charge time falls to 0.4 seconds; the shot deals 2.5 times damage and penetrates one monster. | Holds aim on the same target, charges, then fires. |
| Pistol Gunfish | Fanfire | Primary fire becomes a controlled two-round burst. | The burst becomes a tighter three-round burst. | Uses the same burst behavior. |
| Auto Rifle Gunfish | Spool | Continuous fire ramps to 50% additional fire rate over 0.75 seconds and resets after 0.4 seconds without firing. | Full speed is reached in 0.4 seconds; full-spool rounds penetrate one target at 60% remaining damage. | Applies directly while firing. |
| Auto Rifle Gunfish | Hammer | Every fifth fired round is a visible tracer with three times normal stagger. | Every fourth round instead creates a small stagger-only pulse around the hit. | Applies directly while firing. |
| Shotgun Gunfish | Sweeper | Pellets form a horizontal fan and pass through one monster at 50% remaining damage. | Pellets pass through two monsters and gain 25% stagger. | Applies directly. |
| Shotgun Gunfish | Slug | The pellet spread becomes one accurate projectile carrying the full pellet damage total. | After traveling eight metres, the slug gains 30% damage and penetrates one monster. | Applies directly. |

Each species has exactly two Stage I choices and one deterministic Stage II deepening per branch. None adds another consumable or ability meter.

### Monster roster

| Monster | Role | Health | Attack damage | Pressure cost | Behavior |
| --- | --- | ---: | ---: | ---: | --- |
| Skitter | Pursuer | 60 | 20 | 1 | Direct chase with a short telegraphed lunge. |
| Ramjaw | Pursuer | 100 | 35 | 2 | Commits to a long linear charge with punishable recovery. |
| Spitter | Ranged monster | 180 | 25 | 2 | Fires a visible projectile and performs one bounded reposition when pressured. |
| Shellback | Siege monster | 600 | 40 | 4 | Uses slow high-impact attacks, has 35% frontal damage reduction, and exposes its rear. |

- Both Pursuers drop 1 Upgrade resource, Spitter drops 2, and Shellback drops 4. Role-based rewards remain independent of pressure cost.
- Two differently costed Pursuers let Gunfish power change legal Phase 1 pressure without unlocking another role.
- Initial health values preserve the established lethality target: a short burst kills a Pursuer, roughly one committed magazine kills Spitter, and Shellback takes several magazines or advantageous positioning.

### Weighted monster mixes

Notation: `S` is Skitter, `J` is Ramjaw, `R` is Spitter, and `B` is Shellback. Bracketed numbers are total pressure cost.

| Phase | Low Gunfish power | Middle Gunfish power | High Gunfish power |
| --- | --- | --- | --- |
| 1 | 100% `2S` [2] | 100% `S+J` [3] | 100% `S+2J` [5] |
| 2 | 70% `2S+2R` [6], 30% `S+J+2R` [7] | 30% `2S+2R` [6], 70% `S+J+2R` [7] | 60% `S+J+3R` [9], 40% `2J+3R` [10] |
| 3 | 60% `2S+3R+B` [12], 40% `S+J+3R+B` [13] | 60% `S+J+2R+2B` [15], 40% `2J+2R+2B` [16] | 60% `S+2J+2R+2B` [17], 40% `3J+2R+2B` [18] |
| 4 | 60% `S+2J+3R+2B` [19], 40% `3J+3R+2B` [20] | 60% `S+2J+2R+3B` [21], 40% `3J+2R+3B` [22] | 60% `3J+3R+3B` [24], 40% `S+2J+3R+3B` [23] |

- High Gunfish power adds one monster to each phase's normal population target; Middle keeps the normal target.
- Phase and Gunfish power select the table cell. Random weighting only varies between the listed legal compositions.
- The first refill guarantees at phase boundaries still take precedence, so the first Phase 2 refill includes Spitter and the first Phase 3 refill includes Shellback.
- Pursuers remain approximately one-third of mixed-role populations. Phase 1 necessarily contains only Pursuers.

### World and fishing content

- Reedbeds has dense cover and short sightlines, with Pistol Gunfish weighted highest.
- Flood Channel has open banks and long firing lanes, with Auto Rifle Gunfish weighted highest.
- Sunken Quarry has tight approaches, hard cover, and elevation changes, with Shotgun Gunfish weighted highest.
- The regions form an outer loop with a riskier central crossing, giving Recovery routes both exposed shortcuts and longer covered alternatives.
- Each region contains one sheltered fishing location and one exposed hotspot, for six fishing locations total.
- Each fishing location begins a Run with three visible fish. Landed fish do not replenish during that Run; every location is freshly seeded on the next Run.
- A region's signature species has 60% weight and each other species has 20%. No species is exclusive to a region.
- Sheltered locations use rarity weights of 80% Tier I, 18% Tier II, and 2% Tier III.
- Exposed hotspots use rarity weights of 55% Tier I, 35% Tier II, and 10% Tier III.
- One opening pocket sits near each fishing location. The selected pocket offers two isolated Tier I fish of different species, chosen from the three-species roster, so the player makes an informed first-build choice under the guaranteed-safe opening conditions.
- Six distributed opening pockets and the loop topology are the minimum geometry used to target the established favorable, contested, and poor Recovery route bands.
- Region changes geography and fish odds only. Monster mixes remain driven by phase and Gunfish power, while Threat remains detection-only.

The first catch, two Combat slots, species-biased travel, duplicate pursuit, evolution branches, exposed hotspots, three reserve pools, Mounted sacrifice, and Recovery routing are the intended sources of variation between Runs.
