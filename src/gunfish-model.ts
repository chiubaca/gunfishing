import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Species } from "./types";

export const GUNFISH_COLORS: Record<Species, number> = {
  pistol: 0xf1ce81,
  rifle: 0x87cfb2,
  shotgun: 0xe3957d,
};
export const RARITY_COLORS = [0, 0xd2ddba, 0x79d8eb, 0xdfa0f2];
const materials = new Map<number, THREE.MeshStandardMaterial>();
const box = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.IcosahedronGeometry(1, 1);
const cone = new THREE.ConeGeometry(0.35, 0.5, 3);
const pistolAssets = new Map<number, Promise<THREE.Group | null>>();

function loadPistolAsset(rarity: number) {
  const tier = rarity === 2 ? 2 : 1;
  let asset = pistolAssets.get(tier);
  if (asset) return asset;
  const baseUrl = `${import.meta.env.BASE_URL}assets/gunfish/`;
  const loader = new GLTFLoader();
  const load = (file: string) => loader.loadAsync(`${baseUrl}${file}`);
  asset = (tier === 2
    ? load("pistol-tier-2.glb").catch((error: unknown) => {
        console.warn("Tier II Pistol Gunfish model unavailable; using base model.", error);
        return load("pistol.glb");
      })
    : load("pistol.glb"))
    .then(({ scene }) => {
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = object.receiveShadow = true;
        object.userData.sharedGunfishAsset = true;
      });
      return scene;
    })
    .catch((error: unknown) => {
      console.warn("Pistol Gunfish model unavailable; using fallback mesh.", error);
      return null;
    });
  pistolAssets.set(tier, asset);
  return asset;
}

/** Shared by swimming, held, mounted and field-guide Gunfish. */
export function fishModel(
  species: Species,
  rarity: number,
  parent: THREE.Object3D,
  onReady?: () => void,
) {
  const group = new THREE.Group();
  parent.add(group);
  const body = new THREE.Group();
  group.add(body);
  function part(
    geometry: THREE.BufferGeometry,
    color: number,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = 1,
    sz = 1,
    container: THREE.Object3D = body,
  ) {
    if (!materials.has(color))
      materials.set(
        color,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.82,
          flatShading: true,
        }),
      );
    const mesh = new THREE.Mesh(geometry, materials.get(color)!);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.sharedGunfishAsset = true;
    container.add(mesh);
    return mesh;
  }
  const length = species === "rifle" ? 1.5 : species === "shotgun" ? 1.1 : 0.95;
  const color = GUNFISH_COLORS[species];
  part(
    sphere,
    color,
    0,
    0,
    0,
    species === "shotgun" ? 0.45 : 0.27,
    0.26,
    length * 0.65,
  );
  part(cone, color, 0, 0, -length * 0.75).rotation.x = Math.PI / 2;
  part(
    box,
    0x244443,
    0,
    0,
    length * 0.63,
    0.16,
    0.16,
    species === "rifle" ? 0.65 : 0.3,
  );
  part(sphere, 0x101d1c, -0.22, 0.14, 0.3, 0.07, 0.07, 0.07);
  part(sphere, 0x101d1c, 0.22, 0.14, 0.3, 0.07, 0.07, 0.07);
  for (let i = 0; i < rarity; i++)
    part(
      box,
      RARITY_COLORS[rarity],
      0,
      0.3,
      species === "pistol" ? 0.35 - i * 0.14 : -0.2 + i * 0.22,
      species === "pistol" ? 0.12 : 0.1,
      species === "pistol" ? 0.035 : 0.2,
      species === "pistol" ? 0.08 : 0.12,
      group,
    );
  if (species === "pistol") {
    void loadPistolAsset(rarity).then((asset) => {
      if (!asset || !group.parent) return;
      group.remove(body);
      const model = asset.clone(true);
      // Blender's muzzle points along -X; Gunfish in the game face +Z.
      model.rotation.y = Math.PI / 2;
      model.scale.setScalar(0.22);
      model.position.y = -0.29;
      group.add(model);
      onReady?.();
    });
  }
  return group;
}
