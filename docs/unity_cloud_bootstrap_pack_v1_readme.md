# Unity Cloud Bootstrap Pack v1

## Purpose

This pack gives Unity Build Automation a more complete Unity project skeleton.

The previous build likely failed because the `/unity` folder had scripts and assets, but not enough real Unity project structure for Cloud Build to recognise and build it cleanly.

## What this adds

```text
unity/Packages/manifest.json
unity/Packages/packages-lock.json
unity/ProjectSettings/ProjectVersion.txt
unity/ProjectSettings/ProjectSettings.asset
unity/Assets/Editor/NightmareParkCloudBuildBootstrap.cs
unity/Assets/Scenes/README.md
```

## What the bootstrap script does

When Unity opens the project in batch mode, it attempts to:

1. Create `Assets/Scenes/ArenaOne_Test.unity` if it is missing.
2. Add a camera, directional light and simple arena placeholder.
3. Add the scene to Build Settings.
4. Provide a custom WebGL build method.

## Cloud Build target settings

Use:

```text
Branch: main
Project subfolder path: unity
Platform: WebGL
Unity version: Latest 6000.x
OS: Windows 11 24H2
Machine: Micro
Build profile path: blank
```

If Unity asks for a build method, use:

```text
NightmarePark.Editor.NightmareParkCloudBuildBootstrap.PerformWebGLBuild
```

## Important

This is only to get the first cloud build working. It is not the finished game scene.
