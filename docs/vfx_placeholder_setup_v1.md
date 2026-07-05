# VFX Placeholder Setup v1

## Purpose

Set up simple placeholder VFX prefabs for the first Unity slice.

The visual quality can improve later. The timing and event hooks matter now.

## Required placeholder VFX

### Spawn puff

Name:

```text
VFX_GG_SpawnPuff
```

Use:

Small green particle puff at GroundAnchor.

### Foot dust

Name:

```text
VFX_GG_FootDust
```

Use:

Tiny grey dust puff at each foot contact.

### Bone Stab slash

Name:

```text
VFX_GG_BoneStabSlash
```

Use:

Short green slash at WeaponTipAnchor.

### Hit flash

Name:

```text
VFX_HitFlash
```

Use:

Quick flash at HitCenterAnchor.

### Death puff

Name:

```text
VFX_GG_DeathPuff
```

Use:

Green smoke puff plus tiny bone flecks.

### Tower bolt

Name:

```text
VFX_TowerBolt
```

Use:

Fast line renderer between tower and target.

## Placeholder quality rule

Keep them simple.

Better to have clean timing than a messy overdone effect.

## First integration

Assign these to:

```text
UnitVfxController
TowerBoltSpawner
DeploymentFeedbackSpawner
```
