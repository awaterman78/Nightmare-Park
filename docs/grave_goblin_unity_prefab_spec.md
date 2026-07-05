# Grave Goblin Unity Prefab Spec

## Prefab name

PF_GraveGoblin

## Purpose

The first production unit prefab.

This prefab is the template for all future monsters.

## Required components

```text
Transform
Animator
Character Model
Collider
Rigidbody or CharacterController
Health
UnitController
TargetingController
MeleeAttack
UnitPathing
HealthBarAnchor
VFXAnchorSet
AudioSource
```

## Child objects

```text
Model
Rig
HealthBarAnchor
WeaponTipAnchor
HitCenterAnchor
GroundAnchor
FootDustLeftAnchor
FootDustRightAnchor
SelectionRing
```

## Animator clips

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

## Animator parameters

```text
Bool IsMoving
Bool IsDead
Float MoveSpeed
Trigger SpawnLeap
Trigger BoneStab
Trigger Hit
Trigger Death
```

## Gameplay stats

```text
Energy Cost: 2
Health: 260
Damage: 52
Attack Rate: 0.72
Attack Range: 0.8
Move Speed: Very Fast
First Hit Multiplier: 1.85
```

## Movement

The UnitPathing script should provide a destination.

The Animator should respond to movement speed.

The model should lean and scuttle, not glide.

## Bone Stab damage timing

Damage should not happen at animation start.

Damage should happen on an animation event at the stab impact frame.

Suggested animation event:

```text
AnimEvent_BoneStabImpact()
```

This calls the MeleeAttack damage method.

## Hit reaction

When Health receives damage:

- Trigger Hit animation if not dead.
- Brief flash or material pulse.
- Optional tiny knockback.
- Health bar updates.

## Death

When HP reaches 0:

- Stop movement.
- Trigger Death animation.
- Disable collider.
- Play death VFX.
- Remove object after animation.

## VFX anchors

WeaponTipAnchor:

- Bone Stab slash.
- Weapon trail.

GroundAnchor:

- Spawn puff.
- Death puff.

FootDustLeft and FootDustRight:

- Scuttle dust puffs.

HitCenterAnchor:

- Hit flash.
- Damage pop.

## Acceptance criteria

Prefab accepted when:

- Can be spawned by DeploymentController.
- Moves toward target.
- Plays scuttle run while moving.
- Plays Bone Stab when attacking.
- Deals damage on impact frame.
- Takes damage.
- Dies cleanly.
- Looks correctly scaled in Arena One.
