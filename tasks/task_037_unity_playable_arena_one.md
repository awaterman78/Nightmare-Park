# Task 037, Unity Playable Arena One

## Goal

Replace the static Unity Cloud test scene with the first playable Arena One vertical slice.

## Adds

- Arena One haunted map
- Grave Goblin player card
- Candle Imp enemy waves
- Energy regeneration
- Player deployment half
- Unit movement and combat
- Tower shooting
- Core health
- Win and lose condition

## Upload

Upload this pack to the repo root and overwrite existing files when prompted.

Important replacement:

```text
unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs
```

This file must be replaced because the old version generates the basic test map.

## Build

Run Unity Cloud Build again using:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
```

## Expected result

The Unity share link loads a playable prototype, not just the basic test scene.
