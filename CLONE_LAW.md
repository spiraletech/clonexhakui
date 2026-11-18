# CLONE — foundation law, version 1

CLONE is an original calm, eerie life sandbox: a miniature human life inside a machine,
with another machine inside it. Familiarity should feel slightly misplaced. Begin with a
credible home and small, observable actions. Extend a verified baseline one system at a time.

## 1. Locked visual direction
The five supplied November 17 room references define the material/scale target: architectural
isometric cutaways, white/cream cabinetry, pale wood, restrained glass/metal, parquet/tile,
small coherent polygon forms, soft realistic illumination. Preserve readable geometry and
quiet atmosphere. No imported game-franchise models, logos or characters. Concept imagery
never counts as implemented art or proof of functionality. v0.1 models are original first-pass
geometry; exact photographic matching, the loft, pool and reference office are not implemented.

## 2. One scale, one occupancy owner
- One main square = 1 metre. One main square contains a 4 × 4 array of quarter-metre subcells.
- The starter-home floor is 12 × 10 metres: 48 × 40 subcells. The small exterior uses that scale.
- Each catalogue item has integer origin, rectangular subcell footprint and 0/90/180/270° rotation.
- Placement is ground-only in this foundation. No arbitrary elevation, free rotation or floating placement.
- Placed bodies may touch footprint edges; they may not intersect occupied cells or exceed the map.
- Model detail belongs to its host assembly. The collision/placement rectangle comes from core.js,
  never from an image. Ground contact and closed model bounds must pass the model tests.
- Movement reserves a body-sized clearance, not only a mathematical point. Do not let narrow
  quarter-tile gaps become passages through which the wider player model clips.
- A move/new item must retain usable routes. The prototype caps placed objects at 128.
- Fridge/wardrobe opening uses a conservative swing envelope. Blocked swings must report a reason;
  open/closing envelopes occupy space, and future placement must respect them. A closed object may
  be tightly packed, but a blocked door must not open through another object.
- Entrance anchors are fixed in this baseline. Surface stacking, walls, upper floors and stairs
  require validated support/clearance data before implementation. Never fake them visually.

## 3. Usable assemblies
Each displayed catalogue object exposes real named actions and an exit. The foundational asset
contract is recorded in ASSETS.md. Water has visible motion and a bounded interaction timer.
A fridge contains counted stock. Storage changes conserve inventory. Sitting/lying/sleeping
are poses with a way to stand and walk away. Sleep advances the single world clock.
A computer holds its own bounded text files and its built-in applications; it must not claim
unimplemented native OS/program compatibility. Lamps, doors and appliances reflect their state.

## 4. Animation and size
Reuse shared indexed primitive geometry, material atlas and instance batches. Small surface
motion belongs in shader/time-driven effects when possible. Never store an image per animation
frame merely to make water or a screen move. Keep model rebuilds bounded, pause hidden simulation,
and measure runtime geometry/package size. Size or triangle counts do not establish a frame rate.

## 5. A life has one clock and a history
A saved seed controls story/weather choices; the world clock drives day/night and neighbor routines.
Render time may animate surfaces but must not independently advance stories or NPC decisions.
No hidden/offline elapsed time advances this prototype. Neighbor encounters are player-triggered,
remembered, and journalled. Every consequential player interaction writes a bounded life-log entry.
Weather, inventory, identity and computer notes must round-trip through validated save data.
Keep the last 1,000 life-log moments in the live save. Export preserves the retained log. A lifetime
archive beyond this cap needs an explicit chunked storage system; do not silently claim it exists.

## 6. Starts, exits and ownership
First launch: customize identity in a dream → wake in the bed → take control in the house.
Opening/closing, washing/showering, flush, sleep, web viewing and placement all have exits.
No indefinitely sounding sources, stuck action timers, automatic external web browsing or network
requests from the story clock. Audio starts only after the player's SOUND/interaction gesture.
Close an embedded web page when its computer window closes or the player leaves.

## 7. Data and web
Save schema is versioned JSON. Validate dimensions, item kinds, overlaps, player position, bounded
fields/files and state before applying imports. Keep a safety backup. Render text as text; no HTML
injection or execution of imported notes. Local browser storage can fail: export must remain available.
Web accepts explicit HTTPS URLs only, without URL credentials. YouTube video ids are validated.
Embeds obey the destination site's rules; expose an external browser fallback. Do not claim that
arbitrary sites or native programs work inside a browser iframe. A full virtual browser/OS is a
separate future integration, not an implicit feature of the computer model.

## 8. Honest milestones
Tests with DOM/WebGL/audio stubs establish control flow, not actual browser visuals or sound.
Native GLES proofs establish mesh/shader rendering, not browser/Windows acceptance. Record failures
and blocked checks. Never promise no bugs, no glitches, zero lag, perfect sound or exact reference
matching without relevant evidence. User authorization for a task permits its necessary reversible
implementation; do not invent approval gates. Preserve prior baseline archives when starting fresh.

## 9. Foundation boundary
v0.1 is a local single-player starter home plus a small exterior/neighbor seed. A seamless streaming
city, community economy, full emergent life history, multiplayer servers, full virtual OS, and the
reference pool/loft are future milestones. Every future milestone must add concrete state, behavior,
asset support, limits, save migration and appropriate verification together.
