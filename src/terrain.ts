import { coastRadius, WATER_BODIES, WATERFALLS, insideOutline } from "./geography";
import type { Vec } from "./types";

const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const basins = WATER_BODIES.map(body => ({
  ...body,
  minX: Math.min(...body.outline.map(p => p.x)), maxX: Math.max(...body.outline.map(p => p.x)),
  minZ: Math.min(...body.outline.map(p => p.z)), maxZ: Math.max(...body.outline.map(p => p.z)),
}));
const segmentDistance = (p: Vec, a: Vec, b: Vec) => {
  const dx = b.x - a.x, dz = b.z - a.z;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(p.x - a.x - t * dx, p.z - a.z - t * dz);
};

// Broad massifs and winding cuts are deterministic, with gradual biome transitions.
export function landscapeHeight(p: Vec): number {
  const { x, z } = p;
  const inland = coastRadius(Math.atan2(z, x)) - Math.hypot(x, z);
  if (inland <= 12) return 0;
  let bank = 70;
  for (const body of basins) {
    if (x < body.minX - bank || x > body.maxX + bank || z < body.minZ - bank || z > body.maxZ + bank) continue;
    if (insideOutline(p, body.outline)) return 0;
    for (let i = 0; i < body.outline.length; i++)
      bank = Math.min(bank, segmentDistance(p, body.outline[i], body.outline[(i + 1) % body.outline.length]));
  }
  const hill = (cx: number, cz: number, rx: number, rz: number) => Math.exp(-(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2));
  const snow = 1 - smooth(-220, -140, z), tropical = smooth(80, 160, x);
  const rolling = 3 + 3 * (Math.sin(x * 0.021) * Math.cos(z * 0.018) + 1);
  const forest = rolling + 24 * hill(-220, 5, 160, 200) + 19 * hill(-100, 285, 150, 100);
  const jungle = rolling + 53 * hill(310, -25, 110, 130) + 40 * hill(255, 260, 160, 150);
  const ridge = 0.68 + 0.32 * (1 - Math.abs(Math.sin(x * 0.025 + z * 0.011)));
  const alpine = 10 + ridge * (100 * hill(15, -310, 240, 120) + 84 * hill(315, -300, 140, 130) + 47 * hill(-240, -300, 160, 150));
  let height = (forest * (1 - tropical) + jungle * tropical) * (1 - snow) + alpine * snow;
  const forestCut = Math.abs(x - (-210 + 27 * Math.sin(z * 0.016)));
  const alpineCut = Math.abs(x - (65 + 20 * Math.sin(z * 0.024)));
  height *= 1 - 0.85 * (1 - smooth(7, 38, forestCut)) * smooth(-170, -90, z) * (1 - smooth(230, 310, z));
  height *= 1 - 0.90 * (1 - smooth(6, 35, alpineCut)) * snow;
  // The Parrot River and lakes cut low gorges through the tropical highlands.
  height *= smooth(5, 70, bank) * smooth(12, 110, inland);
  // Waterfall arches and their hidden entrances retain a level, walk-through floor.
  for (const fall of WATERFALLS) height *= smooth(35, 70, Math.hypot(x - fall.x, z - fall.z));
  return height;
}
