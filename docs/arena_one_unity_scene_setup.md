# Arena One Unity Scene Setup

## Scene name

ArenaOne_Test

## Scene purpose

First playable battle test scene for Grave Goblin.

## Required hierarchy

```text
ArenaOne_Test
  GameManager
  CameraRig
    MainCamera
  Arena
    ArenaBackground
    DeploymentArea_Player
    DeploymentArea_Enemy
    NoDeployArea_Middle
    Bridge_Left
    Bridge_Right
  PlayerSide
    PlayerCore
    PlayerTower_Left
    PlayerTower_Right
  EnemySide
    EnemyCore
    EnemyTower_Left
    EnemyTower_Right
  UI
    Canvas
      TopHUD
      EnergyBar
      CardHand
      ResultPanel
  SpawnedUnits
  VFX
  Audio
```

## Arena background

Use the approved Arena One image as temporary background.

In the final build, this can become a 3D or layered 2.5D arena.

For the first slice, a high resolution plane or sprite is acceptable.

## Coordinate guide

Use Unity world space.

Suggested basic layout:

```text
Player core:       (0, 0, -6.2)
Player left tower: (-2.4, 0, -4.2)
Player right tower:(2.4, 0, -4.2)

Middle river:      z around 0
Left bridge:       x around -1.8
Right bridge:      x around 1.8

Enemy left tower:  (-2.4, 0, 4.2)
Enemy right tower: (2.4, 0, 4.2)
Enemy core:        (0, 0, 6.2)
```

## Camera

Orthographic camera recommended for first slice.

Suggested:

```text
Projection: Orthographic
Rotation: 60 degrees X, 0 degrees Y, 0 degrees Z
Size: adjusted to frame full arena in portrait
```

Alternative:

Use perspective camera with fixed angle if the arena is built in 3D.

## Deployment areas

Player deployment area:

```text
x: -4.0 to 4.0
z: -6.0 to -0.6
```

Enemy deployment area:

```text
x: -4.0 to 4.0
z: 0.6 to 6.0
```

No deployment:

```text
middle river and enemy half
```

## Pathing

First version can use simple steering.

Recommended movement logic:

1. If target is in same half, move direct.
2. If crossing middle, choose nearest bridge.
3. Move to near side bridge point.
4. Move to far side bridge point.
5. Move to target.

This avoids units sliding through the cursed fog.

## Tower setup

Each tower needs:

- Health component.
- Team assignment.
- Range.
- Damage.
- Fire rate.
- Targeting logic.
- Projectile or instant hit VFX.

## Core setup

Each core needs:

- Health component.
- Team assignment.
- Health bar.
- Win or lose trigger when destroyed.

## UI setup

Top:

- Enemy core HP.
- Timer.
- Player core HP.

Middle:

- Arena only.

Bottom:

- Energy orb.
- Energy bar.
- Grave Goblin card.

## First scene quality bar

The scene should feel clean and premium.

No debug cubes visible in final test.

No giant instruction panel.

No lane guides.

No ugly prototype labels.
