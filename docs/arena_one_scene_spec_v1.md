# Arena One Scene Spec v1

## Scene name

ArenaOne_Test

## Scene purpose

Arena One is the first playable battle arena for Nightmare Park, Monster Royale.

It is the test environment for Grave Goblin and all early combat feel.

## Required hierarchy

```text
ArenaOne_Test
  GameManager
  ArenaRoot
    ArenaBackground
    DeploymentPlane
    ArenaConfigReference
    BridgePoints
      LeftBridge_PlayerSide
      LeftBridge_EnemySide
      RightBridge_PlayerSide
      RightBridge_EnemySide
    DeploymentZones
      PlayerDeploymentZone
      EnemyDeploymentZone
      MiddleNoDeployZone
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
    Projectiles
    VFX
    Audio
  CameraRig
    MainCamera
  UI
    BattleCanvas
```

## Art implementation

Use the approved Arena One image as a temporary arena background.

Recommended first setup:

1. Create a large plane.
2. Apply Arena One image as material texture.
3. Rotate or position the plane so it sits flat in world space.
4. Add a separate transparent deployment plane with collider for raycast placement.

## Arena world scale

Recommended first world bounds:

```text
MinX: -4.5
MaxX: 4.5
MinZ: -7.0
MaxZ: 7.0
```

This gives enough space for cores, towers, bridge routing and deployment.

## Side definitions

Player side:

```text
Z less than 0
```

Enemy side:

```text
Z greater than 0
```

Middle cursed separator:

```text
Z around -0.55 to 0.55
```

## Deployment rule

Player can place units only in player deployment zone.

Enemy can place units only in enemy deployment zone.

Units must not be placed on the cursed middle separator.

## Battle objective

Destroy the enemy core.

## First test entities

Player:

1. Player core.
2. Player left tower.
3. Player right tower.
4. Grave Goblin card.

Enemy:

1. Enemy core.
2. Enemy left tower.
3. Enemy right tower.
4. Dummy Grave Goblin spawner.
