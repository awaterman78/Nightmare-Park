# V16 Living Arena

V16 turns the V14/V15 4K map from a static background into a live battlefield layer. The goal is not to change core mechanics yet; it is to make the map feel premium, atmospheric and responsive while preserving readable competitive play.

## New system

`src/systems/AtmosphereSystem.js` owns the living-world state:

- elapsed atmosphere time
- wind / fog drift
- lightning and moon flash pulses
- danger intensity based on core damage and sudden death
- occasional callouts when the park changes mood

## New data

`src/data/atmosphere.js` defines overlay anchors aligned to the current 4K map:

- torch clusters
- rune stones
- fog bands
- puddles
- bat flight paths
- ember / ash particles
- animated carnival silhouettes

## Render layer

`RenderSystem.drawV16LivingArena()` draws this on top of the map art but underneath units. It adds:

- flickering purple/green torch light
- pulsing cursed river energy
- reflective puddles
- drifting fog layers
- bats and ash
- occasional moon/lightning flash
- sudden-death danger tint

## Next

V17 should move back to gameplay depth: card upgrades, more ability rules, deploy-preview targeting and clearer lane pressure UI.
