# V17 — Defence Buildings + Character Motion

V17 moves Nightmare Park away from debug-looking lane markers and toward proper game objects.

## Defence building system

`src/data/defenses.js` defines the defence building library. Each defence has:

- name and short name,
- role and slot type,
- HP, range, damage and attack cadence,
- projectile style,
- colour palette,
- customisation flag,
- future upgrade track.

`src/data/map.js` now assigns each fixed tower slot a `defenseId`. The `Tower` entity loads stats and presentation from the defence library.

This sets up future customisation where the player can swap a lane defence, core skin, projectile style or upgrade track without changing the map layout.

## Current defence loadout

Player:

- left/right: Soul Lantern Turret,
- core: Haunted Gate Core.

Enemy:

- left/right: Cursed Skull Turret,
- core: Crimson Mausoleum Core.

## Character motion upgrade

`Unit` entities now carry visual state:

- `animTime`,
- `visualSeed`,
- `attackAnim`,
- `spawnAnim`,
- `abilityPulse`,
- last position.

`CombatSystem` drives those animation states when units move, attack, summon or take damage.

`RenderSystem` now draws unique procedural silhouettes for:

- Brute Clown: heavy stomping tank with mallet swing,
- Werewolf Runner: fast loping melee with claw slashes and frenzy after-image,
- Midnight Witch: hovering cloak, staff and hex ring,
- Skeletons: jittering bone bodies and skitter movement,
- Gargoyle: flapping wings and hover shadow,
- Pumpkin Catapult: rolling cart, cocking catapult arm and pumpkin shot,
- Grave Goblin: crouched scuttle, ears, dagger jab.

## What remains for V18

V17 is still procedural canvas art. It is a big gameplay/readability upgrade, but the next premium step is to introduce real character artwork:

- sprite sheets or layered SVG/canvas rigs,
- unique card portraits,
- enemy variants,
- animation timings per unit,
- upgraded hit/impact effects,
- sound effect hook points.
