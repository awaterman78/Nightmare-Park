# Unity Editor Setup Checklist

Use this when opening the project in Unity.

## Project settings

- Set orientation to portrait.
- Use 1080 x 1920 as primary Game view test resolution.
- Use URP later if needed, but built-in pipeline is acceptable for first test.
- Set target platform to Android first.
- Add scene `ArenaOne_Test`.

## Scene hierarchy

```text
ArenaOne_Test
  GameManager
  CameraRig
    MainCamera
  Arena
    ArenaBackground
    DeploymentPlane
    BridgePoint_Left_PlayerSide
    BridgePoint_Left_EnemySide
    BridgePoint_Right_PlayerSide
    BridgePoint_Right_EnemySide
  Player
    PlayerCore
    PlayerTower_Left
    PlayerTower_Right
  Enemy
    EnemyCore
    EnemyTower_Left
    EnemyTower_Right
  UI
    BattleCanvas
      TopHud
      EnergyHud
      CardHand
      ResultPanel
  Runtime
    SpawnedUnits
    VFX
    Audio
```

## Camera

Recommended first camera:

```text
Projection: Orthographic
Rotation: 60, 0, 0
Position: 0, 9, -8
Orthographic Size: adjust until full arena fits portrait
```

## Arena

Use the arena concept as a temporary textured plane.

- Plane position: 0, 0, 0
- Plane scale: match portrait arena aspect
- Add collider for raycast deployment
- Use a separate invisible deployment plane if easier

## Deployment bounds

Player half:

```text
MinX: -4
MaxX: 4
MinZ: -6
MaxZ: -0.6
```

Enemy half:

```text
MinX: -4
MaxX: 4
MinZ: 0.6
MaxZ: 6
```

## Tower positions

```text
EnemyCore:        0, 0, 6.2
EnemyTowerLeft:  -2.4, 0, 4.2
EnemyTowerRight:  2.4, 0, 4.2

PlayerCore:       0, 0, -6.2
PlayerTowerLeft: -2.4, 0, -4.2
PlayerTowerRight: 2.4, 0, -4.2
```

## Bridge points

```text
LeftPlayerBridge:  -1.8, 0, -0.45
LeftEnemyBridge:   -1.8, 0,  0.45
RightPlayerBridge:  1.8, 0, -0.45
RightEnemyBridge:   1.8, 0,  0.45
```

## First test

- Press Play.
- Select Grave Goblin card.
- Click/tap player half.
- Goblin spawns.
- Goblin moves via bridge.
- Enemy tower shoots him.
- Goblin attacks valid targets.
