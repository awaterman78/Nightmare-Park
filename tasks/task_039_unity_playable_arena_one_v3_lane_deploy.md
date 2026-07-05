# Task 039, Unity Playable Arena One v3, Lane Deploy

## Goal

Fix the deployment issue from the previous build.

## Problem

The map loaded and the Grave Goblin box appeared, but clicking the map did not deploy a unit.

## Fix

Deployment now uses UI lane buttons instead of world-map clicking:

```text
DEPLOY LEFT
DEPLOY CENTRE
DEPLOY RIGHT
```

This avoids fragile mouse/touch raycasting inside the Unity Cloud public share player.

## Upload

Upload this pack to the repo root.

Overwrite files when prompted.

Must replace:

```text
unity_cloud_minimal/Assets/Scripts/NightmareParkArenaOneController.cs
unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs
```

## Build

Use the same Unity Cloud build target:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build profile path: blank
```

## Expected result

Clicking `DEPLOY CENTRE` should immediately spawn a Grave Goblin near the player core.
