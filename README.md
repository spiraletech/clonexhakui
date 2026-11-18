# CLONE × HAKUI — locomotion correction v0.2.1

This folder is a playable **browser/WebGL2** adaptation of the handed-over CLONE v0.1.0 Home 01 build. It preserves the original scene art, asset assembly, 48 × 40 quarter-metre collision grid and save schema 1. It adds a compatibility substrate in `js/spiral-substrate.js` using selected, verified contracts from the SpiralOS repositories. **It does not compile, bundle, or execute the native C++ HAKUI, HOME, or GOLF-GUFF engines.** INOKUI's standalone repository currently contains a README only. See `docs/SPIRAL-SOURCE-MAP.md` for implementation provenance and the pending native bridge.

**Play:** open `index.html` in a WebGL2 browser, or on Windows run `START-CLONE.cmd` with Node.js 20+ installed. Move with **WASD / arrows**, hold **Shift** to sprint, or **click the floor** to pathfind. v0.2.1 drives grounded procedural gait, a HAKUI-style solved pose and foot contacts; the actual native C++ HAKUI animation runtime is **not** linked. New `SPIRAL` menu shows HOME revision/receipt history, HAKUI body checks, INOKUI read-only projection and a GUFF local adviser that can propose a plant placement. The action requires an explicit **AUTHORIZE** click; it is a deterministic local example, not an LLM or remote service.

**Verify:** `node --test tests/*.test.cjs` runs 48 tests (42 retained v0.2.0 baseline checks plus 6 locomotion/rig checks). This is Node/DOM-stub verification, **not** browser, audio, FPS or Windows acceptance. See `docs/INTEGRATION-QA.md` and `docs/LOCOMOTION-QA.md`.

---

# CLONE v0.1.0 — Home 01

An original isometric life-sandbox foundation: build your identity in a dream, wake in a quiet home,
and begin keeping a life in a place that seems to remember you. White/pale-wood modular household
models follow the supplied reference direction. The current rendering is a first-pass implementation,
not an exact reconstruction of the reference illustrations.

## Start
Extract the complete ZIP into a new folder. Open index.html in a current WebGL2-capable browser for
the local game. No model downloads, paid API or game engine install is required. The optional
START-CLONE.cmd launches a loopback-only HTTP host using an independently installed Node.js 20+;
it opens http://127.0.0.1:17858. Keep its window open. This is a browser game, not a native EXE.
HTTP launch is preferred for embedded web/video behavior. File and HTTP origins have different
browser save storage: export/import your life if changing launch method.

## Play
Choose name/skin/hair/clothing in the opening dream, then REMEMBER MYSELF. A brief waking phase
leads to player control. Click floor to walk at 3.25 m/s; WASD/arrows move, hold Shift to sprint at 5.75 m/s; click/right-click an item for its menu;
E uses the nearest primary action or stands up; Q sips held soda. Wheel changes zoom.
Use LIFE LOG, POCKETS and SAVE / DATA from the header. Hidden tabs pause world simulation.
SOUND is opt-in. Water/flush effects are short procedural sounds, not licensed recordings.

The fridge has inventory; a stove cooks food from it. Fill water at a sink before watering a plant.
The bed/couch support sleep, and the couch supports lying/sitting and drinking. Sleep advances eight
world hours. Shower/flush/wash timers stop themselves; shower also has a stop action. The door leads
to a small exterior. Approach either neighbor and press F (or double-click nearby) to talk. They remember
encounters; dialogue, actions, weather and seeded familiar/eerie moments enter the saved life log.

## Arrange and scale
ARRANGE opens the asset palette. Select a new object, hover a valid spot, R/ROTATE to turn, click
to place. To move an existing item while arranging, click it and choose PLACE / MOVE. Escape or
CANCEL exits. A main tile is 1 metre; the fine grid has 4 × 4 quarter-metre subcells per main tile.
Items have integer subcell footprints and cardinal rotation. Placement rejects overlaps, out-of-map
origins, player occupation and blocked usable routes. This foundation permits ground placement only.
Fridge/wardrobe opening reports blocked swings; opening and closing swing envelopes reserve space.
A tightly packed closed door may need a neighboring prop moved before it can open. A map has a
128-object cap. Entrances are fixed to preserve the home/exterior connection.

## Computer
Power on → Use computer. Built-in programs are Web, Notes/Storage and Life Log. Each computer has
its own maximum 20 text files of at most 20,000 characters, with a 600 KB aggregate file-data budget across all computers. Notes are not executed. YouTube video
URLs use the privacy-enhanced embedded player. Explicit HTTPS sites can be opened in a sandboxed
frame; many websites refuse embedding or require full browser capabilities. OPEN IN BROWSER is the
fallback. Live websites/video playback have not been verified here. This is not a virtual Windows PC,
a general-purpose program installer or a streamed browser engine.

## Save and continuity
Local automatic save with backup, explicit save, export and validated import are included. Import
keeps a backup before replacement. Export regularly. The retained live journal has a 1,000-moment
cap; it is not an unlimited lifetime archive. World time does not advance while closed/hidden.
This project is independent of RSA Studio; it does not modify any earlier game/workspace save.

## Verification and next steps
See QA_REPORT.md, CLONE_LAW.md, ASSETS.md and BUILD-PROVENANCE.json. Node checks and native GLES
renders are included. Browser launch was blocked by this execution environment's process socket
restriction. Actual browser/Windows layout/performance, audible playback and live website acceptance
are NOT VERIFIED. Do not treat the offline preview as a running browser screenshot.

This is the home-and-grid foundation. The small exterior and two neighbors seed the future world;
a streaming Japanese city, multiplayer, deeper needs/economy, long-form randomized story systems,
surface stacking, the reference loft/pool, full virtual OS and finished character art remain future
milestones. The locked reference art is the target, not a claim that every final asset already exists.

Developer checks: node --test tests/*.test.cjs. Offline mesh proof: node tools/export-proof.cjs, then
python3 tools/verify-render.py qa (Python, numpy, Pillow and system Mesa EGL/GLES required only for
this authoring check). The renderer reuses shared indexed meshes and one generated material atlas;
water ripples use shader time, and flow/screen details use small live transforms rather than image
frames. Normal game launch does not use Python, Blender or those verification tools.
