# Nightmare Park, Unity Cloud Playable Arena One Pack v1

## What this adds

This turns the Unity Cloud minimal test into a first playable Unity vertical slice.

It adds:

- Arena One haunted battleground
- Player core and two player towers
- Enemy core and two enemy towers
- Cursed green separator and bridges
- Grave Goblin card
- Tap or click deployment in the player half
- Energy system
- Enemy Candle Imp waves
- Automatic unit movement and combat
- Tower attacks
- Health bars
- Win and lose condition
- Basic UI and status messages

This is still placeholder geometry, but it is now a playable Unity scene rather than a static test map.

## Upload instructions

Unzip this pack.

Upload the **contents** of the unzipped folder into the root of the GitHub repo.

Important: this pack intentionally replaces:

```text
unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs
```

because the previous version was generating the basic test map.

## Unity Cloud settings

Keep using:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build profile path: blank
```

Then rerun the Unity Cloud build.

## Expected result

The Unity share link should load a playable Arena One prototype.

Controls:

1. Press the Grave Goblin card at the bottom.
2. Tap or click in your half of the arena.
3. Goblins will run, cross bridges, attack enemies, towers and the enemy core.
4. Destroy the enemy core to win.
