# Task 038, Unity Playable Arena One v2

## Goal

Fix the blank Unity share player by creating a visible-first playable Unity scene.

## Why

Build 3 showed the Unity share page but the player area appeared blank. This v2 creates the camera, floor, labels and arena objects directly inside the scene at build time so the output has visible content immediately.

## Upload

Upload this pack to the repo root.

Overwrite files when asked.

Must replace:

```text
unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs
```

## Build

Use the same Unity Cloud target:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build profile path: blank
```

## Expected result

The Unity public share page should visibly show:

```text
NIGHTMARE PARK
ARENA ONE
```

plus the arena, bridges, towers, Grave Goblin card and gameplay UI.
