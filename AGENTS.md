# CLONE work rules
Read CLONE_LAW.md before changes. This is a separate project from RSA Studio and the VST projects.
core.js owns simulation and placement; assets.js owns original geometry; renderer.js owns graphics;
game.js owns browser UI/input/audio. Keep imports and notes data-only. Preserve save schema or supply
migration. Read BUILD-PROVENANCE.json and QA_REPORT.md before claiming a verified baseline. Run
`node --test tests/*.test.cjs` and syntax checks for changed scripts. Native rendering can be reproduced
with tools/export-proof.cjs and tools/verify-render.py. Report browser/audio/Windows checks separately.
