# Nightmare Park, Unity Visual Slice Pack v4

## What this is

This is the first proper visual pass for the working Unity Cloud prototype.

It keeps the reliable v3 lane-button deployment, but makes the build look more like a real haunted monster battler instead of a rough cube test.

## What changed

- Better Arena One presentation
- Haunted stone battlefield
- Green player side and purple enemy side
- Cursed centre river/fog strip
- Wooden bridges
- Lane markers
- More designed cores and towers
- Grave Goblin silhouette with head, ears, eyes and bone dagger
- Candle Imp enemy with wax body and green flame
- Cleaner HUD
- Better bottom deployment controls
- Health bars
- Wave counter
- Spawn puffs and attack strike VFX
- Victory / defeat overlay

## Important

This is still procedural prototype art, not final production art.

There are no imported 3D models yet. That is deliberate so Unity Cloud can build it without asset import issues.

## Upload

Unzip this pack.

Upload the **contents** into the GitHub repo root.

Replace files when prompted.

Must replace:

```text
unity_cloud_minimal/Assets/Scripts/NightmareParkArenaOneController.cs
unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs
unity_cloud_minimal/Assets/Editor/WebGLPagesFriendlySettings.cs
```

## Unity Cloud Build

Use the same target:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build profile path: blank
```

## Expected result

Open the Unity Cloud share link. You should see a much stronger looking Arena One scene with:

```text
DEPLOY LEFT
DEPLOY CENTRE
DEPLOY RIGHT
```

Click any button to spawn a Grave Goblin.
