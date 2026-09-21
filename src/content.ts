import type { Ammo, Location, Obstacle, Role, Species, Vec } from "./types";
import { coastPoint, onIsland, waterAt, WATERFALLS, RIVER } from "./geography";
import { landscapeHeight } from "./terrain";
export { WORLD_SIZE } from "./geography";
export const CATCHING = {
  center: 0.72,
  cycle: 2.88,
  widths: [0.5, 0.38, 0.28],
};
export const catchingWidth = (rarity: number, rod: number) =>
  CATCHING.widths[rarity - 1] * (1 + (rod - 1) * 0.25);
export const catchingPosition = (cycle: number) => {
  const phase = (cycle % CATCHING.cycle) / (CATCHING.cycle / 2);
  return phase <= 1 ? phase : 2 - phase;
};
export const catchingTargetWidth = (rarity: number, rod: number) =>
  Math.min(1, catchingWidth(rarity, rod) / (CATCHING.cycle / 2));
export const catchingReady = (cycle: number, rarity: number, rod: number) =>
  Math.abs(catchingPosition(cycle) - 0.5) <=
  catchingTargetWidth(rarity, rod) / 2 + 1e-9;
export const SPECIES: Record<
  Species,
  {
    name: string;
    ammo: Ammo;
    damage: number;
    rate: number;
    magazine: number;
    reload: number;
    bundle: number;
    branches: string[];
  }
> = {
  pistol: {
    name: "Pistol Gunfish",
    ammo: "pistol",
    damage: 24,
    rate: 4,
    magazine: 8,
    reload: 1,
    bundle: 16,
    branches: ["Deadeye", "Fanfire"],
  },
  rifle: {
    name: "Auto Rifle Gunfish",
    ammo: "rifle",
    damage: 12,
    rate: 10,
    magazine: 24,
    reload: 1.8,
    bundle: 48,
    branches: ["Spool", "Hammer"],
  },
  shotgun: {
    name: "Shotgun Gunfish",
    ammo: "shells",
    damage: 9,
    rate: 1,
    magazine: 5,
    reload: 0.55,
    bundle: 10,
    branches: ["Sweeper", "Slug"],
  },
};
export const MONSTERS: Record<
  Role,
  {
    health: number;
    damage: number;
    cost: number;
    speed: number;
    range: number;
    windup: number;
    recovery: number;
    reward: number;
  }
> = {
  skitter: {
    health: 60,
    damage: 20,
    cost: 1,
    speed: 3.5,
    range: 4,
    windup: 0.8,
    recovery: 1.2,
    reward: 1,
  },
  ramjaw: {
    health: 100,
    damage: 35,
    cost: 2,
    speed: 2.8,
    range: 12,
    windup: 1.3,
    recovery: 2.2,
    reward: 1,
  },
  spitter: {
    health: 180,
    damage: 25,
    cost: 2,
    speed: 2,
    range: 26,
    windup: 1.2,
    recovery: 2.5,
    reward: 2,
  },
  shellback: {
    health: 600,
    damage: 40,
    cost: 4,
    speed: 1.4,
    range: 9,
    windup: 2,
    recovery: 3,
    reward: 4,
  },
};
export const LANDMARKS = [
  { x: -620, z: 170, name: "Willowwood Windmill", kind: "windmill" },
  { x: -340, z: -410, name: "Snowbell Lodge", kind: "lodge" },
  { x: 560, z: -510, name: "Frostcrown Spire", kind: "crystal" },
  { x: 410, z: 470, name: "Sunburst Lighthouse", kind: "lighthouse" },
  { x: 780, z: 140, name: "Coral Gate", kind: "arch" },
  { x: -180, z: 200, name: "Mushroom Picnic", kind: "mushroom" },
].map(p => ({ ...p, x: p.x * 0.6, z: p.z * 0.6 }));
export const LANDMARK_OBSTACLES: Obstacle[] = LANDMARKS.flatMap((p): Obstacle[] => {
  if (p.kind === "arch") return [-10, 10].map(dx => ({ x: p.x + dx, z: p.z, width: 5, depth: 6, height: 18 }));
  if (p.kind === "mushroom") return [-9, 0, 9].map(dx => ({ x: p.x + dx, z: p.z, width: 3.6, depth: 3.6, height: 6 }));
  if (p.kind === "crystal") return [-8, 0, 8].map(dx => ({ x: p.x + dx, z: p.z, width: 8, depth: 8, height: dx ? 20 : 40 }));
  return [{ x: p.x, z: p.z, width: p.kind === "lighthouse" ? 10 : 15, depth: 12, height: p.kind === "lighthouse" ? 38 : 16 }];
});
export const LOCATIONS: Location[] = (
  [
    {
      x: -360,
      z: -250,
      name: "Willow Haven",
      region: "Reedbeds",
      exposed: false,
      species: "pistol",
    },
    {
      x: -430,
      z: 60,
      name: "Reedwater Reach",
      region: "Reedbeds",
      exposed: true,
      species: "pistol",
    },
    {
      x: -30,
      z: 410,
      name: "Lockkeeper Bay",
      region: "Flood Channel",
      exposed: false,
      species: "rifle",
    },
    {
      x: 260,
      z: 340,
      name: "Spillway",
      region: "Flood Channel",
      exposed: true,
      species: "rifle",
    },
    {
      x: 410,
      z: -190,
      name: "Slate Refuge",
      region: "Sunken Quarry",
      exposed: false,
      species: "shotgun",
    },
    {
      x: 140,
      z: -360,
      name: "The Deep Cut",
      region: "Sunken Quarry",
      exposed: true,
      species: "shotgun",
    },
  ] satisfies Location[]
);
LOCATIONS.push(
  { x: 190, z: 115, name: "Papaya Lake", region: "Sunburst Shores", exposed: true, species: "rifle" },
  { x: 145, z: 240, name: "Lotus Looking Glass", region: "Sunburst Shores", exposed: false, species: "pistol" },
  { x: 310, z: 70, name: "Jade Falls", region: "Sunburst Shores", exposed: true, species: "shotgun" },
  { x: 310, z: 20, name: "Whisperfin Grotto", region: "Sunburst Shores", exposed: true, species: "shotgun", secret: true },
  { x: 350, z: 210, name: "Blue Parrot Bend", region: "Sunburst Shores", exposed: true, species: "rifle" },
  { x: -160, z: 90, name: "Moonpetal Spring", region: "Willowwood Forest", exposed: false, species: "pistol", secret: true },
  { x: 440, z: 105, name: "Orchid Falls", region: "Sunburst Shores", exposed: false, species: "rifle" },
);
for (const p of RIVER.slice(1).filter(p => Math.hypot(p.x - 350, p.z - 210) > 30)) {
  LOCATIONS.push({ ...p, name: "Parrot River", region: "Sunburst Shores", exposed: false, species: "rifle" });
}
// Schools around the entire shoreline make every stretch of beach worth a cast.
for (let i = 0; i < 72; i++) LOCATIONS.push({
  ...coastPoint(i * Math.PI * 2 / 72, -14), name: "Coral Coast", region: "Open Ocean",
  exposed: true, species: (["pistol", "rifle", "shotgun"] as const)[i % 3],
});
export const POCKETS: Vec[] = LOCATIONS.slice(0, 6).map((p) => ({ x: p.x, z: p.z + 20 }));
const TERRAIN_PLAZAS = LANDMARKS.map(p => ({ ...p, height: Math.min(landscapeHeight(p), ...Array.from({ length: 32 }, (_, i) => {
  const angle = i * Math.PI / 16;
  return landscapeHeight({ x: p.x + Math.cos(angle) * 34, z: p.z + Math.sin(angle) * 34 });
})) }));
export function terrainHeight(point: Vec): number {
  const height = landscapeHeight(point);
  // Level plazas keep multipart landmarks and their collision shapes grounded.
  for (const landmark of TERRAIN_PLAZAS) {
    const distance = Math.hypot(point.x - landmark.x, point.z - landmark.z);
    if (distance >= 32) continue;
    const t = Math.max(0, (distance - 24) / 8);
    const blend = t * t * (3 - 2 * t);
    return Math.min(height, landmark.height) * (1 - blend) + height * blend;
  }
  return height;
}
export const OBSTACLES: Obstacle[] = LOCATIONS.slice(0, 6).flatMap((p, i) => [
  { x: p.x - 25, z: p.z + 22, width: 9, depth: 18, height: 5 },
  { x: p.x + 24, z: p.z + 28, width: 12, depth: 9, height: 4 },
  { x: p.x + 35, z: p.z - 27, width: 16, depth: 12, height: 6 + i },
  { x: p.x - 48, z: p.z - 12, width: 10, depth: 24, height: 7 },
]);
// Broken cover along the outer circuit; the central shortcut has much longer sightlines.
for (const [radius, count] of [
  [490, 16],
  [370, 20],
  [250, 12],
  [140, 6],
]) {
  for (let i = 0; i < count; i++) {
    const angle = ((i + 0.5) / count) * Math.PI * 2;
    const point = { x: Math.sin(angle) * radius, z: Math.cos(angle) * radius };
    if (!onIsland(point, 25) || waterAt(point) || LOCATIONS.some((p) => Math.hypot(p.x - point.x, p.z - point.z) < 65))
      continue;
    OBSTACLES.push({
      ...point,
      width: point.x < -200 ? 24 : 14,
      depth: point.x < -200 ? 32 : 18,
      height: point.z < -200 ? 9 : 5,
    });
  }
}
OBSTACLES.push(...LANDMARK_OBSTACLES);
export const WATERFALL_OBSTACLES: Obstacle[] = WATERFALLS.flatMap(f => [-1, 1].map(side => ({ x: f.x + side * 15, z: f.z, width: 10, depth: 18, height: f.height })));
for (let i = 0; i <= 12; i++) {
  const a = Math.PI + i * Math.PI / 12;
  WATERFALL_OBSTACLES.push({ x: 310 + Math.cos(a) * 27, z: 20 + Math.sin(a) * 24, width: 11, depth: 10, height: 14 });
}
OBSTACLES.push(...WATERFALL_OBSTACLES);
export const PHASES = [
  { start: 0, end: 120, target: 2, delayStart: 30, delayEnd: 25 },
  { start: 120, end: 360, target: 4, delayStart: 25, delayEnd: 20 },
  { start: 360, end: 660, target: 6, delayStart: 20, delayEnd: 15 },
  { start: 660, end: 900, target: 8, delayStart: 15, delayEnd: 10 },
];
const roles: Record<string, Role> = {
  S: "skitter",
  J: "ramjaw",
  R: "spitter",
  B: "shellback",
};
const mix = (weight: number, text: string) => ({
  weight,
  roles: [...text].map((c) => roles[c]),
});
export const MIXES = [
  [[mix(1, "SS")], [mix(1, "SJ")], [mix(1, "SJJ")]],
  [
    [mix(0.7, "SSRR"), mix(0.3, "SJRR")],
    [mix(0.3, "SSRR"), mix(0.7, "SJRR")],
    [mix(0.6, "SJRRR"), mix(0.4, "JJRRR")],
  ],
  [
    [mix(0.6, "SSRRRB"), mix(0.4, "SJRRRB")],
    [mix(0.6, "SJRRBB"), mix(0.4, "JJRRBB")],
    [mix(0.6, "SJJRRBB"), mix(0.4, "JJJRRBB")],
  ],
  [
    [mix(0.6, "SJJRRRBB"), mix(0.4, "JJJRRRBB")],
    [mix(0.6, "SJJRRBBB"), mix(0.4, "JJJRRBBB")],
    [mix(0.6, "JJJRRRBBB"), mix(0.4, "SJJRRRBBB")],
  ],
];
