import {
  CATCHING,
  catchingReady,
  LOCATIONS,
  MIXES,
  MONSTERS,
  OBSTACLES,
  PHASES,
  POCKETS,
  SPECIES,
  terrainHeight,
  WORLD_SIZE,
} from "./content";
import {
  economyAction,
  gunStats,
  killDrops,
  makeGunfish,
  previewEvolution,
  updatePower,
} from "./economy";
import type {
  Action,
  EvolutionPreview,
  Gunfish,
  Input,
  Monster,
  Mounted,
  Role,
  RunState,
  Scenario,
  Species,
  Vec,
} from "./types";

const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.z - b.z);
const bearing = (a: Vec, b: Vec) => Math.atan2(b.x - a.x, b.z - a.z);
const clamp = (n: number, low: number, high: number) =>
  Math.max(low, Math.min(high, n));
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const segmentDistance = (
  p: Vec & { y: number },
  a: Vec & { y: number },
  b: Vec & { y: number },
): number => {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    dz = b.z - a.z;
  const t = clamp(
    ((p.x - a.x) * dx + (p.y - a.y) * dy + (p.z - a.z) * dz) /
      (dx * dx + dy * dy + dz * dz || 1),
    0,
    1,
  );
  return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t, p.z - a.z - dz * t);
};

/** Live renderer state; step and transition use real seconds. Scenario callbacks are not serialized. */
export class Run {
  state: RunState;
  private scenario: Scenario;

  constructor(
    options: { seed?: number; saved?: string; scenario?: Scenario } = {},
  ) {
    this.scenario = options.scenario ?? {};
    if (options.saved) {
      const saved = JSON.parse(options.saved) as RunState;
      if (
        saved.version !== 1 ||
        !saved.player ||
        !Number.isFinite(saved.player.pitch) ||
        !Array.isArray(saved.projectiles)
      )
        throw new Error("Unsupported Run save");
      this.state = saved;
      if (saved.worldVersion !== 2) {
        // Keep the character and catches while relocating the old, larger map's entities.
        const fresh = new Run({ seed: saved.seed }).state;
        saved.fish.forEach((fish, i) => {
          const replacement = fresh.fish[i];
          if (replacement) Object.assign(fish, { x: replacement.x, z: replacement.z, home: { ...replacement.home } });
        });
        for (const fish of fresh.fish.slice(saved.fish.length)) saved.fish.push({ ...fish, id: this.id("fish") });
        const relocate = (p: Vec) => Object.assign(p, this.stable({ x: p.x / 1.9, z: p.z / 1.9 }));
        relocate(saved.player);
        if (saved.cache) relocate(saved.cache);
        saved.monsters.forEach(relocate); saved.mounted.forEach(relocate); saved.drops.forEach(relocate);
        saved.projectiles = []; saved.cast = null;
        saved.worldVersion = 2;
      }
      this.state.player.pitch ??= 0;
      for (const p of this.state.projectiles) {
        p.y ??= terrainHeight(p) + 1.15;
        p.vy ??= 0;
      }
      this.state.hold = null;
      return;
    }
    this.state = {
      version: 1,
      worldVersion: 2,
      seed: (options.seed ?? Date.now()) >>> 0,
      nextId: 1,
      elapsed: 0,
      status: "playing",
      resultTime: 0,
      player: { x: 0, z: 0, health: 100, heading: 0, pitch: 0, y: 0, vy: 0 },
      mode: "fishing",
      transition: 0,
      lineLinger: 0,
      cast: null,
      threat: 12,
      rod: 1,
      arsenal: [],
      slots: [null, null],
      active: 0,
      supplies: ["beer", "beer"],
      reserves: { pistol: 0, rifle: 0, shells: 0 },
      resource: 0,
      mounted: [],
      fish: [],
      monsters: [],
      drops: [],
      projectiles: [],
      cache: copy(options.scenario?.cache ?? null),
      replacedCache: false,
      powerHistory: {},
      power: 0,
      phase: 0,
      refill: null,
      lull: 0,
      guaranteedRole: null,
      arsenalOpen: false,
      aiming: false,
      sprinting: false,
      reload: 0,
      fireCooldown: 0,
      rodCooldown: 0,
      bufferedShot: false,
      charge: 0,
      spool: 0,
      sinceShot: 0,
      shots: 0,
      hold: null,
      prompt: "Aim and Cast beside a Gunfish",
      completed: [],
      notice: "",
      noticeTime: 0,
      kills: 0,
      catches: 0,
    };
    const s = this.state;
    let pockets = POCKETS;
    if (s.cache) {
      const candidates = POCKETS.map((p) => ({
        p,
        time: this.route(p, s.cache!).distance / 9,
      }));
      const roll = this.random();
      const low = roll < 0.2 ? 20 : roll < 0.8 ? 45 : 75;
      const high = low === 20 ? 45 : low === 45 ? 75 : 120;
      const legal = candidates.filter((c) => c.time >= 20 && c.time <= 120);
      const band = legal.filter((c) => c.time >= low && c.time <= high);
      pockets = (band.length ? band : legal).map((c) => c.p);
      if (!pockets.length) pockets = POCKETS;
    }
    const pocket = pockets[Math.floor(this.random() * pockets.length)] ?? {
      x: 0,
      z: 0,
    };
    Object.assign(s.player, pocket);
    const opening = [...LOCATIONS].sort(
      (a, b) => distance(a, pocket) - distance(b, pocket),
    )[0];
    s.player.heading = bearing(pocket, opening);
    for (const location of LOCATIONS) {
      for (let i = 0; i < 3; i++) {
        const speciesRoll = this.random();
        const alternatives = (
          ["pistol", "rifle", "shotgun"] as Species[]
        ).filter((v) => v !== location.species);
        const species =
          speciesRoll < 0.6
            ? location.species
            : alternatives[speciesRoll < 0.8 ? 0 : 1];
        const rarityRoll = this.random();
        const rarity =
          rarityRoll < (location.exposed ? 0.55 : 0.8)
            ? 1
            : rarityRoll < (location.exposed ? 0.9 : 0.98)
              ? 2
              : 3;
        const point = {
          x: location.x + (i - 1) * 6,
          z: location.z + 2 + this.random() * 2,
        };
        s.fish.push({
          ...point,
          id: this.id("fish"),
          species,
           rarity: location.secret ? 3 : rarity,
          interest: 0,
          cooldown: 0,
          landed: false,
          home: { ...point },
        });
      }
    }
    const nearest = [...s.fish]
      .sort((a, b) => distance(a, pocket) - distance(b, pocket))
      .slice(0, 2);
    nearest.forEach((fish, i) => {
      fish.species = i ? "rifle" : "pistol";
      fish.rarity = 1;
      Object.assign(fish, { x: opening.x + (i ? 6 : -6), z: opening.z + 5 });
      fish.home = { x: fish.x, z: fish.z };
    });
    for (const fish of s.fish)
      if (!nearest.includes(fish) && distance(fish.home, opening) < 14) {
        fish.x = opening.x;
        fish.z = opening.z - 10;
        fish.home = { x: fish.x, z: fish.z };
      }
    Object.assign(s, copy(options.scenario?.state ?? {}));
    updatePower(s);
  }

  view(): RunState {
    return this.state;
  }
  surfaceHeight(point: Vec): number {
    return terrainHeight(point);
  }
  content() {
    return copy({
      worldSize: WORLD_SIZE,
      locations: LOCATIONS,
      pockets: POCKETS,
      obstacles: OBSTACLES,
      species: SPECIES,
      monsters: MONSTERS,
      phases: PHASES,
      mixes: MIXES,
      catching: CATCHING,
    });
  }
  save(): string {
    return JSON.stringify(this.state);
  }
  previewEvolution(
    id: string,
    donors: string[],
    branch: string,
  ): EvolutionPreview {
    return previewEvolution(this.state, id, donors, branch);
  }

  private random = (): number => {
    this.state.seed = (Math.imul(this.state.seed, 1664525) + 1013904223) >>> 0;
    return this.state.seed / 4294967296;
  };
  private id(prefix: string): string {
    let id: string;
    do {
      id = `${prefix}-${this.state.nextId++}`;
    } while (id === this.state.cache?.gunfish?.id);
    return id;
  }
  private monster(role: Role, point: Vec): Monster {
    return {
      ...point,
      id: this.id("monster"),
      role,
      health: MONSTERS[role].health,
      heading: 0,
      alerted: false,
      target: null,
      windup: 0,
      recovery: 0,
      lane: null,
      lost: 0,
      stagger: 0,
      staggerTime: 0,
      repositioned: false,
    };
  }

  private solid(point: Vec, radius = 0, shoreline = true): boolean {
    const half = WORLD_SIZE / 2;
    return (
      (shoreline && !onIsland(point, radius)) ||
      Math.abs(point.x) > half - radius ||
      Math.abs(point.z) > half - radius ||
      OBSTACLES.some(
        (o) =>
          Math.abs(point.x - o.x) < o.width / 2 + radius &&
          Math.abs(point.z - o.z) < o.depth / 2 + radius,
      )
    );
  }
  private stable(point: Vec): Vec {
    const half = WORLD_SIZE / 2 - 1;
    const p = {
      x: clamp(point.x, -half, half),
      z: clamp(point.z, -half, half),
    };
    if (!onIsland(p, 2)) Object.assign(p, coastPoint(Math.atan2(p.z, p.x), 3));
    for (let i = 0; i < OBSTACLES.length + 1 && this.solid(p); i++) {
      const obstacle = OBSTACLES.find(
        (o) =>
          Math.abs(p.x - o.x) < o.width / 2 + 0.1 &&
          Math.abs(p.z - o.z) < o.depth / 2 + 0.1,
      );
      if (!obstacle) break;
      const candidates = [
        { x: obstacle.x - obstacle.width / 2 - 0.2, z: p.z },
        { x: obstacle.x + obstacle.width / 2 + 0.2, z: p.z },
        { x: p.x, z: obstacle.z - obstacle.depth / 2 - 0.2 },
        { x: p.x, z: obstacle.z + obstacle.depth / 2 + 0.2 },
      ].sort((a, b) => distance(a, point) - distance(b, point));
      Object.assign(p, candidates.find((c) => !this.solid(c)) ?? candidates[0]);
    }
    return p;
  }
  private los(a: Vec, b: Vec): boolean {
    if (this.scenario.lineOfSight) return this.scenario.lineOfSight(a, b);
    return !OBSTACLES.some((o) => {
      let near = 0,
        far = 1;
      for (const axis of ["x", "z"] as const) {
        const delta = b[axis] - a[axis],
          half = (axis === "x" ? o.width : o.depth) / 2;
        if (Math.abs(delta) < 1e-9) {
          if (Math.abs(a[axis] - o[axis]) > half) return false;
        } else {
          const t1 = (o[axis] - half - a[axis]) / delta,
            t2 = (o[axis] + half - a[axis]) / delta;
          near = Math.max(near, Math.min(t1, t2));
          far = Math.min(far, Math.max(t1, t2));
          if (near > far) return false;
        }
      }
      return far >= 0 && near <= 1;
    });
  }
  private route(a: Vec, b: Vec): { distance: number; waypoint: Vec } {
    if (this.los(a, b)) return { distance: distance(a, b), waypoint: b };
    const nodes = [
      a,
      b,
      ...OBSTACLES.flatMap((o) =>
        [-1, 1].flatMap((x) =>
          [-1, 1].map((z) => ({
            x: o.x + x * (o.width / 2 + 1),
            z: o.z + z * (o.depth / 2 + 1),
          })),
        ),
      ),
    ].filter((p, i) => i < 2 || !this.solid(p));
    const costs = nodes.map(() => Infinity),
      previous = nodes.map(() => -1),
      visited = new Set<number>();
    costs[0] = 0;
    for (let i = 0; i < nodes.length; i++) {
      let best = -1;
      for (let j = 0; j < nodes.length; j++)
        if (
          !visited.has(j) &&
          (best < 0 ||
            costs[j] + distance(nodes[j], b) <
              costs[best] + distance(nodes[best], b))
        )
          best = j;
      if (best === 1 || best < 0 || !Number.isFinite(costs[best])) break;
      visited.add(best);
      for (let j = 0; j < nodes.length; j++)
        if (
          !visited.has(j) &&
          costs[best] + distance(nodes[best], nodes[j]) < costs[j] &&
          this.los(nodes[best], nodes[j])
        ) {
          costs[j] = costs[best] + distance(nodes[best], nodes[j]);
          previous[j] = best;
        }
    }
    let next = 1;
    while (previous[next] > 0) next = previous[next];
    return { distance: costs[1], waypoint: nodes[next] };
  }

  act(action: Action): void {
    const s = this.state;
    if (action.type === "next" && (s.status === "failure" || s.status === "victory")) {
      this.state = new Run({
        seed: s.seed,
        scenario: { ...this.scenario, state: undefined, cache: s.cache },
      }).state;
      return;
    }
    if (s.status !== "playing") return;
    if (action.type === "cancel" || action.type === "release") {
      s.hold = null;
      if (action.type === "cancel") {
        this.endCast("cancel");
        this.draw();
      }
      return;
    }
    if (action.type === "arsenal") {
      s.arsenalOpen = action.open ?? !s.arsenalOpen;
      if (s.arsenalOpen) {
        this.endCast("cancel");
        s.hold = null;
        s.reload = 0;
        s.aiming = false;
        s.sprinting = false;
        s.bufferedShot = false;
      }
      this.complete("arsenal");
      return;
    }
    if (
      ["assign", "upgrade", "rodUpgrade", "evolve", "supply"].includes(
        action.type,
      )
    ) {
      if (s.arsenalOpen) {
        economyAction(s, action);
        if (action.type === "supply" && action.drop)
          for (const drop of s.drops) Object.assign(drop, this.stable(drop));
        s.reload = 0;
        s.charge = 0;
        updatePower(s);
      }
      return;
    }
    if (s.arsenalOpen || s.mode === "returning") return;
    if (action.type === "draw") {
      this.endCast("cancel");
      s.hold = null;
      if (
        action.slot !== undefined &&
        (action.slot === 0 || action.slot === 1)
      ) {
        if (s.active !== action.slot) {
          s.reload = 0;
          s.charge = 0;
          s.spool = 0;
        }
        s.active = action.slot;
      }
      this.draw();
      this.complete("draw");
      return;
    }
    if (action.type === "fish") {
      this.endCast("cancel");
      s.hold = null;
      s.reload = 0;
      s.bufferedShot = false;
      if (s.mode !== "fishing") {
        s.mode = "returning";
        s.transition = 0;
      }
      return;
    }
    if (action.type === "cast") {
      if (
        s.mode !== "fishing" ||
        s.cast ||
        s.hold ||
        !Number.isFinite(action.point.x) ||
        !Number.isFinite(action.point.z)
      )
        return;
      if (
        distance(s.player, action.point) > 32 ||
        this.solid(action.point, 0, false) ||
        !this.los(s.player, action.point) ||
        !s.fish.some((f) => !f.landed && distance(f.home, action.point) < 12)
      )
        return;
      s.player.heading = bearing(s.player, action.point);
      s.cast = Object.assign(
        {
          lure: { ...action.point },
          fishId: null,
          phase: "lure" as const,
          elapsed: 0,
          hits: 0,
          misses: 0,
          cycle: 0,
          tug: 0,
        },
        { anchor: { ...action.point }, tugCooldown: 0 },
      );
      for (const fish of s.fish)
        if (!fish.landed && distance(fish, action.point) < 0.8)
          this.scare(fish.id);
      this.complete("cast");
      return;
    }
    if (action.type === "tug" && s.cast?.phase === "lure") {
      const length = Math.hypot(action.x, action.z);
      if (!Number.isFinite(length) || length === 0) return;
      const cast = s.cast as typeof s.cast & {
        anchor?: Vec;
        tugCooldown?: number;
      };
      if ((cast.tugCooldown ?? 0) > 1e-9) return;
      cast.anchor ??= { ...cast.lure };
      const strong = action.strong || length > 1 + 1e-9;
      const point = {
        x: cast.lure.x + (action.x / Math.max(1, length)) * (strong ? 1 : 0.25),
        z: cast.lure.z + (action.z / Math.max(1, length)) * (strong ? 1 : 0.25),
      };
      if (
        distance(point, cast.anchor) > 2 ||
        distance(point, s.player) > 32 ||
        this.solid(point, 0, false) ||
        !this.los(cast.lure, point) ||
        !s.fish.some((f) => distance(f.home, point) < 12)
      )
        return;
      Object.assign(cast.lure, point);
      cast.tugCooldown = 0.2;
      s.cast.tug = 0.8;
      s.threat += 0.3;
      if (strong)
        for (const f of s.fish)
          if (!f.landed && distance(f, s.cast.lure) < 6) this.scare(f.id);
      this.detect();
      this.complete("tug");
      return;
    }
    if (action.type === "catch" && s.cast?.phase === "catch") {
      const f = s.fish.find((f) => f.id === s.cast!.fishId);
      if (!f) return;
      if (catchingReady(s.cast.cycle, f.rarity, s.rod)) {
        s.cast.hits++;
        s.cast.misses = 0;
        this.complete("catch");
        s.notice = "The line sings. Reel it home.";
        s.noticeTime = 1;
        if (s.cast.hits >= f.rarity + 2) {
          this.endCast("land");
          return;
        }
      } else {
        s.cast.misses++;
        s.notice = "The line slackens";
        s.noticeTime = 1;
        if (s.cast.misses >= 2) {
          this.endCast("lost");
          return;
        }
      }
      s.cast.cycle = 0;
      return;
    }
    if (action.type === "fire") {
      if (s.mode === "drawing" && s.transition < 0.46 - 1e-9) {
        s.bufferedShot = true;
        return;
      }
      if (s.reload > 0) {
        s.reload = 0;
        if (
          this.activeGun()?.species === "shotgun" &&
          this.activeGun()!.magazine > 0
        )
          this.fire();
        else this.reload();
        return;
      }
      this.fire();
      return;
    }
    if (action.type === "reload") {
      this.reload();
      return;
    }
    if (action.type === "jump" && s.player.y === 0 && !s.hold) {
      s.player.vy = 6;
      return;
    }
    if (action.type === "rod" && s.mode === "combat" && s.rodCooldown <= 0) {
      s.hold = null;
      s.reload = 0;
      s.rodCooldown = 1.1;
      this.move(
        s.player,
        Math.sin(s.player.heading) * 0.8,
        Math.cos(s.player.heading) * 0.8,
        true,
      );
      for (const m of [...s.monsters])
        if (
          Math.abs(terrainHeight(s.player) + s.player.y - terrainHeight(m)) <
            3 &&
          Math.hypot(
            distance(s.player, m),
            terrainHeight(s.player) + s.player.y - terrainHeight(m),
          ) < 4 &&
          Math.cos(bearing(s.player, m) - s.player.heading) > 0.25 &&
          this.los(s.player, m)
        )
          this.hitMonster(m, 32, 100, s.player);
      this.complete("rod");
      return;
    }
    if (s.cast || s.hold || s.mode === "drawing") return;
    if (action.type === "mount" && this.activeGun()) {
      const p = {
        x: s.player.x + Math.sin(s.player.heading) * 2,
        z: s.player.z + Math.cos(s.player.heading) * 2,
      };
      if (!this.solid(p, 0.7) && !s.mounted.some((m) => distance(m, p) < 2))
        s.hold = {
          kind: "mount",
          duration: 1.25,
          elapsed: 0,
          target: this.activeGun()!.id,
        };
    }
    if (
      action.type === "drink" &&
      s.supplies.includes("beer") &&
      s.player.health < 100
    )
      s.hold = { kind: "drink", duration: 1, elapsed: 0, target: null };
    if (action.type === "interact") {
      if (s.cache && distance(s.player, s.cache) < 3) {
        s.hold = { kind: "recover", duration: 2, elapsed: 0, target: null };
        return;
      }
      const drop = s.drops
        .filter((d) => distance(d, s.player) < 3)
        .sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
      if (drop) {
        if (drop.type === "resource") s.resource += drop.amount;
        else if (s.supplies.length < 8) s.supplies.push(drop.type);
        else {
          s.notice = "Supply slots full";
          s.noticeTime = 2;
          return;
        }
        s.drops = s.drops.filter((d) => d.id !== drop.id);
        return;
      }
      const mounted = s.mounted
        .filter((m) => distance(m, s.player) < 3)
        .sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
      if (
        mounted &&
        s.supplies.includes("beer") &&
        (mounted.health < mounted.maxHealth || mounted.fuel < 20)
      )
        s.hold = {
          kind: "service",
          duration: 1,
          elapsed: 0,
          target: mounted.id,
        };
    }
  }

  private activeGun(): Gunfish | undefined {
    return this.state.arsenal.find(
      (g) => g.id === this.state.slots[this.state.active],
    );
  }
  private complete(key: string): void {
    const s = this.state;
    if (!s.completed.includes(key)) s.completed.push(key);
    this.prompt();
  }
  private prompt(): void {
    const s = this.state,
      done = (key: string) => s.completed.includes(key);
    if (
      s.cast &&
      s.monsters.some(
        (m) => m.alerted && distance(m, s.player) < Math.max(25, s.threat),
      ) &&
      !done("danger")
    ) {
      s.prompt = s.slots[0]
        ? "[Primary]: cancel the Cast and draw now"
        : s.slots[1]
          ? "[Secondary]: cancel the Cast and draw now"
          : "[Cancel]: cancel the Cast now";
      return;
    }
    if (!done("cast")) s.prompt = "Click water beside a Gunfish to place the Lure";
    else if (s.cast?.phase === "lure" && !done("tug"))
      s.prompt = "Tap the Arrow keys gently until a Gunfish turns toward the Lure";
    else if (s.cast?.phase === "catch" && !done("catch"))
      s.prompt = "Press [Catch] when the swinging box center is inside the target";
    else if ((s.mode === "drawing" || s.mode === "combat") && !done("aim"))
      s.prompt = "Hold [Aim] for precision";
    else if (s.arsenal.length > 1 && !s.slots[1] && !done("arsenal"))
      s.prompt = "[Arsenal]: assign the stored Gunfish to Secondary";
    else if (s.slots[1] && s.active !== 1 && !done("secondary"))
      s.prompt = "[Secondary]: switch Gunfish";
    else if (
      !done("rod") &&
      (this.activeGun()?.magazine === 0 ||
        s.monsters.some((m) => distance(m, s.player) < 4))
    )
      s.prompt = "[Rod Attack]: always available";
    else s.prompt = "";
  }
  private scare(id: string): void {
    const f = this.state.fish.find((f) => f.id === id);
    if (!f) return;
    f.interest = 0;
    f.cooldown = 4;
    const angle = this.random() * Math.PI * 2;
    f.x = f.home.x + Math.sin(angle) * 2;
    f.z = f.home.z + Math.cos(angle) * 2;
    this.state.notice = "A sharp splash. The Gunfish retreats.";
    this.state.noticeTime = 1.5;
  }
  private endCast(outcome: "cancel" | "land" | "lost"): void {
    const s = this.state,
      cast = s.cast;
    if (!cast) return;
    if (s.prompt.includes("cancel the Cast") && !s.completed.includes("danger"))
      s.completed.push("danger");
    const f = s.fish.find((f) => f.id === cast.fishId);
    if (outcome !== "cancel" && f) {
      s.threat += (outcome === "land" ? 5 : 7) * f.rarity;
      this.detect();
    }
    if (f) {
      f.cooldown = outcome === "lost" ? 18 : 3;
      f.interest = 0;
    } else
      for (const fish of s.fish)
        if (distance(fish, cast.lure) < 6) {
          fish.cooldown = Math.max(fish.cooldown, 3);
          fish.interest = 0;
        }
    s.cast = null;
    s.lineLinger = 0.1;
    if (outcome === "land" && f) {
      f.landed = true;
      const g = makeGunfish(f.id, f.species, f.rarity);
      s.arsenal.push(g);
      s.catches++;
      if (s.catches === 1 && !s.slots[0]) {
        s.slots[0] = g.id;
        s.active = 0;
        s.bufferedShot = true;
        s.notice = `Primary: ${SPECIES[g.species].name}`;
      } else s.notice = `Stored in arsenal: ${SPECIES[g.species].name}`;
      s.noticeTime = 3;
      updatePower(s);
      this.draw();
    } else if (outcome === "lost") this.draw();
  }
  private draw(): void {
    const s = this.state;
    if (s.mode !== "combat" && s.mode !== "drawing") {
      s.mode = "drawing";
      s.transition = 0;
    }
    s.reload = 0;
    if (s.active === 1) this.complete("secondary");
    this.prompt();
  }
  private fishing(dt: number, input: Input): void {
    const s = this.state;
    for (const f of s.fish) f.cooldown = Math.max(0, f.cooldown - dt);
    const cast = s.cast as typeof s.cast & {
      anchor?: Vec;
      tugCooldown?: number;
    };
    if (!cast) return;
    cast.tugCooldown = Math.max(0, (cast.tugCooldown ?? 0) - dt);
    s.threat += dt * 0.6;
    cast.elapsed += dt;
    if (cast.phase === "catch") {
      cast.cycle = (cast.cycle + dt) % CATCHING.cycle;
      return;
    }
    if (input.reel) {
      const d = distance(cast.lure, s.player);
      if (d > 1) {
        const dx = ((s.player.x - cast.lure.x) / d) * dt * 0.8,
          dz = ((s.player.z - cast.lure.z) / d) * dt * 0.8;
        const point = { x: cast.lure.x + dx, z: cast.lure.z + dz };
        if (
          !this.solid(point, 0, false) &&
          this.los(cast.lure, point) &&
          s.fish.some((f) => distance(f.home, point) < 12)
        ) {
          cast.anchor ??= { ...cast.lure };
          cast.anchor.x += dx;
          cast.anchor.z += dz;
          Object.assign(cast.lure, point);
        }
      }
      cast.tug = Math.max(cast.tug, 0.1);
    }
    cast.tug = Math.max(0, cast.tug - dt);
    const interested = [];
    for (const f of s.fish) {
      if (f.landed || f.cooldown > 0) continue;
      const d = distance(f, cast.lure);
      if (d <= 10 && cast.tug > 0) {
        f.interest = Math.min(
          1,
          f.interest + dt * 0.4 * (1 + (s.rod - 1) * 0.25),
        );
        const approach = Math.min(Math.max(0, d - 1), dt * 0.5);
        if (d > 0) {
          f.x += ((cast.lure.x - f.x) / d) * approach;
          f.z += ((cast.lure.z - f.z) / d) * approach;
        }
        if (f.interest > 0.3) interested.push(f);
      } else f.interest = Math.max(0, f.interest - dt * 0.02);
    }
    if (interested.length) {
      const total = interested.reduce((sum, f) => sum + f.interest, 0);
      if (
        interested.some((f) => f.interest >= 1) ||
        this.random() < dt * total * 0.12
      ) {
        let roll = this.random() * total;
        const f =
          interested.find((f) => (roll -= f.interest) <= 0) ?? interested[0];
        cast.fishId = f.id;
        cast.phase = "catch";
        cast.cycle = 0;
        cast.hits = 0;
        cast.misses = 0;
        s.notice = "Bite! Stop the box inside the target";
        s.noticeTime = 1.5;
        this.prompt();
      }
    }
  }

  private reload(): void {
    const s = this.state,
      g = this.activeGun();
    if (!g || s.mode !== "combat" || s.hold || s.rodCooldown > 0) return;
    const stats = gunStats(g);
    if (g.magazine >= stats.magazine || s.reserves[stats.ammo] <= 0) return;
    s.reload = stats.reload;
    s.aiming = false;
    s.sprinting = false;
    s.charge = 0;
  }

  private fire(): void {
    const s = this.state,
      g = this.activeGun();
    if (
      !g ||
      s.arsenalOpen ||
      s.sprinting ||
      s.reload > 0 ||
      s.hold ||
      s.rodCooldown > 0 ||
      s.fireCooldown > 1e-9 ||
      (s.mode !== "combat" &&
        !(s.mode === "drawing" && s.transition >= 0.46 - 1e-9))
    )
      return;
    if (g.magazine <= 0) {
      this.reload();
      return;
    }
    const stats = gunStats(g);
    const burst = g.branch === "Fanfire" && g.stage ? g.stage + 1 : 1;
    const rounds = Math.min(g.magazine, burst);
    const firing = g as Gunfish & { shots?: number };
    for (let i = 0; i < rounds; i++) {
      g.magazine--;
      s.shots++;
      firing.shots = (firing.shots ?? 0) + 1;
      this.shoot(
        g,
        s.player,
        s.player.heading,
        "player",
        s.aiming,
        s.charge,
        s.spool,
        firing.shots,
        s.player.pitch,
      );
    }
    s.fireCooldown =
      1 / (stats.rate * (g.branch === "Spool" ? 1 + s.spool * 0.5 : 1));
    s.charge = 0;
    s.sinceShot = 0;
    this.noise(s.player, "player");
  }

  private shoot(
    g: Gunfish,
    from: Vec,
    heading: number,
    owner: string,
    precision: boolean,
    charge: number,
    spool: number,
    shots: number,
    pitch: number,
  ): void {
    const s = this.state,
      stats = gunStats(g),
      evolved = g.stage > 0;
    const slug = evolved && g.branch === "Slug";
    const pellets = g.species === "shotgun" && !slug ? 8 : 1;
    const deadeye =
      evolved &&
      g.branch === "Deadeye" &&
      charge >= (g.stage === 2 ? 0.4 : 0.6) - 1e-9;
    const hammer =
      evolved && g.branch === "Hammer" && shots % (g.stage === 2 ? 4 : 5) === 0;
    for (let i = 0; i < pellets; i++) {
      const spread =
        (slug
          ? 0.008
          : g.species === "shotgun"
            ? precision
              ? 0.12
              : 0.22
            : precision
              ? 0.008
              : g.species === "rifle"
                ? 0.085
                : 0.035) * (g.branch === "Fanfire" && g.stage === 2 ? 0.65 : 1);
      const angle =
        heading +
        (g.branch === "Sweeper"
          ? (i / 7 - 0.5) * spread * 2
          : (this.random() - 0.5) * spread * 2);
      const damage =
        stats.damage *
        (slug ? 8 : 1) *
        (deadeye ? (g.stage === 2 ? 2.5 : 2) : 1);
      const pierce =
        evolved && g.branch === "Sweeper"
          ? g.stage
          : (deadeye && g.stage === 2) ||
              (g.branch === "Spool" && g.stage === 2 && spool >= 1) ||
              (slug && g.stage === 2)
            ? 1
            : 0;
      s.projectiles.push({
        id: this.id("shot"),
        x: from.x,
        z: from.z,
        y: terrainHeight(from) + (owner === "player" ? s.player.y : 0) + 1.15,
        vx: Math.sin(angle) * Math.cos(pitch) * 85,
        vy: Math.sin(pitch) * 85,
        vz: Math.cos(angle) * Math.cos(pitch) * 85,
        life: 1.1,
        damage,
        hostile: false,
        radius: slug ? 0.25 : 0.15,
        pierce,
        stagger:
          damage *
          (hammer || deadeye
            ? 3
            : g.branch === "Sweeper" && g.stage === 2
              ? 1.25
              : 1),
        traveled: 0,
        hit: [],
        owner: `${owner}|${g.branch ?? ""}|${g.stage}|${hammer ? "pulse" : ""}`,
      });
    }
  }

  private noise(point: Vec, target: string): void {
    for (const m of this.state.monsters)
      if (distance(m, point) < 55) {
        m.alerted = true;
        if (!m.target || (m.target === "player" && target !== "player")) {
          const nearest = this.state.mounted
            .filter(
              (t) =>
                (distance(m, t) < 35 && this.los(m, t)) ||
                (t.shots > 0 &&
                  ((t as Mounted & { sinceShot?: number }).sinceShot ??
                    Infinity) < 0.1 &&
                  distance(m, t) < 55),
            )
            .sort((a, b) => distance(m, a) - distance(m, b))[0];
          m.target = nearest?.id ?? target;
        }
        if (m.target === target) m.lost = 0;
      }
  }
  private detect(): void {
    const s = this.state;
    for (const m of s.monsters) {
      const perceived = s.mounted
        .filter((t) => distance(m, t) < 35 && this.los(m, t))
        .sort((a, b) => distance(m, a) - distance(m, b))[0];
      if (perceived && (!m.target || m.target === "player")) {
        m.target = perceived.id;
        m.alerted = true;
        m.lost = 0;
      }
      if (
        (s.cast && distance(m, s.player) <= s.threat) ||
        distance(m, s.player) < 3 ||
        (distance(m, s.player) < 24 && this.los(m, s.player))
      ) {
        m.alerted = true;
        m.target ??= "player";
        m.lost = 0;
      }
    }
  }

  private move(entity: Vec, dx: number, dz: number, player = false): void {
    const blocked = (p: Vec) =>
      this.solid(p, player ? 0.5 : 0.65) ||
      (player &&
        this.state.player.y < 1 &&
        this.state.monsters.some(
          (m) => distance(m, p) < 1.3 && distance(m, p) < distance(m, entity),
        ));
    if (!blocked({ x: entity.x + dx, z: entity.z + dz })) {
      entity.x += dx;
      entity.z += dz;
      return;
    }
    if (!blocked({ x: entity.x + dx, z: entity.z })) entity.x += dx;
    if (!blocked({ x: entity.x, z: entity.z + dz })) entity.z += dz;
  }

  private hitMonster(
    m: Monster,
    damage: number,
    stagger: number,
    from: Vec,
  ): void {
    const s = this.state;
    if (m.role === "shellback" && Math.cos(bearing(m, from) - m.heading) > 0)
      damage *= 0.65;
    m.health -= damage;
    m.alerted = true;
    m.target ??= "player";
    if (m.role !== "shellback") {
      m.stagger += stagger;
      m.staggerTime = 0.7;
      if (m.stagger >= (m.role === "ramjaw" ? 60 : 40)) {
        m.windup = 0;
        m.lane = null;
        m.recovery = 0.8;
        m.stagger = 0;
        (m as Monster & { repositioning?: boolean }).repositioning = false;
      }
    }
    if (m.health <= 0) {
      const previousDrops = s.drops.length;
      killDrops(s, m, this.random);
      for (const drop of s.drops.slice(previousDrops))
        Object.assign(drop, this.stable(drop));
      s.monsters = s.monsters.filter((other) => other.id !== m.id);
      s.kills++;
    }
  }

  private hurt(damage: number): void {
    const s = this.state;
    if (damage <= 0 || s.status !== "playing") return;
    s.player.health = Math.max(0, s.player.health - damage);
    this.endCast("cancel");
    s.hold = null;
    this.draw();
    if (s.player.health === 0) {
      s.replacedCache = !!s.cache;
      s.cache = {
        ...this.stable(s.player),
        rod: s.rod,
        gunfish: copy(this.activeGun() ?? null),
      };
      this.finish("failure");
    }
  }
  private finish(status: "failure" | "victory"): void {
    const s = this.state;
    s.status = status;
    s.resultTime = 0;
    s.cast = null;
    s.lineLinger = 0;
    s.hold = null;
    s.mounted = [];
    s.projectiles = [];
    s.reload = 0;
    s.bufferedShot = false;
    s.arsenalOpen = false;
    s.notice =
      status === "victory"
        ? "Dawn. You survived."
        : s.replacedCache
          ? "New Recovery cache. The older cache is lost."
          : "Your equipment remains in a Recovery cache.";
    s.prompt = "";
  }

  private combat(dt: number, input: Input): void {
    const s = this.state,
      g = this.activeGun();
    const moving = Math.hypot(input.x ?? 0, input.z ?? 0) > 0.01;
    if (moving) s.hold = null;
    s.sprinting =
      !!input.sprint &&
      !s.arsenalOpen &&
      s.reload <= 0 &&
      !s.hold &&
      !s.cast &&
      s.rodCooldown <= 0;
    s.aiming =
      !!input.aim &&
      !s.sprinting &&
      !s.arsenalOpen &&
      s.reload <= 0 &&
      !s.hold &&
      (s.mode === "combat" || s.mode === "drawing");
    if (s.aiming) {
      s.charge += dt;
      this.complete("aim");
    } else s.charge = 0;
    if (moving && !s.cast) {
      const length = Math.max(1, Math.hypot(input.x ?? 0, input.z ?? 0));
      const speed = s.arsenalOpen
        ? 1.5
        : s.rodCooldown > 0
          ? 2
          : s.sprinting
            ? 9
            : s.aiming
              ? 2.8
              : 5;
      this.move(
        s.player,
        ((input.x ?? 0) / length) * speed * dt,
        ((input.z ?? 0) / length) * speed * dt,
        true,
      );
    }
    if (s.player.y > 0 || s.player.vy > 0) {
      s.player.vy -= dt * 16;
      s.player.y = Math.max(0, s.player.y + s.player.vy * dt);
      if (s.player.y === 0) s.player.vy = 0;
    }
    s.sinceShot += dt;
    if (g?.branch === "Spool" && input.fire && !s.sprinting && !s.reload)
      s.spool = Math.min(1, s.spool + dt / (g.stage === 2 ? 0.4 : 0.75));
    else if (s.sinceShot >= 0.4) s.spool = 0;
    if (s.reload > 0 && g) {
      if (input.fire || input.sprint) {
        s.reload = 0;
        this.reload();
      } else {
        s.reload = Math.max(0, s.reload - dt);
        if (s.reload < 1e-9) {
          s.reload = 0;
          const stats = gunStats(g),
            count = Math.min(
              stats.magazine - g.magazine,
              s.reserves[stats.ammo],
              g.species === "shotgun" ? 1 : Infinity,
            );
          g.magazine += count;
          s.reserves[stats.ammo] -= count;
          if (g.species === "shotgun") this.reload();
        }
      }
    } else if (!s.arsenalOpen && !s.hold) {
      if (input.fire && g?.species === "rifle") {
        if (s.mode === "drawing" && s.transition < 0.46) s.bufferedShot = true;
        else this.fire();
      }
      if (g && g.magazine === 0 && !s.sprinting) this.reload();
    }
  }

  private monsters(dt: number): void {
    const s = this.state;
    for (const m of s.monsters) {
      const stats = MONSTERS[m.role];
      const navigation = m as Monster & { roamGoal?: Vec; waypoint?: Vec };
      m.staggerTime = Math.max(0, m.staggerTime - dt);
      if (m.staggerTime === 0) m.stagger = 0;
      if (
        m.target &&
        m.target !== "player" &&
        !s.mounted.some((t) => t.id === m.target)
      ) {
        m.target = null;
        m.alerted = false;
      }
      const target = s.mounted.find((t) => t.id === m.target) ?? s.player;
      if (m.alerted && distance(m, target) > 55 && !this.los(m, target)) {
        m.lost += dt;
        if (m.lost >= 4) {
          m.alerted = false;
          m.target = null;
          m.lost = 0;
          m.lane = null;
          m.windup = 0;
          (m as Monster & { repositioning?: boolean }).repositioning = false;
        }
      } else if (this.los(m, target)) m.lost = 0;
      if (m.recovery > 0) {
        m.recovery = Math.max(0, m.recovery - dt);
        continue;
      }
      if (m.windup > 0) {
        m.windup = Math.max(0, m.windup - dt);
        if (m.windup < 1e-9 && m.lane) {
          m.windup = 0;
          const maneuver = m as Monster & { repositioning?: boolean };
          if (maneuver.repositioning) {
            this.move(m, m.lane.x - m.x, m.lane.z - m.z);
            maneuver.repositioning = false;
          } else {
            const direction = bearing(m, m.lane);
            const speed =
              m.role === "spitter" ? 15 : m.role === "ramjaw" ? 22 : 14;
            const reach =
              m.role === "spitter"
                ? 60
                : m.role === "shellback"
                  ? 10
                  : stats.range + 1;
            const pitch =
              m.role === "spitter"
                ? Math.atan2(
                    terrainHeight(m.lane) +
                      (target === s.player ? s.player.y : 0) -
                      terrainHeight(m),
                    distance(m, m.lane),
                  )
                : 0;
            s.projectiles.push({
              id: this.id("attack"),
              x: m.x,
              z: m.z,
              y: terrainHeight(m) + 1.15,
              vx: Math.sin(direction) * Math.cos(pitch) * speed,
              vy: Math.sin(pitch) * speed,
              vz: Math.cos(direction) * Math.cos(pitch) * speed,
              life: reach / speed,
              damage: stats.damage,
              hostile: true,
              radius:
                m.role === "shellback" ? 2.2 : m.role === "ramjaw" ? 1 : 0.5,
              pierce: 0,
              stagger: 0,
              traveled: 0,
              hit: [],
              owner: `${m.id}|${m.role}`,
            });
          }
          m.lane = null;
          m.recovery = stats.recovery;
        }
        continue;
      }
      if (!m.alerted && !navigation.roamGoal) {
        this.move(
          m,
          Math.sin(m.heading) * stats.speed * dt,
          Math.cos(m.heading) * stats.speed * dt,
        );
        if (
          this.solid(
            {
              x: m.x + Math.sin(m.heading) * 2,
              z: m.z + Math.cos(m.heading) * 2,
            },
            0.7,
          )
        )
          m.heading += Math.PI / 2;
        continue;
      }
      const destination = m.alerted ? target : navigation.roamGoal!;
      m.heading = bearing(m, destination);
      if (
        m.alerted &&
        m.role === "spitter" &&
        distance(m, target) < 4 &&
        !m.repositioned
      ) {
        const point = this.stable({
          x: m.x - Math.sin(m.heading) * 6,
          z: m.z - Math.cos(m.heading) * 6,
        });
        if (this.los(m, point)) {
          m.lane = point;
          m.windup = 0.6;
          m.repositioned = true;
          (m as Monster & { repositioning?: boolean }).repositioning = true;
          continue;
        }
      }
      if (
        m.alerted &&
        distance(m, target) <= stats.range &&
        this.los(m, target)
      ) {
        m.lane = { x: target.x, z: target.z };
        m.windup = stats.windup;
        continue;
      }
      let heading = m.heading;
      if (this.los(m, destination)) navigation.waypoint = undefined;
      else {
        if (!navigation.waypoint || distance(m, navigation.waypoint) < 0.5)
          navigation.waypoint = this.route(m, destination).waypoint;
        heading = bearing(m, navigation.waypoint);
      }
      const look = {
        x: m.x + Math.sin(heading) * 2,
        z: m.z + Math.cos(heading) * 2,
      };
      if (this.solid(look, 0.65)) {
        const alternatives = [heading + Math.PI / 2, heading - Math.PI / 2];
        heading =
          alternatives.find(
            (a) =>
              !this.solid(
                { x: m.x + Math.sin(a) * 2, z: m.z + Math.cos(a) * 2 },
                0.65,
              ),
          ) ?? heading;
      }
      this.move(
        m,
        Math.sin(heading) * stats.speed * dt,
        Math.cos(heading) * stats.speed * dt,
      );
      if (!m.alerted && distance(m, destination) < 1)
        navigation.roamGoal = undefined;
    }
  }

  private projectiles(dt: number): void {
    const s = this.state;
    for (const p of [...s.projectiles]) {
      if (s.status !== "playing") break;
      const from = { x: p.x, y: p.y, z: p.z };
      const advance = Math.min(dt, p.life);
      p.x += p.vx * advance;
      p.y += p.vy * advance;
      p.z += p.vz * advance;
      p.life -= dt;
      const previous = p.traveled;
      p.traveled += distance(from, p);
      const [owner, branch, stage, pulse] = p.owner.split("|");
      const groundAttack = p.hostile && branch !== "spitter";
      if (groundAttack) p.y = terrainHeight(p) + 1.15;
      else {
        // Sample the swept path, not just its end, so shots cannot cross a ridge.
        const steps = Math.max(
          1,
          Math.ceil(Math.hypot(distance(from, p), p.y - from.y) / 0.2),
        );
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const point = {
            x: from.x + (p.x - from.x) * t,
            z: from.z + (p.z - from.z) * t,
          };
          if (from.y + (p.y - from.y) * t <= terrainHeight(point) + p.radius) {
            p.y = from.y + (p.y - from.y) * t;
            Object.assign(p, point);
            p.life = 0;
            break;
          }
        }
        if (from.y <= terrainHeight(from) + p.radius) continue;
      }
      if (branch === "Slug" && stage === "2" && previous < 8 && p.traveled >= 8)
        p.damage *= 1.3;
      const targets: (Vec & { id: string })[] = p.hostile
        ? [
            ...(!groundAttack || s.player.y < 1.1
              ? [{ ...s.player, id: "player" }]
              : []),
            ...s.mounted,
          ]
        : [...s.monsters];
      targets.sort((a, b) => distance(from, a) - distance(from, b));
      for (const target of targets) {
        const center = {
          ...target,
          y:
            terrainHeight(target) +
            (target.id === "player" ? s.player.y : 0) +
            1.15,
        };
        if (
          p.hit.includes(target.id) ||
          segmentDistance(center, from, p) >
            p.radius + (target.id === "player" ? 0.5 : 0.9) ||
          !this.los(from, target)
        )
          continue;
        if (p.hostile) {
          if (target.id === "player") {
            this.hurt(p.damage);
            if (s.status !== "playing") return;
          } else {
            const mounted = s.mounted.find((m) => m.id === target.id);
            if (mounted) mounted.health -= p.damage;
          }
        } else {
          const m = s.monsters.find((m) => m.id === target.id);
          if (!m) continue;
          this.hitMonster(m, p.damage, p.stagger, from);
          if (
            owner !== "player" &&
            (!m.target || m.target === "player") &&
            s.mounted.some((t) => t.id === owner)
          ) {
            m.target = owner;
            m.alerted = true;
          }
          if (branch === "Hammer" && stage === "2" && pulse === "pulse") {
            for (const nearby of s.monsters)
              if (nearby.id !== m.id && distance(m, nearby) < 4)
                this.hitMonster(nearby, 0, 60, from);
          }
        }
        p.hit.push(target.id);
        if (p.pierce <= 0 || (branch === "Slug" && p.traveled < 8)) {
          p.life = 0;
          break;
        }
        p.pierce--;
        if (branch === "Sweeper") p.damage *= 0.5;
        if (branch === "Spool") p.damage *= 0.6;
      }
      if (!this.los(from, p) || this.solid(p)) p.life = 0;
      if (p.hostile && (branch === "ramjaw" || branch === "skitter")) {
        const attacker = s.monsters.find((m) => m.id === owner);
        if (attacker) this.move(attacker, p.x - attacker.x, p.z - attacker.z);
      }
    }
    s.projectiles = s.projectiles.filter((p) => p.life > 1e-9);
    s.mounted = s.mounted.filter((m) => m.health > 0);
  }

  private commitments(dt: number): void {
    const s = this.state,
      hold = s.hold;
    if (!hold) return;
    const target = s.mounted.find((m) => m.id === hold.target);
    if (
      (hold.kind === "recover" &&
        (!s.cache || distance(s.player, s.cache) >= 3)) ||
      (hold.kind === "service" && (!target || distance(s.player, target) >= 3))
    ) {
      s.hold = null;
      return;
    }
    hold.elapsed += dt;
    if (hold.elapsed < hold.duration - 1e-9) return;
    s.hold = null;
    if (hold.kind === "recover" && s.cache) {
      s.rod = Math.max(s.rod, s.cache.rod);
      if (s.cache.gunfish) {
        const g = copy(s.cache.gunfish);
        g.magazine = gunStats(g).magazine;
        s.arsenal.push(g);
      }
      s.cache = null;
      updatePower(s);
      s.notice = "Recovery cache reclaimed";
      s.noticeTime = 3;
      return;
    }
    if (hold.kind === "mount") {
      const g = this.activeGun();
      const p = {
        x: s.player.x + Math.sin(s.player.heading) * 2,
        z: s.player.z + Math.cos(s.player.heading) * 2,
      };
      if (
        !g ||
        g.id !== hold.target ||
        this.solid(p, 0.7) ||
        s.mounted.some((m) => distance(m, p) < 2)
      )
        return;
      updatePower(s);
      const health = gunStats(g).durability;
      s.mounted.push({
        ...p,
        id: this.id("mounted"),
        gunfish: g,
        health,
        maxHealth: health,
        fuel: 0,
        cooldown: 0,
        charge: 0,
        shots: (g as Gunfish & { shots?: number }).shots ?? 0,
      });
      s.arsenal = s.arsenal.filter((other) => other.id !== g.id);
      s.slots = s.slots.map((id) =>
        id === g.id ? null : id,
      ) as RunState["slots"];
      if (s.slots[1 - s.active]) s.active = 1 - s.active;
      s.reload = 0;
      s.charge = 0;
      s.spool = 0;
      this.draw();
      return;
    }
    const beer = s.supplies.indexOf("beer");
    if (beer < 0) return;
    if (hold.kind === "drink")
      s.player.health = Math.min(100, s.player.health + 35);
    else if (target) {
      if (target.health < target.maxHealth)
        target.health = Math.min(
          target.maxHealth,
          target.health + target.maxHealth * 0.4,
        );
      else target.fuel = Math.min(20, target.fuel + 10);
    } else return;
    s.supplies.splice(beer, 1);
  }

  private defenders(dt: number): void {
    const s = this.state;
    for (const mounted of s.mounted) {
      const live = mounted as Mounted & {
        targetId?: string;
        spool?: number;
        sinceShot?: number;
      };
      mounted.cooldown = Math.max(0, mounted.cooldown - dt);
      live.sinceShot = (live.sinceShot ?? 0) + dt;
      const target = s.monsters
        .filter((m) => distance(m, mounted) < 45 && this.los(mounted, m))
        .sort((a, b) => distance(mounted, a) - distance(mounted, b))[0];
      if (!target || (mounted.gunfish.magazine <= 0 && mounted.fuel <= 0)) {
        mounted.charge = 0;
        live.targetId = undefined;
        if (live.sinceShot >= 0.4) live.spool = 0;
        continue;
      }
      const g = mounted.gunfish;
      if (live.targetId !== target.id) {
        mounted.charge = 0;
        live.targetId = target.id;
      }
      mounted.charge += dt;
      live.spool = Math.min(
        1,
        (live.spool ?? 0) + dt / (g.stage === 2 ? 0.4 : 0.75),
      );
      if (
        g.branch === "Deadeye" &&
        g.stage &&
        mounted.charge < (g.stage === 2 ? 0.4 : 0.6) - 1e-9
      )
        continue;
      if (mounted.cooldown > 1e-9) continue;
      const rate =
        gunStats(g).rate * (g.branch === "Spool" ? 1 + live.spool * 0.5 : 1);
      const rounds = g.branch === "Fanfire" && g.stage ? g.stage + 1 : 1;
      for (let i = 0; i < rounds; i++) {
        if (g.magazine > 0) g.magazine--;
        else if (mounted.fuel > 0)
          mounted.fuel = Math.max(0, mounted.fuel - 1 / rate / rounds);
        else break;
        mounted.shots++;
        (g as Gunfish & { shots?: number }).shots = mounted.shots;
        this.shoot(
          g,
          mounted,
          bearing(mounted, target),
          mounted.id,
          false,
          mounted.charge,
          live.spool,
          mounted.shots,
          Math.atan2(
            terrainHeight(target) - terrainHeight(mounted),
            distance(mounted, target),
          ),
        );
      }
      mounted.cooldown = 1 / rate;
      mounted.charge = 0;
      live.sinceShot = 0;
      this.noise(mounted, mounted.id);
    }
  }

  private director(dt: number): void {
    const s = this.state;
    const phase = Math.min(
      3,
      Math.max(
        0,
        PHASES.findIndex((p) => s.elapsed < p.end - 1e-8),
      ),
    );
    if (phase !== s.phase) {
      s.phase = phase;
      s.lull = 20;
      s.refill = null;
      s.guaranteedRole =
        phase === 1 ? "spitter" : phase === 2 ? "shellback" : null;
      s.notice = [
        "First Light",
        "The water carries their calls",
        "Heavy footsteps below",
        "Hold until dawn",
      ][phase];
      s.noticeTime = 4;
      return;
    }
    let refillNow = false;
    if (s.lull > 0) {
      s.lull = Math.max(0, s.lull - dt);
      if (s.lull > 1e-8) return;
      s.lull = 0;
      refillNow = true;
    }
    if (s.catches === 0) return;
    const offCamera = (p: Vec) =>
      Math.cos(bearing(s.player, p) - s.player.heading) < 0.35;
    const region = Math.max(360, s.threat + 160);
    s.monsters = s.monsters.filter(
      (m) =>
        m.alerted ||
        distance(m, s.player) < region + 90 ||
        !offCamera(m) ||
        this.los(s.player, m),
    );
    const local = s.monsters.filter((m) => distance(m, s.player) <= region);
    const config = PHASES[s.phase],
      band = s.power >= 16 ? 2 : s.power >= 8 ? 1 : 0;
    const vacancies = config.target + (band === 2 ? 1 : 0) - local.length;
    if (vacancies <= 0) {
      s.refill = null;
      return;
    }
    if (!refillNow) {
      if (s.refill === null)
        s.refill =
          config.delayStart +
          (config.delayEnd - config.delayStart) *
            clamp(
              (s.elapsed - config.start) / (config.end - config.start),
              0,
              1,
            );
      s.refill = Math.max(0, s.refill - dt);
      if (s.refill > 1e-8) return;
    }
    const choices = MIXES[s.phase][band];
    let roll =
      this.random() * choices.reduce((sum, choice) => sum + choice.weight, 0);
    const mix =
      choices.find((choice) => (roll -= choice.weight) <= 0) ?? choices[0];
    const desired = [...mix.roles];
    for (const m of local) {
      const index = desired.indexOf(m.role);
      if (index >= 0) desired.splice(index, 1);
    }
    if (s.guaranteedRole) {
      const index = desired.indexOf(s.guaranteedRole);
      if (index >= 0) desired.splice(index, 1);
      desired.unshift(s.guaranteedRole);
    }
    for (let i = 0; i < vacancies; i++) {
      let point: Vec | null = null;
      for (
        let attempt = 0;
        attempt < OBSTACLES.length + 48 && !point;
        attempt++
      ) {
        let candidate: Vec;
        if (attempt < OBSTACLES.length) {
          const o = OBSTACLES[attempt],
            angle = bearing(s.player, o),
            radius = Math.max(65, distance(s.player, o) + 20, s.threat + 10);
          candidate = {
            x: s.player.x + Math.sin(angle) * radius,
            z: s.player.z + Math.cos(angle) * radius,
          };
        } else {
          const angle = this.random() * Math.PI * 2,
            radius = Math.max(65, s.threat + 10) + this.random() * 100;
          candidate = {
            x: s.player.x + Math.sin(angle) * radius,
            z: s.player.z + Math.cos(angle) * radius,
          };
        }
        if (
          distance(candidate, s.player) <= region - 10 &&
          distance(candidate, s.player) > s.threat &&
          offCamera(candidate) &&
          !this.solid(candidate, 1) &&
          !this.los(s.player, candidate) &&
          !s.monsters.some((m) => distance(m, candidate) < 3)
        )
          point = candidate;
      }
      if (!point) {
        s.refill = 1;
        return;
      }
      const role =
        desired[i] ?? mix.roles[Math.floor(this.random() * mix.roles.length)];
      // Roam toward this fixed entry destination, not the player's future position.
      const m = this.monster(role, point);
      m.heading = bearing(point, s.player);
      s.monsters.push(
        Object.assign(m, { roamGoal: { x: s.player.x, z: s.player.z } }),
      );
      if (role === s.guaranteedRole) s.guaranteedRole = null;
    }
    s.refill = null;
  }

  step(dt: number, input: Input = {}): void {
    if (!Number.isFinite(dt) || dt < 0) return;
    const s = this.state;
    if (s.status !== "playing") {
      s.resultTime += dt;
      return;
    }
    // Victory priority belongs to the public update, not its integration substeps.
    if (s.elapsed + dt >= 900 - 1e-8 && s.player.health > 0) {
      s.elapsed = 900;
      this.finish("victory");
      return;
    }
    if (input.heading !== undefined && Number.isFinite(input.heading))
      s.player.heading = input.heading;
    if (input.pitch !== undefined && Number.isFinite(input.pitch))
      s.player.pitch = clamp(input.pitch, -Math.PI / 2, Math.PI / 2);
    if (dt === 0) {
      this.combat(0, input);
      return;
    }
    let remaining = Math.min(dt, 900 - s.elapsed);
    while (remaining > 1e-9 && s.status === "playing") {
      let part = Math.min(0.02, remaining, 900 - s.elapsed);
      const phaseEnd = PHASES[s.phase]?.end;
      if (phaseEnd && phaseEnd > s.elapsed + 1e-8)
        part = Math.min(part, phaseEnd - s.elapsed);
      if (s.mode === "drawing") {
        const boundary = s.transition < 0.46 - 1e-9 ? 0.46 : 0.68;
        part = Math.min(part, Math.max(1e-9, boundary - s.transition));
      }
      if (s.mode === "returning")
        part = Math.min(part, Math.max(1e-9, 0.68 - s.transition));
      const world = part * (s.mode === "drawing" ? 0.35 : 1);
      s.elapsed += part;
      remaining -= part;
      // Timer priority is applied before any damage or catch outcome in this tick.
      if (s.elapsed >= 900 - 1e-8) {
        s.elapsed = 900;
        this.finish("victory");
        break;
      }
      s.lineLinger = Math.max(0, s.lineLinger - part);
      s.noticeTime = Math.max(0, s.noticeTime - part);
      s.fireCooldown = Math.max(0, s.fireCooldown - world);
      s.rodCooldown = Math.max(0, s.rodCooldown - world);
      this.combat(world, input);
      this.fishing(world, input);
      this.detect();
      this.monsters(world);
      this.defenders(world);
      this.projectiles(world);
      if (this.scenario.damage && s.status === "playing")
        this.hurt(this.scenario.damage(s, world));
      if (s.status !== "playing") break;
      this.commitments(world);
      this.director(part);
      if (s.mode === "drawing" || s.mode === "returning") {
        s.transition += part;
        if (
          s.mode === "drawing" &&
          s.transition >= 0.46 - 1e-9 &&
          s.bufferedShot
        ) {
          s.bufferedShot = false;
          this.fire();
        }
        if (s.transition >= 0.68 - 1e-9) {
          s.mode = s.mode === "drawing" ? "combat" : "fishing";
          s.transition = 0.68;
        }
      }
      this.prompt();
    }
  }
}
import { coastPoint, onIsland } from "./geography";
