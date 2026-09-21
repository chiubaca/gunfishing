import { describe, expect, it } from "vitest";
import { LANDMARKS, POCKETS, terrainHeight } from "../src/content";
import { coastPoint, WATER_BODIES } from "../src/geography";

describe("Island relief", () => {
  it("keeps a low, continuous beach around the entire island", () => {
    for (let i = 0; i < 360; i++) for (const inset of [-10, 0, 5, 12])
      expect(terrainHeight(coastPoint(i * Math.PI / 180, inset))).toBeCloseTo(0, 8);
  });

  it("keeps fishing water and its immediate banks at water level", () => {
    for (const body of WATER_BODIES) for (const p of body.outline) {
      expect(terrainHeight(p), body.name).toBeCloseTo(0, 5);
      for (const dx of [-2, 2]) expect(terrainHeight({ x: p.x + dx, z: p.z }), body.name).toBeCloseTo(0, 5);
    }
    for (const p of POCKETS) expect(terrainHeight(p)).toBeLessThan(3);
  });

  it("gives snow the tallest mountains, tropical highlands and gentler forest hills", () => {
    const snow = terrainHeight({ x: -20, z: -300 });
    const tropical = terrainHeight({ x: 260, z: -45 });
    const forest = terrainHeight({ x: -280, z: 0 });
    expect(snow).toBeGreaterThan(65);
    expect(tropical).toBeGreaterThan(30);
    expect(forest).toBeGreaterThan(10);
    expect(snow).toBeGreaterThan(tropical);
    expect(tropical).toBeGreaterThan(forest);
  });

  it("cuts winding gorges below the surrounding ridges", () => {
    for (const [x, z, width] of [
      [65 + 20 * Math.sin(-300 * 0.024), -300, 40],
      [-210, 0, 45],
      [350, 210, 75],
    ]) {
      const floor = terrainHeight({ x, z });
      expect(terrainHeight({ x: x - width, z }) - floor).toBeGreaterThan(8);
      expect(terrainHeight({ x: x + width, z }) - floor).toBeGreaterThan(8);
    }
  });

  it("grounds landmark plazas and leaves waterfall entrances level", () => {
    for (const p of LANDMARKS) for (const dx of [-20, 0, 20])
      expect(terrainHeight({ x: p.x + dx, z: p.z })).toBeCloseTo(terrainHeight(p));
    for (const p of [{ x: 310, z: 44 }, { x: 310, z: 20 }, { x: 440, z: 79 }])
      expect(terrainHeight(p)).toBe(0);
  });
});
