# Nightmare Park, Unity Cloud Playable Arena One Pack v3

## What this fixes

The previous build showed the map and the Grave Goblin selection box, but clicking the map did not deploy anything.

That means the Unity WebGL build was running, but the map-click deployment was too fragile inside the Unity Cloud share player.

This v3 removes that blocker.

## Main change

Deployment is now done through clear lane buttons:

- Deploy Left
- Deploy Centre
- Deploy Right

This means it no longer relies on raycasting from the browser canvas into the world.

Map click deployment is not required for this test.

## What this build includes

- Visible Arena One map
- Player and enemy cores
- Player and enemy towers
- Grave Goblin lane deployment
- Energy system
- Candle Imp enemy waves
- Automatic movement
- Automatic combat
- Tower attacks
- Health bars
- Win / lose state

## Upload

Unzip this pack.

Upload the **contents** into the GitHub repo root.

Replace files when prompted.

Important replacement:

```text
unity_cloud_minimal/Assets/Scripts/NightmareParkArenaOneController.cs
unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs
```

## Build

Use the same Unity Cloud build settings:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build profile path: blank
```

## Expected result

The public Unity share page should show the map and bottom lane buttons.

Click:

```text
Deploy Centre
```

A Grave Goblin should spawn near the bottom and start moving upward.
