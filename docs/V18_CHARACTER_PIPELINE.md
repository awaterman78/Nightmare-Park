# V18 Character Pipeline + Cinematic Motion

V18 changes the character approach from “procedural unit drawings” to a lightweight character asset pipeline.

## Core files

```txt
src/data/characters.js
src/systems/CharacterMotionSystem.js
src/entities/Unit.js
src/systems/RenderSystem.js
src/ui/CardDock.js
src/styles/cards.css
```

## Character data

Each playable monster now has a `CHARACTER_LIBRARY` entry containing:

- `silhouette` — the readable battlefield shape.
- `scale` — how large the character appears on the arena.
- `motion.locomotion` — stomp, pounce, hover, skitter, flap, trundle, scuttle.
- `motion.cadence` — animation speed.
- `signature.weapon` — the weapon/readable attack identity.
- `signature.attack` — named attack style.
- `signature.vfx` — colour for trails, dust, aura and impact effects.
- `portrait` — CSS/vector card portrait palette.

## Why this matters

A Clash-style battler lives or dies by instant unit readability. The player should know what a unit does from the way it moves before reading stats.

V18 makes each monster feel different in three places:

1. **Card identity** — distinct portrait silhouette.
2. **Arena movement** — unique locomotion profile.
3. **Combat feedback** — unique attack/VFX profile.

## Current rigs

| Character | Locomotion | Gameplay read |
| --- | --- | --- |
| Brute Clown | Stomp | slow heavy tank |
| Werewolf Runner | Pounce | fast melee pressure |
| Midnight Witch | Hover | ranged magic support |
| Skeleton Swarm | Skitter | cheap fragile swarm |
| Gargoyle | Flap | flying chip unit |
| Pumpkin Catapult | Trundle | slow siege splash |
| Grave Goblin | Scuttle | fast stab/bleed pressure |

## Next art step

When real art is commissioned/generated, keep these IDs:

```txt
assets/characters/bruteClown/
assets/characters/werewolfRunner/
assets/characters/midnightWitch/
assets/characters/skeletonSwarm/
assets/characters/gargoyle/
assets/characters/pumpkinCatapult/
assets/characters/graveGoblin/
```

Each folder should eventually contain:

```txt
portrait.png
idle.png
walk.png
attack.png
special.png
death.png
manifest.json
```

The game can then replace procedural canvas rigs with real sprite sheets while keeping V18 motion logic.
