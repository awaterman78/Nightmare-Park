# Grave Goblin Design Pack v1

## Project

Nightmare Park, Monster Royale

## Purpose

This document locks the design direction for the first production monster.

The goal is not to create a generic goblin. The goal is to create a small, nasty, twitchy, memorable unit that feels brilliant to deploy in Arena One.

## Monster identity

Name: Grave Goblin

Rarity: Common

Card cost: 2 scare energy

Role: Fast melee pressure unit

Movement style: Quick Scuttle

Signature skill: Bone Stab

Targeting: Ground units and buildings

## Design summary

The Grave Goblin is the first unit in the game and therefore the quality benchmark for every monster that follows.

He should feel small, fast, vicious, twitchy, sneaky, alive, readable and fun to deploy.

He must never feel like a sliding picture. He must feel like a little creature with weight, rhythm, panic and attitude.

## Player fantasy

The player should feel like they are throwing a nasty little goblin into the arena and watching it cause trouble.

He is cheap, quick and annoying.

He is not a tank. He is not elegant. He is not brave.

He is a horrible little gremlin who darts forward, stabs something, recoils, then scuttles onwards.

## Visual design

Body:

Short compact body, large head, oversized ears, long clawed fingers, hunched spine, bent knees, low centre of gravity and nervous posture.

Face:

Glowing green eyes, wide grin, sharp teeth, expressive brow and readable face at mobile camera distance.

Clothing:

Dark stitched hood, ragged patchwork outfit, leather straps, bone charms, small skull details, dirty boots or wrappings.

Weapon:

Jagged bone dagger, clearly readable during attack.

## Scale guide

The Grave Goblin should be small against the map.

About one third of a defensive tower height.

Small enough to feel cheap and swarmable.

Large enough that face, ears and weapon read on mobile.

## Card design

Card name: Grave Goblin

Cost: 2

Rarity: Common

Role label: Fast melee

Short description:

Quick scuttling melee unit. First attack deals bonus Bone Stab damage.

Card portrait:

Close up face and dagger, glowing eyes, green and purple lighting, strong silhouette, readable cost badge and common rarity frame.

## Gameplay role

The Grave Goblin is an early pressure unit.

Used to force enemy response, chip towers, intercept weak units, punish slow expensive deployments and create fast pressure when ignored.

He should die quickly to tower fire and splash units.

He should be dangerous if ignored.

## Starting stats

Health: 260

Damage: 52

First Bone Stab damage multiplier: 1.85

Attack rate: 0.72 seconds

Movement speed: Very fast

Attack range: Melee

Energy cost: 2

Deployment count: 1

## Special skill, Bone Stab

The first attack after deployment deals bonus damage.

The animation must make this obvious.

Required phases:

Anticipation, pulls dagger back and crouches lower.

Impact, fast forward lunge with green slash effect.

Recovery, recoils backwards and returns to ready stance.

Future upgrade idea:

Small chance for a double stab on normal attacks.

Not required for vertical slice.

## Movement design, Quick Scuttle

This is the most important animation.

The Grave Goblin must not run like a tiny human.

Movement requirements:

Low to the ground.

Uneven side to side weave.

Burst based movement.

Head bob.

Shoulder twitch.

Quick feet.

Hands forward.

Tiny dust puffs.

Slight squash and stretch.

Occasional glance or snap of the head.

Feels feral, not smooth.

## Animation clips

### GG Idle

Hunched stance, breathing, eyes flicking, dagger hand twitching, ears twitching and impatient foot shuffle.

Loop between 1.5 and 2.2 seconds.

### GG Spawn Leap

Small green puff, goblin pops into arena, lands in crouch and transitions into scuttle.

Length between 0.35 and 0.55 seconds.

### GG Scuttle Walk

Lower cautious movement, sneaky feet and light head bob.

Loop between 0.7 and 0.9 seconds.

### GG Scuttle Run

Fast, low, uneven, hands almost touching ground, side to side dart, quick feet and dust puffs.

Loop between 0.45 and 0.65 seconds.

### GG Bone Stab

Anticipation, lunge, impact, recoil and return to stance.

Total clip around 0.45 to 0.6 seconds.

Impact should land around 45 percent through the animation.

### GG Hit Reaction

Quick flinch backward, angry snap back and fast recovery.

Length between 0.2 and 0.35 seconds.

### GG Death

Collapse or spin, green puff, bone dagger drop or bone scatter.

Length between 0.5 and 0.8 seconds.

### GG Victory Snarl

Optional future flourish. Raises dagger, snarls and puffs chest.

Length between 0.8 and 1.2 seconds.

## Combat behaviour

Deployment:

Player selects Grave Goblin card, taps anywhere in own half, goblin spawns at selected point and chooses target.

Target priority:

Nearest enemy unit in range.

Nearest enemy defensive tower.

Enemy core after towers are destroyed or if core becomes valid target.

Pathing:

Goblin moves toward the best available bridge.

Goblin does not slide through the central cursed fog.

Goblin should weave subtly rather than move in a perfectly straight dead line.

Attack loop:

Move to target, enter attack range, stop briefly, perform Bone Stab or normal stab, apply damage at impact frame, recoil and continue attacking or retarget.

## VFX direction

Spawn:

Small green grave puff, tiny bone particles and short ground ripple.

Movement:

Small dust puffs and tiny green trail only during quick burst moments.

Bone Stab:

Green slash arc, bright impact point, tiny bone shard particles and small screen shake on first hit.

Hit reaction:

Small white flash and quick damage pop.

Death:

Green smoke puff, bone scatter and quick fade.

## Sound direction

Spawn:

Short grave pop, dirt burst and tiny goblin cackle.

Scuttle:

Very light foot taps or scratchy movement sound, not too loud.

Attack:

Quick dagger jab, bone click and small goblin snarl.

Hit:

Short squeak or grunt.

Death:

Tiny yelp, bone rattle and green puff.

## UI requirements

Card:

Cost badge 2, name Grave Goblin, rarity Common, snarling goblin portrait, selected card lift and green glow.

Deployment:

Subtle player half glow only when card is selected.

Health bar:

Small, readable and not dominant.

## Unity prefab requirements

Prefab name:

PF_GraveGoblin

Required components:

Animator

UnitController

Health

MeleeAttack

Targeting

PathingAgent

Collider

HealthBarAnchor

VFXAnchors

AudioSource

Suggested child anchors:

HeadAnchor

WeaponTipAnchor

HitCenterAnchor

FootDustLeftAnchor

FootDustRightAnchor

GroundAnchor

## Animator parameters

Bool, IsMoving

Trigger, SpawnLeap

Trigger, BoneStab

Trigger, Hit

Trigger, Death

Float, MoveSpeed

Bool, IsDead

## Acceptance criteria

Accepted only if:

It reads clearly at mobile screen size.

It is correctly scaled to Arena One.

It can be placed anywhere in the player half.

It scuttles rather than glides.

It has anticipation before Bone Stab.

It has impact and recoil after Bone Stab.

It visibly reacts when hit.

It has a clear death animation.

It feels fun to deploy repeatedly.

It looks like part of the haunted arena world.

## Rejection criteria

Reject if:

It slides across the map.

It runs like a normal person.

It is too large for the arena.

It is too small to read.

The attack has no impact.

The animation feels robotic.

The face and dagger are unreadable.

The unit looks like a flat sticker.

The movement has no personality.

## Designer note

This unit sets the bar for the whole game.

If Grave Goblin is not fun, do not add more monsters yet.

Fix him first.
