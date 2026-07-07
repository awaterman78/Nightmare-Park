# V19 Premium Visual Slice

V19 replaces the obvious procedural monster look with real runtime art assets.

## Runtime art folders

Each active monster has a folder under:

```text
assets/characters/<character-id>/
```

Current V19 character IDs:

- `graveGoblin`
- `candleImp`
- `tinBat`
- `mirrorClown`
- `zombieRunner`
- `phantomBride`
- `werewolfKing`
- `summonedSkeleton`

Each folder contains:

```text
sprite.png
portrait.png
idle.png
walk.png
attack.png
special.png
manifest.json
```

## Renderer behaviour

`RenderSystem` now attempts to draw the current character image frame first. If the asset is not loaded, it falls back to the older procedural canvas renderer. This prevents a broken page if a file is missing while allowing the visual bar to move to real art.

## Card UI behaviour

`CardDock` now uses character portrait images and rarity badges. Emoji / CSS portraits remain fallback only.

## Next target

V20 should replace static PNG states with true multi-frame animation sheets or Unity/Spine-style rigs:

- idle loop
- run loop
- attack anticipation
- attack follow-through
- hit reaction
- death
- special ability
