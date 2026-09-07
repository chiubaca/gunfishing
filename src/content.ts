import type { Ammo, Location, Obstacle, Role, Species, Vec } from "./types";
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
export const WORLD_SIZE = 2660;
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
).map((p) => ({ ...p, x: p.x * 1.9, z: p.z * 1.9 }));
export const POCKETS: Vec[] = LOCATIONS.map((p) => ({ x: p.x, z: p.z + 20 }));
export function terrainHeight(point: Vec): number {
  for (const basin of LOCATIONS) {
    if (basin.region !== "Sunken Quarry") continue;
    const radius = Math.hypot(point.x - basin.x, point.z - basin.z);
    if (radius < 100)
      return radius <= 20
        ? 0
        : radius < 45
          ? ((radius - 20) * 6) / 25
          : radius <= 60
            ? 6
            : ((100 - radius) * 6) / 40;
  }
  return 0;
}
export const OBSTACLES: Obstacle[] = LOCATIONS.flatMap((p, i) => [
  { x: p.x - 25, z: p.z + 22, width: 9, depth: 18, height: 5 },
  { x: p.x + 24, z: p.z + 28, width: 12, depth: 9, height: 4 },
  { x: p.x + 35, z: p.z - 27, width: 16, depth: 12, height: 6 + i },
  { x: p.x - 48, z: p.z - 12, width: 10, depth: 24, height: 7 },
]);
// Broken cover along the outer circuit; the central shortcut has much longer sightlines.
for (const [radius, count] of [
  [1180, 16],
  [850, 28],
  [450, 12],
  [140, 6],
]) {
  for (let i = 0; i < count; i++) {
    const angle = ((i + 0.5) / count) * Math.PI * 2;
    const point = { x: Math.sin(angle) * radius, z: Math.cos(angle) * radius };
    if (LOCATIONS.some((p) => Math.hypot(p.x - point.x, p.z - point.z) < 85))
      continue;
    OBSTACLES.push({
      ...point,
      width: point.x < -200 ? 24 : 14,
      depth: point.x < -200 ? 32 : 18,
      height: point.z < -200 ? 9 : 5,
    });
  }
}
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
