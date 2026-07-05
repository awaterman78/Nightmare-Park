# Battle UI Layout Spec v1

## Screen format

Portrait mobile.

Primary test size:

```text
1080 x 1920
```

The UI must also fit iPhone screens with notches and home indicators.

## Screen structure

### Top HUD

Enemy core health on the left.

Timer in the middle.

Your core health on the right.

Top HUD must be compact and not cover too much arena.

### Optional stat row

For first test, stats can be hidden or small.

If used:

```text
Screams
Bones
Chaos
```

These are secondary and should not distract from combat.

### Arena area

The arena takes most of the screen.

Do not cover units with big panels.

World health bars should be small and readable.

### Bottom HUD

Energy orb.

Energy bar.

Card hand.

For first test:

```text
Card 1: Grave Goblin
Slots 2 to 4: locked or empty
```

## Card selection flow

1. Player taps Grave Goblin card.
2. Card lifts and glows.
3. Player deployment zone subtly glows.
4. Player taps valid area.
5. Goblin deploys.
6. Card returns to normal state.

## Invalid placement flow

1. Player taps invalid area.
2. Small red pulse appears.
3. Optional short message, "Your half only".
4. Card remains selected.

## Visual style

Haunted gothic mobile battler.

Colours:

```text
Green: player, valid, energy, Grave Goblin
Purple: enemy, magic, haunted energy
Red: danger, damage, invalid placement
Gold: rewards and important impact
Dark navy: panel background
```

## Readability rule

The UI should look good, but every value must be readable at arm's length on an iPhone.
