# V14 Map + Navmesh Upgrade

## What changed

V14 puts the high-detail Nightmare Park arena art into the playable game and backs it with real navigation data.

The visual map lives here:

```text
assets/maps/nightmare_park_arena_v14_4k.jpg
```

The playable navigation layer lives here:

```text
src/data/map.js
src/systems/NavigationSystem.js
```

## How pathing works

The map still has three competitive logical routes, but they are curved and organic rather than obvious straight strips.

Each route has:

- waypoints
- width
- deployment snap width
- route name
- total path length

Units do not free-roam over the whole image. They follow the route centreline and offset perpendicular to the path, so they stay on the proper walkable space and do not wander into the river, fences or scenery.

## Deployment rules

When a card is dropped or tapped:

1. The point must be in the correct half of the map.
2. The point must not be inside a blocked zone.
3. Units must be close enough to a walkable route.
4. Buildings must be in legal terrain and close enough to the fight routes.
5. The deployment is snapped/associated to the nearest legal route.

Blocked examples:

- cursed river/chasm
- central scenery obstacles
- grave clusters
- base keeps

## AI fix

V13 had a progress-direction mismatch. Enemy deployment was trying to use lower-map progress values, so enemy cards could fail silently. V14 fixes that:

- progress 0 = player base
- progress 1 = enemy base
- player deploys at progress below 0.5
- enemy deploys at progress above 0.5

The HUD now shows enemy AI plays so it is obvious whether the AI is actually active.

## Next

V15 should split the map into layers:

- base art
- fog layer
- light layer
- interactable building layer
- collision/nav layer

That will make the map feel even more alive and make Unity transfer cleaner.
