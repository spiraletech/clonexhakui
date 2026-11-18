# Stage 2 · Native engine bridge plan (not implemented)

The existing CLONE v0.1.0 is a JavaScript/WebGL2 sandbox. This stage deliberately preserves a playable browser game while adopting a few tested SpiralOS contracts. **A native engine merge is a different build product.**

## Recommended engineering order

1. Establish `clonexhakui` source as a playable, testable baseline and compare saves and action traces with the original 0.1.0 ZIP. Do not alter donor repositories.
2. Select one target binary: native Windows C++20 executable with a WebGL-compatible renderer replaced by a native graphics backend **or** a browser WebAssembly deployment for selected C++ libraries. Avoid running two independent authoritative HOME states.
3. Expose HOME's actual `VersionedWorld` transaction/snapshot APIs through a narrow ABI; migrate CLONE entities and occupancy with deterministic unit conversion: 1 room tile=1m, 4 quarter cells per metre; preserve stable IDs, topology, world minute, inventory and revision.
4. Replace the JS `S.hakui.step` with authoritative HAKUI C++ `PlayerMovementController` and interaction consequence ABI. Compare 60-Hz trajectory/collision traces, pause/seek/load, and body pose before swapping.
5. Feed HOME snapshots to actual INOKUI scene/material projections; implement shader/material/lighting changes only after visual acceptance. Use existing WebGL2 as compatibility renderer until a GPU backend is proved.
6. Introduce GUFF through a fail-closed executable bridge with typed proposal and signed authority receipts for privileged actions. Keep model-generated text out of the direct input/collision path.
7. Verify old-save import/migration, determinism, no ghost entities, renderer stress, Windows build artifact, launch, audio, frame rate and regression suite.

**Canonical sources:** HOME `2a703f0b5a983569253b339454fd36dc7f22ae3c`; HAKUI implementation `spiraletech/spiral-ether-tech` main and authorized profile branches; INOKUI standalone main README-only as inspected; GUFF `spiraletech/GOLF-GUFF` main. Follow each module's license/third-party notices before reusing native files.
