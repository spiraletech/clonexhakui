# ETHERTECH IRIDESCENCE 001 — experimental material room

**Status:** unpromoted research branch `experiment/iridescence-001`.
**Base:** `fix/hakui-grounded-locomotion-v0.2.1`.

## Scope

This is a reversible read-only material experiment in CLONE's existing **home**. It does **not** build a new room, alter game geometry, modify physical collision, import Blender/Unreal assets, or integrate C++ HAKUI. The same original home mesh, player animation, items and saved world are used.

- Browser boot: `index.html`, **MATERIAL LAB** header control.
- `js/iridescence-lab.js`: read-only projections; four named surface IDs (7–10).
- `js/renderer.js`: angle-dependent thin-film interference **approximation**, five uniforms, moon/warm lighting tint.
- `js/game.js`: projection of existing shell + selected objects; menu sliders.
- Four simultaneous surfaces: Moonlit Pearl, Midnight Mercury, Opal Glass, Obsidian Oil Film. Choose one as a global coated-surface preview or return to the four-material gallery.
- Parameter controls: film strength, film thickness (300–900 nm), roughness. Toggle off to reproduce the source scene.
- All settings are session-local presentation settings, not persisted as HOME mutations.

## Architecture

```
CLONE saved HOME state → original CLONE geometry & animation
                      → read-only experimental material projection
                      → RSA WebGL2 renderer (unchanged collision meshes)
```

Original player, neighbor models, gameplay routines and world-state writes remain on their existing paths. Only display materials on selected shell/item meshes are changed in the scene projection. The existing material atlas, seven geometric primitives and shadow map remain reused. The shader is physically inspired, **not** a measured full spectral thin-film BRDF. No frame-time or VRAM improvement is claimed.

## Test commands

```sh
for f in js/*.js; do node --check "$f"; done
node --test tests/*.test.cjs
node tools/export-iridescence-proof.cjs
python3 tools/verify-render.py qa/iridescence
```

The last command requires numpy, Pillow and a working Mesa EGL/GLES3 software graphics environment. The experiment CI workflow provides these on Ubuntu and publishes shader compilation/render reports plus proof screenshots.

Node and DOM/WebGL mocks verify code paths and state invariants; **they are not a real browser playback test**. Offline GLES proof verifies shader linkage, a nonempty scene and GL errors on that test platform, not perceptual fidelity, Windows compatibility, interaction latency, or FPS. Only claim passing checks after GitHub Actions actually reports success.

## Acceptance for promotion

1. Original 48 baseline tests still pass; new tests pass independently.
2. No changed world truth, stable IDs, occupancy rules, HAKUI locomotion or save schema.
3. Compiles and renders the actual **enabled** coating shader in Mesa GLES.
4. Manual Windows/WebGL2 inspection verifies distinct surfaces, no extreme clipping or blown highlights, clean lighting toggle, reasonable GPU performance and a working toggle back to baseline.
5. Explicit user approval before integration into canonical branches.

## Not claimed

No native `.exe` or GPU benchmark, no Blender interchange export, no offline asset generator, no real spectral interference model, no performance acceptance, no merge into HAKUI or RSA Studio. FALCON Verify, when used, audits report claims; it cannot substitute for shader compilation, image inspection or real-browser acceptance.
