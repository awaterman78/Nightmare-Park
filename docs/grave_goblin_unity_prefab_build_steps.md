# Grave Goblin Unity Prefab Build Steps

## Prefab name

PF_GraveGoblin

## Folder

```text
unity/Assets/Prefabs/Units/PF_GraveGoblin.prefab
```

## Required child structure

```text
PF_GraveGoblin
  Model
  HealthBarAnchor
  WeaponTipAnchor
  HitCenterAnchor
  GroundAnchor
  FootDustLeftAnchor
  FootDustRightAnchor
  SelectionRing
```

## Components on root

```text
Health
Targetable
UnitController
MeleeAttack
CapsuleCollider
Rigidbody or CharacterController
UnitAnimationEvents
UnitVfxController
UnitAudioController
```

## Component settings

### Health

```text
Team: Player or assigned at spawn
MaxHealth: 260
```

### UnitController

```text
Team: assigned at spawn
Stats: GraveGoblinStats
Animator: model animator
```

### MeleeAttack

```text
Unit: this UnitController
Stats: GraveGoblinStats
Animator: model animator
```

### Collider

Use a small capsule collider.

Approximate first settings:

```text
Height: 0.8
Radius: 0.25
Center: 0, 0.4, 0
```

## Animator

Animator controller:

```text
AC_GraveGoblin
```

States:

```text
Idle
SpawnLeap
ScuttleRun
BoneStab
HitReaction
Death
VictorySnarl
```

Parameters:

```text
IsMoving, bool
IsDead, bool
MoveSpeed, float
SpawnLeap, trigger
BoneStab, trigger
Hit, trigger
Death, trigger
```

## Animation events

On Bone Stab clip:

At impact frame call:

```text
AnimEvent_BoneStabImpact
```

On Scuttle Run:

Left foot contact:

```text
AnimEvent_FootstepLeft
```

Right foot contact:

```text
AnimEvent_FootstepRight
```

On Spawn Leap:

Landing frame:

```text
AnimEvent_SpawnImpact
```

On Death:

Puff frame:

```text
AnimEvent_DeathPuff
```

## First prefab test

1. Drag PF_GraveGoblin into ArenaOne_Test.
2. Press Play.
3. Confirm idle animation.
4. Set destination manually or spawn with DeploymentController.
5. Confirm scuttle run.
6. Confirm Bone Stab triggers.
7. Confirm damage applies on animation event.
8. Confirm hit reaction.
9. Confirm death.
