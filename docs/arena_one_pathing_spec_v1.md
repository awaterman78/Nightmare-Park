# Arena One Pathing Spec v1

## Goal

Units should move naturally across Arena One without hard lane markers.

The player can place units anywhere in their half, but the map still has two clear bridge crossings.

## Main behaviour

Units move from placement position toward their chosen target.

If crossing the middle separator, units must use the closest sensible bridge.

## Bridge selection

First version:

1. If unit X position is less than 0, prefer left bridge.
2. If unit X position is greater than or equal to 0, prefer right bridge.
3. If current target is much closer to the other bridge, optional later improvement can reroute.

## Player unit crossing

Player unit starts in negative Z.

If target is in enemy half:

1. Move to chosen bridge point on player side.
2. Move to chosen bridge point on enemy side.
3. Move to target.

## Enemy unit crossing

Enemy unit starts in positive Z.

If target is in player half:

1. Move to chosen bridge point on enemy side.
2. Move to chosen bridge point on player side.
3. Move to target.

## Same side targeting

If current unit and target are on the same side, unit can move directly toward target.

This allows interception and skirmishes.

## No sliding through river

Units must not travel straight through the cursed fog separator.

If they need to cross, they use bridges.

## Future improvements

Later versions can add:

1. NavMesh.
2. Avoidance.
3. Dynamic bridge selection.
4. Formation spreading.
5. Obstacle blocking.
6. Anti clumping.
