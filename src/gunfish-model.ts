import * as THREE from "three";
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

/** Shared by swimming, held, mounted and field-guide Gunfish. */
export function fishModel(
  species: Species,
  rarity: number,
  parent: THREE.Object3D,
) {
  const group = new THREE.Group();
  parent.add(group);
  function part(
    geometry: THREE.BufferGeometry,
    color: number,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = 1,
    sz = 1,
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
    group.add(mesh);
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
    part(box, RARITY_COLORS[rarity], 0, 0.3, -0.2 + i * 0.22, 0.1, 0.2, 0.12);
  return group;
}
