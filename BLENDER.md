# Blender asset workflow

Blender files are editable art sources. The game and field guide load exported GLBs from `public/assets/`; they do not load `.blend` files or presentation renders.

## Base Pistol Gunfish

| Purpose | File |
| --- | --- |
| Editable base model | `art/gunfish/pistol/base.blend` |
| Game-ready export | `public/assets/gunfish/pistol.glb` |
| Reference views | `art/gunfish/pistol/renders/` |
| Runtime loading and placement | `src/gunfish-model.ts` |

The base model is the unevolved Pistol Gunfish. It has details on both sides. Its `.blend` also contains a studio floor, camera, and lights for renders; none belong in the game export. Keep `base.blend` as the source of truth when editing the base model, and update `pistol.glb` after art changes. The GLB is currently merged into 12 meshes by material to keep draw calls down when several Gunfish are on screen.

## Exporting an asset

1. Open the source `.blend` and save art changes there first.
2. Export **only the model geometry**: exclude the studio floor, lights, camera, and reference objects. Make export copies if you need to convert text or curves so the editable source remains intact.
3. Convert export copies of text and curves to meshes, apply modifiers, and combine meshes that share a material. Preserve the model's two-sided details and PBR materials.
4. Export a GLB into `public/assets/gunfish/`. Do not include an additional floor or presentation scene.
5. Load the GLB in the field guide and rotate it to inspect the muzzle, tail, grip, lettering, and both sides. Run `npm run build` to confirm Vite includes the asset.

The current pistol source has its muzzle toward Blender **−X** and **Z up**. `src/gunfish-model.ts` turns it toward the game's **+Z** direction, scales it by `0.22`, and offsets it vertically by `−0.29`. Keep new pistol variants aligned with the base's origin and dimensions so they fit swimming, held, mounted, and guide views without per-view corrections.

## Variants

Use the base model for common body geometry. A finish-only variation can share one GLB and change materials at runtime. For a different silhouette, attachment, or evolution stage, keep an editable source beside `base.blend` (for example, `art/gunfish/pistol/deadeye-1.blend`) and export a named GLB (for example, `public/assets/gunfish/pistol-deadeye-1.glb`). Follow the same convention for other species.

Name evolution variants by **species, branch, and stage**. Tier II Pistol Gunfish is a rarity-specific silhouette: `art/gunfish/pistol/tier-2.blend` exports to `public/assets/gunfish/pistol-tier-2.glb`. `src/gunfish-model.ts` selects this model for Pistol rarity 2 in the game and field guide, irrespective of evolution branch or stage; other tiers use `pistol.glb`. Keep a fallback model while an asset is loading or if its export is unavailable.
