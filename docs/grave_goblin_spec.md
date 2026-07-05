# Grave Goblin Spec

## Identity

**Name:** Grave Goblin  
**Rarity:** Common  
**Role:** Fast melee  
**Cost:** 2 energy  
**Movement:** Quick Scuttle  
**Signature Skill:** Bone Stab  

## Personality

The Grave Goblin is small, vicious, twitchy and mischievous.

He should feel like a nasty little creature that has been hiding under a grave slab and is delighted to cause trouble.

He should not move like a human. He should move low, quick and uneven, with bursts of speed, little side-to-side darts, head bobbing and clawed hands forward.

## Visual requirements

- Small body compared with towers and arena props.
- Oversized ears.
- Glowing green eyes.
- Hooded ragged clothing.
- Bone charms and skull accessories.
- Jagged bone dagger.
- Hunched posture.
- Big readable silhouette from top-down mobile camera.

## Core stats, first test values

```text
Health: 260
Damage: 52
Attack rate: 0.72 seconds
Move speed: Fast
Range: Melee
Targeting: Ground units and buildings
Energy cost: 2
```

## Behaviour

### Deploy

- Appears with a quick springy leap.
- Lands in a crouch.
- Immediately transitions into scuttle run.

### Movement, Quick Scuttle

The movement must feel goblin-like:

- Low centre of gravity.
- Feet and hands moving quickly.
- Uneven side-to-side weave.
- Short bursts rather than smooth gliding.
- Head and shoulders bob.
- Occasional twitch or glance.
- Tiny dust puffs on quick steps.
- Slight squash and stretch on steps.

### Attack, Bone Stab

Bone Stab must have three readable phases:

1. **Anticipation:** pulls dagger back, crouches lower.
2. **Impact:** fast forward lunge with green slash effect.
3. **Recovery:** recoils backwards, snaps back into ready stance.

Special rule:

- First hit deals bonus damage.
- Optional later upgrade, small chance to double stab.

### Hit reaction

- Quick flinch backwards.
- Angry snap back.
- Brief squash or recoil.
- Health bar shake.

### Death

- Small green puff.
- Bone dagger drops or spins.
- Goblin collapses or vanishes into grave dust.
- Quick, readable and not too dramatic for a common unit.

## Required animation clips

```text
GG_Idle
GG_Spawn_Leap
GG_Scuttle_Walk
GG_Scuttle_Run
GG_Bone_Stab
GG_Hit_Reaction
GG_Death
GG_Victory_Snarl
```

## Animation feel reference

The movement should feel like a premium mobile battler unit:

- Snappy.
- Over-animated enough to read on a phone.
- Strong anticipation and follow-through.
- Small unit, big personality.
