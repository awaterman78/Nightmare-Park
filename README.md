# Nightmare Park, Monster Royale

A haunted real time 1 vs 1 monster card battler.

## Current direction

Select a monster card, place it anywhere in your half of Arena One, then watch the monster move, target and fight automatically.

The first vertical slice is deliberately narrow:

**Arena One + Grave Goblin + one playable deployment loop.**

No extra menus. No fake depth. No haunted spreadsheet nonsense.

## First milestone

### Vertical Slice 001, Grave Goblin in Arena One

The test is successful when:

1. Grave Goblin can be deployed anywhere in the player's half.
2. Grave Goblin moves like a goblin, low, twitchy, quick and alive.
3. Grave Goblin targets enemies and structures clearly.
4. Bone Stab has anticipation, lunge, impact, recoil and readable damage.
5. The haunted arena and UI feel premium enough to build on.
6. The whole thing works in portrait mobile format.

## Repository structure

```text
docs/              Game design, arena, combat and animation specs.
tasks/             Sprint task breakdowns.
art_direction/     Approved reference art and mockups.
unity/             Unity project folder and implementation notes.
blender/           Character modelling, rigging, animation and export pipeline.
prototypes/        Browser prototypes used only for testing direction.
builds/            Output builds, not source of truth.
```

## Current priority

Start with the Grave Goblin. Get one unit feeling incredible before adding more monsters.
