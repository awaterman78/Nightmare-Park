# Unity Cloud Minimal Project Pack v1

## Purpose

This pack creates a clean minimal Unity project in:

```text
unity_cloud_minimal
```

Use this to prove Unity Build Automation can build from the repo.

This deliberately avoids the larger `/unity` folder for now, because that folder contains lots of draft scripts, setup notes and partial implementation files.

## Why this exists

Unity Cloud Build is failing without accessible logs.

Rather than keep guessing, this creates a clean minimal Unity project with:

- Assets folder
- Packages folder
- ProjectSettings folder
- A simple scene
- A cloud build script

If this builds, we know Unity Cloud is connected correctly.

Then we move the real game into this working structure.

## Build target settings

In Unity Build Automation, change or create a target with:

```text
Repository: awaterman78/Nightmare-Park
Branch: main
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build Profile path: blank
Builder OS: Windows 11 24H2
Machine: Micro
```

If it asks for custom build method, use:

```text
NightmarePark.Editor.CloudBuild.PerformWebGLBuild
```

## Expected output

A basic WebGL scene saying:

```text
Nightmare Park
Cloud Build Minimal Test
```

with simple arena-like shapes.

This is not the game. This is the build test.
