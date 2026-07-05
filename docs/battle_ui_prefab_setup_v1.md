# Battle UI Prefab Setup v1

## Prefab name

```text
PF_BattleHud
```

## Hierarchy

```text
PF_BattleHud
  SafeAreaRoot
    TopHud
      EnemyCorePanel
      TimerPanel
      PlayerCorePanel
    ArenaOverlay
      DeploymentMessage
      InvalidPlacementPulse
      FloatingTextRoot
    BottomHud
      EnergyPanel
        EnergyOrb
        EnergyBar
        EnergyText
      CardHand
        GraveGoblinCard
        EmptySlot_2
        EmptySlot_3
        EmptySlot_4
    ResultPanel
```

## Required components

On root:

```text
BattleUiController
SafeAreaFitter
```

On EnergyPanel:

```text
EnergyUiView
```

On core panels:

```text
CoreHealthUiView
```

On GraveGoblinCard:

```text
MonsterCardUiView
CardSelectionFeedback
```

On ResultPanel:

```text
ResultPanelController
```

## First references to assign

BattleUiController:

```text
EnergySystem
DeploymentController
PlayerCore
EnemyCore
EnergyUiView
EnemyCoreHealthUiView
PlayerCoreHealthUiView
GraveGoblinCard
ResultPanel
```

## First Unity test

1. Press Play.
2. Energy UI updates.
3. Grave Goblin card dims below 2 energy.
4. Grave Goblin card brightens at 2 energy.
5. Tap card.
6. Card lifts and glows.
7. Tap arena.
8. Card deselects after deployment.
