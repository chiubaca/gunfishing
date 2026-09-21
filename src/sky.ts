import * as THREE from "three";

// One solar day per Run: dawn, daylight, sunset, starlight, then dawn again.
export function solarState(elapsed: number) {
  const angle = elapsed / 900 * Math.PI * 2;
  const elevation = Math.sin(angle);
  return {
    angle,
    daylight: THREE.MathUtils.smoothstep(elevation, -0.16, 0.3),
    twilight: (1 - THREE.MathUtils.smoothstep(Math.abs(elevation), 0.03, 0.4)),
    night: 1 - THREE.MathUtils.smoothstep(elevation, -0.3, -0.06),
  };
}

/** Camera-independent celestial dome, also visible to the water reflection camera. */
export function createSky(scene: THREE.Scene, sun: THREE.DirectionalLight) {
  const ambient = new THREE.HemisphereLight(0xe4f4e9, 0x41584b, 2.3);
  const moon = new THREE.DirectionalLight(0x9dbbff, 0.45);
  scene.add(ambient, moon, moon.target);
  const uniforms = {
    sunDirection: { value: new THREE.Vector3() },
    daylight: { value: 1 }, twilight: { value: 0 }, night: { value: 0 },
    time: { value: 0 }, rotation: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false,
    uniforms,
    vertexShader: `
      varying vec3 direction;
      void main() {
        direction = position;
        vec4 clip = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
        gl_Position = clip.xyww;
      }
    `,
    fragmentShader: `
      varying vec3 direction;
      uniform vec3 sunDirection;
      uniform float daylight, twilight, night, time, rotation;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.3, 0.7));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                       mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                       mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) {
        return noise(p) * 0.55 + noise(p * 2.03) * 0.27 + noise(p * 4.07) * 0.12 + noise(p * 8.13) * 0.06;
      }
      void main() {
        vec3 d = normalize(direction);
        float height = pow(max(d.y, 0.0), 0.45);
        vec3 day = mix(vec3(0.55,0.77,0.85), vec3(0.045,0.25,0.58), height);
        vec3 dark = mix(vec3(0.022,0.035,0.085), vec3(0.002,0.005,0.022), height);
        vec3 color = mix(dark, day, daylight);
        float facing = pow(max(0.0, dot(normalize(vec3(d.x,0.001,d.z)), normalize(vec3(sunDirection.x,0.001,sunDirection.z)))), 3.0);
        float horizon = exp(-max(d.y, 0.0) * 5.5);
        vec3 sunset = mix(vec3(0.32,0.08,0.24), vec3(1.5,0.32,0.055), facing);
        color = mix(color, sunset, twilight * horizon * 0.85);
        color += vec3(1.0,0.42,0.12) * twilight * facing * exp(-abs(d.y) * 15.0) * 0.5;

        // A tilted galactic plane with luminous knots and broken dust lanes.
        vec3 stars = vec3(cos(rotation)*d.x - sin(rotation)*d.z, d.y, sin(rotation)*d.x + cos(rotation)*d.z);
        float latitude = dot(stars, normalize(vec3(0.45,0.38,0.8)));
        float cloud = fbm(stars * 8.0);
        float band = exp(-pow(latitude / 0.17, 2.0));
        float dust = smoothstep(0.32, 0.65, fbm(stars * 23.0));
        vec3 galaxy = mix(vec3(0.09,0.16,0.32), vec3(0.4,0.23,0.32), cloud);
        color += galaxy * band * (0.25 + cloud * 1.4) * (1.0 - dust * 0.8) * night;
        for (int layer = 0; layer < 2; layer++) {
          vec3 grid = stars * (layer == 0 ? 190.0 : 340.0);
          vec3 cell = floor(grid);
          float seed = hash(cell);
          vec3 offset = vec3(hash(cell + 3.1), hash(cell + 7.7), hash(cell + 13.2));
          float point = 1.0 - smoothstep(0.025, layer == 0 ? 0.20 : 0.13, length(fract(grid) - offset));
          float sparkle = 0.8 + 0.2 * sin(time * 1.7 + seed * 100.0);
          color += mix(vec3(0.65,0.8,1.0), vec3(1.0,0.8,0.55), seed) * point * step(0.93, seed) * sparkle * night * 2.5;
        }
        float sunDistance = length(d - sunDirection);
        color += mix(vec3(1.0,0.34,0.08), vec3(1.0,0.92,0.7), daylight)
          * (exp(-sunDistance * 18.0) * 0.5 + (1.0 - smoothstep(0.012,0.016,sunDistance)) * 5.0)
          * smoothstep(-0.04,0.01,d.y);
        float moonDistance = length(d + sunDirection);
        float moonDisc = 1.0 - smoothstep(0.018,0.021,moonDistance);
        color += vec3(0.62,0.74,1.0) * (moonDisc * (0.7 + noise(d * 380.0) * 0.3) + exp(-moonDistance * 24.0) * 0.12) * night;

        // High, wind-swept cloud veils catch pink and gold at either horizon.
        vec3 wind = vec3(time * 0.006, 0.0, time * 0.003);
        float clouds = smoothstep(0.52,0.73,fbm(d * vec3(6.0,18.0,6.0) + wind));
        clouds *= smoothstep(0.01,0.18,d.y) * 0.65;
        vec3 cloudColor = mix(vec3(0.025,0.035,0.065),vec3(0.85,0.92,1.0),daylight);
        cloudColor = mix(cloudColor,vec3(1.3,0.38,0.2),twilight * (0.4 + facing * 0.6));
        color = mix(color, cloudColor, clouds);
        color = mix(color, mix(vec3(0.018,0.03,0.06),vec3(0.43,0.65,0.66),daylight), 1.0 - smoothstep(-0.15,0.0,d.y));
        gl_FragColor = vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), material);
  dome.frustumCulled = false;
  dome.renderOrder = -1000;
  scene.add(dome);
  const nightSky = new THREE.Color(0x536fa8), daySky = new THREE.Color(0xe4f4e9);
  const nightGround = new THREE.Color(0x25314a), dayGround = new THREE.Color(0x41584b);
  const warm = new THREE.Color(0xff8850), white = new THREE.Color(0xffedcf);
  const nightFog = new THREE.Color(0x17243b), dayFog = new THREE.Color(0xb9d9d2);
  const sunsetFog = new THREE.Color(0xbc807d);
  return {
    update(elapsed: number, target: THREE.Vector3, waters: THREE.Mesh[]) {
      const state = solarState(elapsed);
      const direction = uniforms.sunDirection.value.set(Math.cos(state.angle) * 0.8, Math.sin(state.angle), Math.cos(state.angle) * -0.6);
      uniforms.daylight.value = state.daylight;
      uniforms.twilight.value = state.twilight;
      uniforms.night.value = state.night;
      uniforms.time.value = elapsed;
      uniforms.rotation.value = state.angle * 0.25;
      sun.position.copy(target).addScaledVector(direction, 90);
      sun.target.position.copy(target);
      sun.color.copy(warm).lerp(white, state.daylight);
      sun.intensity = 3.1 * THREE.MathUtils.smoothstep(direction.y, -0.04, 0.28);
      moon.position.copy(target).addScaledVector(direction, -90);
      moon.target.position.copy(target);
      moon.intensity = state.night * 0.65;
      ambient.color.copy(nightSky).lerp(daySky, state.daylight);
      ambient.groundColor.copy(nightGround).lerp(dayGround, state.daylight);
      ambient.intensity = 0.75 + state.daylight * 1.55;
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(nightFog).lerp(dayFog, state.daylight).lerp(sunsetFog, state.twilight * 0.6);
      }
      for (const water of waters) {
        const shader = water.material;
        if (!(shader instanceof THREE.ShaderMaterial)) continue;
        shader.uniforms.sunDirection.value.copy(direction).multiplyScalar(state.night > 0.5 ? -1 : 1);
        shader.uniforms.sunColor.value.copy(state.night > 0.5 ? moon.color : sun.color).multiplyScalar(state.night > 0.5 ? 0.18 : sun.intensity / 3.1);
        shader.uniforms.daylight.value = state.daylight;
      }
    },
  };
}
