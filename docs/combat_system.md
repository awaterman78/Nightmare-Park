# Combat System Spec

## Combat style

Real time auto battling after deployment.

The player controls:

- Card selection.
- Placement position.
- Timing.

The monsters control:

- Movement.
- Targeting.
- Attacks.

## Deployment

A selected monster can be placed anywhere in the player's half.

Rules:

```text
Allowed: own half
Not allowed: enemy half
Not allowed: middle separator
Not allowed: directly on top of towers
```

## Energy

Energy refills over time.

First test:

```text
Max energy: 10
Starting energy: 5
Grave Goblin cost: 2
Recharge rate: approx 1 per second
```

## Targeting rules, first version

1. Attack nearest enemy unit in range.
2. If no enemy unit, move toward nearest enemy defensive tower.
3. If towers destroyed, move toward enemy core.
4. Cross nearest relevant bridge.
5. Do not slide directly through the cursed trench.

## Grave Goblin combat

- Fast melee unit.
- First attack is Bone Stab and deals bonus damage.
- Normal attack is a quick dagger stab.
- Dies quickly if focused by tower fire.

## Win condition

Destroy enemy core.

## Lose condition

Your core is destroyed.

## Future systems

Not for vertical slice:

- Spells.
- Flying units.
- Splash units.
- Taunt.
- Summons.
- Stuns.
- Poison.
- Charge.
- Boss monsters.
