# Animation Pipeline

## Goal

Build monsters in a repeatable way so every monster has a consistent Unity prefab and animation set.

## Tools

- Blender for modelling, rigging and animation.
- Unity for prefab setup, gameplay controller and mobile testing.
- GitHub for docs, specs and exported assets.

## Grave Goblin asset pipeline

### 1. Model

Create a stylised 3D model matching the approved concept sheet.

Requirements:

- Low-to-mid poly mobile friendly mesh.
- Strong silhouette.
- Separate weapon if useful.
- Readable face and ears at small size.
- Material colours match concept art.

### 2. Rig

Rig should support:

- Hunched spine.
- Head and jaw expression.
- Big ear movement if possible.
- Arms and dagger stabbing.
- Leg scuttle motion.
- Foot IK optional later.
- Squash/stretch can be animation driven.

### 3. Animations

Export clips:

```text
GG_Idle.fbx
GG_Spawn_Leap.fbx
GG_Scuttle_Walk.fbx
GG_Scuttle_Run.fbx
GG_Bone_Stab.fbx
GG_Hit_Reaction.fbx
GG_Death.fbx
GG_Victory_Snarl.fbx
```

### 4. Export settings

- FBX export.
- Forward: -Z Forward or Unity-compatible standard.
- Up: Y Up.
- Apply transforms.
- One animation clip per export if easier.
- Keep scale consistent.

### 5. Unity prefab

Prefab name:

```text
PF_GraveGoblin
```

Prefab should include:

- Mesh renderer.
- Animator.
- Unit controller.
- Health component.
- Targeting component.
- Attack component.
- Collider / selection radius.
- Health bar anchor.
- VFX anchor points.

## Animation quality bar

Do not accept robotic movement.

Required feel:

- Anticipation.
- Impact.
- Recovery.
- Bounce.
- Weight.
- Personality.
- Readability on phone screen.
