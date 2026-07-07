# Nightmare Park Architecture

## Current aim

Build a playable monster battler inspired by the clear tactical loop of lane-based card battlers, while keeping Nightmare Park original: haunted theme park map, monster tribes, odd buildings, cursed energy and darker comic-horror atmosphere.

## Runtime approach

This build is a no-build-step ES module app so it works directly on GitHub Pages.

`index.html` only hosts the shell. The game is now split into modules.

## Main folders

### `src/core`
Game lifecycle, screen input, constants and maths utilities.

### `src/data`
Balance and content. This is where new cards, stats, towers and map layout should be added.

### `src/entities`
Runtime object classes. Units, buildings, towers, projectiles and effects.

### `src/systems`
Game behaviour:

- DeploymentSystem: validates half-of-field placement and spawns units/buildings.
- EconomySystem: cursed energy regeneration.
- AISystem: enemy card spending and lane response.
- CombatSystem: target selection, attacks, projectiles, splash and win/loss.
- RenderSystem: canvas map, units, towers, projectiles and effects.

### `src/ui`
DOM-based card deck and HUD.

The card dock is now DOM rather than hidden canvas logic, so missing cards should be much easier to catch and fix.

## Next architecture upgrades

1. Move ability logic out of CombatSystem into separate ability modules.
2. Add a real card-hand cycle instead of showing the whole deck.
3. Add account-free local progression in LocalStorage.
4. Add sprite assets instead of procedural canvas shapes.
5. Add a balancing file for levels and upgrades.
6. Add unit test coverage for targeting and deployment rules.
7. Convert the same structure into Unity scripts/prefabs later.
