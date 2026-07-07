# Assets Folder

V14 now uses a real map asset instead of a procedural placeholder.

- `assets/maps/nightmare_park_arena_v14_4k.jpg` — 2160x3840 arena artwork used by the live canvas.
- `assets/units` — future sprite sheets and animation frames.
- `assets/vfx` — projectile and hit effects.
- `assets/audio` — placeholder and final sound effects.

The map is not just decoration: `src/data/map.js` defines the matching walkable routes, blocked zones, bridge/choke areas and tower positions so units know where they can and cannot go.
