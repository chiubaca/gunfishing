/// <reference types="vite/client" />
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { buildNature, buildTerrain } from "./nature";
import { BIOMES, biomeAt, buildExploration, createMinimap } from "./exploration";
import { Run } from "./run";
import {
  catchingPosition,
  catchingReady,
  catchingTargetWidth,
  catchingWidth,
  LOCATIONS,
  LANDMARK_OBSTACLES,
  WATERFALL_OBSTACLES,
  MONSTERS,
  OBSTACLES,
  SPECIES,
  terrainHeight,
  WORLD_SIZE,
} from "./content";
import { gunStats } from "./economy";
import type { Action, Gunfish, Monster, Role, Species, Vec } from "./types";
import "./style.css";
import { buildWaterscape } from "./waterscape";
import { createSky } from "./sky";

const app = document.querySelector<HTMLDivElement>("#app")!;
const assetLoader = new GLTFLoader();
app.innerHTML = `
  <main id="game" aria-label="Gunfishers survival game">
    <div id="viewport"></div><div class="vignette"></div>
    <section id="orientation-prompt" aria-label="Landscape orientation recommended"><div class="orientation-card"><span class="orientation-icon" aria-hidden="true">↔</span><span class="eyebrow">WIDER VIEW RECOMMENDED</span><h2>Turn your device sideways</h2><p>Gunfishers is designed to play in landscape.</p></div></section>
    <header class="hud"><div class="brand">GUNFISHERS<span id="region">ONE MORE CAST</span></div>
      <div class="clock"><span id="phase">FIRST LIGHT</span><strong id="clock">15:00</strong></div>
       <div class="tools"><button id="arsenal-button">Arsenal <kbd>Tab</kbd></button><button id="map-toggle" aria-label="Toggle island radar" aria-pressed="true">Map</button><button id="help-button" aria-label="Show controls">?</button><button id="sound" aria-label="Toggle sound">Sound on</button></div>
    </header>
    <aside id="navigation"></aside><div id="fish-label"></div>
    <aside id="exploration-map" aria-label="Exploration radar"><strong>ISLAND RADAR</strong><canvas id="minimap" width="220" height="220" aria-label="North-up map: red enemies, gold landmarks, blue fishing pools"></canvas><span id="radar-status"></span><small>● Enemies · ◆ Landmarks · ● Pools<br>Edge arrows: distant enemies</small><p id="discovery" role="status"></p></aside>
     <div id="reticle"><i></i></div><div id="notice" role="status"></div>
    <section id="catch-meter" hidden aria-label="Catch timing">
      <div class="catch-heading"><strong id="catch-cue" role="status"></strong><span id="catch-progress"></span></div>
      <button id="catch-track" aria-label="Catch fish" aria-describedby="catch-instruction catch-risk"><span class="catch-rail" aria-hidden="true"><span id="catch-target"></span><span class="catch-midpoint"></span><span id="catch-box"><i></i></span></span></button>
      <p id="catch-instruction">Press E / click when the box center is inside the target</p>
      <small id="catch-risk"></small>
    </section>
    <footer class="hud bottom"><div class="vitals"><span>VITALITY <strong id="health">100</strong></span><div class="health-track"><i id="health-fill"></i></div><span class="threat">THREAT <strong id="threat">12 m</strong></span><small id="power">GUNFISH POWER 0 / LOW</small></div>
      <div class="guidance"><p id="prompt"></p><span id="interaction"></span><small id="mode-help">Click water to cast · F fishing · 1 / 2 draw</small></div>
      <div class="kit"><div id="ammo">ROD READY</div><div id="slots"></div><small id="resource">0 upgrade resource · 2 / 8 supplies</small></div>
    </footer>
    <section id="arsenal" class="panel" hidden aria-label="Gunfish arsenal"><div class="panel-heading"><div><span class="eyebrow">EXPOSED TO THE WORLD</span><h2>Gunfish arsenal</h2></div><button id="close-arsenal">Close <kbd>Tab</kbd></button></div><p class="muted">Walk slowly. Time and monsters never stop here. Purchases and sacrifices are permanent.</p><div id="arsenal-content"></div></section>
    <section id="help" class="panel help" hidden><div class="panel-heading"><h2>Field guide</h2><button id="close-help">Close</button></div><p>Survive until dawn. Every Cast expands Threat for the rest of the Run. It lets existing monsters hear your fishing through cover; it never summons them.</p><dl>
      <dt>W A S D / Shift / Space</dt><dd>Move / sprint / jump. Sprint lowers your Gunfish.</dd>
      <dt>F / 1 / 2 / Q</dt><dd>Fishing / draw Primary / draw Secondary / cancel immediately.</dd>
      <dt>Click water / arrows / hold R</dt><dd>Place the Lure beside a fish / gently tug / reel toward you. Alternate gentle tugs; don't land directly on a fish.</dd>
      <dt>E / click / tap the catch track</dt><dd>On a bite, a box swings across the track. Press when its center marker is inside the gold target. Land Tier + 2 hits. Two consecutive mistimed presses lose the fish; waiting never counts as a miss. The fish, line and sound also signal the target window.</dd>
       <dt>Mouse look / right mouse</dt><dd>Move to turn freely. Click to fire; hold for Auto Rifle. Hold right mouse for precision aim.</dd>
      <dt>R / V</dt><dd>Reload / committed Rod attack, even without ammunition.</dd>
      <dt>Hold E / hold M / hold B</dt><dd>Collect or service / sacrifice active Gunfish as a defender / drink Beer.</dd>
      <dt>Tab</dt><dd>Assign slots, unpack ammo bundles, upgrade or merge same-species Gunfish.</dd>
     </dl><p>Head toward a location marker to find more visible fish. Sheltered pools favor common catches. Exposed hotspots favor rarity. A Recovery marker shows the exact equipment from your last failure.</p><p class="muted">On touch screens: use the left thumbstick, drag the world to look, tap water to place, and use the right-side action buttons. The app resumes your current Run when reopened. This guide does not pause play.</p></section>
     <section id="welcome" class="overlay"><div class="intro"><span class="eyebrow">A SOLO SURVIVAL FIELD EXPERIMENT</span><h1>One more<br><em>cast.</em></h1><p>Fish for living guns. Hold your ground.<br>Make it to dawn, or leave something worth returning for.</p><button id="start" class="primary">Enter the waterlands <span>15 MINUTE RUN</span></button><small>WASD to move · Mouse to cast and fire · Headphones recommended</small></div><div class="intro-note">THE WATER GIVES.<br>THE WATER REMEMBERS.</div></section>
    <section id="results" class="overlay" hidden><div class="intro"><span class="eyebrow" id="result-eyebrow"></span><h1 id="result-title"></h1><p id="result-copy"></p><div id="result-stats"></div><button id="next" class="primary">Start the next Run</button></div></section>
     <div id="touch" aria-label="Touch controls"><div class="move-controls"><div id="joystick" class="joystick" role="group" aria-label="Move joystick"><span id="joystick-knob" class="joystick-knob" aria-hidden="true"></span></div><button class="touch-sprint" data-key="ShiftLeft">Run</button></div><div class="touch-actions"><button data-touch="main" data-control="main" data-mode="both">Cast</button><button data-key="KeyE" data-control="interact" data-mode="both">Catch</button><button data-key="KeyR" data-control="reel" data-mode="both">Reel</button><button data-key="ArrowLeft" data-control="tug" data-mode="fishing">Tug L</button><button data-key="ArrowRight" data-control="tug" data-mode="fishing">Tug R</button><button data-key="Digit1" data-mode="shooting">Primary</button><button data-key="Digit2" data-mode="shooting">Secondary</button><button data-key="KeyF" data-mode="shooting">Fish</button><button data-key="KeyQ" data-control="cancel" data-mode="both">Cancel</button><button data-key="KeyV" data-mode="shooting">Rod</button><button data-key="KeyM" data-mode="shooting">Mount</button><button data-key="KeyB" data-mode="shooting">Beer</button><button data-key="Space" data-mode="both">Jump</button><button data-touch="aim" data-mode="shooting">Aim</button></div></div>
    <div id="save-warning" role="alert" hidden></div>
  </main>`;
const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const updateMinimap = createMinimap(el<HTMLCanvasElement>("minimap"), el("radar-status"), el("discovery"));
const text = (id: string, value: string) => {
  if (el(id).textContent !== value) el(id).textContent = value;
};
const tiers = ["", "I", "II", "III"];
const colors: Record<Species, number> = {
  pistol: 0xf1ce81,
  rifle: 0x87cfb2,
  shotgun: 0xe3957d,
};
const rarityColors = [0, 0xd2ddba, 0x79d8eb, 0xdfa0f2];
const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.z - b.z);
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const describe = (g: Gunfish) =>
  `${SPECIES[g.species].name} · Tier ${tiers[g.rarity]} · ${g.branch ? `${g.branch} ${tiers[g.stage]}` : "Unevolved"} · Damage ${g.ranks.damage} / Rate ${g.ranks.rate} / Magazine ${g.ranks.magazine}`;
const SAVE_KEY = "gunfishers.first-playable.v1";
let run = new Run(),
  started = false,
  muted = false;
try {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    run = new Run({ saved });
    started = true;
    el("welcome").hidden = true;
  }
} catch {
  el("save-warning").hidden = false;
  text(
    "save-warning",
    "Your saved Run could not be read. The existing save has not been removed.",
  );
}
function persist() {
  if (!started) return;
  try {
    localStorage.setItem(SAVE_KEY, run.save());
  } catch {
    el("save-warning").hidden = false;
    text(
      "save-warning",
      "Storage unavailable. This Run cannot survive closing the tab.",
    );
  }
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9d9d2);
scene.fog = new THREE.FogExp2(0xb9d9d2, 0.0028);
const camera = new THREE.PerspectiveCamera(
  48,
  innerWidth / innerHeight,
  0.1,
  480,
);
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
} catch {
  el("welcome").innerHTML =
    '<div class="intro"><h1>WebGL unavailable</h1><p>Gunfishers needs a browser with hardware-accelerated WebGL. Enable graphics acceleration and reload.</p></div>';
  throw new Error("WebGL unavailable");
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
el("viewport").append(renderer.domElement);
renderer.domElement.setAttribute(
  "aria-label",
  "3D world. Click water to cast; click to fire in combat.",
);
const sun = new THREE.DirectionalLight(0xffddb0, 3.1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -65;
sun.shadow.camera.right = 65;
sun.shadow.camera.top = 65;
sun.shadow.camera.bottom = -65;
sun.shadow.camera.far = 180;
sun.shadow.bias = -0.001;
scene.add(sun, sun.target);
const sky = createSky(scene, sun);
const materials = new Map<number, THREE.MeshStandardMaterial>();
function material(color: number) {
  if (!materials.has(color))
    materials.set(
      color,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.82,
        flatShading: true,
      }),
    );
  return materials.get(color)!;
}
const boxGeometry = new THREE.BoxGeometry(1, 1, 1),
  sphereGeometry = new THREE.IcosahedronGeometry(1, 1);
function mesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  color: number,
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1,
) {
  const m = new THREE.Mesh(geometry, material(color));
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
const terrainMeshes = buildTerrain(scene);
buildExploration(scene);
void buildNature(scene).catch((error: unknown) => {
  console.error("Nature scenery loading failed", error);
  el("save-warning").hidden = false;
  text("save-warning", "Some scenery could not load. You can still play; reload to retry.");
});
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x268b86,
  roughness: 0.22,
  metalness: 0.25,
  transparent: false,
});
const cameraObstacles: THREE.Object3D[] = [...terrainMeshes];
const waters = buildWaterscape(scene, waterMaterial, cameraObstacles);
const ringGeometry = new THREE.RingGeometry(0.93, 1, 48);
const rippleMaterial = new THREE.MeshBasicMaterial({
  color: 0xdcf1da,
  transparent: true,
  opacity: 0.4,
  side: THREE.DoubleSide,
});
function ring(
  parent: THREE.Object3D,
  radius: number,
  mat: THREE.Material = rippleMaterial,
) {
  const m = new THREE.Mesh(ringGeometry, mat);
  m.rotation.x = -Math.PI / 2;
  m.scale.setScalar(radius);
  parent.add(m);
  return m;
}
for (const [index, location] of LOCATIONS.entries()) {
  if (index >= 6) continue;
  for (let j = 0; j < 44; j++) {
    const a = j * 2.399,
      radius = 15 + (j % 4) * 0.7;
    if (j % 6 === 0) continue;
    const x = location.x + Math.sin(a) * radius,
      z = location.z + Math.cos(a) * radius;
    mesh(
      scene,
      boxGeometry,
      index < 2 ? 0x455e3c : 0x6a7154,
      x,
      terrainHeight({ x, z }) + 0.65,
      z,
      0.11,
      1 + (j % 3) * 0.3,
      0.11,
    ).rotation.z = Math.sin(j) * 0.2;
  }
  for (let j = 0; j < 5; j++) {
    mesh(
      scene,
      boxGeometry,
      0x766951,
      location.x + 3 + j * 0.8,
      terrainHeight({ x: location.x + 3 + j * 0.8, z: location.z + 14 }) + 0.32,
      location.z + 14,
      0.7,
      0.3,
      5,
    );
  }
}
for (const [i, o] of OBSTACLES.entries()) {
  const ground = terrainHeight(o);
    if (LANDMARK_OBSTACLES.includes(o) || WATERFALL_OBSTACLES.includes(o)) {
    const collider = mesh(scene, boxGeometry, 0xffffff, o.x, ground + o.height / 2, o.z, o.width, o.height, o.depth);
    collider.visible = false;
    cameraObstacles.push(collider);
    continue;
  }
  cameraObstacles.push(
    mesh(
      scene,
      sphereGeometry,
      biomeAt(o) === "snow" ? 0xa6c8dc : biomeAt(o) === "tropical" ? 0xd5aa78 : 0x708e78,
      o.x,
      ground + o.height / 2,
      o.z,
      o.width * 0.72,
      o.height * 0.65,
      o.depth * 0.72,
    ),
  );
  mesh(
    scene,
    sphereGeometry,
    biomeAt(o) === "snow" ? 0xeef8ff : biomeAt(o) === "tropical" ? 0xf4d59a : 0x7dac50,
    o.x,
    ground + o.height * 0.83,
    o.z,
    o.width * 0.53,
    o.height * 0.27,
    o.depth * 0.53,
  );
}
// Low, traversable causeways indicate the outer circuit and exposed central shortcuts.
for (let i = 0; i < 6; i++) {
  const a = LOCATIONS[i],
    b = LOCATIONS[(i + 1) % 6];
  const path = mesh(
    scene,
    boxGeometry,
    0x8e9276,
    (a.x + b.x) / 2,
    0.015,
    (a.z + b.z) / 2,
    7,
    0.025,
    distance(a, b),
  );
  path.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  const shortcut = mesh(
    scene,
    boxGeometry,
    0x7b8977,
    a.x / 2,
    0.01,
    a.z / 2,
    4,
    0.02,
    Math.hypot(a.x, a.z),
  );
  shortcut.rotation.y = Math.atan2(a.x, a.z);
}
const player = new THREE.Group();
scene.add(player);
const playerBody = new THREE.Group();
playerBody.name = "player-fallback";
player.add(playerBody);
mesh(playerBody, boxGeometry, 0x233f3b, 0, 1.1, 0, 0.65, 1, 0.42);
mesh(playerBody, sphereGeometry, 0xc6a37d, 0, 1.93, 0, 0.3, 0.34, 0.3);
mesh(
  playerBody,
  new THREE.CylinderGeometry(0.52, 0.52, 0.11, 12),
  0xcbbd85,
  0,
  2.14,
  0,
);
mesh(playerBody, boxGeometry, 0x293d38, -0.19, 0.35, 0, 0.22, 0.7, 0.28);
mesh(playerBody, boxGeometry, 0x293d38, 0.19, 0.35, 0, 0.22, 0.7, 0.28);
const rod = mesh(
  player,
  boxGeometry,
  0xc2b489,
  0.42,
  1.8,
  1,
  0.055,
  0.055,
  3.3,
);
rod.rotation.x = -0.3;
const held = new THREE.Group();
held.position.set(0.48, 1.25, 0.7);
player.add(held);
function fishModel(species: Species, rarity: number, parent: THREE.Object3D) {
  const g = new THREE.Group();
  parent.add(g);
  const length = species === "rifle" ? 1.5 : species === "shotgun" ? 1.1 : 0.95;
  mesh(
    g,
    sphereGeometry,
    colors[species],
    0,
    0,
    0,
    species === "shotgun" ? 0.45 : 0.27,
    0.26,
    length * 0.65,
  );
  const tail = mesh(
    g,
    new THREE.ConeGeometry(0.35, 0.5, 3),
    colors[species],
    0,
    0,
    -length * 0.75,
  );
  tail.rotation.x = Math.PI / 2;
  mesh(
    g,
    boxGeometry,
    0x244443,
    0,
    0,
    length * 0.63,
    0.16,
    0.16,
    species === "rifle" ? 0.65 : 0.3,
  );
  mesh(g, sphereGeometry, 0x101d1c, -0.22, 0.14, 0.3, 0.07, 0.07, 0.07);
  mesh(g, sphereGeometry, 0x101d1c, 0.22, 0.14, 0.3, 0.07, 0.07, 0.07);
  for (let i = 0; i < rarity; i++)
    mesh(
      g,
      boxGeometry,
      rarityColors[rarity],
      0,
      0.3,
      -0.2 + i * 0.22,
      0.1,
      0.2,
      0.12,
    );
  return g;
}
let heldId = "";
const entities = new Map<string, THREE.Group>();
const monsterAssetPaths: Record<Role, string> = {
  skitter: "Zombie_Basic.gltf",
  ramjaw: "Zombie_Arm.gltf",
  spitter: "Zombie_Ribcage.gltf",
  shellback: "Zombie_Chubby.gltf",
};
const monsterModelHeights: Record<Role, number> = {
  skitter: 2.1,
  ramjaw: 2.25,
  spitter: 2,
  shellback: 2.6,
};
type MonsterAsset = {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};
const monsterAssets = new Map<Role, MonsterAsset>();
function entity(id: string, create: (g: THREE.Group) => void) {
  let g = entities.get(id);
  if (!g) {
    g = new THREE.Group();
    create(g);
    entities.set(id, g);
    scene.add(g);
  }
  g.userData.live = true;
  return g;
}
function disposeEntity(group: THREE.Object3D) {
  const mixer = group.userData.mixer as THREE.AnimationMixer | undefined;
  if (group.userData.monsterAsset) {
    mixer?.stopAllAction();
    group.removeFromParent();
    return;
  }
  const shared = new Set<THREE.BufferGeometry>([
    boxGeometry,
    sphereGeometry,
    ringGeometry,
  ]);
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (!shared.has(object.geometry)) object.geometry.dispose();
    const used = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const mat of used)
      if (
        mat !== rippleMaterial &&
        ![...materials.values()].includes(mat as THREE.MeshStandardMaterial)
      )
        mat.dispose();
  });
  group.removeFromParent();
}
function resetModels() {
  for (const group of entities.values()) {
    if (group.userData.lane) disposeEntity(group.userData.lane);
    disposeEntity(group);
  }
  entities.clear();
  for (const child of [...held.children]) disposeEntity(child);
  heldId = "";
  alerted.clear();
  winding.clear();
  previousShots = 0;
  previousHealth = 100;
  previousStatus = "";
}
function clearMonsterEntities() {
  for (const [id, group] of entities) {
    if (!group.userData.monster) continue;
    if (group.userData.lane) disposeEntity(group.userData.lane);
    disposeEntity(group);
    entities.delete(id);
  }
}
function setMonsterAnimation(group: THREE.Group, monster: Monster) {
  const actions = group.userData.actions as
    | Map<string, THREE.AnimationAction>
    | undefined;
  if (!actions?.size) return;
  const candidates =
    monster.staggerTime > 0
      ? ["HitReact", "Idle"]
      : monster.windup > 0
        ? ["Idle_Attack", "Run_Attack", "Punch", "Idle"]
        : monster.alerted
          ? ["Run", "Walk", "Idle"]
          : ["Walk", "Idle"];
  const name = candidates.find((candidate) => actions.has(candidate));
  if (!name || name === group.userData.animationName) return;
  const previous = actions.get(group.userData.animationName as string);
  const next = actions.get(name)!;
  previous?.fadeOut(0.15);
  next.reset();
  const oneShot = monster.staggerTime > 0 || monster.windup > 0;
  next.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity);
  next.clampWhenFinished = oneShot;
  next.fadeIn(0.15).play();
  group.userData.animationName = name;
}
function addMonsterAsset(group: THREE.Group, role: Role): boolean {
  const asset = monsterAssets.get(role);
  if (!asset) return false;
  const model = cloneSkinned(asset.scene);
  model.name = "zombie-model";
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const height = Math.max(0.001, bounds.max.y - bounds.min.y);
  const scale = monsterModelHeights[role] / height;
  model.scale.setScalar(scale);
  model.position.y = -bounds.min.y * scale;
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });
  group.add(model);
  const mixer = new THREE.AnimationMixer(model);
  const actions = new Map<string, THREE.AnimationAction>();
  for (const clip of asset.animations) actions.set(clip.name, mixer.clipAction(clip));
  group.userData.monsterAsset = true;
  group.userData.mixer = mixer;
  group.userData.actions = actions;
  const idle = actions.get("Idle");
  if (idle) {
    idle.play();
    group.userData.animationName = "Idle";
  }
  return true;
}
async function loadMonsterAssets() {
  const results = await Promise.allSettled(
    Object.entries(monsterAssetPaths).map(async ([role, file]) => {
      const gltf = await assetLoader.loadAsync(
        `${import.meta.env.BASE_URL}assets/zombie-apocalypse-kit/${file}`,
      );
      monsterAssets.set(role as Role, {
        scene: gltf.scene,
        animations: gltf.animations,
      });
    }),
  );
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length)
    console.warn(`${failed.length} zombie asset(s) failed to load; using fallback meshes.`);
  clearMonsterEntities();
}
void loadMonsterAssets();
let playerMixer: THREE.AnimationMixer | undefined;
let playerActions: Map<string, THREE.AnimationAction> | undefined;
let playerAnimationName = "";
function setPlayerAnimation(name: string) {
  if (!playerActions?.size) return;
  const nextName = playerActions.has(name) ? name : "Idle";
  if (nextName === playerAnimationName) return;
  const previous = playerActions.get(playerAnimationName);
  const next = playerActions.get(nextName);
  if (!next) return;
  previous?.fadeOut(0.15);
  next.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.15).play();
  playerAnimationName = nextName;
}
async function loadPlayerAsset() {
  try {
    const gltf = await assetLoader.loadAsync(
      `${import.meta.env.BASE_URL}assets/zombie-apocalypse-kit/Characters_Shaun.gltf`,
    );
    const model = cloneSkinned(gltf.scene);
    model.name = "shaun-player";
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const height = Math.max(0.001, bounds.max.y - bounds.min.y);
    const scale = 2.2 / height;
    model.scale.setScalar(scale);
    model.position.y = -bounds.min.y * scale;
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
    disposeEntity(playerBody);
    player.add(model);
    playerMixer = new THREE.AnimationMixer(model);
    playerActions = new Map(
      gltf.animations.map((clip) => [clip.name, playerMixer!.clipAction(clip)]),
    );
    playerAnimationName = "";
    setPlayerAnimation("Idle");
  } catch (error) {
    console.warn("Shaun player asset failed to load; using fallback mesh.", error);
  }
}
void loadPlayerAsset();
const threatRing = new THREE.Mesh(
  ringGeometry.clone().rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({
    color: 0xe6b080,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  }),
);
const dangerArc = new THREE.Mesh(
  new THREE.RingGeometry(0.96, 1, 24, 1, -0.24, 0.48).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({
    color: 0xffd19b,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  }),
);
for (const boundary of [threatRing, dangerArc]) {
  boundary.userData.coordinates = new Float32Array(
    boundary.geometry.getAttribute("position").array,
  );
  scene.add(boundary);
}
const placement = ring(
  scene,
  1,
  new THREE.MeshBasicMaterial({
    color: 0xf2e5b9,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  }),
);
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(),
  new THREE.Vector3(),
]);
const line = new THREE.Line(
  lineGeometry,
  new THREE.LineBasicMaterial({ color: 0xffe8b6 }),
);
scene.add(line);
const lure = mesh(scene, sphereGeometry, 0xffe5a1, 0, 0.4, 0, 0.18, 0.3, 0.18);
let lastLure = new THREE.Vector3();
const raycaster = new THREE.Raycaster(),
  pointer = new THREE.Vector2(0, 0.15);
const aimPoint = new THREE.Vector3();
const fishingAimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const fishingAimPoint = new THREE.Vector3();
let fishingHeading = run.state.player.heading;
let hasPointer = false;
let waterPoint: Vec | null = null;
const keys = new Set<string>();
let firing = false,
  aiming = false,
  heading = run.state.player.heading,
  pitch = run.state.player.pitch,
  dragging = false,
  dragX = 0,
  dragY = 0,
  dragDistance = 0;
let audio: AudioContext | null = null;
function unlockAudio() {
  if (!audio) audio = new AudioContext();
  if (audio.state === "suspended") void audio.resume();
}
function tone(frequency: number, duration = 0.09, volume = 0.035, point?: Vec) {
  if (!audio || muted || audio.state !== "running") return;
  const oscillator = audio.createOscillator(),
    gain = audio.createGain();
  oscillator.type = frequency < 160 ? "triangle" : "sine";
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    frequency * 0.65,
    audio.currentTime + duration,
  );
  const range = point ? distance(run.state.player, point) : 0;
  gain.gain.setValueAtTime(volume / (1 + range / 15), audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  oscillator.connect(gain);
  if (point) {
    const pan = audio.createStereoPanner();
    pan.pan.value = Math.sin(
      Math.atan2(point.x - run.state.player.x, point.z - run.state.player.z) -
        heading,
    );
    gain.connect(pan);
    pan.connect(audio.destination);
  } else gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}
function action(a: Action) {
  if (!started) return;
  run.act(a);
  if (a.type === "cast" || a.type === "draw")
    heading = run.state.player.heading;
}
function mainAction() {
  const s = run.state;
  if (s.cast?.phase === "catch") action({ type: "catch" });
  else if (s.mode === "fishing" && !s.cast && waterPoint)
    action({ type: "cast", point: waterPoint });
  else if (s.mode === "combat" || s.mode === "drawing")
    action({ type: "fire" });
}
const touchButtons = [
  ...document.querySelectorAll<HTMLButtonElement>("#touch .touch-actions button"),
];
const joystick = el("joystick"),
  joystickKnob = el("joystick-knob");
let joystickPointerId: number | null = null,
  joystickX = 0,
  joystickY = 0;
function updateTouchControls() {
  const s = run.state;
  const mode = s.mode === "fishing" ? "fishing" : "shooting";
  const castPhase = s.cast?.phase;
  el("touch").dataset.mode = mode;
  for (const button of touchButtons) {
    const control = button.dataset.control;
    const buttonMode = button.dataset.mode;
    let visible = buttonMode === "both" || buttonMode === mode;
    if (control === "main") visible = mode === "shooting" || !s.cast || castPhase === "catch";
    if (control === "reel") visible = mode === "shooting" || castPhase === "lure";
    if (control === "tug") visible = mode === "fishing" && castPhase === "lure";
    if (control === "cancel") visible = !!s.cast || s.mode === "drawing";
    button.hidden = !visible;
  }
  const main = el("touch").querySelector<HTMLButtonElement>('[data-control="main"]');
  const interact = el("touch").querySelector<HTMLButtonElement>('[data-control="interact"]');
  const reel = el("touch").querySelector<HTMLButtonElement>('[data-control="reel"]');
  if (main) main.textContent = mode === "shooting" ? "Fire" : castPhase === "catch" ? "Catch" : "Cast";
  if (interact) interact.textContent = mode === "fishing" && castPhase === "catch" ? "Catch" : "Collect";
  if (reel) reel.textContent = mode === "shooting" ? "Reload" : "Reel";
}
function updateJoystick(clientX: number, clientY: number) {
  const bounds = joystick.getBoundingClientRect();
  const radius = Math.max(1, Math.min(bounds.width, bounds.height) / 2 - joystickKnob.offsetWidth / 2);
  const dx = clientX - (bounds.left + bounds.width / 2),
    dy = clientY - (bounds.top + bounds.height / 2),
    length = Math.hypot(dx, dy),
    scale = Math.min(1, radius / Math.max(1, length)),
    offsetX = dx * scale,
    offsetY = dy * scale;
  joystickX = offsetX / radius;
  joystickY = -offsetY / radius;
  joystickKnob.style.transform = `translate(${offsetX}px, ${offsetY}px) translate(-50%, -50%)`;
}
function resetJoystick() {
  joystickPointerId = null;
  joystickX = 0;
  joystickY = 0;
  joystickKnob.style.transform = "translate(-50%, -50%)";
}
joystick.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  joystickPointerId = e.pointerId;
  joystick.setPointerCapture(e.pointerId);
  updateJoystick(e.clientX, e.clientY);
});
joystick.addEventListener("pointermove", (e) => {
  if (e.pointerId === joystickPointerId) updateJoystick(e.clientX, e.clientY);
});
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  joystick.addEventListener(event, resetJoystick);
el("catch-track").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.button !== 0 || run.state.cast?.phase !== "catch") return;
  unlockAudio();
  mainAction();
  if (e.pointerType === "mouse") {
    hasMouseInput = true;
    requestCombatPointerLock();
  }
});
el("catch-track").addEventListener("click", (e) => {
  e.stopPropagation();
  if (e.detail === 0 && run.state.cast?.phase === "catch") {
    unlockAudio();
    mainAction();
    requestCombatPointerLock();
  }
});
function keyDown(code: string) {
  if (keys.has(code)) return;
  keys.add(code);
  if (code === "Tab") {
    action({ type: "arsenal" });
    return;
  }
  if (code === "Escape") {
    el("help").hidden = true;
    action({ type: "arsenal", open: false });
    action({ type: "cancel" });
    return;
  }
  if (code === "Digit1" || code === "Digit2")
    action({ type: "draw", slot: code === "Digit1" ? 0 : 1 });
  if (code === "KeyF") action({ type: "fish" });
  if (code === "KeyQ") action({ type: "cancel" });
  if (code === "KeyV") action({ type: "rod" });
  if (code === "Space") action({ type: "jump" });
  if (code === "KeyR" && run.state.mode === "combat")
    action({ type: "reload" });
  if (code === "KeyE")
    action({ type: run.state.cast?.phase === "catch" ? "catch" : "interact" });
  if (code === "KeyM") action({ type: "mount" });
  if (code === "KeyB") action({ type: "drink" });
}
function keyUp(code: string) {
  keys.delete(code);
  if (["KeyE", "KeyM", "KeyB"].includes(code)) action({ type: "release" });
}
addEventListener("keydown", (e) => {
  if (
    e.target instanceof HTMLElement &&
    e.target.matches("input,select,textarea")
  )
    return;
  if (
    [
      "Tab",
      "Space",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ].includes(e.code)
  )
    e.preventDefault();
  if (!e.repeat) {
    unlockAudio();
    keyDown(e.code);
    if (e.code !== "Escape") requestCombatPointerLock();
  }
});
addEventListener("keyup", (e) => keyUp(e.code));
function clearInput() {
  keys.clear();
  firing = false;
  aiming = false;
  dragging = false;
  resetJoystick();
  action({ type: "release" });
}
addEventListener("blur", clearInput);
addEventListener("pagehide", () => {
  clearInput();
  persist();
});
document.addEventListener("visibilitychange", () => {
  last = performance.now();
  clearInput();
  persist();
});
const canvas = renderer.domElement;
const pointerLockSupported =
  "pointerLockElement" in document &&
  "requestPointerLock" in canvas;
let hasMouseInput = matchMedia("(any-pointer: fine)").matches;
function canCaptureMouse() {
  const s = run.state;
  return (
    pointerLockSupported &&
    hasMouseInput &&
    started &&
    s.status === "playing" &&
    (s.mode === "drawing" || s.mode === "combat") &&
    !s.arsenalOpen &&
    el("help").hidden
  );
}
function requestCombatPointerLock() {
  if (!canCaptureMouse() || document.pointerLockElement === canvas) return;
  void canvas.requestPointerLock().catch(() => {});
}
function updatePointerLockState() {
  const locked = document.pointerLockElement === canvas;
  if (locked && !canCaptureMouse()) document.exitPointerLock();
}
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== canvas) clearInput();
  updatePointerLockState();
});
document.addEventListener("pointerlockerror", updatePointerLockState);
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener("pointerdown", (e) => {
  if (!started || run.state.arsenalOpen) return;
  hasPointer = true;
  pointer.set(
    (e.clientX / innerWidth) * 2 - 1,
    1 - (e.clientY / innerHeight) * 2,
  );
  updatePlacement();
  unlockAudio();
  if (document.pointerLockElement !== canvas) canvas.setPointerCapture(e.pointerId);
  dragX = e.clientX;
  dragY = e.clientY;
  dragDistance = 0;
  dragging = true;
  if (e.button === 2) aiming = true;
  else if (e.pointerType !== "touch") {
    firing = true;
    mainAction();
  }
  if (e.pointerType === "mouse") {
    hasMouseInput = true;
    requestCombatPointerLock();
  }
});
canvas.addEventListener("pointermove", (e) => {
  if (e.pointerType === "mouse" && !hasMouseInput) {
    hasMouseInput = true;
    updatePointerLockState();
  }
  hasPointer = true;
  pointer.set(
    (e.clientX / innerWidth) * 2 - 1,
    1 - (e.clientY / innerHeight) * 2,
  );
  const looking =
    (e.pointerType === "touch" && dragging) ||
    (e.pointerType === "mouse" &&
      (document.pointerLockElement === canvas || !pointerLockSupported));
  if (looking) {
    const dx = e.pointerType === "mouse" ? e.movementX : e.clientX - dragX,
      dy = e.pointerType === "mouse" ? e.movementY : e.clientY - dragY;
    if (dragging) dragDistance += Math.hypot(dx, dy);
    if (started && run.state.mode !== "fishing" && !run.state.arsenalOpen) {
      heading -= dx * 0.006;
      pitch = THREE.MathUtils.clamp(pitch - dy * 0.004, -0.75, 0.75);
    }
    dragX = e.clientX;
    dragY = e.clientY;
  }
});
canvas.addEventListener("pointerup", (e) => {
  if (e.pointerType === "touch" && dragDistance < 8) {
    pointer.set(
      (e.clientX / innerWidth) * 2 - 1,
      1 - (e.clientY / innerHeight) * 2,
    );
    updatePlacement();
    mainAction();
  }
  dragging = false;
  firing = false;
  if (e.button === 2) aiming = false;
});
canvas.addEventListener("pointercancel", clearInput);
document.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((button) => {
  const code = button.dataset.key!;
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    unlockAudio();
    keyDown(code);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    button.addEventListener(event, () => keyUp(code));
});
document
  .querySelectorAll<HTMLButtonElement>("[data-touch]")
  .forEach((button) => {
    button.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      unlockAudio();
      if (button.dataset.touch === "aim") aiming = true;
      else {
        firing = true;
        mainAction();
      }
    });
    for (const event of ["pointerup", "pointercancel"])
      button.addEventListener(event, () => {
        firing = false;
        aiming = false;
      });
  });
el("start").onclick = () => {
  unlockAudio();
  started = true;
  el("welcome").hidden = true;
  el("save-warning").hidden = true;
  persist();
};
el("arsenal-button").onclick = () => action({ type: "arsenal" });
let mapOpen = true;
el("map-toggle").onclick = () => {
  mapOpen = !mapOpen;
  el("exploration-map").hidden = !mapOpen;
  el("map-toggle").setAttribute("aria-pressed", `${mapOpen}`);
  text("map-toggle", mapOpen ? "Map" : "Map off");
};
el("close-arsenal").onclick = () => {
  action({ type: "arsenal", open: false });
  requestCombatPointerLock();
};
el("help-button").onclick = () => {
  el("help").hidden = !el("help").hidden;
};
el("close-help").onclick = () => {
  el("help").hidden = true;
  requestCombatPointerLock();
};
el("sound").onclick = () => {
  unlockAudio();
  muted = !muted;
  text("sound", muted ? "Sound off" : "Sound on");
};
el("next").onclick = () => {
  action({ type: "next" });
  resetModels();
  heading = run.state.player.heading;
  fishingHeading = heading;
  hasPointer = false;
  pitch = run.state.player.pitch;
  clearInput();
  el("results").hidden = true;
  persist();
};

let arsenalSignature = "";
function renderArsenal(force = false) {
  const s = run.state;
  el("arsenal").hidden = !s.arsenalOpen;
  if (!s.arsenalOpen) {
    arsenalSignature = "";
    return;
  }
  const signature = JSON.stringify([
    s.arsenal,
    s.supplies,
    s.resource,
    s.rod,
    s.slots,
  ]);
  if (!force && signature === arsenalSignature) return;
  arsenalSignature = signature;
  el("arsenal-content").innerHTML =
    `<div class="rod-upgrade"><div><h3>Rod · Tier ${tiers[s.rod]}</h3><small>Interest and timing width +${(s.rod - 1) * 25}%</small></div><button data-buy-rod ${s.rod === 3 || s.resource < (s.rod === 1 ? 8 : 20) ? "disabled" : ""}>${s.rod === 3 ? "Fully improved" : `Improve · ${s.rod === 1 ? 8 : 20} resource`}</button></div><h3>Carried Gunfish <span>${s.arsenal.length}</span></h3><div class="gunfish-list">${
      s.arsenal
        .map((g) => {
          const stats = gunStats(g),
            total = Object.values(g.ranks).reduce((a, b) => a + b, 0),
            cost = [3, 5, 8][g.rarity - 1] * (total + 1);
          return `<article class="gunfish-card"><span class="eyebrow">TIER ${tiers[g.rarity]} · POWER ${2 * g.rarity - 1 + 2 * g.stage + total}</span><h3>${SPECIES[g.species].name}</h3><p>${g.branch ? `${g.branch} · Stage ${tiers[g.stage]}` : "Unevolved"} · ${g.magazine} / ${stats.magazine} loaded</p><div class="row">${[0, 1].map((slot) => `<button data-assign="${g.id}" data-slot="${slot}">${s.slots[slot] === g.id ? "Assigned " : "Assign "}${slot ? "Secondary" : "Primary"}</button>`).join("")}</div><div class="rank-row">${(["damage", "rate", "magazine"] as const).map((stat) => `<button data-upgrade="${g.id}" data-stat="${stat}" ${total >= 3 || s.resource < cost ? "disabled" : ""}>${stat} ${g.ranks[stat]}<small>${total >= 3 ? "Max ranks" : `+1 · ${cost} resource`}</small></button>`).join("")}</div>${
            g.stage < 2
              ? `<details><summary>Evolve · sacrifice ${g.rarity * (g.stage + 1)} same-species donors</summary><div class="evolution" data-target="${g.id}"><label>Branch <select ${g.stage ? "disabled" : ""}>${SPECIES[g.species].branches.map((branch) => `<option ${g.branch === branch ? "selected" : ""}>${branch}</option>`).join("")}</select></label><p class="branch-description"></p>${
                  s.arsenal
                    .filter((d) => d.species === g.species && d.id !== g.id)
                    .map(
                      (d) =>
                        `<label class="donor"><input type="checkbox" value="${d.id}"> ${escapeHtml(describe(d))}${s.slots.includes(d.id) ? " · ASSIGNED" : ""}</label>`,
                    )
                    .join("") || "<p>No same-species donors carried.</p>"
                }<p class="preview"></p><button data-merge="${g.id}" disabled>Confirm permanent merge</button></div></details>`
              : ""
          }</article>`;
        })
        .join("") ||
      '<p class="empty">An empty arsenal. The water has something for you.</p>'
    }</div><h3>Supplies · ${s.supplies.length} / 8</h3><div class="supplies">${s.supplies.map((supply, i) => `<div><span>${supply === "beer" ? "Beer" : `${supply} bundle`}</span>${supply !== "beer" ? `<button data-unpack="${i}">Unpack</button>` : "<small>Hold B outside arsenal</small>"}<button data-drop="${i}">Drop</button></div>`).join("")}</div><p class="muted">Reserve: ${s.reserves.pistol} pistol · ${s.reserves.rifle} rifle · ${s.reserves.shells} shells. Bundles grant 16 / 48 / 10 rounds.</p>`;
  el("arsenal-content")
    .querySelectorAll<HTMLElement>(".evolution")
    .forEach(updatePreview);
}
const branchText: Record<string, string> = {
  Deadeye:
    "Precision aim charges a high-stagger shot: 0.6s / double damage. Stage II: 0.4s / 2.5x damage, penetrates one monster.",
  Fanfire:
    "A controlled two-round burst. Stage II: a tighter three-round burst.",
  Spool:
    "Sustained fire ramps to +50% rate over 0.75s. Stage II: 0.4s ramp, full-spool rounds penetrate at 60% damage.",
  Hammer:
    "Every fifth round has triple stagger. Stage II: every fourth round creates a stagger-only pulse.",
  Sweeper:
    "Horizontal pellet fan penetrates one monster at half damage. Stage II: two monsters and +25% stagger.",
  Slug: "An accurate slug carries the full pellet damage. Stage II: after 8m gains 30% damage and penetrates one monster.",
};
function updatePreview(section: HTMLElement) {
  const donors = [
    ...section.querySelectorAll<HTMLInputElement>("input:checked"),
  ].map((input) => input.value);
  const branch = section.querySelector("select")!.value;
  const preview = run.previewEvolution(section.dataset.target!, donors, branch);
  section.querySelector(".preview")!.textContent = preview.warning;
  section.querySelector(".branch-description")!.textContent =
    branchText[branch];
  section.querySelector("button")!.disabled = !preview.valid;
}
el("arsenal-content").addEventListener("change", (e) => {
  const section = (e.target as HTMLElement).closest<HTMLElement>(".evolution");
  if (section) updatePreview(section);
});
el("arsenal-content").addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!button) return;
  const d = button.dataset;
  if ("buyRod" in d) action({ type: "rodUpgrade" });
  if (d.assign) action({ type: "assign", id: d.assign, slot: Number(d.slot) });
  if (d.upgrade)
    action({
      type: "upgrade",
      id: d.upgrade,
      stat: d.stat as "damage" | "rate" | "magazine",
    });
  if (d.unpack) action({ type: "supply", index: Number(d.unpack) });
  if (d.drop) action({ type: "supply", index: Number(d.drop), drop: true });
  if (d.merge) {
    const section = button.closest<HTMLElement>(".evolution")!;
    action({
      type: "evolve",
      id: d.merge,
      donors: [
        ...section.querySelectorAll<HTMLInputElement>("input:checked"),
      ].map((input) => input.value),
      branch: section.querySelector("select")!.value,
    });
  }
  renderArsenal(true);
  persist();
});

function updatePlacement() {
  raycaster.setFromCamera(pointer, camera);
  if (started && hasPointer && run.state.mode === "fishing" && !run.state.arsenalOpen) {
    const p = run.state.player;
    fishingAimPlane.constant = -(terrainHeight(p) + p.y);
    if (raycaster.ray.intersectPlane(fishingAimPlane, fishingAimPoint)) {
      const dx = fishingAimPoint.x - p.x;
      const dz = fishingAimPoint.z - p.z;
      if (Math.hypot(dx, dz) > 0.1) heading = Math.atan2(dx, dz);
    }
  }
  const hit = raycaster.intersectObjects(waters)[0];
  waterPoint =
    hit && distance(run.state.player, { x: hit.point.x, z: hit.point.z }) <= 32
      ? { x: hit.point.x, z: hit.point.z }
      : null;
  placement.visible =
    !!waterPoint &&
    run.state.mode === "fishing" &&
    !run.state.cast &&
    !run.state.arsenalOpen;
  if (waterPoint) placement.position.set(waterPoint.x, 0.23, waterPoint.z);
  let label = "";
  if (waterPoint) {
    const f = run.state.fish
      .filter((f) => !f.landed && distance(f, waterPoint!) < 3)
      .sort((a, b) => distance(a, waterPoint!) - distance(b, waterPoint!))[0];
    if (f) label = `${SPECIES[f.species].name} · Tier ${tiers[f.rarity]}`;
  }
  text("fish-label", label);
  el("fish-label").style.left = `${((pointer.x + 1) * innerWidth) / 2}px`;
  el("fish-label").style.top = `${((1 - pointer.y) * innerHeight) / 2 - 35}px`;
}

let previousShots = 0,
  previousHealth = 100,
  previousPhase = 0,
  previousCatchReady = false,
  previousMode = "",
  previousNotice = "",
  previousStatus = "";
const alerted = new Set<string>(),
  winding = new Set<string>();
let hudTime = 0,
  saveTime = 0,
  tugTime = 0;
let lastRenderTime = performance.now() / 1000;
function renderWorld(time: number) {
  const animationDelta = Math.min(0.1, Math.max(0, time - lastRenderTime));
  lastRenderTime = time;
  const s = run.state,
    p = s.player;
  const catchState = s.cast?.phase === "catch" ? s.cast : null;
  const hookedFish = s.fish.find((f) => f.id === catchState?.fishId);
  const ready =
    !!catchState &&
    !!hookedFish &&
    catchingReady(catchState.cycle, hookedFish.rarity, s.rod);
  el("catch-meter").hidden = !catchState || !hookedFish;
  el("catch-meter").classList.toggle("ready", ready);
  if (catchState && hookedFish) {
    el("catch-box").style.left = `${catchingPosition(catchState.cycle) * 100}%`;
    el("catch-target").style.width = `${catchingTargetWidth(hookedFish.rarity, s.rod) * 100}%`;
    text("catch-cue", ready ? "CATCH NOW" : "FISH ON / WATCH THE CENTER");
    text("catch-progress", `${catchState.hits} / ${hookedFish.rarity + 2} hits`);
    text(
      "catch-risk",
      `${catchState.misses} / 2 consecutive mistimed presses lose the fish. Waiting never counts as a miss.`,
    );
    if (ready && !previousCatchReady) {
      tone(740, catchingWidth(hookedFish.rarity, s.rod), 0.09, hookedFish);
      navigator.vibrate?.(35);
    }
  }
  previousCatchReady = ready;
  const ground = terrainHeight(p);
  player.position.set(p.x, ground + p.y, p.z);
  player.rotation.y = p.heading;
  const moving = ["KeyW", "KeyA", "KeyS", "KeyD"].some((key) => keys.has(key));
  setPlayerAnimation(
    s.mode === "fishing" || s.mode === "returning"
      ? moving
        ? "Walk"
        : "Idle"
      : s.sprinting
        ? "Run_Gun"
        : moving
          ? "Walk_Gun"
          : "Idle_Gun",
  );
  const gun = s.arsenal.find((g) => g.id === s.slots[s.active]);
  const fishing = s.mode === "fishing" || s.mode === "returning";
  rod.visible = fishing || !gun || s.rodCooldown > 0.3;
  rod.rotation.y = s.rodCooldown > 0.3 ? Math.sin(s.rodCooldown * 8) : 0;
  held.visible = !fishing && !!gun && s.rodCooldown <= 0.3;
  held.rotation.x =
    s.sprinting || s.reload > 0 ? 0.8 : s.fireCooldown > 0.05 ? -0.1 : 0;
  if (heldId !== (gun?.id ?? "")) {
    for (const child of [...held.children]) disposeEntity(child);
    if (gun) fishModel(gun.species, gun.rarity, held);
    heldId = gun?.id ?? "";
  }
  const ease = (v: number) => {
    const x = THREE.MathUtils.clamp(v, 0, 1);
    return x * x * (3 - 2 * x);
  };
  const blend =
    s.mode === "combat"
      ? 1
      : s.mode === "drawing"
        ? ease((s.transition - 0.1) / 0.58)
        : s.mode === "returning"
          ? 1 - ease(s.transition / 0.68)
          : 0;
  const forward = new THREE.Vector3(
      Math.sin(p.heading),
      0,
      Math.cos(p.heading),
    ),
    right = new THREE.Vector3(-Math.cos(p.heading), 0, Math.sin(p.heading));
  const base = new THREE.Vector3(p.x, ground + p.y, p.z);
  // Keep the elevated view independent of cursor-driven player facing.
  const fishingForward = new THREE.Vector3(Math.sin(fishingHeading), 0, Math.cos(fishingHeading));
  const elevated = base
    .clone()
    .addScaledVector(fishingForward, -19)
    .add(new THREE.Vector3(0, 32, 0));
  const shoulder = base
    .clone()
    .addScaledVector(forward, s.aiming ? -3.2 : -5.2)
    .addScaledVector(right, 0.8)
    .add(new THREE.Vector3(0, 2.8, 0));
  camera.position.copy(elevated.lerp(shoulder, blend));
  const focus = base.clone().add(new THREE.Vector3(0, 1.8, 0)),
    cameraOffset = camera.position.clone().sub(focus);
  raycaster.set(focus, cameraOffset.clone().normalize());
  raycaster.far = cameraOffset.length();
  const obstruction = raycaster.intersectObjects(cameraObstacles, false)[0];
  if (obstruction)
    camera.position
      .copy(focus)
      .addScaledVector(
        cameraOffset.normalize(),
        Math.max(0.5, obstruction.distance - 0.3),
      );
  raycaster.far = Infinity;
  aimPoint
    .copy(base)
    .addScaledVector(fishingForward, 3 * (1 - blend))
    .addScaledVector(forward, 32 * blend)
    .add(
      new THREE.Vector3(
        0,
        THREE.MathUtils.lerp(0.5, 1.15 + Math.tan(p.pitch) * 32, blend),
        0,
      ),
    );
  camera.lookAt(aimPoint);
  camera.fov = s.aiming ? 40 : 48;
  camera.updateProjectionMatrix();
  sky.update(s.elapsed, player.position, waters);
  threatRing.visible = !!s.cast;
  const detecting = s.cast
    ? s.monsters
        .filter((m) => m.alerted)
        .sort((a, b) => distance(a, p) - distance(b, p))[0]
    : null;
  dangerArc.visible = !!detecting;
  if (detecting) dangerArc.material.opacity = 0.35 + Math.sin(time * 8) * 0.25;
  for (const boundary of [threatRing, dangerArc])
    if (boundary.visible) {
      const coordinates = boundary.userData.coordinates as Float32Array,
        vertices = boundary.geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;
      const angle =
        boundary === dangerArc && detecting
          ? Math.atan2(detecting.z - p.z, detecting.x - p.x)
          : 0;
      boundary.position.set(p.x, 0, p.z);
      for (let i = 0; i < vertices.count; i++) {
        const x =
          (coordinates[i * 3] * Math.cos(angle) -
            coordinates[i * 3 + 2] * Math.sin(angle)) *
          s.threat;
        const z =
          (coordinates[i * 3] * Math.sin(angle) +
            coordinates[i * 3 + 2] * Math.cos(angle)) *
          s.threat;
        vertices.setXYZ(
          i,
          x,
          terrainHeight({ x: p.x + x, z: p.z + z }) + 0.24,
          z,
        );
      }
      vertices.needsUpdate = true;
      boundary.geometry.computeBoundingSphere();
    }
  for (const g of entities.values()) g.userData.live = false;
  for (const f of s.fish) {
    if (f.landed || distance(p, f) > 130) continue;
    const g = entity(f.id, (g) => {
      fishModel(f.species, f.rarity, g);
      const r = ring(g, 1.4);
      r.name = "ripple";
    });
    const hooked = s.cast?.fishId === f.id;
    const snap = hooked && ready;
    const landedDistance = hooked ? (s.cast!.hits / (f.rarity + 2)) * 0.7 : 0;
    g.position.set(
      THREE.MathUtils.lerp(f.x, p.x, landedDistance),
      0.35 + Math.sin(time * 2 + f.x) * 0.05 + (snap ? 0.6 : 0),
      THREE.MathUtils.lerp(f.z, p.z, landedDistance),
    );
    g.rotation.y =
      s.cast && f.interest > 0.1
        ? Math.atan2(s.cast.lure.x - f.x, s.cast.lure.z - f.z)
        : Math.sin(time + f.x) * 0.25;
    g.scale.setScalar(f.cooldown > 0 ? 0.85 : 1);
    const r = g.getObjectByName("ripple")!;
    r.scale.setScalar(
      (1.2 + ((time * (f.interest > 0.2 ? 2 : 0.5)) % 1) * 1.5) *
        (snap ? 1.6 : 1),
    );
    r.visible = f.interest > 0.12 || hooked || Math.sin(time + f.z) > 0.5;
    const interestCue = Math.floor(f.interest * 4);
    if (interestCue > (g.userData.interestCue ?? 0))
      tone(280 + interestCue * 80, 0.15, 0.045, f);
    g.userData.interestCue = interestCue;
  }
  for (const m of s.monsters) {
    if (distance(p, m) > 160) continue;
    const g = entity(m.id, (g) => {
      g.userData.monster = true;
      if (!addMonsterAsset(g, m.role)) {
        const color =
          m.role === "spitter"
            ? 0xaab869
            : m.role === "shellback"
              ? 0x7a7770
              : m.role === "ramjaw"
                ? 0xc78565
                : 0xb4aaa0;
        const scale =
          m.role === "shellback" ? 1.7 : m.role === "ramjaw" ? 1.2 : 0.85;
        mesh(
          g,
          sphereGeometry,
          color,
          0,
          0.8 * scale,
          0,
          scale,
          0.75 * scale,
          scale * 1.25,
        );
        for (const side of [-1, 1]) {
          mesh(g, boxGeometry, 0x3f5149, side * scale, 0.38, 0.3, 0.18, 0.7, 0.2);
          mesh(
            g,
            sphereGeometry,
            0xf8d389,
            side * 0.3,
            scale,
            scale,
            0.13,
            0.13,
            0.13,
          );
        }
        if (m.role === "ramjaw")
          mesh(g, boxGeometry, 0xd7ceaa, 0, 0.65, 1.6, 1.1, 0.5, 0.7);
        if (m.role === "shellback")
          mesh(g, sphereGeometry, 0x475b54, 0, 1.5, 0.3, 1.8, 0.8, 1.7);
      }
      const lane = new THREE.Group();
      lane.name = "lane";
      const laneMat = new THREE.MeshBasicMaterial({
        color: 0xf2b891,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const geometry = new THREE.PlaneGeometry(1, 1, 1, 20);
      geometry.rotateX(-Math.PI / 2);
      const area = new THREE.Mesh(geometry, laneMat);
      area.userData.coordinates = new Float32Array(
        geometry.getAttribute("position").array,
      );
      area.name = "area";
      lane.add(area);
      for (let i = 0; i < 5; i++) {
        const mark = mesh(
          lane,
          boxGeometry,
          0xf7dcad,
          0,
          0.035,
          i * 2,
          0.9,
          0.025,
          0.12,
        );
        mark.name = "stripe";
      }
      scene.add(lane);
      g.userData.lane = lane;
    });
    g.position.set(
      m.x,
      terrainHeight(m) + Math.sin(time * 10 + m.x) * 0.07,
      m.z,
    );
    g.rotation.y = m.heading;
    g.rotation.z = m.stagger > 0 ? Math.sin(time * 45) * 0.08 : 0;
    setMonsterAnimation(g, m);
    const lane = g.userData.lane as THREE.Group;
    lane.visible = !!m.lane;
    if (m.lane) {
      const length =
        m.role === "spitter"
          ? distance(m, m.lane) + 4
          : MONSTERS[m.role].range + 1;
      lane.position.set(m.x, 0.26, m.z);
      lane.rotation.y = Math.atan2(m.lane.x - m.x, m.lane.z - m.z);
      const area = lane.getObjectByName("area") as THREE.Mesh,
        width = m.role === "shellback" ? 4.4 : m.role === "ramjaw" ? 2 : 1.2;
      const vertices = area.geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute,
        coordinates = area.userData.coordinates as Float32Array;
      for (let i = 0; i < vertices.count; i++) {
        const x = coordinates[i * 3] * width,
          z = (coordinates[i * 3 + 2] + 0.5) * length;
        const point = {
          x:
            m.x + Math.cos(lane.rotation.y) * x + Math.sin(lane.rotation.y) * z,
          z:
            m.z - Math.sin(lane.rotation.y) * x + Math.cos(lane.rotation.y) * z,
        };
        vertices.setXYZ(i, x, terrainHeight(point), z);
      }
      vertices.needsUpdate = true;
      area.geometry.computeBoundingSphere();
      const progress = 1 - m.windup / MONSTERS[m.role].windup;
      lane.children.slice(1).forEach((mark, i) => {
        mark.position.z = ((i / 5) * length + progress * length) % length;
        mark.position.y =
          terrainHeight({
            x: m.x + Math.sin(lane.rotation.y) * mark.position.z,
            z: m.z + Math.cos(lane.rotation.y) * mark.position.z,
          }) + 0.035;
        mark.scale.x = m.role === "shellback" ? 3 : 1;
      });
      if (!winding.has(m.id)) {
        tone(m.role === "shellback" ? 75 : 145, 0.35, 0.06, m);
        winding.add(m.id);
      }
    } else winding.delete(m.id);
    if (m.alerted && !alerted.has(m.id)) {
      tone(210, 0.3, 0.06, m);
      alerted.add(m.id);
    }
    if (!m.alerted) alerted.delete(m.id);
  }
  for (const t of s.mounted) {
    if (distance(p, t) > 130) continue;
    const g = entity(t.id, (g) => {
      mesh(g, boxGeometry, 0x3c5550, 0, 0.5, 0, 0.35, 1, 0.35);
      fishModel(t.gunfish.species, t.gunfish.rarity, g).position.y = 1.1;
      ring(g, 1.4);
    });
    g.position.set(t.x, terrainHeight(t) + 0.1, t.z);
    const nearest = [...s.monsters].sort(
      (a, b) => distance(t, a) - distance(t, b),
    )[0];
    if (nearest) g.rotation.y = Math.atan2(nearest.x - t.x, nearest.z - t.z);
    if (t.shots > (g.userData.shots ?? t.shots))
      tone(t.gunfish.species === "shotgun" ? 70 : 115, 0.12, 0.07, t);
    g.userData.shots = t.shots;
  }
  for (const d of s.drops) {
    if (distance(p, d) > 100) continue;
    const g = entity(d.id, (g) => {
      mesh(
        g,
        d.type === "resource" ? sphereGeometry : boxGeometry,
        d.type === "resource"
          ? 0xf1d289
          : d.type === "beer"
            ? 0x9ac67b
            : 0x94bbc4,
        0,
        0.5,
        0,
        0.3,
        0.45,
        0.3,
      );
      ring(g, 0.6);
    });
    g.position.set(d.x, terrainHeight(d) + 0.15, d.z);
    g.rotation.y = time;
  }
  for (const projectile of s.projectiles) {
    const g = entity(projectile.id, (g) => {
      mesh(
        g,
        sphereGeometry,
        projectile.hostile ? 0xf2a071 : 0xffeac2,
        0,
        0,
        0,
        projectile.hostile ? projectile.radius : 0.1,
        projectile.hostile ? 0.3 : 0.1,
        projectile.hostile ? 0.5 : 0.6,
      );
      if (projectile.hostile) tone(90, 0.2, 0.07, projectile);
    });
    g.position.set(projectile.x, projectile.y, projectile.z);
    g.rotation.y = Math.atan2(projectile.vx, projectile.vz);
  }
  if (s.cache && distance(p, s.cache) < 220) {
    const g = entity("cache", (g) => {
      mesh(g, boxGeometry, 0xdac78d, 0, 0.6, 0, 1.3, 1.2, 1);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.6, 35, 8),
        new THREE.MeshBasicMaterial({
          color: 0xf5e3ac,
          transparent: true,
          opacity: 0.3,
        }),
      );
      beam.position.y = 18;
      g.add(beam);
      ring(g, 2);
    });
    g.position.set(s.cache.x, terrainHeight(s.cache) + 0.2, s.cache.z);
  }
  for (const [id, g] of entities)
    if (!g.userData.live) {
      if (g.userData.lane) disposeEntity(g.userData.lane);
      disposeEntity(g);
      entities.delete(id);
    }
  line.visible = !!s.cast || s.lineLinger > 0;
  lure.visible = !!s.cast;
  if (s.cast) {
    const hookedModel = s.cast.fishId ? entities.get(s.cast.fishId) : null;
    if (hookedModel) lastLure.copy(hookedModel.position);
    else lastLure.set(s.cast.lure.x, 0.45, s.cast.lure.z);
    lure.position.copy(lastLure);
  }
  if (line.visible) {
    const start = new THREE.Vector3(0.4, 2.3, 2.5).applyMatrix4(
      player.matrixWorld,
    );
    const pos = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    pos.setXYZ(0, start.x, start.y, start.z);
    pos.setXYZ(1, lastLure.x, lastLure.y, lastLure.z);
    pos.needsUpdate = true;
    lineGeometry.computeBoundingSphere();
    (line.material as THREE.LineBasicMaterial).color.setHex(
      ready ? 0xffffff : 0xb1bfa4,
    );
    rod.rotation.x = ready ? -0.65 : -0.3;
  }
  if (s.shots > previousShots)
    tone(gun?.species === "shotgun" ? 70 : 115, 0.12, 0.07);
  previousShots = s.shots;
  if (s.player.health < previousHealth) {
    tone(65, 0.25, 0.1);
    el("game").classList.remove("hurt");
    void el("game").offsetWidth;
    el("game").classList.add("hurt");
  }
  previousHealth = s.player.health;
  if (s.phase !== previousPhase) {
    tone(95, 1.3, 0.09);
    previousPhase = s.phase;
  }
  if (
    s.mode === "drawing" &&
    s.transition >= 0.46 &&
    previousMode !== "ready"
  ) {
    tone(540, 0.06, 0.06);
    previousMode = "ready";
  } else if (s.mode !== "drawing") previousMode = s.mode;
  if (s.notice !== previousNotice && s.noticeTime > 0) {
    if (s.notice.includes("line sings")) tone(880, 0.18, 0.06);
    if (s.notice.includes("slackens")) tone(180, 0.22, 0.05);
    previousNotice = s.notice;
  }
  updatePlacement();
  playerMixer?.update(animationDelta);
  for (const group of entities.values()) {
    const mixer = group.userData.mixer as THREE.AnimationMixer | undefined;
    mixer?.update(animationDelta);
  }
  renderer.render(scene, camera);
}
function renderHud() {
  updateMinimap(run.state, performance.now());
  const s = run.state,
    gun = s.arsenal.find((g) => g.id === s.slots[s.active]);
  updatePointerLockState();
  updateTouchControls();
  const remaining = Math.max(0, Math.ceil(900 - s.elapsed));
  text(
    "clock",
    `${Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`,
  );
  text(
    "phase",
    [
      "I · FIRST LIGHT",
      "II · RISING WATER",
      "III · HEAVY FOOTSTEPS",
      "IV · UNTIL DAWN",
    ][s.phase],
  );
  text("health", `${Math.ceil(s.player.health)}`);
  el("health-fill").style.width = `${s.player.health}%`;
  text("threat", `${Math.floor(s.threat)} m`);
  text(
    "power",
    `GUNFISH POWER ${s.power} / ${s.power < 8 ? "LOW" : s.power < 16 ? "MIDDLE" : "HIGH"}`,
  );
  text(
    "ammo",
    gun
      ? `${gun.magazine} / ${s.reserves[SPECIES[gun.species].ammo]}${s.reload > 0 ? " · RELOADING" : s.sprinting ? " · LOWERED" : ""}`
      : "ROD READY",
  );
  text(
    "slots",
    s.slots
      .map(
        (id, i) =>
          `${i === s.active ? "› " : ""}${i + 1} ${s.arsenal.find((g) => g.id === id)?.species.toUpperCase() ?? "EMPTY"}`,
      )
      .join("    "),
  );
  text(
    "resource",
    `${s.resource} upgrade resource · ${s.supplies.length} / 8 supplies`,
  );
  const boundPrompt = s.prompt
    .replace("[Primary]", "[1]")
    .replace("[Secondary]", "[2]")
    .replace("[Cancel]", "[Q]")
    .replace("[Catch]", "[E / Click]")
    .replace("[Aim]", "[Right mouse / Aim]")
    .replace("[Arsenal]", "[Tab]")
    .replace("[Rod Attack]", "[V]");
  text("prompt", boundPrompt);
  text("notice", s.noticeTime > 0 ? s.notice : "");
  text(
    "mode-help",
    s.mode === "fishing"
      ? s.cast?.phase === "lure"
        ? "2. Gently tap Arrows to tease the Lure · Hold R to reel · Q cancel"
        : s.cast?.phase === "catch"
          ? "3. Match the box center to the gold target · Waiting never counts as a miss"
          : "1. Click water beside a Gunfish to place the Lure · Do not land on it"
      : pointerLockSupported &&
          hasMouseInput &&
          document.pointerLockElement !== canvas
        ? "Move to look · Click fire · Right mouse aim · F fish"
        : "Mouse look · Click fire · Right mouse aim · F fish",
  );
  el("reticle").hidden =
    s.mode === "fishing" || s.mode === "returning" || s.arsenalOpen;
  el("reticle").classList.toggle(
    "ready",
    s.mode === "combat" || s.transition >= 0.46,
  );
  el("reticle").classList.toggle("buffered", s.bufferedShot);
  let interaction = "";
  if (s.hold)
    interaction = `Hold ${s.hold.kind === "mount" ? "M · Committing Gunfish" : s.hold.kind === "drink" ? "B · Drinking Beer" : s.hold.kind === "service" ? "E · Servicing defender" : "E · Reclaiming cache"}...`;
  else if (s.cache && distance(s.player, s.cache) < 3)
    interaction = "Hold E · Recover equipment";
  else if (s.drops.some((d) => distance(s.player, d) < 3))
    interaction = "E · Collect drop";
  else {
    const t = s.mounted.find((t) => distance(s.player, t) < 3);
    if (t)
      interaction = `Hold E · ${t.health < t.maxHealth ? "Repair" : "Fuel"} · Durability ${Math.ceil(t.health)} / ${t.maxHealth} · Fuel ${Math.ceil(t.fuel)}s`;
  }
  text("interaction", interaction);
  const nearest = LOCATIONS.filter(l => !l.secret || s.completed.includes(`secret:${l.name}`)).sort(
    (a, b) => distance(s.player, a) - distance(s.player, b),
  );
  text(
    "region",
    `${BIOMES[biomeAt(s.player)].name.toUpperCase()} / ${nearest[0].exposed ? "EXPOSED HOTSPOT" : "SHELTERED WATER"}`,
  );
  const bearingText = (p: Vec) => {
    const delta =
      Math.atan2(p.x - s.player.x, p.z - s.player.z) - s.player.heading;
    const angle =
      (Math.atan2(Math.sin(delta), Math.cos(delta)) * 180) / Math.PI;
    return `${angle > 15 ? "LEFT" : angle < -15 ? "RIGHT" : "AHEAD"} ${Math.abs(Math.round(angle))}° · ${Math.round(distance(p, s.player))} m`;
  };
  const available = nearest.filter((location) =>
    s.fish.some((f) => !f.landed && distance(f.home, location) < 16),
  );
  el("navigation").innerHTML =
    `${s.cache ? `<div class="cache-marker"><span>RECOVERY · ${bearingText(s.cache)}</span><strong>Rod Tier ${tiers[s.cache.rod]}</strong><small>${s.cache.gunfish ? escapeHtml(describe(s.cache.gunfish)) : "Rod only"}</small></div>` : ""}${available
      .slice(0, 2)
      .map(
        (l) =>
          `<div class="location-marker"><span>${l.name}</span><small>${bearingText(l)} · ${l.exposed ? "Hotspot" : "Sheltered"}</small></div>`,
      )
      .join("")}`;
  renderArsenal();
  if (
    s.status !== "playing" &&
    s.resultTime >= (s.status === "failure" ? 1.8 : 0.7)
  ) {
    el("results").hidden = false;
    el("next").hidden = s.status === "victory";
    text(
      "result-eyebrow",
      s.status === "victory"
        ? "FIRST PLAYABLE COMPLETE"
        : "A NEWEST-ONLY RECOVERY CACHE",
    );
    el("result-title").innerHTML =
      s.status === "victory"
        ? "You made<br><em>the dawn.</em>"
        : "The water<br><em>remembers.</em>";
    text(
      "result-copy",
      s.status === "victory"
        ? "Fifteen minutes. The world exhales. This character survived."
        : `${s.replacedCache ? "Your older unrecovered cache was replaced. " : ""}Left behind: Rod Tier ${tiers[s.cache?.rod ?? 1]}${s.cache?.gunfish ? ` and ${describe(s.cache.gunfish)}` : " only"}. Everything else is lost.`,
    );
    text(
      "result-stats",
      `${Math.floor(s.elapsed / 60)}m ${Math.floor(s.elapsed % 60)}s survived · ${s.catches} catches · ${s.kills} kills · ${s.power} peak power`,
    );
  }
  if (s.status !== previousStatus) {
    previousStatus = s.status;
    persist();
  }
}
let last = performance.now();
function frame(now: number) {
  requestAnimationFrame(frame);
  const dt = (now - last) / 1000;
  last = now;
  if (document.hidden) return;
  if (started) {
    updatePlacement();
    let x = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0) + joystickX,
      z = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0) + joystickY;
    const controlHeading = run.state.mode === "fishing" ? fishingHeading : heading;
    const worldX = Math.sin(controlHeading) * z - Math.cos(controlHeading) * x,
      worldZ = Math.cos(controlHeading) * z + Math.sin(controlHeading) * x;
    tugTime += dt;
    if (tugTime > 0.2) {
      tugTime = 0;
      const tx =
          (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0),
        tz = (keys.has("ArrowUp") ? 1 : 0) - (keys.has("ArrowDown") ? 1 : 0);
      if (tx || tz)
        action({
          type: "tug",
          x: -Math.cos(controlHeading) * tx + Math.sin(controlHeading) * tz,
          z: Math.sin(controlHeading) * tx + Math.cos(controlHeading) * tz,
          strong: keys.has("ShiftLeft"),
        });
    }
    run.step(dt, {
      x: worldX,
      z: worldZ,
      heading,
      pitch,
      aim: aiming,
      sprint: keys.has("ShiftLeft") || keys.has("ShiftRight"),
      fire: firing,
      reel: keys.has("KeyR"),
    });
    saveTime += dt;
    if (saveTime > 1) {
      persist();
      saveTime = 0;
    }
  }
  renderWorld(now / 1000);
  hudTime += dt;
  if (hudTime > 0.08) {
    renderHud();
    hudTime = 0;
  }
}
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
renderHud();
requestAnimationFrame(frame);
