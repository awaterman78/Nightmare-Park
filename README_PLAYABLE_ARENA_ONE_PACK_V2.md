# Nightmare Park, Unity Cloud Playable Arena One Pack v2

## What this fixes

Build #3 created a WebGL player page but the game area appeared blank on the Unity public share page.

This v2 build changes the approach:

- The camera is created directly inside the Unity scene at build time.
- The arena is created directly inside the Unity scene at build time.
- Visible labels and map objects exist before the runtime game script starts.
- Gameplay is added on top of an already visible scene.
- WebGL compression is disabled for simpler hosting and testing.

## What this adds

- Proper visible Arena One scene
- Haunted park arch
- Cursed green separator
- Bridges
- Player core and towers
- Enemy core and towers
- Grave Goblin deployment card
- Energy system
- Enemy Candle Imp waves
- Automatic combat
- Health bars
- Win/lose loop
- Mobile/desktop input

## Upload

Unzip this pack.

Upload the **contents** of the unzipped folder into the root of the GitHub repo.

Replace files when prompted.

Important replacement:

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

Then rerun the build and open the new share link.

## Controls

- Click or tap the Grave Goblin card.
- Tap in the green player half.
- Destroy the enemy core.
