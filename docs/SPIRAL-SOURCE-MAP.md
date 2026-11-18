# SpiralOS Integration Source Map · CLONE × HAKUI v0.2.0

## Source ownership and inspected references (2026-11-17)

| Source | Verified file / implementation | Browser adaptation | Status |
|---|---|---|---|
| CLONE v0.1.0 Home 01 | Uploaded ZIP, `js/core.js`, `js/assets.js`, `js/renderer.js`, `js/game.js` | Preserved as primary game, only narrow edits | Retained, 30/30 original regression tests |
| HOME | [`spiraletech/SPIRAL-OS-HOME/include/home/versioned_world.hpp`](https://github.com/spiraletech/SPIRAL-OS-HOME/blob/main/include/home/versioned_world.hpp), [`hakui_adapter.hpp`](https://github.com/spiraletech/SPIRAL-OS-HOME/blob/main/include/home/hakui_adapter.hpp), [`guff_home_cartridge.hpp`](https://github.com/spiraletech/SPIRAL-OS-HOME/blob/main/include/home/guff_home_cartridge.hpp) | `S.home` world projection, serial revision, bounded receipts, stale-rejecting and atomic staged transactions | JS contract subset; C++ library not linked |
| HAKUI | [`spiraletech/spiral-ether-tech/src/player/PlayerMovementController.hpp`](https://github.com/spiraletech/spiral-ether-tech/blob/main/src/player/PlayerMovementController.hpp), and movement/interaction implementation | `S.hakui.step` validates speed-bounded body movement against CLONE collision and NPC occupancy, tracks crossing consequence | JS body-control subset; native C++ not linked |
| INOKUI | `spiraletech/INOKUI` main is README-only; the implemented adapter is [`SPIRAL-OS-HOME/include/home/inokui_adapter.hpp`](https://github.com/spiraletech/SPIRAL-OS-HOME/blob/main/include/home/inokui_adapter.hpp) | `S.inokui.project` read-only presentation frame; supplies existing daylight factor to renderer | JS frame projection; no native INOKUI graphics engine |
| GOLF-GUFF | [`spiraletech/GOLF-GUFF/docs/AUTHORITY_GATE.md`](https://github.com/spiraletech/GOLF-GUFF/blob/main/docs/AUTHORITY_GATE.md), [`SPIRAL-OS-HOME/include/home/guff_home_cartridge.hpp`](https://github.com/spiraletech/SPIRAL-OS-HOME/blob/main/include/home/guff_home_cartridge.hpp) | Typed, scoped local proposal evaluation and explicit player-approval path; denial does not mutate HOME | JS sandbox subset; no signed receipt/AI execution or native GUFF runtime |

## Locked boundaries

1. **CLONE/HOME** is the sole persistent world-state owner in this browser build; objects, placement, logs, time and inventory remain in `CLONE` state. The Stage 1 bridge batches build/interact/talk operations via its serial revision transaction wrapper. Native HOME is not silently made a second authoritative database.
2. **HAKUI** reports physical position consequences and cannot directly create/change household assets. The locomotion bridge validates body clearance; it is not the original native collision solver, skating, physics, combat or rig system.
3. **INOKUI** projects world state to a presentation view and does not write to CLONE. Appearance values remain user-controlled; visual style is unchanged.
4. **GUFF** proposes bounded operations under a capability grant. Evaluation never mutates world state. A separate player click is required to apply a valid proposal, and revisions are revalidated. This sample does not imply cryptographic GUFF authority receipts or any running language model.
5. **ENTROKOI / XENON** are not integrated. CLONE retains its existing isometric camera and opt-in procedural audio.

## Stage 1 integration contract

```
Browser UI / user gesture
    |                      GUFF scoped proposal (read-only)
    v                         | approval only
CLONE state <--- HOME transaction/validation gate
    ^                         |
HAKUI step (body only)        +--> revision + bounded receipt
    |
INOKUI projection --> existing WebGL2 renderer
```

`S.commit({ expectedRevision, actor, operations })` is limited to 1–8 typed operations; it stages changes on a copy of the entire world, applies CLONE's own placement/interaction invariants, verifies the result with `C.load`, then publishes the update in one commit. Rejected operations do not partially apply. Its audit is bounded at 32 receipt summaries. The original save schema (`schema: 1`) is preserved; optional `spiral` world/revision/audit fields round-trip and are validated. Legacy saves without the fields import normally.

The player's subcell motion is validated in `S.hakui.step`, with a revision on integer subcell boundary crossings. Existing game time, weather RNG, NPC life routines, identity edits and computer notes still use their original CLONE pathways; this transitional bridge does not yet provide complete canonical change accounting for those paths. The HOME v0.1 C++ state engine remains the next-phase authority candidate.

## Required next native step, not claimed as completed

A true port requires a target platform decision and actual C++/WASM or native host build, matching semantics and transaction receipts, verified save migration, 60 Hz movement tests, image/audio tests, and Windows acceptance before any authority promotion. Do not paste whole C++ repositories into browser JavaScript or overwrite the canonical repos.

## Baseline preservation

Original v0.1.0 docs, art and QA reference files remain in the integration ZIP. `BUILD-PROVENANCE.json` and `QA_REPORT.md` refer to the team's original v0.1.0 proof, not new v0.2 graphics tests.
