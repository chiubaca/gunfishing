import * as THREE from "three";
import { LANDMARKS, LOCATIONS, OBSTACLES, terrainHeight, WORLD_SIZE } from "./content";
export { LANDMARKS } from "./content";
import type { RunState, Vec } from "./types";
import { onIsland, waterAt, WATER_BODIES, ISLAND } from "./geography";

export const biomeAt = (p: Vec) => p.z < -180 ? "snow" : p.x > 120 ? "tropical" : "forest";
export const BIOMES = {
  snow: { name: "Snowbell Highlands", color: "#dceef5" },
  tropical: { name: "Sunburst Shores", color: "#edda91" },
  forest: { name: "Willowwood Forest", color: "#81ba78" },
};

// Shared, low-poly resources keep distant groves inexpensive.
export function buildExploration(scene: THREE.Scene) {
  const ball = new THREE.IcosahedronGeometry(1, 1);
  const cone = new THREE.ConeGeometry(1, 1, 8);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const batches = new Map<string, { geometry: THREE.BufferGeometry; color: number; matrices: THREE.Matrix4[] }>();
  const dummy = new THREE.Object3D();
  const part = (geometry: THREE.BufferGeometry, color: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, rotation = 0) => {
    const key = `${geometry.uuid}/${color}/${Math.floor(x / 160)}/${Math.floor(z / 160)}`;
    if (!batches.has(key)) batches.set(key, { geometry, color, matrices: [] });
    dummy.position.set(x, terrainHeight({ x, z }) + y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, rotation, 0);
    dummy.updateMatrix();
    batches.get(key)!.matrices.push(dummy.matrix.clone());
  };
  let seed = 417;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 1800; i++) {
    const x = (random() - 0.5) * (WORLD_SIZE - 50), z = (random() - 0.5) * (WORLD_SIZE - 50);
    if (!onIsland({ x, z }, 15) || waterAt({ x, z }) || waterAt({ x: x + 5, z }) || waterAt({ x: x - 5, z })) continue;
    if (LOCATIONS.some(p => Math.hypot(x - p.x, z - p.z) < 35) ||
      LANDMARKS.some(p => Math.hypot(x - p.x, z - p.z) < 38) ||
      OBSTACLES.some(p => Math.abs(x - p.x) < p.width / 2 + 5 && Math.abs(z - p.z) < p.depth / 2 + 5)) continue;
    const biome = biomeAt({ x, z }), size = 0.8 + random() * 0.8;
    if (biome === "forest") continue;
    part(cylinder, 0x987052, x, 4 * size, z, 0.6 * size, 8 * size, 0.6 * size);
    if (biome === "snow") {
      for (let j = 0; j < 3; j++) {
        part(cone, 0x367c79, x, (5 + j * 2.7) * size, z, (4 - j) * size, 6 * size, (4 - j) * size);
        part(cone, 0xe9f8ff, x, (6.4 + j * 2.7) * size, z, (3.2 - j * 0.8) * size, 3.6 * size, (3.2 - j * 0.8) * size);
      }
    } else {
      for (let j = 0; j < 5; j++) {
        const a = j * Math.PI * 2 / 5;
        part(ball, j % 2 ? 0x37b586 : 0x65d78a, x + Math.sin(a) * 2.5 * size, 8.3 * size, z + Math.cos(a) * 2.5 * size, 1.6 * size, 0.65 * size, 4 * size, a);
      }
      part(ball, 0xb3864f, x, 7.5 * size, z, 1.1, 1, 1.1);
    }
  }
  for (const p of LANDMARKS) {
    const { x, z } = p;
    // Open plaza and a colorful flag make each destination readable from afar.
    part(cylinder, biomeAt(p) === "snow" ? 0xb4d6e5 : 0xe8cf96, x, 0.08, z, 24, 0.16, 24);
    part(cylinder, 0xfaf0d2, x + 17, 8, z, 0.25, 16, 0.25);
    part(box, 0xffa16f, x + 20, 14, z, 6, 3, 0.2);
    if (p.kind === "lodge" || p.kind === "windmill") {
      part(box, p.kind === "lodge" ? 0xc98269 : 0xf5d9a2, x, 6, z, 15, 12, 12);
      part(cone, p.kind === "lodge" ? 0xf2f8ff : 0x569ea0, x, 15, z, 13, 9, 11, Math.PI / 4);
      part(box, 0x654e49, x, 3, z + 6.1, 3, 6, 0.3);
      for (const dx of [-5, 5]) part(box, 0xffeaa1, x + dx, 7, z + 6.2, 2.5, 3, 0.3);
      if (p.kind === "windmill") {
        part(box, 0xfff2d3, x, 15, z + 9, 26, 2, 0.8);
        part(box, 0xfff2d3, x, 15, z + 9, 2, 26, 0.8);
        part(ball, 0xee966a, x, 15, z + 10, 2, 2, 1);
      }
    } else if (p.kind === "lighthouse") {
      for (let j = 0; j < 5; j++) part(cylinder, j % 2 ? 0xff8c7b : 0xfff4d9, x, 3 + j * 6, z, 5 - j * 0.4, 6, 5 - j * 0.4);
      part(ball, 0xffde75, x, 33, z, 4, 4, 4);
      part(cone, 0x398e99, x, 38, z, 6, 5, 6);
    } else if (p.kind === "crystal") {
      for (let j = -1; j <= 1; j++) part(cone, j ? 0x8de0ed : 0xb9a5ff, x + j * 8, j ? 10 : 20, z, 6, j ? 20 : 40, 6);
    } else if (p.kind === "arch") {
      for (const dx of [-10, 10]) part(box, 0xeea29a, x + dx, 9, z, 5, 18, 6);
      part(box, 0xffc7a6, x, 19, z, 25, 5, 6);
    } else {
      for (const dx of [-9, 0, 9]) {
        part(cylinder, 0xffe6c0, x + dx, 3, z, 1.8, 6, 1.8);
        part(ball, dx ? 0xf49487 : 0xe5b460, x + dx, 6, z, 5, 2.5, 5);
      }
      part(box, 0xf4b9a0, x, 0.2, z + 12, 10, 0.3, 7);
    }
  }
  const materials = new Map<number, THREE.MeshStandardMaterial>();
  for (const b of batches.values()) {
    if (!materials.has(b.color)) materials.set(b.color, new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.9, flatShading: true }));
    const mesh = new THREE.InstancedMesh(b.geometry, materials.get(b.color), b.matrices.length);
    b.matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    scene.add(mesh);
  }
}

export function createMinimap(canvas: HTMLCanvasElement, label: HTMLElement, discovery: HTMLElement) {
  const ctx = canvas.getContext("2d")!;
  let last = -Infinity;
  return (state: RunState, now: number) => {
    if (now - last < 100) return;
    last = now;
    const p = state.player, radius = 220, scale = 0.45, center = 110;
    const point = (v: Vec) => ({ x: center + (v.x - p.x) * scale, y: center + (v.z - p.z) * scale });
    ctx.clearRect(0, 0, 220, 220);
    ctx.save();
    ctx.beginPath(); ctx.arc(center, center, 103, 0, Math.PI * 2); ctx.clip();
    for (let x = 0; x < 220; x += 5) for (let y = 0; y < 220; y += 5) {
      const world = { x: p.x + (x - center) / scale, z: p.z + (y - center) / scale };
      ctx.fillStyle = onIsland(world) ? BIOMES[biomeAt(world)].color : "#318fab";
      ctx.fillRect(x, y, 5, 5);
    }
    const dot = (v: Vec, color: string, size: number) => {
      const q = point(v); ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(q.x, q.y, size, 0, Math.PI * 2); ctx.fill();
    };
    const polygon = (outline: Vec[], color: string, fill = true) => {
      ctx.beginPath(); outline.forEach((v, i) => { const q = point(v); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
    };
    polygon(ISLAND, "#f4dda0", false);
    WATER_BODIES.filter(w => !w.secret || state.completed.includes(`secret:${w.name}`)).forEach(w => polygon(w.outline, "#319fbf"));
    LANDMARKS.forEach(v => { const q = point(v); ctx.fillStyle = "#fff1b0"; ctx.strokeStyle = "#735737"; ctx.lineWidth = 2; ctx.fillRect(q.x - 4, q.y - 4, 8, 8); ctx.strokeRect(q.x - 4, q.y - 4, 8, 8); });
    ctx.strokeStyle = "#ffffff70"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(center, center, 50, 0, Math.PI * 2); ctx.stroke();
    let enemies = 0;
    for (const m of state.monsters) {
      if (m.health <= 0) continue;
      const d = Math.hypot(m.x - p.x, m.z - p.z);
      if (d > radius * 2) continue;
      enemies++;
      const ratio = Math.min(1, radius / Math.max(d, 1));
      const q = point({ x: p.x + (m.x - p.x) * ratio, z: p.z + (m.z - p.z) * ratio });
      ctx.fillStyle = "#e93660"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (d > radius) {
        const a = Math.atan2(q.y - center, q.x - center);
        ctx.moveTo(q.x + Math.cos(a) * 5, q.y + Math.sin(a) * 5);
        ctx.lineTo(q.x + Math.cos(a + 2.3) * 6, q.y + Math.sin(a + 2.3) * 6);
        ctx.lineTo(q.x + Math.cos(a - 2.3) * 6, q.y + Math.sin(a - 2.3) * 6); ctx.closePath();
      } else ctx.arc(q.x, q.y, 4 + Math.sin(now / 180) * 0.8, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    if (state.cache) dot(state.cache, "#c776f5", 5);
    ctx.translate(center, center); ctx.rotate(Math.PI - p.heading);
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#235866"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 7); ctx.lineTo(0, 4); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    label.textContent = `${enemies ? `${enemies} enemies nearby` : "All quiet"} · N ↑ · 220 m`;
    const nearest = [...LANDMARKS].sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
    const d = Math.hypot(nearest.x - p.x, nearest.z - p.z);
    const key = `landmark:${nearest.kind}`;
    if (d < 35 && !state.completed.includes(key)) state.completed.push(key);
    const found = LANDMARKS.filter(l => state.completed.includes(`landmark:${l.kind}`)).length;
    discovery.textContent = `${d < 35 ? "Discovered" : `${Math.round(d)} m to`} ${nearest.name} · ${found}/${LANDMARKS.length}`;
    const secret = LOCATIONS.find(l => l.secret && Math.hypot(l.x - p.x, l.z - p.z) < 23);
    if (secret) {
      const key = `secret:${secret.name}`;
      if (!state.completed.includes(key)) state.completed.push(key);
      discovery.textContent = `✦ Secret discovered: ${secret.name} · ${secret.name === "Whisperfin Grotto" ? "The waterfall was hiding a whole world." : "A moonlit garden of floating flowers."}`;
    } else if (Math.hypot(p.x - 310, p.z - 70) < 65 && !state.completed.includes("secret:Whisperfin Grotto")) {
      discovery.textContent = "Something glimmers through the falling water…";
    }
  };
}
