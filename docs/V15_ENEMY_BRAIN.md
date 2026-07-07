# V15 Enemy Brain + Real Match Flow

V15 moves Nightmare Park from a map/navmesh demo toward a real PvP-style card battler.

## Player hand

The player now sees only four cards at a time. When a card is played it cycles to the back of the deck and the next queued card enters the hand.

Implemented in:

- `src/systems/CardCycleSystem.js`
- `src/core/Game.js`
- `src/ui/CardDock.js`

## Enemy brain

The enemy has its own deck, hand and energy. It evaluates the battlefield every few moments and chooses between:

- defending a threatened lane,
- supporting an existing push,
- attacking a damaged player tower,
- splitting pressure,
- saving energy when unaffordable.

Implemented in:

- `src/systems/AISystem.js`

## Combat feedback

V15 adds stronger feedback primitives:

- enemy deployment callouts,
- melee slash effects,
- projectile impact bursts,
- clearer death poofs,
- HUD status showing AI intent and enemy energy.

Implemented in:

- `src/systems/CombatSystem.js`
- `src/systems/RenderSystem.js`
- `src/entities/Effect.js`

## What V16 should add next

- Better unit targeting priorities.
- Smarter enemy combos: tank first, ranged behind, building only when defending.
- Animated tower charge-up.
- Ambient map animation layer: flicker, bats, fog pulses, rune glows.
- Basic card upgrade and reward screen after match.
