# Unity Cloud Scene Fix Pack v1

## Why this exists

The Unity Cloud log shows the cloud build now checks out the repo, opens the project, resolves packages and compiles scripts.

The failure is:

```text
ERROR: There were no scenes configured to build!
```

That means the cloud pipeline is alive. It just has no scene in Build Settings.

## What this pack does

Adds an Editor bootstrap script which automatically:

1. Creates a minimal scene at:
   `unity_cloud_minimal/Assets/Scenes/CloudBuild_Minimal_Test.unity`

2. Adds that scene to Unity Build Settings.

3. Creates a simple camera, light, arena, towers, cores and title text.

4. Saves the scene before Unity Cloud Build attempts WebGL export.

## Upload location

Upload this pack into the root of the repo.

It should add:

```text
unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs
tasks/task_035_unity_cloud_scene_fix.md
```

## After upload

Run the Unity Cloud Build target again using:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build profile path: blank
```

Do not switch back to `/unity` yet.

This is still just the minimal pipeline test, not the full game.
