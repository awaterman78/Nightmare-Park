# V14 Roadmap — Make It Feel Like a Game

V13 fixes the architecture problem. V14 should improve game feel.

## Priority 1 — Real card hand

Current V13 shows the full test deck. V14 should use:

- 4-card hand
- next card preview
- card rotation after deploy
- locked cards / unlock progression

## Priority 2 — Better monster roles

Improve behavioural difference:

- Brute Clown should body-block and soak damage.
- Werewolf should leap or dash to targets.
- Witch should actively summon behind herself.
- Gargoyle should ignore ground blockers.
- Pumpkin Catapult should only target buildings and feel like siege.
- Grave building should be a genuine pressure engine.

## Priority 3 — Higher quality map

Use real map art or tile layers:

- haunted midway background
- organic paths painted into the terrain
- river slime animation
- bridge props
- fog layers
- damaged ride landmarks

## Priority 4 — Feel and feedback

- hit pause / shake on tower damage
- clearer projectile trails
- better death bursts
- unit spawn sounds
- tower lock-on indicators
- troop shadows

## Priority 5 — Unity transfer

Once the browser version has good mechanics, create a Unity vertical slice using the same architecture:

- CardData ScriptableObjects
- UnitController prefab
- BuildingController prefab
- TowerController prefab
- CombatSystem
- DeploymentController
- BattleArena scene
