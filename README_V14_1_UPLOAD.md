# Nightmare Park V14.1 Map Loader Fix

This is the corrected repo-root upload package. It fixes the V14 map not appearing.

## What was fixed

- The first render could crash before the 4K map loaded because the fallback renderer expected old `map.decor` data.
- The renderer now safely handles the loading state.
- The renderer now tries multiple asset paths.
- A root copy of the map image is included as a fallback as well as the proper `assets/maps/` copy.
- If the asset is missing, the game now shows a clear on-screen message instead of failing silently.

## Upload

Upload everything inside this ZIP into the GitHub repo root. Do not upload the ZIP itself.

Required paths:

```text
index.html
src/
assets/maps/nightmare_park_arena_v14_4k.jpg
nightmare_park_arena_v14_4k.jpg
```

Then open:

```text
https://awaterman78.github.io/Nightmare-Park/?v=14-1-map-loader-fix
```

You should see:

```text
NIGHTMARE PARK V14.1 MAP LOADER FIX • 4K ARENA + SAFE NAVMESH
```
