import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LOCATIONS, SPECIES } from "./content";
import { fishModel } from "./gunfish-model";
import type { Species } from "./types";
import "./gun-guide.css";

const details: Record<
  Species,
  { summary: string; style: string; branches: [string, string][] }
> = {
  pistol: {
    summary:
      "A dependable semi-automatic companion. Make each shot count, or trade precision for a rapid burst.",
    style: "Precision / burst",
    branches: [
      [
        "Aim for 0.6 seconds to charge a double-damage shot with triple stagger.",
        "Charge in 0.4 seconds for 2.5× damage, triple stagger and penetration through one extra target.",
      ],
      [
        "Fire a two-round burst, spending ammunition for each round.",
        "Fire a three-round burst with 35% less spread.",
      ],
    ],
  },
  rifle: {
    summary:
      "A fast-firing automatic Gunfish. Keep the pressure on with sustained fire or disruptive stagger pulses.",
    style: "Sustained fire / disruption",
    branches: [
      [
        "Holding fire spins up to 50% faster fire over 0.75 seconds. Spool resets after 0.4 seconds without firing.",
        "Reach full spool in 0.4 seconds. At full spool, shots penetrate one extra target, retaining 60% damage after the first hit.",
      ],
      [
        "Every fifth shot delivers triple stagger.",
        "Every fourth shot delivers triple stagger and staggers other monsters within 4 metres of the hit.",
      ],
    ],
  },
  shotgun: {
    summary:
      "Eight pellets in a close-range blast. Sweep through a crowd or evolve into a precise, heavy-hitting slug.",
    style: "Crowd control / heavy shot",
    branches: [
      [
        "Pellets form an even horizontal fan and penetrate one extra target, losing half their damage after each hit.",
        "Penetrate two extra targets and gain 25% more stagger.",
      ],
      [
        "Replace the pellet spread with one accurate slug dealing eight times the damage of a single pellet.",
        "After travelling 8 metres, the slug gains 30% damage and can penetrate one extra target.",
      ],
    ],
  },
};
const species = Object.keys(SPECIES) as Species[];
const url = (type: Species) => `/explore/guns/${type}`;
const rarityFromSearch = (search: string) => {
  const level = Number(new URLSearchParams(search).get("level"));
  return level === 2 || level === 3 ? level : 1;
};

function viewer(type: Species, interactive: boolean, rarity = 1) {
  const host = document.querySelector<HTMLElement>(`[data-model="${type}"]`)!;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    host.innerHTML =
      '<p class="model-error">3D preview unavailable. Enable hardware-accelerated WebGL to view this Gunfish.</p>';
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.append(renderer.domElement);
  renderer.domElement.setAttribute(
    "aria-label",
    `${SPECIES[type].name}, in-game 3D model`,
  );
  renderer.domElement.setAttribute("role", "img");
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xe6fff5, 0x244443, 3));
  const light = new THREE.DirectionalLight(0xffddb0, 3.1);
  light.position.set(3, 5, 4);
  scene.add(light);
  let model = fishModel(type, rarity, scene);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
  camera.position.set(3.5, 1.7, 2.5);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = interactive;
  controls.enablePan = false;
  controls.minDistance = 2;
  controls.maxDistance = 9;
  controls.target.set(0, 0, 0);
  controls.update();
  controls.saveState();
  const render = () => renderer.render(scene, camera);
  controls.addEventListener("change", render);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  });
  resize.observe(host);
  if (interactive) {
    document
      .querySelector<HTMLSelectElement>("#rarity")!
      .addEventListener("change", (event) => {
        const level = Number((event.target as HTMLSelectElement).value);
        const search = new URLSearchParams(window.location.search);
        search.set("level", String(level));
        history.replaceState(null, "", `${window.location.pathname}?${search}`);
        scene.remove(model);
        model = fishModel(type, level, scene);
        render();
      });
    document
      .querySelectorAll<HTMLButtonElement>("[data-view]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.view;
          if (action === "reset") controls.reset();
          else if (action === "left" || action === "right") {
            camera.position.applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              action === "left" ? -Math.PI / 8 : Math.PI / 8,
            );
          } else
            camera.position.setLength(
              THREE.MathUtils.clamp(
                camera.position.length() * (action === "in" ? 0.8 : 1.25),
                2,
                9,
              ),
            );
          controls.update();
          render();
        });
      });
  }
  window.addEventListener(
    "pagehide",
    (event) => {
      if (event.persisted) return;
      resize.disconnect();
      controls.dispose();
      renderer.dispose();
    },
    { once: true },
  );
}

export function showGunGuide(path: string, search = window.location.search) {
  const slug = path.slice("/explore/guns/".length);
  const type = species.find((item) => item === slug);
  const directory = path === "/explore/guns";
  const rarity = rarityFromSearch(search);
  document.title = `${directory ? "Gunfish directory" : type ? SPECIES[type].name : "Gunfish not found"} | Gunfishers`;
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <header class="guide-header"><a class="wordmark" href="/">GUNFISHERS<span>THE WATERLANDS FIELD GUIDE</span></a><nav aria-label="Main navigation"><a href="/explore/guns" ${directory ? 'aria-current="page"' : ""}>Gunfish directory</a><a class="play-link" href="/">Play the game ↗</a></nav></header>
    <main class="guide-main">${directory ? directoryMarkup() : type ? detailMarkup(type, rarity) : '<section class="guide-intro"><p class="eyebrow">UNCHARTED WATERS</p><h1>Gunfish not found.</h1><p>This species isn’t in the current game.</p><a href="/explore/guns">← Browse all Gunfish</a></section>'}</main>
    <footer class="guide-footer">THE WATER GIVES. THE WATER REMEMBERS.<span>Gunfishers · Field notes</span></footer>`;
  if (directory) species.forEach((item) => viewer(item, false));
  else if (type) viewer(type, true, rarityFromSearch(search));
}

function directoryMarkup() {
  return `<section class="guide-intro"><p class="eyebrow">EXPLORE / GUNFISH</p><h1>Know your next catch.</h1><p>Living fish. Unlikely firepower. Meet every Gunfish you can currently fish for in the waterlands, and discover what it can become.</p><span class="count">${species.length} CATCHABLE SPECIES · 2 EVOLUTION BRANCHES EACH</span></section>
    <ul class="gun-list">${species.map((type, index) => `<li><a class="gun-card ${type}" href="${url(type)}"><div class="card-model" data-model="${type}" aria-hidden="true"></div><div class="card-copy"><span class="eyebrow">SPECIES 0${index + 1} / ${details[type].style}</span><h2>${SPECIES[type].name}</h2><p>${details[type].summary}</p><span class="branch-label">${SPECIES[type].branches.join(" / ")}</span></div><span class="card-arrow" aria-hidden="true">↗</span></a></li>`).join("")}</ul>`;
}

function detailMarkup(type: Species, rarity: number) {
  const gun = SPECIES[type];
  const info = details[type];
  const locations = [
    ...new Set(
      LOCATIONS.filter((location) => location.species === type).map(
        (location) => location.name,
      ),
    ),
  ];
  return `<a class="back-link" href="/explore/guns">← All Gunfish</a>
    <section class="detail-heading"><p class="eyebrow">SPECIES 0${species.indexOf(type) + 1} / ${info.style}</p><h1>${gun.name}</h1><p>${info.summary}</p></section>
    <section class="specimen ${type}" aria-label="Interactive Gunfish preview"><div class="specimen-top"><span class="eyebrow">LIVE SPECIMEN / IN-GAME MODEL</span><label>Rarity <select id="rarity"><option value="1" ${rarity === 1 ? "selected" : ""}>Tier I</option><option value="2" ${rarity === 2 ? "selected" : ""}>Tier II</option><option value="3" ${rarity === 3 ? "selected" : ""}>Tier III</option></select></label></div><div class="detail-model" data-model="${type}"></div><div class="viewer-toolbar"><p>Drag to rotate · Scroll or pinch to zoom</p><div><button data-view="left" aria-label="Rotate left">↶</button><button data-view="right" aria-label="Rotate right">↷</button><button data-view="in" aria-label="Zoom in">+</button><button data-view="out" aria-label="Zoom out">−</button><button data-view="reset">Reset view</button></div></div></section>
    <dl class="stats"><div><dt>Base damage${type === "shotgun" ? " / pellet" : ""}</dt><dd>${gun.damage}${type === "shotgun" ? " × 8" : ""}</dd></div><div><dt>Shots / second</dt><dd>${gun.rate}</dd></div><div><dt>Magazine</dt><dd>${gun.magazine}</dd></div><div><dt>Reload${type === "shotgun" ? " / shell" : ""}</dt><dd>${gun.reload}s</dd></div><div><dt>Ammo class</dt><dd>${gun.ammo}</dd></div></dl><p class="stat-note">Tier I, unevolved, with no numerical upgrades. Tier II and III increase base damage by 20% and 40% respectively.</p>
    <section class="evolution"><p class="eyebrow">FROM CATCH TO COMPANION</p><h2>Choose its evolution.</h2><p>Open the Gunfish arsenal (Tab), choose your target and sacrifice other carried <strong>${gun.name}</strong> to evolve it. Stage I chooses a branch; Stage II deepens that same branch.</p>
    <div class="requirements"><h3>What you’ll need</h3><table><caption>Same-species donors required, in addition to the target</caption><thead><tr><th scope="col">Target rarity</th><th scope="col">Unevolved → Stage I</th><th scope="col">Stage I → Stage II</th></tr></thead><tbody>${[1, 2, 3].map((rarity) => `<tr><th scope="row">Tier ${["I", "II", "III"][rarity - 1]}</th><td>${rarity} ${rarity === 1 ? "donor" : "donors"}</td><td>${rarity * 2} donors</td></tr>`).join("")}</tbody></table><p>Donors may be any rarity or evolution stage. Each must be a distinct Gunfish other than the target. Donors, their magazines and progression are permanently consumed; the target keeps its rarity and numerical upgrades. No Upgrade resource is required.</p></div>
    <div class="branch-root">${gun.name}<span>UNEVOLVED · CHOOSE ONE BRANCH</span></div><div class="evolution-branches">${gun.branches.map((branch, index) => `<article class="branch"><span class="eyebrow">PATH 0${index + 1}</span><h3>${branch}</h3><ol><li><span class="stage">STAGE I</span><p>${info.branches[index][0]}</p></li><li><span class="stage">STAGE II</span><p>${info.branches[index][1]}</p></li></ol></article>`).join("")}</div><p class="stat-note">Stage II is the final evolution. Numerical upgrades are separate: up to three ranks shared across Damage, Fire rate and Magazine, bought with Upgrade resource.</p></section>
    <section class="habitats"><p class="eyebrow">CAST A LINE</p><h2>Where to find it.</h2><p>Sheltered pools favour common catches; exposed hotspots favour higher rarity.</p><ul>${locations.map((name) => `<li>${name}</li>`).join("")}</ul></section>`;
}
