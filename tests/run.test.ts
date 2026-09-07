import { describe, expect, it } from "vitest";
import { Run } from "../src/run";
import { CATCHING, catchingPosition, catchingWidth, MONSTERS, terrainHeight } from "../src/content";
import type {
  Cast,
  Fish,
  Gunfish,
  Monster,
  Mounted,
  Scenario,
} from "../src/types";

const gun = (id = "held", species: Gunfish["species"] = "pistol"): Gunfish => ({
  id,
  species,
  rarity: 1,
  magazine: species === "pistol" ? 8 : species === "rifle" ? 24 : 5,
  ranks: { damage: 0, rate: 0, magazine: 0 },
  branch: null,
  stage: 0,
});
const fish = (rarity = 1): Fish => ({
  id: "visible",
  x: 0,
  z: 12,
  home: { x: 0, z: 12 },
  species: "pistol",
  rarity,
  interest: 0,
  cooldown: 0,
  landed: false,
});
const monster = (role: Monster["role"] = "skitter", z = 20): Monster => ({
  id: `enemy-${role}`,
  x: 0,
  z,
  role,
  health: MONSTERS[role].health,
  heading: Math.PI,
  alerted: false,
  target: null,
  windup: 0,
  recovery: 0,
  lane: null,
  lost: 0,
  stagger: 0,
  staggerTime: 0,
  repositioned: false,
});
const hooked = (): Cast => ({
  lure: { x: 0, z: 10 },
  fishId: "visible",
  phase: "catch",
  elapsed: 1,
  hits: 0,
  misses: 0,
  cycle: 0,
  tug: 0,
});
const mounted = (): Mounted => ({
  id: "defender",
  x: 1,
  z: 0,
  gunfish: gun("mounted-gunfish"),
  health: 100,
  maxHealth: 100,
  fuel: 0,
  cooldown: 0,
  charge: 0,
  shots: 0,
});
const quiet = (
  state: Scenario["state"] = {},
  extra: Omit<Scenario, "state"> = {},
) =>
  new Run({
    seed: 7,
    scenario: {
      ...extra,
      state: {
        player: { x: 0, z: 0, y: 0, vy: 0, heading: 0, pitch: 0, health: 100 },
        monsters: [],
        fish: [fish()],
        ...state,
      },
    },
  });

describe("Quarry elevation through Run", () => {
  it("aims mounted and Spitter shots across slopes while lunges follow the surface", () => {
    const run = quiet({ mode: "combat" });
    const basin = run.content().locations[4];
    Object.assign(run.state.player, { x: basin.x, z: basin.z + 20 });
    run.state.mounted = [{ ...mounted(), x: basin.x, z: basin.z + 20 }];
    run.state.monsters = [
      { ...monster("ramjaw"), x: basin.x, z: basin.z + 40, recovery: 10 },
    ];
    run.step(0.02);
    expect(run.state.projectiles[0].vy).toBeGreaterThan(0);
    run.step(0.24);
    expect(run.state.monsters[0].health).toBe(76);
    run.state.mounted = [];
    run.state.projectiles = [];
    run.state.monsters = [
      {
        ...monster("spitter"),
        x: basin.x,
        z: basin.z + 40,
        alerted: true,
        target: "player",
        windup: 0.01,
        lane: { x: basin.x, z: basin.z + 20 },
      },
    ];
    run.step(0.02);
    expect(run.state.projectiles[0].vy).toBeLessThan(0);
    run.step(1.5);
    expect(run.state.player.health).toBe(75);
    run.state.projectiles = [];
    run.state.monsters = [
      {
        ...monster("ramjaw"),
        x: basin.x,
        z: basin.z + 32,
        alerted: true,
        target: "player",
        windup: 0.01,
        lane: { x: basin.x, z: basin.z + 20 },
      },
    ];
    run.act({ type: "jump" });
    run.step(0.3);
    const wave = run.state.projectiles[0];
    expect(wave.y).toBeCloseTo(run.surfaceHeight(wave) + 1.15);
    run.step(0.15);
    expect(run.state.player.health).toBe(75);
  });
  it("fires at world height with manual pitch, rejects wrong-height hits and stops at terrain", () => {
    const run = quiet({
      mode: "combat",
      arsenal: [gun()],
      slots: ["held", null],
    });
    const basin = run.content().locations[4];
    Object.assign(run.state.player, {
      x: basin.x,
      z: basin.z + 45,
      heading: Math.PI,
    });
    expect(run.state.player.pitch).toBe(0);
    run.state.monsters = [
      { ...monster("ramjaw"), x: basin.x, z: basin.z + 25, recovery: 10 },
    ];
    run.act({ type: "fire" });
    expect(run.state.projectiles[0].y).toBeCloseTo(7.15);
    expect(run.state.projectiles[0].vy).toBe(0);
    run.step(0.3);
    expect(run.state.monsters[0].health).toBe(100);
    run.step(0, { pitch: Math.atan2(-4.8, 20), aim: true });
    run.act({ type: "fire" });
    run.step(0.3);
    expect(run.state.monsters[0].health).toBe(76);
    expect(new Run({ saved: run.save() }).state.player.pitch).toBe(
      run.state.player.pitch,
    );
    run.state.projectiles = [];
    Object.assign(run.state.player, { z: basin.z + 20, heading: 0 });
    run.step(0, { pitch: 0 });
    run.act({ type: "fire" });
    run.step(0.2);
    expect(run.state.projectiles).toHaveLength(0);
    run.state.monsters = [
      { ...monster("ramjaw"), x: basin.x, z: basin.z + 23, recovery: 10 },
    ];
    run.state.player.y = 4;
    run.act({ type: "rod" });
    expect(run.state.monsters[0].health).toBe(100);
  });
  it("keeps water and openings flat while walking and jumping over both basin ramps", () => {
    const run = quiet();
    for (const basin of run
      .content()
      .locations.filter((l) => l.region === "Sunken Quarry")) {
      for (const [radius, height] of [
        [0, 0],
        [14, 0],
        [20, 0],
        [32.5, 3],
        [45, 6],
        [60, 6],
        [80, 3],
        [100, 0],
      ]) {
        const point = { x: basin.x, z: basin.z + radius };
        expect(run.surfaceHeight(point)).toBeCloseTo(height);
        expect(terrainHeight(point)).toBeCloseTo(height);
      }
      Object.assign(run.state.player, { x: basin.x, z: basin.z + 20 });
      run.step(5, { z: 1 });
      expect(run.surfaceHeight(run.state.player)).toBeCloseTo(6);
      expect(run.state.player.y).toBe(0);
      run.act({ type: "jump" });
      run.step(0.2);
      expect(run.state.player.y).toBeGreaterThan(0);
      run.step(1);
      expect(run.state.player.y).toBe(0);
    }
    for (const pocket of run.content().pockets)
      expect(run.surfaceHeight(pocket)).toBe(0);
    for (const f of new Run({ seed: 2048 }).state.fish)
      expect(run.surfaceHeight(f)).toBe(0);
  });
});

describe("Fishing and Tactical dip", () => {
  it("attracts fish from farther away within three seconds of gentle luring", () => {
    const run = quiet();
    run.act({ type: "cast", point: { x: 0, z: 4 } });
    for (let i = 0; i < 10 && run.state.cast?.phase === "lure"; i++) {
      run.act({ type: "tug", x: i % 2 ? -0.1 : 0.1, z: 0 });
      run.step(0.3);
    }
    expect(run.state.cast?.phase).toBe("catch");
    expect(run.state.elapsed).toBeLessThanOrEqual(3.01);
  });
  it("swings both ways and allows waiting for another pass after save/resume", () => {
    expect(catchingPosition(0)).toBe(0);
    expect(catchingPosition(CATCHING.cycle / 2)).toBe(1);
    expect(catchingPosition(CATCHING.cycle)).toBe(0);
    const run = quiet({ cast: hooked() });
    run.step(CATCHING.cycle * 3);
    expect(run.state.cast?.misses).toBe(0);
    const resumed = new Run({ saved: run.save() });
    resumed.step(CATCHING.cycle - CATCHING.center);
    resumed.act({ type: "catch" });
    expect(resumed.state.cast?.hits).toBe(1);
  });
  it("accepts target edges in both directions across rarities and rod tiers", () => {
    for (const rarity of [1, 2, 3]) {
      for (const rod of [1, 2, 3]) {
        const width = catchingWidth(rarity, rod);
        for (const center of [CATCHING.center, CATCHING.cycle - CATCHING.center]) {
          for (const side of [-1, 1]) {
            const edge = center + side * width / 2;
            const run = quiet({ rod, fish: [fish(rarity)], cast: { ...hooked(), cycle: edge } });
            run.act({ type: "catch" });
            expect(run.state.cast?.hits).toBe(1);
            run.state.cast!.cycle = edge + side * 0.001;
            run.act({ type: "catch" });
            expect(run.state.cast?.misses).toBe(1);
          }
        }
      }
    }
  });
  it("keeps a rotated unit tug gentle despite floating-point rounding", () => {
    const run = quiet();
    run.act({ type: "cast", point: { x: 0, z: 10 } });
    run.act({ type: "tug", x: -Math.cos(0.036), z: Math.sin(0.036) });
    expect(run.view().fish[0].cooldown).toBe(0);
    expect(
      Math.hypot(run.view().cast!.lure.x, run.view().cast!.lure.z - 10),
    ).toBeCloseTo(0.25);
  });
  it("rewards gentle spatial lure play with a timed catch and first-primary teaching shot", () => {
    const run = quiet();
    run.act({ type: "cast", point: { x: 0, z: 10 } });
    for (let i = 0; i < 40 && run.state.cast?.phase === "lure"; i++) {
      run.act({ type: "tug", x: 0.1, z: 0 });
      run.step(0.3);
    }
    expect(run.state.cast?.phase).toBe("catch");
    expect(run.state.monsters).toHaveLength(0);
    expect(run.state.refill).toBeNull();
    for (let i = 0; i < 3; i++) {
      run.step(0.72 - (run.state.cast?.cycle ?? 0));
      run.act({ type: "catch" });
    }
    expect(run.state.catches).toBe(1);
    expect(run.state.fish[0].landed).toBe(true);
    expect(run.state.mode).toBe("drawing");
    expect(run.state.slots[0]).toBe(run.state.arsenal[0].id);
    expect(run.state.threat).toBeGreaterThan(12);
    run.step(0.46);
    expect(run.state.arsenal[0].magazine).toBe(7);
    expect(run.state.shots).toBe(1);
    const resumed = new Run({ saved: run.save() });
    resumed.step(30);
    expect(resumed.state.monsters.length).toBeGreaterThan(0);
  });

  it("draw cancels immediately, preserves Threat and bearing, and buffers one early shot", () => {
    const run = quiet({ arsenal: [gun()], slots: ["held", null] });
    run.act({ type: "cast", point: { x: 0, z: 10 } });
    run.step(1);
    const threat = run.state.threat;
    run.step(0, { heading: 1.2 });
    run.act({ type: "draw" });
    expect(run.state.cast).toBeNull();
    expect(run.state.threat).toBe(threat);
    expect(run.state.lineLinger).toBeCloseTo(0.1);
    run.act({ type: "fire" });
    run.act({ type: "fire" });
    run.step(0.459);
    expect(run.state.shots).toBe(0);
    run.step(0.001);
    expect(run.state.shots).toBe(1);
    run.step(0.22);
    expect(run.state.mode).toBe("combat");
    expect(run.state.player.heading).toBe(1.2);
    expect(run.state.elapsed).toBeCloseTo(1.68);
  });
  it("resets the consecutive miss sequence on success without adding discrete Threat", () => {
    const run = quiet({ cast: hooked() });
    run.act({ type: "catch" });
    run.step(0.72);
    const threat = run.state.threat;
    run.act({ type: "catch" });
    expect(run.state.threat).toBe(threat);
    run.act({ type: "catch" });
    expect(run.state.cast).not.toBeNull();
    run.act({ type: "catch" });
    expect(run.state.cast).toBeNull();
    expect(run.state.threat).toBe(threat + 7);
    expect(run.state.fish[0].cooldown).toBeGreaterThan(10);
  });
  it("makes rarer timing windows smaller and applies final enlarged-radius detection through cover", () => {
    const common = quiet({ cast: { ...hooked(), cycle: 0.92 } });
    common.act({ type: "catch" });
    const rare = quiet({ cast: { ...hooked(), cycle: 0.92 }, fish: [fish(3)] });
    rare.act({ type: "catch" });
    expect(common.state.cast?.hits).toBe(1);
    expect(rare.state.cast?.misses).toBe(1);
    const run = quiet(
      {
        cast: { ...hooked(), hits: 2, cycle: 0.72 },
        monsters: [monster("skitter", 16)],
      },
      { lineOfSight: () => false },
    );
    run.act({ type: "catch" });
    expect(run.state.monsters[0].alerted).toBe(true);
    expect(run.state.threat).toBe(17);
    expect(run.state.arsenal[0].rarity).toBe(1);
  });
  it("damage cancels a hooked fish immediately without an outcome spike", () => {
    const run = quiet({ cast: hooked() }, { damage: () => 1 });
    run.step(0.02);
    expect(run.state.cast).toBeNull();
    expect(run.state.threat).toBeCloseTo(12.012);
    expect(run.state.fish[0].cooldown).toBe(3);
  });
  it("stores later catches without replacing or firing the previously active Gunfish", () => {
    const run = quiet({
      cast: { ...hooked(), hits: 2, cycle: 0.72 },
      arsenal: [gun("recovered")],
      slots: ["recovered", null],
    });
    run.act({ type: "catch" });
    run.step(0.68);
    expect(run.state.slots).toEqual(["recovered", null]);
    expect(run.state.shots).toBe(0);
    expect(run.state.arsenal.map((g) => g.magazine)).toEqual([8, 8]);
  });
  it("gates conflicting inputs throughout the return to Fishing mode", () => {
    const run = quiet({
      mode: "combat",
      arsenal: [gun()],
      slots: ["held", null],
    });
    run.act({ type: "fish" });
    run.act({ type: "fire" });
    run.act({ type: "cast", point: { x: 0, z: 10 } });
    run.step(0.679);
    expect(run.state.cast).toBeNull();
    expect(run.state.shots).toBe(0);
    run.step(0.001);
    run.act({ type: "cast", point: { x: 0, z: 10 } });
    expect(run.state.cast).not.toBeNull();
  });
  it("keeps the urgent Cast prompt readable until cancellation, then dismisses it permanently", () => {
    const run = quiet({ monsters: [monster("skitter", 30)], threat: 35 });
    run.act({ type: "cast", point: { x: 0, z: 10 } });
    run.step(0.1);
    expect(run.state.prompt).toContain("cancel the Cast now");
    run.step(0.5);
    expect(run.state.prompt).toContain("cancel the Cast now");
    run.act({ type: "cancel" });
    expect(run.state.completed).toContain("danger");
  });
  it("rejects casts through cover and bounds repeated tugs rather than freely steering", () => {
    const blocked = quiet({}, { lineOfSight: () => false });
    blocked.act({ type: "cast", point: { x: 0, z: 10 } });
    expect(blocked.state.cast).toBeNull();
    const run = quiet();
    run.act({ type: "cast", point: { x: 0, z: 10 } });
    for (let i = 0; i < 100; i++) run.act({ type: "tug", x: 1, z: 0 });
    expect(run.state.cast?.lure.x).toBe(0.25);
    for (let i = 0; i < 30; i++) {
      run.step(0.2);
      run.act({ type: "tug", x: 0, z: -1, strong: true });
    }
    expect(
      Math.hypot(run.state.cast!.lure.x, run.state.cast!.lure.z - 10),
    ).toBeLessThanOrEqual(2);
    const resumed = new Run({ saved: run.save() });
    for (let i = 0; i < 5; i++) {
      resumed.step(0.2);
      resumed.act({ type: "tug", x: 0, z: -1, strong: true });
    }
    expect(resumed.state.cast?.lure).toEqual(run.state.cast?.lure);
  });
});

describe("Run persistence and opening", () => {
  it("resumes equipment and time but requires a fresh hold after reopening", () => {
    const run = quiet({
      mode: "combat",
      arsenal: [gun()],
      slots: ["held", null],
    });
    run.act({ type: "mount" });
    run.step(0.8);
    const resumed = new Run({ saved: run.save() });
    resumed.step(1);
    expect(resumed.view().mounted).toHaveLength(0);
    expect(resumed.view().arsenal).toHaveLength(1);
    expect(resumed.view().elapsed).toBeCloseTo(1.8);
    resumed.act({ type: "mount" });
    resumed.step(1.25);
    expect(resumed.view().mounted).toHaveLength(1);
  });
  it("resumes the same character, seeded world and clock", () => {
    const run = new Run({ seed: 42 });
    run.step(3);
    expect(run.state.elapsed).toBeCloseTo(3);
    const resumed = new Run({ saved: run.save() });
    expect(resumed.view()).toEqual(run.view());
    resumed.step(1);
    run.step(1);
    expect(resumed.view()).toEqual(run.view());
  });
  it("keeps recovered and newly seeded Gunfish identities distinct across Runs", () => {
    const previous = new Run({ seed: 42 });
    const id = previous.state.fish[0].id;
    const run = new Run({
      seed: 42,
      scenario: { cache: { x: 0, z: 0, rod: 1, gunfish: gun(id) } },
    });
    expect(run.state.fish.some((f) => f.id === id)).toBe(false);
  });
  it("offers two isolated common species in water without initial monsters", () => {
    for (const seed of [1, 512, 1024, 1536, 2048, 1800]) {
      const run = new Run({ seed });
      const nearby = run.state.fish.filter(
        (f) =>
          Math.hypot(f.x - run.state.player.x, f.z - run.state.player.z) < 20,
      );
      expect(
        new Set(nearby.filter((f) => f.rarity === 1).map((f) => f.species))
          .size,
      ).toBeGreaterThanOrEqual(2);
      for (const f of nearby)
        expect(
          run
            .content()
            .locations.some((l) => Math.hypot(f.x - l.x, f.z - l.z) < 14),
        ).toBe(true);
      const pair = [...nearby]
        .sort(
          (a, b) =>
            Math.hypot(a.x - run.state.player.x, a.z - run.state.player.z) -
            Math.hypot(b.x - run.state.player.x, b.z - run.state.player.z),
        )
        .slice(0, 2);
      for (const f of pair)
        expect(
          run.state.fish.every(
            (other) =>
              other.id === f.id ||
              Math.hypot(other.x - f.x, other.z - f.z) >= 8,
          ),
        ).toBe(true);
      expect(run.state.monsters).toHaveLength(0);
    }
  });
});

describe("Run survival boundary", () => {
  it("locks victory at an already-reached deadline even on a zero-duration update", () => {
    const run = quiet({ elapsed: 900 }, { damage: () => 100 });
    run.step(0);
    expect(run.state.status).toBe("victory");
  });
  it("gives victory priority across the entire public update, not only its last substep", () => {
    const run = quiet(
      { elapsed: 899.5, cast: hooked() },
      { damage: () => 100 },
    );
    run.step(0.5);
    expect(run.state.status).toBe("victory");
    expect(run.state.player.health).toBe(100);
    expect(run.state.cache).toBeNull();
    expect(run.state.catches).toBe(0);
  });
  it("starts the clock immediately and victory takes precedence over same-update lethal damage", () => {
    const run = new Run({
      seed: 1,
      scenario: { state: { elapsed: 899.99 }, damage: () => 100 },
    });
    run.step(0.02);
    expect(run.view().status).toBe("victory");
    expect(run.view().elapsed).toBe(900);
    const saved = JSON.parse(run.save());
    run.step(10);
    expect({ ...run.view(), resultTime: 0 }).toEqual({
      ...saved,
      resultTime: 0,
    });
    expect(run.view().resultTime).toBe(10);
  });
  it("ends an unfinished Cast unlanded at victory and rejects all post-result gameplay", () => {
    const run = quiet({
      elapsed: 899.99,
      cast: { ...hooked(), hits: 2, cycle: 0.72 },
      lineLinger: 0.1,
      mounted: [mounted()],
    });
    run.step(0.02);
    run.act({ type: "catch" });
    run.act({ type: "next" });
    expect(run.state.status).toBe("victory");
    expect(run.state.cast).toBeNull();
    expect(run.state.lineLinger).toBe(0);
    expect(run.state.arsenal).toHaveLength(0);
    expect(run.state.mounted).toHaveLength(0);
    expect(run.state.catches).toBe(0);
  });
  it("locks death before the deadline and replaces the cache with only active equipment", () => {
    const held = gun();
    held.ranks.damage = 2;
    const run = quiet(
      {
        elapsed: 899,
        arsenal: [held, gun("stored")],
        slots: ["held", null],
        rod: 3,
        cache: { x: 20, z: 20, rod: 2, gunfish: gun("old") },
      },
      { damage: () => 100 },
    );
    run.step(0.02);
    expect(run.state.status).toBe("failure");
    expect(run.state.replacedCache).toBe(true);
    expect(run.state.cache?.gunfish).toEqual(held);
    expect(run.state.cache?.rod).toBe(3);
    run.act({ type: "next" });
    expect(run.state.status).toBe("playing");
    expect(run.state.elapsed).toBe(0);
    expect(run.state.threat).toBe(12);
    expect(run.state.arsenal).toEqual([]);
    expect(run.state.cache?.gunfish?.id).toBe("held");
  });
  it("does not advance a lunge or any later projectile after lethal lock", () => {
    const enemy = {
      ...monster("skitter", 2),
      alerted: true,
      target: "player",
      recovery: 10,
    };
    const run = quiet({
      monsters: [enemy],
      player: { x: 0, z: 0, y: 0, vy: 0, heading: 0, pitch: 0, health: 1 },
      projectiles: [
        {
          id: "lethal",
          x: 0,
          y: 1.15,
          z: 1,
          vx: 0,
          vy: 0,
          vz: -14,
          life: 1,
          damage: 20,
          hostile: true,
          radius: 0.5,
          pierce: 0,
          stagger: 0,
          traveled: 0,
          hit: [],
          owner: `${enemy.id}|skitter`,
        },
      ],
    });
    run.step(0.02);
    expect(run.state.status).toBe("failure");
    expect(run.state.monsters[0].z).toBe(2);
    expect(run.state.projectiles).toEqual([]);
  });
});

describe("Mobile combat", () => {
  it("runs the world at 35 percent during draw while aim and real-time countdown continue", () => {
    const enemy = monster();
    enemy.alerted = true;
    enemy.target = "player";
    const run = quiet({ monsters: [enemy] });
    run.act({ type: "draw" });
    run.step(0.4, { aim: true, heading: 0.7 });
    expect(run.state.monsters[0].z).toBeCloseTo(20 - 3.5 * 0.4 * 0.35);
    expect(run.state.elapsed).toBeCloseTo(0.4);
    expect(run.state.aiming).toBe(true);
  });
  it("fires physical projectiles, manually collects kill rewards and never adds gunfire Threat", () => {
    const run = quiet({
      mode: "combat",
      arsenal: [gun()],
      slots: ["held", null],
      monsters: [monster("skitter", 10)],
    });
    const threat = run.state.threat;
    run.step(0, { aim: true });
    for (let i = 0; i < 3; i++) {
      run.act({ type: "fire" });
      run.step(0.26);
    }
    expect(run.state.kills).toBe(1);
    expect(run.state.resource).toBe(0);
    expect(run.state.drops.some((d) => d.type === "resource")).toBe(true);
    expect(run.state.threat).toBe(threat);
  });
  it("keeps magazine state on switch and never completes an inactive reload", () => {
    const held = gun();
    held.magazine = 1;
    const run = quiet({
      mode: "combat",
      arsenal: [held, gun("other")],
      slots: ["held", "other"],
      reserves: { pistol: 16, rifle: 0, shells: 0 },
    });
    run.act({ type: "reload" });
    run.step(0.5, { x: 1 });
    expect(run.state.player.x).toBeGreaterThan(0);
    run.act({ type: "draw", slot: 1 });
    run.step(1);
    expect(run.state.arsenal[0].magazine).toBe(1);
    expect(run.state.reserves.pistol).toBe(16);
    run.act({ type: "draw", slot: 0 });
    run.act({ type: "reload" });
    run.step(1);
    expect(run.state.arsenal[0].magazine).toBe(8);
    expect(run.state.reserves.pistol).toBe(9);
  });
  it("telegraphs avoidable attacks rather than dealing contact damage", () => {
    const run = quiet({ mode: "combat", monsters: [monster("skitter", 2)] });
    run.step(0.1);
    expect(run.state.player.health).toBe(100);
    expect(run.state.monsters[0].lane).not.toBeNull();
    run.step(1, { x: 1, sprint: true });
    expect(run.state.player.health).toBe(100);
  });
  it("can interrupt a Shotgun reload to fire already-loaded shells", () => {
    const held = gun("held", "shotgun");
    held.magazine = 0;
    const run = quiet({
      mode: "combat",
      arsenal: [held],
      slots: ["held", null],
      reserves: { pistol: 0, rifle: 0, shells: 10 },
    });
    run.act({ type: "reload" });
    run.step(0.56);
    expect(run.state.arsenal[0].magazine).toBe(1);
    run.act({ type: "fire" });
    expect(run.state.shots).toBe(1);
    expect(run.state.arsenal[0].magazine).toBe(0);
  });
  it("keeps arsenal decisions live while blocking combat and allowing only a slow walk", () => {
    const run = quiet({
      mode: "combat",
      arsenal: [gun()],
      slots: ["held", null],
      supplies: ["pistol"],
      resource: 3,
    });
    run.act({ type: "arsenal" });
    run.act({ type: "fire" });
    run.act({ type: "mount" });
    run.act({ type: "supply", index: 0 });
    run.act({ type: "upgrade", id: "held", stat: "damage" });
    run.step(1, { x: 1, aim: true, sprint: true, fire: true });
    expect(run.state.player.x).toBeCloseTo(1.5);
    expect(run.state.elapsed).toBeCloseTo(1);
    expect(run.state.shots).toBe(0);
    expect(run.state.hold).toBeNull();
    expect(run.state.reserves.pistol).toBe(16);
    expect(run.state.resource).toBe(0);
    expect(run.state.power).toBe(2);
  });
  it("blocks projectiles with actual world cover and lets Rod attacks strongly stagger without ammo", () => {
    const cover = new Run({ seed: 1 }).content().obstacles[0];
    const run = quiet({
      mode: "combat",
      arsenal: [gun()],
      slots: ["held", null],
      player: {
        x: cover.x - 15,
        z: cover.z,
        y: 0,
        vy: 0,
        heading: Math.PI / 2,
        pitch: 0,
        health: 100,
      },
      monsters: [
        { ...monster("ramjaw"), x: cover.x + 15, z: cover.z, recovery: 10 },
      ],
    });
    run.act({ type: "fire" });
    run.step(0.6);
    expect(run.state.monsters[0].health).toBe(100);
    const melee = quiet({ mode: "combat", monsters: [monster("ramjaw", 3)] });
    melee.step(0.02);
    melee.act({ type: "rod" });
    expect(melee.state.monsters[0].health).toBe(68);
    expect(melee.state.monsters[0].lane).toBeNull();
    expect(melee.state.monsters[0].recovery).toBeGreaterThan(0);
    melee.act({ type: "rod" });
    expect(melee.state.monsters[0].health).toBe(68);
  });
  it("fires instead of teleporting after stagger cancels a Spitter reposition", () => {
    const run = quiet({ mode: "combat", monsters: [monster("spitter", 3)] });
    run.step(0.02);
    const enemy = run.state.monsters[0];
    expect(enemy.repositioned).toBe(true);
    expect(enemy.lane?.x).toBeCloseTo(0);
    expect(enemy.lane?.z).toBeCloseTo(9);
    run.act({ type: "rod" });
    expect(enemy.windup).toBe(0);
    expect(enemy.lane).toBeNull();
    const position = { x: enemy.x, z: enemy.z };
    run.step(0.84);
    expect(enemy.lane).toEqual({
      x: run.state.player.x,
      z: run.state.player.z,
    });
    run.step(MONSTERS.spitter.windup);
    expect({ x: enemy.x, z: enemy.z }).toEqual(position);
    expect(run.state.projectiles.some((p) => p.hostile)).toBe(true);
  });
  it("blocks Rod damage and stagger across a world-cover corner", () => {
    const cover = new Run({ seed: 1 }).content().obstacles[0];
    const x = cover.x - cover.width / 2,
      z = cover.z + cover.depth / 2;
    const run = quiet({
      mode: "combat",
      player: {
        x: x - 0.7,
        z: z - 1.5,
        y: 0,
        vy: 0,
        heading: Math.PI / 4,
        pitch: 0,
        health: 100,
      },
      monsters: [
        {
          ...monster("ramjaw"),
          x: x + 1.5,
          z: z + 0.7,
          windup: 0.5,
          lane: { x, z },
        },
      ],
    });
    run.act({ type: "rod" });
    const enemy = run.state.monsters[0];
    expect(
      Math.hypot(enemy.x - run.state.player.x, enemy.z - run.state.player.z),
    ).toBeLessThan(4);
    expect(enemy.health).toBe(MONSTERS.ramjaw.health);
    expect(enemy.windup).toBe(0.5);
    expect(enemy.lane).toEqual({ x, z });
    expect(enemy.recovery).toBe(0);
    expect(enemy.alerted).toBe(false);
    expect(run.state.rodCooldown).toBe(1.1);
  });
  it("allows escaping pursuit only after sustained distance and broken line of sight", () => {
    const enemy = monster("skitter", 100);
    enemy.alerted = true;
    enemy.target = "player";
    const run = quiet({ monsters: [enemy] }, { lineOfSight: () => false });
    run.step(3.9);
    expect(run.state.monsters[0].alerted).toBe(true);
    run.step(0.2);
    expect(run.state.monsters[0].alerted).toBe(false);
  });
});

describe("Evolved firing behavior", () => {
  it("counts Hammer rounds per Gunfish across switches and saved resumes", () => {
    const hammer = gun("hammer", "rifle");
    hammer.branch = "Hammer";
    hammer.stage = 1;
    const run = quiet({
      mode: "combat",
      arsenal: [gun(), hammer],
      slots: ["held", "hammer"],
    });
    run.act({ type: "fire" });
    run.step(0.25);
    run.act({ type: "draw", slot: 1 });
    for (let i = 0; i < 4; i++) {
      run.act({ type: "fire" });
      run.step(0.11);
    }
    const fourth = run.state.projectiles.at(-1)!;
    expect(fourth.stagger).toBe(fourth.damage);
    const resumed = new Run({ saved: run.save() });
    resumed.act({ type: "fire" });
    const fifth = resumed.state.projectiles.at(-1)!;
    expect(fifth.stagger).toBe(fifth.damage * 3);
  });
  it("Deadeye Stage II charges in precision aim and penetrates one monster", () => {
    const held = gun();
    held.branch = "Deadeye";
    held.stage = 2;
    const run = quiet({
      mode: "combat",
      arsenal: [held],
      slots: ["held", null],
      monsters: [
        { ...monster("ramjaw", 10), recovery: 10 },
        { ...monster("ramjaw", 18), id: "second", recovery: 10 },
      ],
    });
    run.step(0.4, { aim: true });
    run.act({ type: "fire" });
    run.step(0.3);
    expect(run.state.monsters.map((m) => m.health)).toEqual([40, 40]);
    expect(run.state.arsenal[0].magazine).toBe(7);
  });
  it("Fanfire preserves per-round ammunition and Slug gains damage downrange", () => {
    const fan = gun();
    fan.branch = "Fanfire";
    fan.stage = 2;
    const burst = quiet({
      mode: "combat",
      arsenal: [fan],
      slots: ["held", null],
    });
    burst.act({ type: "fire" });
    expect(burst.state.shots).toBe(3);
    expect(burst.state.arsenal[0].magazine).toBe(5);
    const slug = gun("held", "shotgun");
    slug.branch = "Slug";
    slug.stage = 2;
    const run = quiet({
      mode: "combat",
      arsenal: [slug],
      slots: ["held", null],
      monsters: [{ ...monster("ramjaw", 18), recovery: 10 }],
    });
    run.act({ type: "fire" });
    run.step(0.3);
    expect(run.state.monsters[0].health).toBeCloseTo(6.4);
    expect(run.state.arsenal[0].magazine).toBe(4);
  });
});

describe("Exposed commitments", () => {
  it("mounts permanently, preserves magazine/progression and draws the other slot", () => {
    const held = gun();
    held.magazine = 2;
    held.ranks.damage = 1;
    const run = quiet({
      mode: "combat",
      arsenal: [held, gun("other")],
      slots: ["held", "other"],
    });
    run.act({ type: "mount" });
    run.step(0.5, { x: 1 });
    run.step(1);
    expect(run.state.mounted).toHaveLength(0);
    run.act({ type: "mount" });
    run.step(1.25);
    expect(run.state.arsenal.map((g) => g.id)).toEqual(["other"]);
    expect(run.state.slots).toEqual([null, "other"]);
    expect(run.state.active).toBe(1);
    expect(run.state.mounted[0].gunfish).toEqual(held);
    expect(run.state.power).toBe(3);
  });
  it("drinking is canceled by damage without consuming Beer", () => {
    const run = quiet(
      {
        mode: "combat",
        player: { x: 0, z: 0, y: 0, vy: 0, heading: 0, pitch: 0, health: 40 },
      },
      { damage: () => 1 },
    );
    run.act({ type: "drink" });
    run.step(0.1);
    expect(run.state.hold).toBeNull();
    expect(run.state.supplies).toEqual(["beer", "beer"]);
    const peaceful = quiet({
      mode: "combat",
      player: { x: 0, z: 0, y: 0, vy: 0, heading: 0, pitch: 0, health: 40 },
    });
    peaceful.act({ type: "drink" });
    peaceful.step(1);
    expect(peaceful.state.player.health).toBe(75);
    expect(peaceful.state.supplies).toEqual(["beer"]);
  });
  it("reclaims atomically after two seconds, keeping identity and the higher rod without ammo or autoassignment", () => {
    const recovered = gun("recovered");
    recovered.magazine = 0;
    recovered.stage = 1;
    recovered.branch = "Deadeye";
    const run = quiet({
      rod: 2,
      cache: { x: 1, z: 0, rod: 3, gunfish: recovered },
    });
    run.act({ type: "interact" });
    run.step(1, { x: 1 });
    expect(run.state.cache).not.toBeNull();
    expect(run.state.arsenal).toHaveLength(0);
    run.step(0.6, { x: -1 });
    run.act({ type: "interact" });
    run.step(1.99);
    expect(run.state.arsenal).toHaveLength(0);
    run.step(0.01);
    expect(run.state.cache).toBeNull();
    expect(run.state.arsenal[0]).toEqual({ ...recovered, magazine: 8 });
    expect(run.state.rod).toBe(3);
    expect(run.state.slots).toEqual([null, null]);
    expect(run.state.reserves.pistol).toBe(0);
    expect(run.state.shots).toBe(0);
    expect(run.state.power).toBe(3);
  });
  it("repairs before fueling, discards overflow, and does not burn idle fuel", () => {
    const defender = mounted();
    defender.health = 90;
    const run = quiet({
      mode: "combat",
      mounted: [defender],
      supplies: ["beer", "beer", "beer"],
    });
    run.act({ type: "interact" });
    run.step(1);
    expect(run.state.mounted[0].health).toBe(100);
    expect(run.state.mounted[0].fuel).toBe(0);
    run.act({ type: "interact" });
    run.step(1);
    expect(run.state.mounted[0].fuel).toBe(10);
    run.step(5);
    expect(run.state.mounted[0].fuel).toBe(10);
    run.act({ type: "interact" });
    run.step(1);
    expect(run.state.mounted[0].fuel).toBe(20);
  });
  it("spends the magazine before fuel and attracts attacks even after running dry", () => {
    const defender = mounted();
    defender.gunfish.magazine = 1;
    defender.fuel = 1;
    const enemy = monster("shellback", 15);
    const run = quiet({ mounted: [defender], monsters: [enemy] });
    run.step(0.02);
    expect(run.state.mounted[0].gunfish.magazine).toBe(0);
    expect(run.state.mounted[0].fuel).toBe(1);
    expect(run.state.monsters[0].target).toBe("defender");
    run.step(0.26);
    expect(run.state.mounted[0].fuel).toBeLessThan(1);
    run.state.mounted[0].fuel = 0;
    run.step(0.02);
    expect(run.state.monsters[0].target).toBe("defender");
  });
  it("keeps a committed defender target despite another mount firing and hitting it", () => {
    const first = mounted();
    first.gunfish.magazine = 0;
    const second = { ...mounted(), id: "second", x: -1 };
    const enemy = {
      ...monster("shellback", 15),
      target: first.id,
      alerted: true,
      recovery: 10,
    };
    const run = quiet({ mounted: [first, second], monsters: [enemy] });
    run.step(0.5);
    expect(run.state.monsters[0].health).toBeLessThan(600);
    expect(run.state.monsters[0].target).toBe(first.id);
    run.state.mounted[0].health = 0;
    run.step(0.04);
    expect(run.state.monsters[0].target).toBe(second.id);
  });
  it("hears mounted fire through cover and prefers the nearest perceived defender", () => {
    const far = { ...mounted(), id: "far", x: 40 };
    const near = mounted();
    near.gunfish.magazine = 0;
    const run = quiet({
      mounted: [far, near],
      monsters: [{ ...monster("shellback", 15), recovery: 10 }],
    });
    run.step(0.02);
    expect(run.state.monsters[0].target).toBe(near.id);
    const hidden = quiet(
      {
        mounted: [mounted()],
        monsters: [{ ...monster("shellback", 40), recovery: 10 }],
      },
      { lineOfSight: (a) => a.x === 1 },
    );
    hidden.step(0.02);
    expect(hidden.state.monsters[0].target).toBe("defender");
  });
});

describe("Population director", () => {
  it("keeps spawning locked before the first catch across phases and save/resume", () => {
    const run = new Run({ seed: 1 });
    run.step(150);
    expect(run.state.elapsed).toBeCloseTo(150);
    expect(run.state.monsters).toHaveLength(0);
    expect(run.state.refill).toBeNull();
    const resumed = new Run({ saved: run.save() });
    resumed.step(250);
    expect(resumed.state.elapsed).toBeCloseTo(400);
    expect(resumed.state.monsters).toHaveLength(0);
    expect(resumed.state.refill).toBeNull();
  });
  it("refills beyond high Threat without overfilling the expanded local region", () => {
    const run = quiet(
      { catches: 1, threat: 400, refill: 0 },
      { lineOfSight: () => false },
    );
    run.step(0.02);
    expect(run.state.monsters).toHaveLength(2);
    for (const m of run.state.monsters) {
      expect(Math.hypot(m.x, m.z)).toBeGreaterThan(400);
      expect(m.alerted).toBe(false);
      expect(m.target).toBeNull();
      expect(Math.cos(Math.atan2(m.x, m.z))).toBeLessThan(0.35);
    }
    run.step(31);
    expect(run.state.monsters).toHaveLength(2);
  });
  it("uses real cover for refills in the central crossing and near every opening pocket", () => {
    const content = new Run({ seed: 1 }).content();
    for (const point of [{ x: 0, z: 0 }, ...content.pockets]) {
      for (const heading of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        for (const threat of [12, 400]) {
          const run = quiet({
            catches: 1,
            threat,
            refill: 0,
            player: { ...point, y: 0, vy: 0, heading, pitch: 0, health: 100 },
          });
          run.step(0.02);
          expect(
            run.state.monsters,
            JSON.stringify({ point, heading, threat }),
          ).toHaveLength(2);
          for (const m of run.state.monsters)
            expect(Math.hypot(m.x - point.x, m.z - point.z)).toBeGreaterThan(
              threat,
            );
        }
      }
    }
  });
  it("routes hidden refill roamers around cover until normal perception can alert them", () => {
    const run = quiet({ catches: 1, refill: 0 });
    run.step(0.02);
    expect(run.state.monsters.every((m) => !m.alerted)).toBe(true);
    let detected = false;
    for (let i = 0; i < 110 && !detected; i++) {
      run.step(1);
      detected = run.state.monsters.some((m) => m.alerted);
    }
    expect(detected).toBe(true);
  });
  it("starts one refill timer and does not reset it for additional vacancies", () => {
    const run = quiet(
      { catches: 1, monsters: [monster("skitter", 100)] },
      { lineOfSight: () => false },
    );
    run.step(10);
    expect(run.state.monsters).toHaveLength(1);
    const due = run.state.refill!;
    run.state.monsters = [];
    run.step(10);
    expect(run.state.refill).toBeLessThan(due);
    run.step(10.1);
    expect(run.state.monsters).toHaveLength(2);
    expect(
      run.state.monsters.every((m) => !m.alerted && m.role === "skitter"),
    ).toBe(true);
  });
  it("keeps danger live through the boundary lull then guarantees the newly unlocked role", () => {
    const run = quiet(
      { catches: 1, elapsed: 119.99 },
      { lineOfSight: () => false },
    );
    run.step(0.01);
    expect(run.state.phase).toBe(1);
    expect(run.state.lull).toBeCloseTo(20);
    run.step(19.99);
    expect(run.state.monsters).toHaveLength(0);
    run.step(0.01);
    expect(run.state.monsters).toHaveLength(4);
    expect(run.state.monsters.some((m) => m.role === "spitter")).toBe(true);
    expect(run.state.monsters.some((m) => m.role === "shellback")).toBe(false);
  });
  it("waits when there are no unseen spawn points rather than violating LOS", () => {
    const run = quiet({ catches: 1 }, { lineOfSight: () => true });
    run.step(60);
    expect(run.state.monsters).toHaveLength(0);
  });
  it("preserves distant Alerted pursuits and never unlocks Siege early at high power", () => {
    const enemy = monster("skitter", 400);
    enemy.alerted = true;
    enemy.target = "player";
    const run = quiet(
      { catches: 1, monsters: [enemy], power: 16 },
      { lineOfSight: () => true },
    );
    run.step(1);
    expect(run.state.monsters.some((m) => m.id === enemy.id)).toBe(true);
    const high = quiet({ catches: 1, power: 16 }, { lineOfSight: () => false });
    high.step(30.1);
    expect(high.state.monsters).toHaveLength(3);
    expect(
      high.state.monsters.every(
        (m) => m.role === "skitter" || m.role === "ramjaw",
      ),
    ).toBe(true);
    const siege = quiet(
      { catches: 1, elapsed: 359.99, phase: 1 },
      { lineOfSight: () => false },
    );
    siege.step(20.01);
    expect(siege.state.monsters).toHaveLength(6);
    expect(siege.state.monsters.some((m) => m.role === "shellback")).toBe(true);
  });
});

describe("Authored content through Run", () => {
  it("exposes isolated snapshots of the exact roster, economy and pacing contract", () => {
    const run = new Run({ seed: 1 }),
      content = run.content();
    expect(Object.keys(content.species)).toEqual([
      "pistol",
      "rifle",
      "shotgun",
    ]);
    expect(
      Object.values(content.species).map((s) => [
        s.damage,
        s.rate,
        s.magazine,
        s.reload,
        s.bundle,
      ]),
    ).toEqual([
      [24, 4, 8, 1, 16],
      [12, 10, 24, 1.8, 48],
      [9, 1, 5, 0.55, 10],
    ]);
    expect(
      Object.values(content.monsters).map((m) => [
        m.health,
        m.damage,
        m.cost,
        m.reward,
      ]),
    ).toEqual([
      [60, 20, 1, 1],
      [100, 35, 2, 1],
      [180, 25, 2, 2],
      [600, 40, 4, 4],
    ]);
    expect(
      content.phases.map((p) => [
        p.start,
        p.end,
        p.target,
        p.delayStart,
        p.delayEnd,
      ]),
    ).toEqual([
      [0, 120, 2, 30, 25],
      [120, 360, 4, 25, 20],
      [360, 660, 6, 20, 15],
      [660, 900, 8, 15, 10],
    ]);
    expect(content.locations).toHaveLength(6);
    expect(content.pockets).toHaveLength(6);
    expect(new Set(content.locations.map((l) => l.region)).size).toBe(3);
    expect(content.locations.filter((l) => l.exposed)).toHaveLength(3);
    for (const cell of content.mixes.flat())
      expect(cell.reduce((sum, mix) => sum + mix.weight, 0)).toBeCloseTo(1);
    content.species.pistol.damage = 0;
    content.obstacles.length = 0;
    expect(run.content().species.pistol.damage).toBe(24);
    expect(run.content().obstacles.length).toBeGreaterThan(0);
  });
  it("makes post-catch roaming danger reach the opening rather than drift away indefinitely", () => {
    const starts = new Set<string>();
    for (const seed of [1, 512, 1024, 1536, 2048, 1800]) {
      const run = new Run({ seed });
      starts.add(`${run.state.player.x},${run.state.player.z}`);
      run.state.catches = 1;
      let detected = false;
      for (let i = 0; i < 110 && !detected; i++) {
        run.step(1);
        detected = run.state.monsters.some((m) => m.alerted);
      }
      expect(detected, `seed ${seed}`).toBe(true);
    }
    expect(starts.size).toBe(6);
  });
  it("offers genuinely poor recovery pairings as well as favorable and contested ones", () => {
    const pockets = new Run({ seed: 1 }).content().pockets;
    for (const pocket of pockets) {
      const bands = new Set<string>();
      for (const seed of [2048, 1, 1800]) {
        const cache = { ...pocket, rod: 1, gunfish: null };
        const run = new Run({ seed, scenario: { cache } });
        const time =
          Math.hypot(
            run.state.player.x - cache.x,
            run.state.player.z - cache.z,
          ) / 9;
        expect(time).toBeGreaterThanOrEqual(45);
        expect(time).toBeLessThanOrEqual(240);
        bands.add(time < 75 ? "favorable" : time < 150 ? "contested" : "poor");
      }
      expect([...bands].sort(), JSON.stringify(pocket)).toEqual([
        "contested",
        "favorable",
        "poor",
      ]);
    }
  });
  it("connects every pocket along an outer circuit as well as through the central crossing", () => {
    const content = new Run({ seed: 1 }).content();
    const blocked = (x: number, z: number) =>
      content.obstacles.some(
        (o) =>
          Math.abs(x - o.x) < o.width / 2 + 0.5 &&
          Math.abs(z - o.z) < o.depth / 2 + 0.5,
      );
    // A coarse independent walkability flood checks the authored geometry, not Run's pathfinder.
    for (const innerRadius of [0, 600]) {
      const queue = [{ x: 0, z: 1000 }],
        visited = new Set(["0,1000"]);
      for (let i = 0; i < queue.length; i++) {
        const point = queue[i];
        for (const [dx, dz] of [
          [20, 0],
          [-20, 0],
          [0, 20],
          [0, -20],
        ]) {
          const x = point.x + dx,
            z = point.z + dz,
            key = `${x},${z}`;
          if (
            visited.has(key) ||
            Math.hypot(x, z) < innerRadius ||
            Math.hypot(x, z) > 1100
          )
            continue;
          if (
            [0.25, 0.5, 0.75, 1].some((t) =>
              blocked(point.x + dx * t, point.z + dz * t),
            )
          )
            continue;
          visited.add(key);
          queue.push({ x, z });
        }
      }
      for (const pocket of content.pockets)
        expect(
          queue.some((p) => Math.hypot(p.x - pocket.x, p.z - pocket.z) < 15),
        ).toBe(true);
      for (const point of [
        { x: 1000, z: 0 },
        { x: 0, z: -1000 },
        { x: -1000, z: 0 },
      ])
        expect(visited.has(`${point.x},${point.z}`)).toBe(true);
      if (!innerRadius) expect(visited.has("0,0")).toBe(true);
    }
  });
});

describe("Progression economy through Run", () => {
  it("charges additive rank prices without granting ammunition and caps both upgrade ladders", () => {
    const held = gun();
    held.magazine = 1;
    const run = quiet({
      arsenal: [held],
      slots: ["held", null],
      resource: 100,
    });
    run.act({ type: "arsenal" });
    for (const stat of ["damage", "rate", "magazine"] as const)
      run.act({ type: "upgrade", id: held.id, stat });
    expect(run.state.resource).toBe(82);
    expect(run.state.arsenal[0].magazine).toBe(1);
    expect(run.state.arsenal[0].ranks).toEqual({
      damage: 1,
      rate: 1,
      magazine: 1,
    });
    run.act({ type: "upgrade", id: held.id, stat: "damage" });
    expect(run.state.resource).toBe(82);
    for (let i = 0; i < 3; i++) run.act({ type: "rodUpgrade" });
    expect(run.state.rod).toBe(3);
    expect(run.state.resource).toBe(54);
    expect(run.state.power).toBe(4);
  });
  it("previews valuable sacrifices, rejects invalid merges atomically and preserves identity peaks", () => {
    const donor = gun("donor");
    donor.ranks.damage = 3;
    const run = quiet({
      arsenal: [gun(), donor, gun("third"), gun("fourth")],
      slots: ["held", "donor"],
    });
    run.act({ type: "arsenal" });
    const before = run.save();
    run.act({
      type: "evolve",
      id: "held",
      donors: ["held"],
      branch: "Deadeye",
    });
    expect(run.save()).toBe(before);
    const preview = run.previewEvolution("held", ["donor"], "Deadeye");
    expect(preview.valid).toBe(true);
    expect(preview.warning).toContain("assigned");
    expect(preview.warning).toContain("D3");
    run.act({
      type: "evolve",
      id: "held",
      donors: ["donor"],
      branch: "Deadeye",
    });
    expect(run.state.slots).toEqual(["held", null]);
    expect(run.state.power).toBe(7);
    expect(run.state.arsenal[0].magazine).toBe(8);
    run.act({
      type: "evolve",
      id: "held",
      donors: ["third", "fourth"],
      branch: "Fanfire",
    });
    expect(run.state.arsenal).toHaveLength(3);
    run.act({
      type: "evolve",
      id: "held",
      donors: ["third", "fourth"],
      branch: "Deadeye",
    });
    expect(run.state.arsenal).toHaveLength(1);
    expect(run.state.power).toBe(9);
    run.act({ type: "arsenal", open: false });
    run.act({ type: "draw" });
    run.step(0.68);
    run.act({ type: "mount" });
    run.step(1.25);
    expect(run.state.arsenal).toHaveLength(0);
    expect(run.state.power).toBe(9);
    expect(run.previewEvolution("held", [], "Deadeye").valid).toBe(false);
  });
  it("keeps supply collection manual and capacity-limited while bundle yield ignores upgrades", () => {
    const held = gun();
    held.rarity = 3;
    held.ranks.magazine = 3;
    const run = quiet({
      arsenal: [held],
      supplies: Array.from({ length: 8 }, () => "beer"),
      drops: [{ id: "bundle", x: 1, z: 0, type: "pistol", amount: 16 }],
    });
    run.act({ type: "interact" });
    expect(run.state.drops).toHaveLength(1);
    run.act({ type: "arsenal" });
    run.act({ type: "supply", index: 0, drop: true });
    run.act({ type: "arsenal", open: false });
    run.act({ type: "interact" }); // The dropped Beer is closer than the ammo.
    expect(run.state.supplies).toHaveLength(8);
    run.act({ type: "arsenal" });
    run.act({ type: "supply", index: 0, drop: true });
    run.act({ type: "arsenal", open: false });
    run.step(0.2, { x: 1 });
    run.act({ type: "interact" });
    expect(run.state.reserves.pistol).toBe(0);
    expect(run.state.supplies).toContain("pistol");
    run.act({ type: "arsenal" });
    run.act({ type: "supply", index: run.state.supplies.indexOf("pistol") });
    expect(run.state.reserves.pistol).toBe(16);
  });
});
