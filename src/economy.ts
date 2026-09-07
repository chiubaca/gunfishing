import { MONSTERS, SPECIES } from "./content";
import type {
  Action,
  Ammo,
  EvolutionPreview,
  Gunfish,
  Monster,
  RunState,
  Species,
} from "./types";

export function makeGunfish(
  id: string,
  species: Species,
  rarity: number,
): Gunfish {
  if (!Number.isInteger(rarity) || rarity < 1 || rarity > 3)
    throw new RangeError("Gunfish rarity must be 1, 2, or 3");
  return {
    id,
    species,
    rarity,
    magazine: SPECIES[species].magazine,
    ranks: { damage: 0, rate: 0, magazine: 0 },
    branch: null,
    stage: 0,
  };
}

export function gunStats(g: Gunfish): {
  damage: number;
  rate: number;
  magazine: number;
  reload: number;
  ammo: Ammo;
  durability: number;
} {
  const base = SPECIES[g.species];
  const rarity = 1 + (g.rarity - 1) * 0.2;
  return {
    damage: base.damage * rarity * (1 + 0.15 * g.ranks.damage),
    rate: base.rate * (1 + 0.2 * g.ranks.rate),
    magazine:
      base.magazine +
      Math.max(1, Math.ceil(base.magazine * 0.4)) * g.ranks.magazine,
    reload: base.reload,
    ammo: base.ammo,
    durability: 100 * rarity,
  };
}

export function updatePower(state: RunState): void {
  for (const g of state.arsenal) {
    const score =
      2 * g.rarity -
      1 +
      2 * g.stage +
      g.ranks.damage +
      g.ranks.rate +
      g.ranks.magazine;
    // Keep one peak per identity, not multiple snapshots of an upgraded fish.
    const previous = Object.hasOwn(state.powerHistory, g.id)
      ? state.powerHistory[g.id]
      : 0;
    Object.defineProperty(state.powerHistory, g.id, {
      value: Math.max(previous, score),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  const peaks = Object.values(state.powerHistory).sort((a, b) => b - a);
  state.power = Math.max(state.power, (peaks[0] ?? 0) + (peaks[1] ?? 0));
}

export function previewEvolution(
  state: RunState,
  id: string,
  donors: string[],
  branch: string,
): EvolutionPreview {
  const target = state.arsenal.find((g) => g.id === id);
  const selected = donors.flatMap((donor) =>
    state.arsenal.filter((g) => g.id === donor),
  );
  const required =
    target && target.stage < 2
      ? target.rarity * (target.stage === 0 ? 1 : 2)
      : 0;
  let warning = "";
  if (!target) warning = "Target is not in the Gunfish arsenal.";
  else if (target.stage >= 2) warning = "This Gunfish is already at Stage II.";
  else if (
    !SPECIES[target.species].branches.includes(branch) ||
    (target.stage === 1 && branch !== target.branch)
  )
    warning =
      "Choose a legal branch; Stage II must deepen the existing branch.";
  else if (donors.length !== required)
    warning = `Select exactly ${required} same-species donors.`;
  else if (new Set(donors).size !== donors.length || donors.includes(id))
    warning = "Each donor must be a distinct Gunfish other than the target.";
  else if (
    selected.length !== donors.length ||
    selected.some((g) => g.species !== target.species)
  )
    warning = "All donors must be carried Gunfish of the same species.";
  if (warning) return { valid: false, required, donors: selected, warning };
  const valuable = selected.filter(
    (g) =>
      g.rarity > 1 ||
      g.stage > 0 ||
      Object.values(g.ranks).some((rank) => rank > 0) ||
      state.slots.includes(g.id),
  );
  warning = valuable.length
    ? `Permanent sacrifice: ${valuable.map((g) => `${g.id} (Tier ${g.rarity}, ${g.branch ?? "unevolved"} stage ${g.stage}, ranks D${g.ranks.damage}/F${g.ranks.rate}/M${g.ranks.magazine}${state.slots.includes(g.id) ? ", assigned" : ""})`).join("; ")}. No magazines or progression are returned.`
    : "All selected donors and their magazines are permanently consumed.";
  return { valid: true, required, donors: selected, warning };
}

export function economyAction(state: RunState, action: Action): boolean {
  if (state.status !== "playing" || !state.arsenalOpen) return false;
  switch (action.type) {
    case "assign": {
      if (
        (action.slot !== 0 && action.slot !== 1) ||
        !state.arsenal.some((g) => g.id === action.id)
      )
        return false;
      const other = action.slot === 0 ? 1 : 0;
      if (state.slots[other] === action.id)
        state.slots[other] = state.slots[action.slot];
      state.slots[action.slot] = action.id;
      if (!state.slots[state.active]) state.active = action.slot;
      state.reload = 0;
      state.charge = 0;
      state.spool = 0;
      state.bufferedShot = false;
      return true;
    }
    case "upgrade": {
      const g = state.arsenal.find((gun) => gun.id === action.id);
      if (!g || !["damage", "rate", "magazine"].includes(action.stat))
        return false;
      const ranks = g.ranks.damage + g.ranks.rate + g.ranks.magazine;
      if (ranks >= 3) return false;
      const cost = [3, 5, 8][g.rarity - 1] * (ranks + 1);
      if (!Number.isFinite(cost) || state.resource < cost) return false;
      state.resource -= cost;
      g.ranks[action.stat]++;
      updatePower(state);
      return true;
    }
    case "rodUpgrade": {
      const cost = state.rod === 1 ? 8 : state.rod === 2 ? 20 : null;
      if (cost === null || state.resource < cost) return false;
      state.resource -= cost;
      state.rod++;
      return true;
    }
    case "evolve": {
      const preview = previewEvolution(
        state,
        action.id,
        action.donors,
        action.branch,
      );
      if (!preview.valid) return false;
      const g = state.arsenal.find((gun) => gun.id === action.id)!;
      // Capture donor identities before removing them; sacrifice cannot erase power.
      updatePower(state);
      const donors = new Set(action.donors);
      state.arsenal = state.arsenal.filter((gun) => !donors.has(gun.id));
      state.slots = state.slots.map((id) =>
        id && donors.has(id) ? null : id,
      ) as RunState["slots"];
      if (!state.slots[state.active] && state.slots[1 - state.active])
        state.active = 1 - state.active;
      state.reload = 0;
      state.charge = 0;
      state.spool = 0;
      state.bufferedShot = false;
      g.branch = action.branch;
      g.stage++;
      updatePower(state);
      return true;
    }
    case "supply": {
      if (
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= state.supplies.length
      )
        return false;
      const supply = state.supplies[action.index];
      // Beer is only consumed by the Run's interruptible drink/service holds.
      if (!action.drop && supply === "beer") return false;
      state.supplies.splice(action.index, 1);
      const amount =
        supply === "beer"
          ? 1
          : Object.values(SPECIES).find((species) => species.ammo === supply)!
              .bundle;
      if (action.drop)
        state.drops.push({
          id: `drop-${state.nextId++}`,
          x: state.player.x,
          z: state.player.z,
          type: supply,
          amount,
        });
      else state.reserves[supply as Ammo] += amount;
      return true;
    }
    default:
      return false;
  }
}

export function killDrops(
  state: RunState,
  monster: Monster,
  random: () => number,
): void {
  state.drops.push({
    id: `drop-${state.nextId++}`,
    x: monster.x,
    z: monster.z,
    type: "resource",
    amount: MONSTERS[monster.role].reward,
  });
  const base =
    monster.role === "shellback"
      ? 0.4
      : monster.role === "spitter"
        ? 0.25
        : 0.15;
  const chance = Math.min(
    0.8,
    base + 0.05 * Math.max(0, 8 - state.supplies.length),
  );
  if (random() >= chance) return;

  let beerDemand = Math.max(0, 100 - state.player.health) / 35;
  for (const mounted of state.mounted) {
    if (
      mounted.health <= 0 ||
      Math.hypot(mounted.x - state.player.x, mounted.z - state.player.z) > 30
    )
      continue;
    beerDemand +=
      Math.max(0, mounted.maxHealth - mounted.health) /
      (mounted.maxHealth * 0.4);
    beerDemand += Math.max(0, 20 - mounted.fuel) / 10;
  }
  beerDemand -= state.supplies.filter((supply) => supply === "beer").length;
  const choices: { type: "beer" | Ammo; weight: number; amount: number }[] = [
    {
      type: "beer",
      weight: 1 + Math.floor(Math.max(0, beerDemand)),
      amount: 1,
    },
  ];
  const classes = new Set(state.arsenal.map((g) => SPECIES[g.species].ammo));
  for (const ammo of classes) {
    const bundle = Object.values(SPECIES).find(
      (species) => species.ammo === ammo,
    )!.bundle;
    choices.push({
      type: ammo,
      weight: 1 + Math.max(0, 2 - state.reserves[ammo] / bundle),
      amount: bundle,
    });
  }
  let roll = random() * choices.reduce((sum, choice) => sum + choice.weight, 0);
  let selected = choices[choices.length - 1];
  for (const choice of choices) {
    roll -= choice.weight;
    if (roll < 0) {
      selected = choice;
      break;
    }
  }
  // Full inventories still get world drops; collection enforces eight slots.
  state.drops.push({
    id: `drop-${state.nextId++}`,
    x: monster.x,
    z: monster.z,
    type: selected.type,
    amount: selected.amount,
  });
}
