# CLONE × HAKUI locomotion correction — v0.2.1

## Defect
CLONE v0.2.0 moved an articulated-but-static mesh at `dt*9` quarter-cells per second (2.25 m/s), rendering stationary limbs while the player root translated. Foot sliding was a real rendering defect. Its keyboard navigation recalculated an A* target each frame, causing abrupt motion.

## Source-based HAKUI implementation boundary
Canonical references inspected:
- `spiraletech/hakui`, branch `native/hakui-mannequin-correction-02-sully`: `src/body/BodyPoseSolver.cpp`, `BodyConstraintSolver.cpp`, `BodyPoseState.hpp`, `BodyConstraintState.hpp`.
- Same branch: `src/player/PlayerMovementController.hpp` (walk 3.25, sprint 5.75 m/s, acceleration 26 and deceleration 34 m/s²).

The new `js/hakui-embodiment.js` is a **browser-native JavaScript approximation** of the approved ownership model: accepted movement → body pose → foot-contact/IK correction → renderer. It is **not** compiled HAKUI C++ code, a clip-retargeted animation system, authored gait clips, or a general-purpose foot/terrain solver. CLONE currently has flat walking surfaces and only grounded standing locomotion; no jump, skating, or slope-adaptive renderer is claimed.

## Patch
- Walking and Shift sprint use canonical numeric speed constants from HAKUI and acceleration/deceleration; click paths also use the walk speed. Inputs are normalized to avoid diagonal acceleration exploits.
- Displacement is split into <=0.45 subcell fragments so v0.2.0's HAKUI collision/authority guard still handles each step (max <=0.6).
- A transient per-character pose controller advances gait phase from **accepted distance**, not wall clock. It computes swinging arms, knees, foot lift, pelvis bob, knee flexion, yaw following, world-space stance foot locks, pivot releases and two-bone leg reach clamping.
- `js/assets.js` consumes joint and contact results for real animated mesh positions; body solvers do not live in the renderer. NPC meshes share the same animator using their **actual** CLONE movement.
- Rendering follows accepted root coordinates. No pose data is persisted in saves or written as HOME transactions, and the save schema remains 1. Sitting, lying, and sleep remain on their original visual path.
- Reset avatar pose state on explicit save import and on transitions between zones.

## Automated verification
`node --test tests/*.test.cjs`: **48 passed, 0 failed**, including the original 42 tests, pose solver checks, stance/swing contact, stop recovery, pivot without root mutation, travel reset, articulated mesh geometry, browser menu boot, local host route, and walking vs sprinting keyboard distance.

`node tools/export-proof.cjs && python3 tools/verify-render.py qa`: offline GLES shader/geometry checks were executed with zero GL errors. Offline captures do not prove runtime animation timing.

## Still unverified
Manual Windows browser acceptance (including 8-way movement, potential clipping, foot-slip observation and target FPS). Chromium in this execution environment failed initializing ANGLE/EGL, before usable graphics; not counted as a browser pass. Native C++ HAKUI linkage, authored clip blending, terrain IK, full 8-way animation clips and skating are future implementation stages.
