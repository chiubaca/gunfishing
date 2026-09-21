import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { ISLAND, WATER_BODIES, WORLD_SIZE } from "./geography";
import type { Vec } from "./types";

// A baked shoreline field avoids walking every polygon in every fragment. Drawing
// the union also keeps river/pool junctions free of artificial foam seams.
function shorelineTexture() {
  const mask = document.createElement("canvas");
  mask.width = mask.height = 1024;
  const ctx = mask.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1024, 1024);
  const polygon = (points: Vec[], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (p.x / WORLD_SIZE + 0.5) * 1024;
      const y = (p.z / WORLD_SIZE + 0.5) * 1024;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath(); ctx.fill();
  };
  polygon(ISLAND, "black");
  WATER_BODIES.forEach(body => polygon(body.outline, "white"));
  const soft = document.createElement("canvas");
  soft.width = soft.height = 1024;
  const blur = soft.getContext("2d")!;
  blur.filter = "blur(4px)";
  blur.drawImage(mask, 0, 0);
  const texture = new THREE.CanvasTexture(soft);
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/** Coplanar bodies share a single 512px planar reflection, regardless of count.
 * Inspired by the Gerstner/Water examples linked in the three.js water thread.
 * Analytic wave slopes keep the fishing plane stable and need no dense mesh.
 */
export function createWaterSurface(geometries: THREE.BufferGeometry[]) {
  const geometry = mergeGeometries(geometries)!;
  geometries.forEach(g => g.dispose());
  const water = new Water(geometry, {
    textureWidth: 512, textureHeight: 512,
    sunDirection: new THREE.Vector3(-35, 80, -35).normalize(),
    sunColor: 0xffddb0, waterColor: 0x087e86,
    distortionScale: 1.6, fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.17;
  const shader = water.material;
  shader.uniforms.shoreline = { value: shorelineTexture() };
  shader.fragmentShader = shader.fragmentShader
    .replace("uniform float alpha;", `uniform float alpha;
      uniform sampler2D shoreline;
      // Gerstner phase speed sqrt(g/k), with independent wind directions.
      vec2 waveSlope(vec2 p, vec2 direction, float wavelength, float steepness) {
        float k = 6.2831853 / wavelength;
        float phase = k * (dot(direction, p) - sqrt(9.81 / k) * time);
        return direction * steepness * cos(phase);
      }`)
    // Declare time before helpers that use it.
    .replace("uniform sampler2D mirrorSampler;", "uniform sampler2D mirrorSampler;\nuniform float time;")
    .replace("uniform float time;\n\t\t\t\tuniform float size;", "uniform float size;")
    .replace("vec4 noise = getNoise( worldPosition.xz * size );\n\t\t\t\t\tvec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );", `
      vec2 p = worldPosition.xz;
      float depth = clamp((texture2D(shoreline, p / ${WORLD_SIZE.toFixed(1)} + 0.5).r - 0.5) * 2.0, 0.0, 1.0);
      float farFade = 1.0 - smoothstep(35.0, 160.0, length(eye - worldPosition.xyz));
      vec2 slope = waveSlope(p, vec2(0.94, 0.342), 9.0, 0.13)
        + waveSlope(p, vec2(-0.6, 0.8), 4.1, 0.085)
        + waveSlope(p, vec2(0.28, -0.96), 1.8, 0.045);
      slope += farFade * (waveSlope(p, vec2(0.8, 0.6), 0.48, 0.032)
        + waveSlope(p, vec2(-0.38, 0.925), 0.27, 0.02));
      vec3 surfaceNormal = normalize(vec3(-slope.x, 1.0, -slope.y));
    `)
    .replace("float rf0 = 0.3;", "float rf0 = 0.0204;")
    .replace("* waterColor;", "* mix(vec3(0.10, 0.46, 0.37), waterColor * 0.46, smoothstep(0.0, 0.95, depth));")
    .replace("vec3 outgoingLight = albedo;", `
      float ribbons = sin(p.x * 3.1 + sin(p.y * 2.7 + time * 0.7))
        + sin(p.y * 3.6 - sin(p.x * 2.3 - time * 0.6));
      float caustic = pow(max(0.0, ribbons * 0.5), 9.0) * (1.0 - depth) * farFade;
      float foam = (1.0 - smoothstep(0.02, 0.25, depth))
        * smoothstep(0.25, 0.85, sin(p.x * 2.1 + p.y * 1.6 + time * 1.3) * 0.5 + 0.5);
      vec3 outgoingLight = mix(albedo + caustic * vec3(0.16, 0.28, 0.19)
        + specularLight * 0.22, vec3(0.65, 0.85, 0.78), foam * 0.42);
    `);
  const reflect = water.onBeforeRender;
  water.onBeforeRender = function (...args) {
    shader.uniforms.time.value = performance.now() / 1000;
    reflect.apply(this, args);
  };
  return water;
}
