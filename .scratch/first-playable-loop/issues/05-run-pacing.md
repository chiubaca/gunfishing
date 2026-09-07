# Shape the survival Run

Type: `grilling`
Status: `resolved`
Blocked by: 03, 04

## Question

What duration, escalation phases, respite windows, spawn pressure, and success/failure beats give a Run a readable arc without undermining the player's choice to risk one more cast?

## Answer

### Clock and escalation phases

- A Run lasts 15 minutes. The visible countdown begins immediately when the character spawns; the guaranteed first catch does not delay it.
- The Run has four phases. Pressure rises smoothly inside each phase through a shortening refill delay, while phase boundaries change the local population target and unlock roles.

| Phase | Time | Time-unlocked roles | Local population target | Refill delay |
| --- | --- | --- | ---: | --- |
| 1 | 0:00-2:00 | Pursuer | 2 | 30 to 25 seconds |
| 2 | 2:00-6:00 | Pursuer, Ranged monster | 4 | 25 to 20 seconds |
| 3 | 6:00-11:00 | Pursuer, Ranged monster, Siege monster | 6 | 20 to 15 seconds |
| 4 | 11:00-15:00 | Full roster at peak pressure | 8 | 15 to 10 seconds |

- Each boundary at 2:00, 6:00, and 11:00 has a strong audiovisual cue and starts a 20-second replenishment lull. The clock, active monsters, and any Cast continue normally; the lull is an opportunity, not safety.
- When a boundary lull ends, the director immediately fills all vacancies against the new phase target. The first refill in Phase 2 guarantees at least one Ranged monster, and the first refill in Phase 3 guarantees at least one Siege monster. Later refills use the legal weighted mix.
- Phase 4 introduces no boss, elite tier, or new rule. Its identity is the highest population target, fastest refill cadence, and costliest legal mixes of the established roles.

### Ambient population pressure

- Monster population is Run-scoped and freshly seeded when the character spawns. Threat never changes spawn count, timing, strength, or role mix; it only changes which existing monsters can detect the character during a Cast.
- The director targets the number of living monsters in a moving local region around the character. It never limits how many monsters may become Alerted or pursue at once.
- When local population first falls below its target, one refill timer starts. Further vacancies do not reset it. When it expires, the director fills every current vacancy rather than adding monsters one at a time.
- Every new monster must appear off-camera, out of line of sight, and outside both the current Threat radius and a minimum approach distance. If no valid point exists, the director waits rather than weakening these constraints. New monsters enter as roamers and are not directed to attack.
- Distant, off-screen monsters may be recycled into later refills only after they are unalerted. Alerted monsters must disengage under the normal distance-and-line-of-sight rule before they become eligible; the director never despawns an active pursuit.
- There is no special opening suppression or invulnerability. The initial population seed and opening pocket instead guarantee a travel-time margin long enough for the taught first catch to complete at a deliberately slow test pace. Stalling or leaving that pocket receives no protection.

### Gunfish power response

- Gunfish power is a visible three-band high-water mark based on the two strongest Gunfish the character has had available during the Run. Rarity, evolution, and numerical upgrades contribute; extra arsenal depth beyond the strongest two does not. It never falls after switching, mounting, or losing a Gunfish.
- Time alone unlocks monster roles. Gunfish power cannot introduce a Ranged or Siege monster before its phase.
- Concrete monsters receive pressure costs rather than treating the three roles as a strength ladder. The low Gunfish power band uses the phase's baseline mix; the middle band selects the next higher-pressure legal mix at the same population target; the high band steps up again and may add at most one local monster.
- Every legal mix keeps roughly one-third of its population as Pursuers. A band change affects only future refills; existing monsters never transform or gain hidden statistics.
- Exact Gunfish power scoring and band thresholds belong to [Balance catches, evolution, rods, and monster resources](06-progression-economy.md). Concrete monster pressure costs and weighted mixes belong to [Bound the first-playable content set](08-content-envelope.md).

### Success and failure beats

- Reaching 00:00 while alive immediately locks victory, halts damage and monster behavior, gives a brief audiovisual release, and opens results. No cleanup fight, boss, or extraction extends the Run. Victory takes precedence over lethal damage on the same update.
- A Cast still active at 00:00 ends unlanded. The Run succeeds, but that Gunfish does not enter the arsenal or count as a landed catch.
- Lethal damage before 00:00 immediately locks failure. A brief death tableau visibly establishes the newest Recovery cache, then results open; there is no post-death action window.
