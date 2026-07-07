# Nightmare Park V14 — 4K Map + Navmesh

This is the first build where the new high-detail map is actually inside the game and backed by gameplay rules.

## What is new

- High-detail 2160x3840 arena artwork added at `assets/maps/nightmare_park_arena_v14_4k.jpg`.
- Canvas now renders the real map image, not just procedural placeholder art.
- Ambient lighting pulses over the map.
- Cursed river/fog has animated energy movement.
- Tiny ambient particles/bats make the map feel alive.
- New `NavigationSystem` validates where cards can and cannot be placed.
- Units snap to real walkable routes.
- Cursed river, grave clusters, scenery obstacles and keeps are blocked.
- Deployment overlay shows green walkable routes and red/pink blocked areas when a card is selected.
- Fixed the enemy AI deployment bug from V13. Enemy cards now deploy in the enemy half and the HUD shows enemy plays.

## Upload instruction

Extract the ZIP and upload **everything inside this folder** to the root of the GitHub repo.

You must upload the folders as well as the root `index.html`:

```text
index.html
src/
assets/
docs/
scripts/
package.json
```

The map will not work if only `index.html` is uploaded.

## Test URL

```text
https://awaterman78.github.io/Nightmare-Park/?v=14-map-navmesh
```

You should see:

```text
NIGHTMARE PARK V14 MAP NAVMESH • 4K ARENA + WALKABLE ROUTES
```

## How to test quickly

1. Select a monster card.
2. Try dropping it on the lower green route area — it should deploy.
3. Try dropping it into the green river/chasm — it should reject the placement.
4. Wait a few seconds — enemy AI should start playing cards from the top half.
