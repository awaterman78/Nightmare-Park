# PF_GraveGoblin Setup

## Root components

```text
Health
Targetable
UnitController
MeleeAttack
UnitAnimationEvents
UnitVfxController
UnitAudioController
HitReactionBinder
CapsuleCollider
```

## Child objects

```text
Model
HealthBarAnchor
WeaponTipAnchor
HitCenterAnchor
GroundAnchor
FootDustLeftAnchor
FootDustRightAnchor
SelectionRing
```

## Animator parameters

```text
IsMoving, bool
MoveSpeed, float
SpawnLeap, trigger
BoneStab, trigger
Hit, trigger
Death, trigger
IsDead, bool
```

## Placeholder rule

A capsule can be used for the greybox test, but it is not acceptable for the final Grave Goblin feel test.
