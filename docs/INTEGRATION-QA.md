# CLONE × HAKUI v0.2.0 integration acceptance

- Source base: submitted CLONE v0.1.0 Home 01 FULL BUILD ZIP.
- Destination: `https://github.com/spiraletech/clonexhakui` (main initially contained only `README.md`).
- Executable target: local browser/WebGL2 (not a native `.exe`).
- Source dependencies: no additional npm/browser network dependencies.
- Node verification: `node --check js/core.js js/game.js js/spiral-substrate.js` (run separately per script) and `node --test tests/*.test.cjs`.
- Coverage: 30 retained baseline tests + 11 cross-substrate tests + 1 GUI-stub integration test = **42**.
- Regression topics: old save compatibility, transactional atomicity, stale revision refusal, inventory integrity, bounded HAKUI movement and collision refusal, INOKUI snapshot immutability, GUFF refusal and explicit authorization, browser boot via DOM/WebGL stubs and server route allowlist.
- Preserved untouched visuals: `js/assets.js` and `js/renderer.js` kept their existing primitives and shaders. `QA_REPORT.md` refers to the baseline visuals.

## Not verified

Windows browser acceptance, native `exe` build, real WebGL frame rate, audio playback, native HAKUI/HOME/GUFF C++ library linkage, INOKUI shader implementation, multiplayer and city streaming. Existing native offline render proof is original v0.1.0 only.

## Known transition limits

The HOME revision wrapper currently covers placement, move/interact/talk, and HAKUI quarter-cell crossing; legacy game clock/NPC state/notes/identity mutation is not fully represented as revision-stamped transactions. No signed GUFF authority receipts or AI reasoning backend are bundled.

## v0.2.1 locomotion correction

48/48 Node tests now pass. The new animation solver is a local JavaScript bridge and its offline GLES mesh exports report zero graphics errors; browser and Windows gait validation remain unverified. See `docs/LOCOMOTION-QA.md`.
