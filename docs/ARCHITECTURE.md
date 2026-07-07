# Nightmare Park Architecture

## Current aim

Build a playable monster battler inspired by the clear tactical loop of lane-based card battlers, while keeping Nightmare Park original: haunted theme park map, monster tribes, odd buildings, cursed energy and darker comic-horror atmosphere.

## Runtime approach

This build is a no-build-step ES module app so it works directly on GitHub Pages.

`index.html` only hosts the shell. The game is split into modules.

## Main folders

### `assets/maps`
High-detail arena map artwork. V14 uses `nightmare_park_arena_v14_4k.jpg`.

### `src/core`
Game lifecycle, constants, input and maths utilities.

### `src/data`
Balance and content. Map data now includes playable navmesh-style routes, blocked zones, ambient lights and tower positions.

### `src/entities`
Runtime object classes. Units, buildings, towers, projectiles and effects.

### `src/systems`
Game behaviour:

- NavigationSystem: validates deployment, checks blocked terrain, snaps units to routes.
- DeploymentSystem: spends energy and spawns units/buildings using the nav layer.
- EconomySystem: cursed energy regeneration.
- AISystem: enemy card spending, now fixed to deploy in the enemy half.
- CombatSystem: targeting, attacks, projectiles, splash and win/loss.
- RenderSystem: canvas map, ambient lighting, units, towers, projectiles and effects.

### `src/ui`
DOM-based card deck and HUD.

## Next architecture upgrades

1. Move ability logic out of CombatSystem into separate ability modules.
2. Add a real 4-card hand cycle instead of showing the whole deck.
3. Add layered map art: base, fog, lighting, props and collision.
4. Add sprite assets instead of procedural canvas shapes.
5. Add a balancing file for levels and upgrades.
6. Add unit test coverage for targeting and deployment rules.
7. Convert the same structure into Unity scripts/prefabs later.
