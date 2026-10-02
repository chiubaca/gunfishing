import { describe, expect, it } from "vitest";
import { Run } from "../src/run";
import { MONSTERS, SPECIES } from "../src/content";
import { gunStats } from "../src/economy";
import type { Species } from "../src/types";

describe("mechanics sandbox", () => {
  it("provides every monster in a stationary row without fishing", () => {
    const run = new Run({ sandbox: true, seed: 1 });
    const positions = run.state.monsters.map(m => ({ role: m.role, x: m.x, z: m.z }));
    expect(positions.map(m => m.role)).toEqual(Object.keys(MONSTERS));
    expect(run.state.fish).toEqual([]);
    expect(run.state.mode).toBe("combat");
    run.step(10);
    expect(run.state.monsters.map(m => ({ role: m.role, x: m.x, z: m.z }))).toEqual(positions);
    expect(run.state.player.health).toBe(100);
    expect(run.surfaceHeight({ x: 0, z: 0 })).toBe(0);
  });

  it("equips all species, rarities, and evolution stages directly", () => {
    const run = new Run({ sandbox: true });
    for (const species of Object.keys(SPECIES) as Species[]) {
      for (const rarity of [1, 2, 3]) {
        for (const branch of [null, ...SPECIES[species].branches]) {
          for (const stage of branch ? [1, 2] : [0]) {
            run.selectSandboxGunfish(species, rarity, branch, stage);
            const g = run.state.arsenal[0];
            expect(g).toMatchObject({ species, rarity, branch, stage });
            expect(g.magazine).toBe(gunStats(g).magazine);
            expect(run.state.slots).toEqual([g.id, null]);
          }
        }
      }
    }
  });

  it("uses real projectile damage and respawns a killed target at its original spot", () => {
    const run = new Run({ sandbox: true, seed: 2 });
    const target = run.state.monsters[0];
    run.state.player.x = target.x;
    run.act({ type: "fire" });
    run.step(0.5);
    expect(target.health).toBe(MONSTERS.skitter.health - 24);
    for (let i = 0; i < 2; i++) {
      run.act({ type: "fire" });
      run.step(0.5);
    }
    const replacement = run.state.monsters.find(m => m.role === "skitter")!;
    expect(replacement.id).not.toBe(target.id);
    expect(replacement).toMatchObject({ x: target.x, z: target.z, health: MONSTERS.skitter.health });
    expect(run.state.kills).toBe(1);
    expect(run.state.drops).toEqual([]);
  });

  it("does not finish at the survival time limit and resets targets on demand", () => {
    const run = new Run({ sandbox: true });
    run.state.elapsed = 899.9;
    run.step(1);
    expect(run.state.status).toBe("playing");
    run.state.monsters[0].health = 1;
    run.resetSandboxTargets();
    expect(run.state.monsters[0].health).toBe(MONSTERS.skitter.health);
  });

  it("expires stagger and recovery while keeping targets stationary", () => {
    const run = new Run({ sandbox: true });
    const target = run.state.monsters[0];
    Object.assign(target, { stagger: 20, staggerTime: 0.7, recovery: 0.8 });
    run.step(1);
    expect(target).toMatchObject({ stagger: 0, staggerTime: 0, recovery: 0, x: -10.5, z: 8 });
  });
});
