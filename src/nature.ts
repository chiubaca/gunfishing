/// <reference types="vite/client" />
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { LOCATIONS, OBSTACLES, terrainHeight, WORLD_SIZE } from "./content";

// Static scenery owns its shared resources independently of disposable run entities.
export async function buildNature(scene: THREE.Scene): Promise<void> {
  const loader = new GLTFLoader();
  let seed = 7319;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const names = ["BirchTree_1", "BirchTree_2", "BirchTree_3", "BirchTree_4", "BirchTree_5", "Bush_Small", "Bush_Large", "Bush_Small_Flowers", "Flower_1_Clump", "DeadTree_1", "DeadTree_6"];
  const placements: THREE.Matrix4[][] = names.map(() => []);
  const dummy = new THREE.Object3D();
  const place = (kind: number, x: number, z: number, scale: number) => {
    dummy.position.set(x, terrainHeight({ x, z }) + 0.04, z);
    dummy.rotation.set(0, random() * Math.PI * 2, 0);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    placements[kind].push(dummy.matrix.clone());
  };
  const segmentDistance = (x: number, z: number, a: { x: number; z: number }, b: { x: number; z: number }) => {
    const dx = b.x - a.x, dz = b.z - a.z;
    const t = THREE.MathUtils.clamp(((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz), 0, 1);
    return Math.hypot(x - a.x - dx * t, z - a.z - dz * t);
  };
  const clear = (x: number, z: number, margin: number) =>
    !LOCATIONS.some((p, i) => Math.hypot(x - p.x, z - p.z) < 20 + margin ||
      segmentDistance(x, z, p, LOCATIONS[(i + 1) % LOCATIONS.length]) < 5 + margin ||
      segmentDistance(x, z, p, { x: 0, z: 0 }) < 3 + margin) &&
    !OBSTACLES.some((o) => Math.abs(x - o.x) < o.width / 2 + margin && Math.abs(z - o.z) < o.depth / 2 + margin);

  // Broad groves give the long journeys a landscape; finer planting frames each pool.
  for (let i = 0; i < 14500; i++) {
    const x = (random() - 0.5) * (WORLD_SIZE - 40);
    const z = (random() - 0.5) * (WORLD_SIZE - 40);
    if (!clear(x, z, 4)) continue;
    const grove = Math.sin(x * 0.013) * Math.cos(z * 0.017);
    if (grove < -0.15 || (x > 100 && random() < 0.45)) continue;
    place(x > 200 && z < 0 && random() < 0.5 ? 9 + Math.floor(random() * 2) : Math.floor(random() * 5), x, z, 1.1 + random() * 1.5);
    if (random() > 0.55) place(5 + Math.floor(random() * 3), x + 3, z + 2, 1 + random());
  }
  for (const p of LOCATIONS) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = p.x + Math.sin(angle) * 27, z = p.z + Math.cos(angle) * 27;
      if (clear(x, z, 2)) place(p.region === "Sunken Quarry" && i % 3 === 0 ? 9 : i % 5, x, z, 1.7 + random() * 0.5);
    }
    for (let i = 0; i < 680; i++) {
      const angle = random() * Math.PI * 2;
      const radius = 17 + Math.pow(random(), 1.5) * 105;
      const x = p.x + Math.sin(angle) * radius, z = p.z + Math.cos(angle) * radius;
      if (!clear(x, z, 0.5)) continue;
      const tree = radius > 29 && random() < (p.region === "Reedbeds" ? 0.19 : 0.09);
      const kind = tree ? (p.region === "Sunken Quarry" ? 9 + Math.floor(random() * 2) : Math.floor(random() * 5)) : random() < 0.55 ? 8 : 5 + Math.floor(random() * 3);
      place(kind, x, z, tree ? 1.2 + random() * 0.9 : 0.45 + random() * 0.8);
    }
    // Wildflower drifts and low bushes leave the immediate casting bank unobstructed.
    for (let i = 0; i < 160; i++) {
      const angle = random() * Math.PI * 2, radius = 16.5 + random() * 5;
      const x = p.x + Math.sin(angle) * radius, z = p.z + Math.cos(angle) * radius;
      if (Math.abs(x - p.x - 5) < 5 && z > p.z) continue;
      place(i % 3 ? 8 : 7, x, z, 0.8 + random() * 0.8);
    }
  }

  const results = await Promise.allSettled(names.map(async (name, kind) => {
    const { scene: model } = await loader.loadAsync(`${import.meta.env.BASE_URL}assets/ultimate-stylized-nature/${name}.gltf`);
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const ground = new THREE.Matrix4().makeTranslation(0, -bounds.min.y, 0);
    // Spatial batches retain useful frustum culling instead of drawing the entire map.
    const chunks = new Map<string, THREE.Matrix4[]>();
    for (const matrix of placements[kind]) {
      const key = `${Math.floor(matrix.elements[12] / 100)},${Math.floor(matrix.elements[14] / 100)}`;
      if (!chunks.has(key)) chunks.set(key, []);
      chunks.get(key)!.push(matrix);
    }
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.roughness = 0.9;
          if (material.transparent) {
            material.transparent = false;
            material.alphaTest = 0.45;
            material.alphaToCoverage = false;
          }
        }
      }
      const local = ground.clone().multiply(child.matrixWorld);
      for (const matrices of chunks.values()) {
        const batch = new THREE.InstancedMesh(child.geometry, child.material, matrices.length);
        matrices.forEach((matrix, i) => batch.setMatrixAt(i, matrix.clone().multiply(local)));
        batch.castShadow = kind < 5 || kind > 8;
        batch.receiveShadow = true;
        batch.computeBoundingSphere();
        scene.add(batch);
      }
    });
  }));
  if (results.some((result) => result.status === "rejected"))
    throw new Error("Some nature models could not be loaded");
}

export function meadowMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 meadowPosition;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nmeadowPosition = (modelMatrix * vec4(transformed, 1.0)).xz;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec2 meadowPosition;
float meadowHash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float meadowNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(meadowHash(i), meadowHash(i + vec2(1,0)), f.x), mix(meadowHash(i + vec2(0,1)), meadowHash(i + vec2(1,1)), f.x), f.y);
}`)
      .replace("#include <color_fragment>", `#include <color_fragment>
float n = meadowNoise(meadowPosition * 0.09) * 0.7 + meadowNoise(meadowPosition * 0.7) * 0.3;
diffuseColor.rgb *= mix(vec3(0.13, 0.24, 0.095), vec3(0.43, 0.49, 0.22), n);`);
  };
  return material;
}
