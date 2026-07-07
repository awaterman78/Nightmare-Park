# Nightmare Park V13 — Proper Repo Build

This version is deliberately **not just a single index.html**.

It is a modular GitHub Pages build with folders for:

- `src/core` — game loop, constants, input, maths
- `src/data` — cards, unit stats, building stats and map data
- `src/entities` — Unit, Building, Tower, Projectile, Effect classes
- `src/systems` — deployment, economy, enemy AI, combat and rendering systems
- `src/ui` — card dock and HUD
- `src/styles` — CSS split into HUD/cards/main layout
- `docs` — architecture and next roadmap
- `scripts` — smoke test for the data modules

## Upload instruction

Extract the ZIP and upload **everything inside this folder** to the root of the GitHub repo.

You must upload the folders as well as the root `index.html`:

```text
index.html
src/
docs/
assets/
scripts/
package.json
```

Then test:

```text
https://awaterman78.github.io/Nightmare-Park/?v=13-repo-build
```

You should see:

```text
NIGHTMARE PARK V13 REPO BUILD • MODULAR GAME ARCHITECTURE
```

## Why this is better

V12 proved that the live GitHub Pages replacement works, but it was still a one-file prototype.

V13 separates game data, rendering, combat, deployment and UI so future changes can be done properly:

- map changes happen in `src/data/map.js`
- monster stats happen in `src/data/cards.js`
- combat behaviour happens in `src/systems/CombatSystem.js`
- enemy logic happens in `src/systems/AISystem.js`
- card UI happens in `src/ui/CardDock.js`
- visuals happen in `src/systems/RenderSystem.js`

This is the new baseline for serious development.
