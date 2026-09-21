import { describe, expect, it } from "vitest";
import { Run } from "../src/run";
import { coastPoint, onIsland, waterAt } from "../src/geography";

describe("Compact island exploration", () => {
  it("keeps every fish school in rendered water, including secret and coastal schools", () => {
    const run = new Run({ seed: 2048 });
    for (const fish of run.state.fish) expect(waterAt(fish.home), JSON.stringify(fish.home)).toBe(true);
    const secret = run.content().locations.find(l => l.name === "Whisperfin Grotto")!;
    expect(run.state.fish.filter(f => Math.hypot(f.home.x - secret.x, f.home.z - secret.z) < 12).every(f => f.rarity === 3)).toBe(true);
  });
  it("allows casting from beaches all around the island without allowing walking into the ocean", () => {
    for (let i = 0; i < 72; i++) {
      const run = new Run({ seed: 1 });
      const angle = i * Math.PI * 2 / 72;
      Object.assign(run.state.player, coastPoint(angle, 3));
      const school = coastPoint(angle, -14);
      run.act({ type: "cast", point: { x: school.x, z: school.z + 2 } });
      expect(run.state.cast, `shore ${i}`).not.toBeNull();
      run.act({ type: "cancel" });
      run.step(2, { x: Math.cos(angle), z: Math.sin(angle) });
      expect(onIsland(run.state.player)).toBe(true);
    }
  });
  it("migrates old saves without losing equipment, catches or time", () => {
    const run = new Run({ seed: 1 });
    const old = JSON.parse(run.save());
    delete old.worldVersion;
    old.player.x *= 1.9; old.player.z *= 1.9;
    old.fish = old.fish.slice(0, 18);
    old.fish[0].landed = true;
    old.elapsed = 83; old.resource = 17;
    const resumed = new Run({ saved: JSON.stringify(old) });
    expect(onIsland(resumed.state.player)).toBe(true);
    expect(resumed.state.fish[0].landed).toBe(true);
    expect(resumed.state.elapsed).toBe(83);
    expect(resumed.state.resource).toBe(17);
    expect(resumed.state.fish.length).toBe(run.state.fish.length);
    expect(new Set(resumed.state.fish.map(f => f.id)).size).toBe(resumed.state.fish.length);
    expect(new Run({ saved: resumed.save() }).save()).toBe(resumed.save());
  });
});
