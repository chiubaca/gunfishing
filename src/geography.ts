import type { Vec } from "./types";

export const WORLD_SIZE = 1280;
export const coastRadius = (angle: number) => 535 + 24 * Math.sin(angle * 3 + 0.6) + 18 * Math.cos(angle * 5);
export const onIsland = (p: Vec, margin = 0) => Math.hypot(p.x, p.z) <= coastRadius(Math.atan2(p.z, p.x)) - margin;
export const coastPoint = (angle: number, inset = 0): Vec => ({ x: Math.cos(angle) * (coastRadius(angle) - inset), z: Math.sin(angle) * (coastRadius(angle) - inset) });
export const ISLAND = Array.from({ length: 160 }, (_, i) => coastPoint(i * Math.PI * 2 / 160));

export interface WaterBody { name: string; outline: Vec[]; secret?: boolean }
export function pool(name: string, x: number, z: number, rx: number, rz: number, turn = 0, secret = false): WaterBody {
  return { name, secret, outline: Array.from({ length: 64 }, (_, i) => {
    const a = i * Math.PI * 2 / 64, r = 1 + 0.12 * Math.sin(3 * a) + 0.08 * Math.cos(5 * a);
    const dx = Math.cos(a) * rx * r, dz = Math.sin(a) * rz * r;
    return { x: x + dx * Math.cos(turn) - dz * Math.sin(turn), z: z + dx * Math.sin(turn) + dz * Math.cos(turn) };
  }) };
}
export const RIVER: Vec[] = [{ x: 310, z: 70 }, { x: 285, z: 103 }, { x: 322, z: 140 }, { x: 300, z: 178 }, { x: 350, z: 210 }, { x: 368, z: 252 }, { x: 340, z: 286 }, { x: 380, z: 320 }, { x: 404, z: 375 }];
const riverOutline = (points: Vec[], width: number): Vec[] => {
  const side = (sign: number) => points.map((p, i) => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    return { x: p.x - (b.z - a.z) / length * width * sign, z: p.z + (b.x - a.x) / length * width * sign };
  });
  return [...side(1), ...side(-1).reverse()];
};
// Catmull–Rom interpolation rounds the bends while retaining the authored landmarks.
const smoothRiver: Vec[] = RIVER.flatMap((b, i) => {
  if (i === RIVER.length - 1) return [b];
  const a = RIVER[Math.max(0, i - 1)], c = RIVER[i + 1], d = RIVER[Math.min(RIVER.length - 1, i + 2)];
  return Array.from({ length: 8 }, (_, j) => {
    const t = j / 8;
    const axis = (key: keyof Vec) => 0.5 * (2 * b[key] + (-a[key] + c[key]) * t + (2 * a[key] - 5 * b[key] + 4 * c[key] - d[key]) * t * t + (-a[key] + 3 * b[key] - 3 * c[key] + d[key]) * t * t * t);
    return { x: axis("x"), z: axis("z") };
  });
});
export const WATER_BODIES: WaterBody[] = [
  pool("Willow Haven", -360, -250, 20, 17),
  pool("Reedwater Reach", -430, 60, 27, 15, -0.6),
  pool("Lockkeeper Bay", -30, 410, 38, 22, 0.3),
  pool("Spillway", 260, 340, 24, 32, -0.5),
  pool("Slate Refuge", 410, -190, 14, 14),
  pool("The Deep Cut", 140, -360, 14, 14),
  pool("Papaya Lake", 190, 115, 57, 35, -0.4),
  pool("Lotus Looking Glass", 145, 240, 19, 27, 0.7),
  pool("Jade Falls", 310, 70, 30, 23),
  pool("Whisperfin Grotto", 310, 20, 19, 16, 0, true),
  pool("Blue Parrot Bend", 350, 210, 23, 17),
  pool("Moonpetal Spring", -160, 90, 25, 16, 0.9, true),
  pool("Orchid Falls", 440, 105, 20, 24),
  { name: "Parrot River", outline: riverOutline(smoothRiver, 10) },
];
export function insideOutline(p: Vec, outline: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i], b = outline[j];
    if ((a.z > p.z) !== (b.z > p.z) && p.x < (b.x - a.x) * (p.z - a.z) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}
export const waterAt = (p: Vec) => !onIsland(p) || WATER_BODIES.some(w => insideOutline(p, w.outline));
export const WATERFALLS = [{ x: 310, z: 44, height: 24, secret: true }, { x: 440, z: 79, height: 17, secret: false }];
