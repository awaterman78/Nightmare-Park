# ArenaOne_Test Scene Setup

## Required hierarchy

```text
ArenaOne_Test
  GameManager
  ArenaRoot
    ArenaBackground
    DeploymentPlane
    ArenaReferences
    ArenaPathRouter
    PlacementValidator
    DeploymentAreaVisual
  PlayerSide
    PlayerCore
    PlayerTower_Left
    PlayerTower_Right
  EnemySide
    EnemyCore
    EnemyTower_Left
    EnemyTower_Right
  Runtime
    SpawnedUnits
    VFX
    Projectiles
    Audio
  CameraRig
    MainCamera
  UI
    BattleCanvas
```

## First play test

- Press Play.
- Select Grave Goblin card.
- Place in player half.
- Confirm invalid placement is blocked.
- Confirm towers shoot.
- Confirm health changes.
