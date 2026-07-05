# Grave Goblin VFX and Audio Spec

## VFX

### Spawn puff

Trigger:

AnimEvent_SpawnImpact

Visual:

- Small green dust puff
- Bone flecks
- Short ground ripple

Duration:

0.25 to 0.4 seconds.

### Foot dust

Trigger:

AnimEvent_FootstepLeft and AnimEvent_FootstepRight

Visual:

- Tiny dirt puff
- Low opacity
- No big trail

Duration:

0.2 seconds.

### Bone Stab slash

Trigger:

AnimEvent_BoneStabImpact

Visual:

- Short green slash arc
- Bone shard flick
- Small impact spark

Duration:

0.15 to 0.25 seconds.

### Hit flash

Trigger:

Health damaged event.

Visual:

- Brief white or pale green flash
- Tiny recoil pop

Duration:

0.08 to 0.15 seconds.

### Death puff

Trigger:

AnimEvent_DeathPuff

Visual:

- Green smoke puff
- Small bone scatter
- Dagger drop optional

Duration:

0.5 seconds.

## Audio

### Spawn

Sound:

Dirt pop plus tiny goblin cackle.

### Scuttle

Sound:

Light scratchy foot taps.

Must not spam too loudly.

Use random pitch variation.

### Bone Stab

Sound:

Bone click plus sharp stab.

First Bone Stab can have extra impact.

### Hit

Sound:

Small goblin grunt or squeak.

### Death

Sound:

Tiny yelp plus bone rattle.

## Audio implementation

Use UnitAudioController.

Expose clips:

```text
SpawnClip
FootstepClips
BoneStabClip
HitClip
DeathClip
```

Use small pitch variation:

```text
0.92 to 1.08
```

## VFX implementation

Use UnitVfxController.

Expose prefabs:

```text
SpawnPuffPrefab
FootDustPrefab
BoneStabSlashPrefab
HitFlashPrefab
DeathPuffPrefab
```

Do not block gameplay if VFX is missing.
