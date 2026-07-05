# Arena One Coordinates v1

## Coordinate system

Unity world space.

X moves left and right.

Z moves bottom to top.

Y is vertical height.

Player starts at negative Z.

Enemy starts at positive Z.

## Arena bounds

```text
MinX: -4.5
MaxX: 4.5
MinZ: -7.0
MaxZ: 7.0
```

## Core positions

```text
PlayerCore: 0, 0, -6.25
EnemyCore: 0, 0, 6.25
```

## Tower positions

```text
PlayerTower_Left: -2.35, 0, -4.2
PlayerTower_Right: 2.35, 0, -4.2

EnemyTower_Left: -2.35, 0, 4.2
EnemyTower_Right: 2.35, 0, 4.2
```

## Bridge points

```text
LeftBridge_PlayerSide: -1.75, 0, -0.55
LeftBridge_EnemySide: -1.75, 0, 0.55

RightBridge_PlayerSide: 1.75, 0, -0.55
RightBridge_EnemySide: 1.75, 0, 0.55
```

## Deployment zones

### Player deployment zone

```text
MinX: -4.0
MaxX: 4.0
MinZ: -6.25
MaxZ: -0.75
```

### Enemy deployment zone

```text
MinX: -4.0
MaxX: 4.0
MinZ: 0.75
MaxZ: 6.25
```

### Middle no deployment zone

```text
MinX: -4.5
MaxX: 4.5
MinZ: -0.75
MaxZ: 0.75
```

## Camera recommendation

First test orthographic camera:

```text
Position: 0, 10, -8
Rotation: 60, 0, 0
Projection: Orthographic
Size: 7.3
```

Adjust size to frame arena in portrait.

## Unit scale reference

Grave Goblin world height:

```text
0.75 to 0.9
```

Tower world height:

```text
2.4 to 2.8
```

Core world height:

```text
3.0 to 3.5
```

Grave Goblin should feel small but readable.
