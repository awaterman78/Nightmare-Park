# Brief for Unity Developer, Vertical Slice 001

## Goal

Build a portrait mobile battle scene where Grave Goblin can be deployed anywhere in the player's half and fight enemy towers.

## Scene

```text
ArenaOne_Test
```

## Core mechanics

- Energy bar, max 10.
- One Grave Goblin card, cost 2.
- Tap card, then tap anywhere in player half to deploy.
- Grave Goblin moves to nearest target via bridges.
- Towers shoot at enemies.
- Units and towers have health.
- Enemy AI spawns basic goblins.
- Win by destroying enemy core.
- Lose if player core dies.

## Required scripts

```text
EnergySystem.cs
CardController.cs
DeploymentController.cs
UnitController.cs
TargetingSystem.cs
MeleeAttack.cs
TowerController.cs
Health.cs
HealthBar.cs
GameManager.cs
```

## Priority

Feel before features.

Do not add more cards until Grave Goblin feels right.
