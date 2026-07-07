# Nightmare Park V14.2 — Embedded Map Fix + Playable Navmesh

This build fixes the missing-map issue seen on GitHub Pages.

What changed:
- The premium arena is still included as `assets/maps/nightmare_park_arena_v14_4k.jpg`.
- The same map is also embedded inside `src/data/mapImage.js` as an emergency fallback.
- If GitHub does not upload/serve the asset folder correctly, the game still loads the map from the embedded fallback.
- The navmesh/pathing rules remain active: units snap to legal routes, the cursed river and scenery are blocked, and deployment is restricted to walkable areas.

Upload instructions:
1. Unzip this file.
2. Upload **all contents** into the GitHub repo root.
3. Commit the changes.
4. Test with: `https://awaterman78.github.io/Nightmare-Park/?v=14-2-embedded-map`

You should see:
`NIGHTMARE PARK V14.2 EMBEDDED MAP FIX • PLAYABLE NAVMESH`

If the visible map appears, the asset issue is solved.
