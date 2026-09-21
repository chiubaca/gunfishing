export type Vec = { x: number; z: number };
export type Species = "pistol" | "rifle" | "shotgun";
export type Ammo = "pistol" | "rifle" | "shells";
export type Role = "skitter" | "ramjaw" | "spitter" | "shellback";
export type Stat = "damage" | "rate" | "magazine";
export interface Gunfish {
  id: string;
  species: Species;
  rarity: number;
  magazine: number;
  ranks: Record<Stat, number>;
  branch: string | null;
  stage: number;
}
export interface Fish extends Vec {
  id: string;
  species: Species;
  rarity: number;
  interest: number;
  cooldown: number;
  landed: boolean;
  home: Vec;
}
export interface Monster extends Vec {
  id: string;
  role: Role;
  health: number;
  heading: number;
  alerted: boolean;
  target: string | null;
  windup: number;
  recovery: number;
  lane: Vec | null;
  lost: number;
  stagger: number;
  staggerTime: number;
  repositioned: boolean;
}
export interface Mounted extends Vec {
  id: string;
  gunfish: Gunfish;
  health: number;
  maxHealth: number;
  fuel: number;
  cooldown: number;
  charge: number;
  shots: number;
}
export interface Drop extends Vec {
  id: string;
  type: "resource" | "beer" | Ammo;
  amount: number;
}
export interface Projectile extends Vec {
  id: string;
  y: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  damage: number;
  hostile: boolean;
  radius: number;
  pierce: number;
  stagger: number;
  traveled: number;
  hit: string[];
  owner: string;
}
export interface Cache extends Vec {
  rod: number;
  gunfish: Gunfish | null;
}
export interface Location extends Vec {
  secret?: boolean;
  name: string;
  region: string;
  exposed: boolean;
  species: Species;
}
export interface Obstacle extends Vec {
  width: number;
  depth: number;
  height: number;
}
export interface Cast {
  lure: Vec;
  fishId: string | null;
  phase: "lure" | "catch";
  elapsed: number;
  hits: number;
  misses: number;
  cycle: number;
  tug: number;
}
export interface Hold {
  kind: "mount" | "drink" | "service" | "recover";
  elapsed: number;
  duration: number;
  target: string | null;
}
export interface RunState {
  version: 1;
  worldVersion?: number;
  seed: number;
  nextId: number;
  elapsed: number;
  status: "playing" | "failure" | "victory";
  resultTime: number;
  player: Vec & {
    health: number;
    heading: number;
    pitch: number;
    y: number;
    vy: number;
  };
  mode: "fishing" | "drawing" | "combat" | "returning";
  transition: number;
  lineLinger: number;
  cast: Cast | null;
  threat: number;
  rod: number;
  arsenal: Gunfish[];
  slots: [string | null, string | null];
  active: number;
  supplies: ("beer" | Ammo)[];
  reserves: Record<Ammo, number>;
  resource: number;
  mounted: Mounted[];
  fish: Fish[];
  monsters: Monster[];
  drops: Drop[];
  projectiles: Projectile[];
  cache: Cache | null;
  replacedCache: boolean;
  powerHistory: Record<string, number>;
  power: number;
  phase: number;
  refill: number | null;
  lull: number;
  guaranteedRole: Role | null;
  arsenalOpen: boolean;
  aiming: boolean;
  sprinting: boolean;
  reload: number;
  fireCooldown: number;
  rodCooldown: number;
  bufferedShot: boolean;
  charge: number;
  spool: number;
  sinceShot: number;
  shots: number;
  hold: Hold | null;
  prompt: string;
  completed: string[];
  notice: string;
  noticeTime: number;
  kills: number;
  catches: number;
}
export type Action =
  | { type: "cast"; point: Vec }
  | { type: "tug"; x: number; z: number; strong?: boolean }
  | {
      type:
        | "catch"
        | "cancel"
        | "fish"
        | "fire"
        | "reload"
        | "rod"
        | "jump"
        | "mount"
        | "drink"
        | "interact"
        | "release"
        | "next";
    }
  | { type: "draw"; slot?: number }
  | { type: "arsenal"; open?: boolean }
  | { type: "assign"; id: string; slot: number }
  | { type: "upgrade"; id: string; stat: Stat }
  | { type: "rodUpgrade" }
  | { type: "evolve"; id: string; donors: string[]; branch: string }
  | { type: "supply"; index: number; drop?: boolean };
export interface Input {
  x?: number;
  z?: number;
  heading?: number;
  pitch?: number;
  aim?: boolean;
  sprint?: boolean;
  fire?: boolean;
  reel?: boolean;
}
export interface Scenario {
  state?: Partial<RunState>;
  cache?: Cache | null;
  lineOfSight?: (a: Vec, b: Vec) => boolean;
  damage?: (state: RunState, dt: number) => number;
}
export interface EvolutionPreview {
  valid: boolean;
  required: number;
  donors: Gunfish[];
  warning: string;
}
