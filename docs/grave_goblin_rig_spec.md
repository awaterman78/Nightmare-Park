# Grave Goblin Rig Spec

## Purpose

The rig must support twitchy goblin movement, not generic biped movement.

## Rig requirements

### Spine

Needs hunched posture and squash/stretch feel.

Controls:

- Pelvis
- Lower spine
- Chest
- Neck
- Head

### Head

Needs expressive tilt, snap and look direction.

Controls:

- Head rotation
- Jaw open/close if possible
- Brow or eye expression if possible

### Ears

Simple ear bones recommended.

Ear twitching adds life.

Controls:

- Left ear bend/rotate
- Right ear bend/rotate

### Arms

Needs strong dagger action.

Controls:

- Shoulder
- Elbow
- Wrist
- Fingers or claw pose
- Dagger hand

### Legs

Needs low scuttle movement.

Controls:

- Hip
- Knee
- Ankle
- Toe if possible

### Hands and feet

Oversized hands and feet should support squashy goblin poses.

### Weapon

Bone dagger can be:

Option A, attached to hand bone.

Option B, separate object parented to hand socket.

Must support WeaponTipAnchor in Unity.

## Suggested Unity bones

```text
Root
Pelvis
Spine_01
Spine_02
Chest
Neck
Head
Jaw
Ear_L
Ear_R
UpperArm_L
LowerArm_L
Hand_L
UpperArm_R
LowerArm_R
Hand_R
UpperLeg_L
LowerLeg_L
Foot_L
Toe_L
UpperLeg_R
LowerLeg_R
Foot_R
Toe_R
Dagger
```

## Rig quality bar

The rig must allow:

- Low crouch
- Forward lean
- Side-to-side dart
- Head bob
- Shoulder twitch
- Ear twitch
- Weapon pull-back
- Weapon lunge
- Hit flinch
- Death collapse

If the rig only supports a normal walk cycle, it is not enough.
