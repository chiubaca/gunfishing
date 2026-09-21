import * as THREE from "three";
import { ISLAND, WATER_BODIES, WATERFALLS } from "./geography";
import type { Vec } from "./types";
import { createWaterSurface } from "./water";

export function outlineShape(points: Vec[]) {
  return new THREE.Shape(points.map(p => new THREE.Vector2(p.x, -p.z)));
}
export function buildWaterscape(scene: THREE.Scene, material: THREE.MeshStandardMaterial, cameraObstacles: THREE.Object3D[]): THREE.Mesh[] {
  const waterGeometries: THREE.BufferGeometry[] = [];
  const surface = (shape: THREE.Shape, mat: THREE.Material, height: number) => {
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = height;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  const sand = new THREE.MeshStandardMaterial({ color: 0xe8d4a0, roughness: 0.95 });
  surface(outlineShape(ISLAND.map(p => ({ x: p.x * 1.018, z: p.z * 1.018 }))), sand, -0.04);
  const ocean = outlineShape([{ x: -4000, z: -4000 }, { x: 4000, z: -4000 }, { x: 4000, z: 4000 }, { x: -4000, z: 4000 }]);
  ocean.holes.push(new THREE.Path(ISLAND.map(p => new THREE.Vector2(p.x, -p.z))));
  waterGeometries.push(new THREE.ShapeGeometry(ocean));
  for (const body of WATER_BODIES) {
    const center = body.outline.reduce((v, p) => ({ x: v.x + p.x / body.outline.length, z: v.z + p.z / body.outline.length }), { x: 0, z: 0 });
    surface(outlineShape(body.outline.map(p => ({ x: center.x + (p.x - center.x) * 1.07, z: center.z + (p.z - center.z) * 1.07 }))), sand, 0.035);
    waterGeometries.push(new THREE.ShapeGeometry(outlineShape(body.outline)));
  }
  const water = createWaterSurface(waterGeometries);
  scene.add(water);
  const rock = new THREE.MeshStandardMaterial({ color: 0x638679, flatShading: true });
  const crystal = new THREE.MeshStandardMaterial({ color: 0xa4fff0, emissive: 0x36ab99, emissiveIntensity: 0.7, flatShading: true });
  const foam = new THREE.MeshBasicMaterial({ color: 0xe1ffff, transparent: true, opacity: 0.58, depthWrite: false });
  const cascade = new THREE.MeshStandardMaterial({ color: 0x83e4e3, transparent: true, opacity: 0.74, side: THREE.DoubleSide, roughness: 0.2, depthWrite: false });
  const time = { value: 0 };
  cascade.onBeforeCompile = shader => {
    shader.uniforms.flowTime = time;
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 fallPosition;").replace("#include <begin_vertex>", "#include <begin_vertex>\nfallPosition = position;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 fallPosition; uniform float flowTime;").replace("#include <color_fragment>", "#include <color_fragment>\nfloat streak = sin(fallPosition.x * 5.0 + sin(fallPosition.y * 0.6 + flowTime * 5.0)); diffuseColor.rgb += 0.15 * streak; diffuseColor.a *= 0.8 + 0.2 * sin(fallPosition.y * 3.0 + flowTime * 12.0);");
  };
  cascade.onBeforeRender = () => { time.value = performance.now() / 1000; };
  const block = (x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    m.position.set(x, y, z); m.castShadow = mat === rock; m.receiveShadow = true; scene.add(m);
    if (mat === rock) cameraObstacles.push(m);
  };
  for (const f of WATERFALLS) {
    // The open arch beneath the lip is a real walk-through entrance.
    for (const side of [-1, 1]) block(f.x + side * 15, f.height / 2, f.z, 10, f.height, 18, rock);
    block(f.x, f.height, f.z - 3, 40, 5, 22, rock);
    block(f.x, f.height + 2.6, f.z - 5, 19, 0.2, 18, material);
    block(f.x, f.height / 2, f.z + 7, 19, f.height, 0.3, cascade);
    for (const side of [-1, 1]) for (let tier = 0; tier < 4; tier++) {
      const boulder = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), rock);
      boulder.position.set(f.x + side * 17, 3 + tier * f.height / 4, f.z + 3);
      boulder.scale.set(7, f.height / 4, 10);
      boulder.rotation.y = tier * 0.7; boulder.castShadow = true; scene.add(boulder);
      cameraObstacles.push(boulder);
    }
    for (let i = 0; i < 12; i++) {
      const mist = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), foam);
      mist.position.set(f.x - 10 + i * 1.8, 0.6 + (i % 3) * 0.25, f.z + 9 + Math.sin(i) * 2);
      mist.scale.set(2.3, 0.55, 1.6); scene.add(mist);
    }
    if (f.secret) {
      // Rock horseshoe conceals the grotto from the north; the curtain hides its southern approach.
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + i * Math.PI / 12;
        block(f.x + Math.cos(a) * 27, 7, 20 + Math.sin(a) * 24, 11, 14, 10, rock);
      }
      for (const dx of [-13, 12]) {
        const gem = new THREE.Mesh(new THREE.ConeGeometry(1.6, 5, 5), crystal);
        gem.position.set(f.x + dx, 2.5, 18); scene.add(gem);
      }
      const light = new THREE.PointLight(0x74ffe0, 35, 42, 1.5); light.position.set(f.x, 5, 20); scene.add(light);
    }
  }
  // Lotus rafts and a tiny forgotten shrine reward wandering off the main circuit.
  const petal = new THREE.MeshStandardMaterial({ color: 0xffacd4, emissive: 0x63234c, emissiveIntensity: 0.3 });
  for (const p of [{ x: 145, z: 240 }, { x: -160, z: 90 }]) {
    for (let i = 0; i < 14; i++) {
      const a = i * 2.399, x = p.x + Math.cos(a) * (11 + i % 4), z = p.z + Math.sin(a) * (10 + i % 3);
      const leaf = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.08, 7), rock);
      leaf.position.set(x, 0.24, z); scene.add(leaf);
      const flower = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), petal);
      flower.position.set(x, 0.6, z); scene.add(flower);
    }
  }
  return [water];
}
