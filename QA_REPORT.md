# CLONE v0.1.0 verification record

Built 2026-11-17. This is a starter-home foundation, not a completed MMO or final-art acceptance.

## Completed checks
- Node functional, placement, model, DOM adapter and localhost-handler checks: **30 passed, 0 failed**. Exact output: qa/tests.txt.
- Grid: all authored objects integer quarter-tile footprints, no initial body intersections, bounds and usable routes checked. Closed model horizontal bounds checked for all 18 types at four rotations with a 0.025 m bevel tolerance. Player body clearance, packing, swing obstruction and imported open-swing bounds checked.
- Dream customization, waking, household inventory conservation, bounded water/flush timers, couch poses, sleep, cooking, watering, save validation, website input validation, per-computer storage and global storage cap checked.
- NPC route movement/memory and repeatable seeded journal events checked. These are simple routines and short events, not a full story generator.
- Shipped UI module executed with DOM and graphics stubs: dream submission, wake, save, build palette and placement-preview flow. These checks do not establish browser visual layout.
- Actual shipped GLSL and mesh transforms compiled/rendered in native Mesa EGL/OpenGL ES 3.2 llvmpipe. Home/exterior plus 10 action-state captures rendered, **0 reported GL errors**. See qa/graphics-results.json and qa/actions/graphics-results.json.
- Action captures use state transitions from the simulation, including fridge open, seated/sipping player, toilet flush and shower flow; they are offline mesh renders, not browser screenshots.

## Measured budgets
| Measurement | Starter result |
| --- | ---: |
| Browser runtime source, uncompressed HTML/CSS/JS | 63,123 bytes |
| Bundled model/texture/audio binary files required at launch | 0 |
| Shared primitive templates | 7 |
| Generated shared material atlas | 1024 × 512 pixels |
| Atlas RGBA8 plus mipmaps, nominal allocation | 2,796,204 bytes |
| Shadow map | 2048 × 2048 depth |
| Home mesh instances incl. floor, walls, player | 690 |
| Home triangles per geometry pass | 74,452 |
| Home draw calls with shadow refresh | 10 |
| Exterior instances / triangles | 194 / 23,184 |
| Placed-object simulation cap | 128 |
| Computer text file data budget across computers | 600,000 UTF-8 bytes |
| Live life-log retention | 1,000 moments |

Binary-free startup is a disk-size result, not a claim of zero GPU memory use. Geometry buffers,
instancing arrays, atlas, shadow map and the browser framebuffer allocate memory at runtime.
Draw-call and triangle figures describe these two scenes, not a city benchmark. Dynamic geometry
can refresh shadows; lights are bounded to four. Atlas is generated once, not uploaded anew per frame.

## Not verified / remaining acceptance
A real Chromium/Playwright launch was attempted but the process could not create its required
socket in this execution environment. The failure happened before page load (qa/browser-attempt.txt).
Browser display, native event timing, embedded website/video playback, localStorage on actual file
origins, Windows CMD launch, audible sound quality, target-device FPS/RAM and long-session stability
remain **NOT VERIFIED**. Shader compilation/CPU tests are not substitutes for those checks.

No promise of zero bugs, zero artifacts or lag-free large maps is made. The next acceptance pass is
on DEV's WebGL2 browser/Windows hardware, followed by reference-art refinement and streamed-world
performance work. Current art is a simple original polygon implementation of the reference direction.
The loft, pool, full Japanese city, arbitrary supported surface stacking, native virtual OS and
networked multiplayer are not implemented in this milestone.

## Reproduce
Run `node --test tests/*.test.cjs`. Render with `node tools/export-proof.cjs`, then
`python3 tools/verify-render.py qa`. Action proofs: `node tools/export-actions.cjs`, then
`python3 tools/verify-render.py qa/actions`. Python proof tooling needs numpy/Pillow and Mesa EGL/GLES;
normal game launch does not. Browser entry is index.html; optional Node host is server.cjs.
