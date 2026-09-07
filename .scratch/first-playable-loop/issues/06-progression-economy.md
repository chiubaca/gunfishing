# Balance catches, evolution, rods, and monster resources

Type: `grilling`
Status: `resolved`
Blocked by: 03, 04, 05

## Question

What Gunfish power scoring and three-band thresholds, Supply-slot capacity, ammo and Beer yields, duplicate requirements, rod tiers, Gunfish evolutions, upgrade prices, choices, and spend timing create viable builds without a dominant snowball strategy, given an unlimited Gunfish arsenal, two Combat slots, and automatically triggered Mounted evolutions?

## Answer

### Upgrade resource and spending

- Every monster drops one shared, Run-scoped Upgrade resource as a physical pickup: Pursuers drop 1, Ranged monsters drop 2, and Siege monsters drop 4.
- Upgrade resource requires manual collection, occupies no Supply slot, and is lost unspent when the Run ends. It has no permanent or post-victory use in the first playable.
- The player spends it on the rod or any carried Gunfish through the same non-pausing arsenal interface used for Combat-slot assignments. The character can only walk slowly and cannot aim, fire, sprint, reload, fish, mount, drink, service, or interact while the interface is open.
- A confirmed purchase is immediate. Purchases are irreversible and offer no respec, sale, or refund. Mounted Gunfish have left the arsenal and cannot receive later purchases.

### Numerical Gunfish upgrades

- Each individual Gunfish has three total numerical upgrade ranks. For each purchase, the player irreversibly allocates the new rank to Damage, Fire rate, or Magazine; all three ranks may be stacked in one stat or split freely.
- Each Damage rank adds 15% of base damage. Each Fire-rate rank adds 20% of base firing rate. Bonuses are additive from the unupgraded species-and-rarity base.
- Each Magazine rank adds 40% of base magazine capacity, rounded up with a minimum increase of one round for each rank. It changes capacity, not ammo-bundle yield, and does not supply free rounds when bought.
- Upgrade prices use a rarity base multiplied by the next total rank, regardless of which stat receives it:

| Gunfish rarity | Rank 1 | Rank 2 | Rank 3 | Total |
| --- | ---: | ---: | ---: | ---: |
| Tier I | 3 | 6 | 9 | 18 |
| Tier II | 5 | 10 | 15 | 30 |
| Tier III | 8 | 16 | 24 | 48 |

- Evolution does not reset ranks or prices. A Mounted Gunfish preserves all three upgrade allocations; Damage, Fire rate, and Magazine operate under its normal automated firing behavior.

### Rod tiers

- The rod has three linear tiers: the starting tier and two purchasable improvements. Tier II costs 8 Upgrade resource and Tier III costs 20.
- Each purchased tier adds 25% of the starting rod's Interest gain and 25% of its catching-target width. The bonuses are additive, so Tier III provides +50% to each.
- Rod tiers do not change the landed Gunfish's rarity, Threat accumulation or outcome spikes, the two-consecutive-miss rule, required successful hits, Lure movement limits, or Rod-attack strength.
- The rod's global catch benefit and its 28-resource total cost are the build choice; there are no branches inside the first-playable rod ladder.

### Duplicate merging and evolution

- A carried Gunfish can evolve through two stages. Evolution is initiated in the live arsenal interface and only becomes available when all required same-species donor Gunfish are currently in the arsenal.
- The merge is atomic: confirmation consumes every donor at once. There is no partial feeding, stored duplicate progress, Upgrade-resource cost, refund, or recovery of donor magazines and investments.
- Donor rarity, numerical ranks, and evolution do not increase donor value. Each selected donor counts once, so the confirmation preview must make any unusually valuable sacrifice explicit. Mounted Gunfish are no longer carried and cannot be donors.
- Stage I consumes 1, 2, or 3 donors when the target is respectively Tier I, II, or III. It presents two mutually exclusive, species-specific evolution branches; the choice is irreversible.
- Stage II deterministically deepens the selected branch and consumes another 2, 4, or 6 donors according to target rarity. Total donors across both stages are therefore 3, 6, or 9.
- An evolution may alter primary firing behavior or add at most one cooldown-based player action. It introduces no additional consumable meter. Every player-triggered ability must define a simple deterministic trigger for the Mounted form; passive and primary-fire changes apply directly.
- Exact branch behaviors and Mounted triggers belong to [Bound the first-playable content set](08-content-envelope.md), which must provide two branches and their Stage-II improvements for every included species.

### Gunfish power

- An individual Gunfish's visible score is additive: rarity contributes 1/3/5 points for Tier I/II/III, each evolution stage contributes 2 points, and each numerical rank contributes 1 point. Individual scores range from 1 to 12.
- Run Gunfish power is the high-water sum of the two strongest distinct Gunfish identities that have been available during the Run. An absent second Gunfish contributes 0; a single Gunfish's earlier states can never occupy both positions.
- Landing, evolving, or numerically upgrading a Gunfish can raise the high-water score immediately. Consuming, mounting, or otherwise losing one cannot lower it. Reclaimed Gunfish contribute their current score when they become available in the new Run.
- The visible bands are Low at 0-7, Middle at 8-15, and High at 16-24. The interface shows both the total and its band; the already-decided director response still affects future refills only.
- Rod tiers, Supply inventory, unspent Upgrade resource, arsenal size beyond the strongest two, and Mounted durability or fuel do not contribute to Gunfish power.

### Supplies and yields

- The character has eight fixed Supply slots. Capacity has no first-playable upgrade.
- Each ammo bundle adds a fixed integer number of rounds to its ammo-class reserve. [Bound the first-playable content set](08-content-envelope.md) must set that integer near two full base magazines of the class's median-capacity species. Switching Gunfish and buying Magazine ranks never changes a bundle's yield.
- One Beer heals 35% of maximum character health, repairs 40% of a Mounted Gunfish's maximum durability, or adds 10 seconds of active firing fuel to a fully repaired Mounted Gunfish.
- One use consumes the whole Beer. Healing and repair stop at maximum and discard overflow. Repair never spills into fuel; a damaged Mounted Gunfish requires a later service action for fuel after it has become fully repaired.
- A Mounted Gunfish can store at most 20 seconds of fuel. Fuel beyond that cap is discarded, and its initial loaded magazine still fires before stored fuel begins supplying unlimited ammunition.
- A killed monster's separate supply-drop chance is `min(80%, role base + 5 percentage points per empty Supply slot)`, using role bases of 15% for Pursuers, 25% for Ranged monsters, and 40% for Siege monsters.
- When a supply drop succeeds, eligible types are Beer plus every ammo class represented anywhere in the current Gunfish arsenal. Every type starts with weight 1.
- Each ammo class gains one weight for each bundle-equivalent missing below a target reserve of two bundles. Beer gains one weight for each whole Beer-equivalent of unmet character healing, nearby Mounted repair, and nearby Mounted fuel demand after subtracting carried Beer. Nearby fuel demand stops at each turret's 20-second cap. The drop is selected from those weights.

### Anti-snowball balance and initial targets

- Catch-focused builds can buy the global rod ladder, specialist builds can stack one Gunfish, generalists can exploit cheaper first ranks, and Mounted builds can turn catches and Beer into autonomous pressure. No track removes the always-available Rod attack or prevents changing Combat-slot assignments.
- Gunfish percentage gains are checked by rarity-scaled, rank-escalating prices and an immediate Gunfish-power response. Rod gains still require more Threat exposure and produce stronger caught Gunfish that enter the same power calculation.
- Evolution consumes potential Combat-slot alternatives or Mounted Gunfish; mounting permanently sacrifices the carried copy while its historical power remains. Arsenal breadth avoids a carrying cap but broadens the ammo classes considered by supply drops.
- Beer competes among healing, repair, and a capped amount of firing fuel. Mounted Gunfish therefore remain a temporary positional investment rather than a permanent conversion of every spare catch into free damage.
- Initial tuning should target roughly 40-55 manually collected Upgrade resource in a successful, combat-active 15-minute Run. That budget supports a complete rod ladder or one deeply upgraded low-rarity Gunfish plus several smaller choices, but not every progression line.
- Catch placement and rarity distribution should make Stage I on a Tier-I target common enough to observe, Stage I on Tier II or III a deliberate pursuit, Stage II on Tier I an uncommon specialization, and higher-rarity Stage II an exceptional high-roll outcome. Concrete species populations and rarity placement belong to [Bound the first-playable content set](08-content-envelope.md).
