# Vertical Slice 001 Build Spec

## Project

Nightmare Park, Monster Royale

## Slice name

Grave Goblin in Arena One

## Purpose

This is the first proper playable build target.

The goal is not to make the full game.

The goal is to prove the most important question:

Does placing Grave Goblin in Arena One feel brilliant?

If the answer is no, no extra monsters should be added yet.

## Build target

Portrait mobile battle scene.

Recommended first target:

Unity Android test build or Unity WebGL test build.

## Included

- Arena One scene.
- One playable card, Grave Goblin.
- One energy system.
- Place anywhere deployment in player half.
- Enemy dummy spawner.
- Player towers and core.
- Enemy towers and core.
- Grave Goblin movement.
- Grave Goblin Bone Stab.
- Hit reaction.
- Death.
- Basic health bars.
- Basic VFX.
- Basic sound hooks.

## Excluded

- Multiplayer.
- Matchmaking.
- Account system.
- Shop.
- Progression.
- Full deck builder.
- Full monster roster.
- Card upgrades.
- Live economy.
- Ads.
- IAP.

## Gameplay loop

1. Match starts.
2. Player energy begins at 5 out of 10.
3. Grave Goblin card is available.
4. Player taps Grave Goblin card.
5. Player taps anywhere in own half.
6. Grave Goblin spawns at that location.
7. Grave Goblin scuttles toward nearest valid target.
8. Enemy periodically spawns dummy Grave Goblins.
9. Towers shoot enemy units.
10. Units damage towers and cores.
11. Destroy enemy core to win.
12. Lose if player core is destroyed.

## Player placement rules

Allowed:

- Player half only.
- Ground areas clear of towers and core.
- Multiple placements if enough energy.

Not allowed:

- Enemy half.
- Middle cursed fog separator.
- Directly on top of towers.
- Outside arena bounds.

Feedback:

- If valid, show subtle green deployment ring.
- If invalid, show red pulse or small "Not here" message.
- Card deselects after successful placement.

## Camera

Portrait mobile view.

Arena fills most of the screen.

Bottom UI reserved for energy and card hand.

Top UI reserved for health and timer.

No giant tutorial panel over the arena.

## Win and lose

Win:

Enemy core health reaches 0.

Lose:

Player core health reaches 0.

Timer loss condition can be ignored for first test, or whichever core has higher HP wins when timer ends.

## Feel goals

The player should immediately understand:

- I have energy.
- I have a card.
- I can place the goblin in my half.
- He moves and fights automatically.
- I want to place another one.

## Acceptance criteria

The slice is accepted when:

- Grave Goblin can be deployed anywhere in own half.
- Grave Goblin moves via bridge or target path.
- Grave Goblin does not slide.
- Grave Goblin feels alive.
- Bone Stab feels punchy.
- Towers shoot and damage units.
- Health bars update.
- A win or lose state occurs.
- Scene runs smoothly in portrait.
