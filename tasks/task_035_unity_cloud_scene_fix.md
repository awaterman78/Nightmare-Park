# Task 035, Unity Cloud Scene Fix

## Goal

Fix Unity Cloud WebGL build failure caused by no scenes being configured.

## Evidence

Build log error:

```text
ERROR: There were no scenes configured to build! Please add a scene to the build using the Build Settings window of the Unity Editor.
```

## Steps

1. Upload this pack to the repo root.
2. Confirm this file exists:
   `unity_cloud_minimal/Assets/Editor/CloudBuildAutoSceneSetup.cs`
3. Commit to `main`.
4. Re-run the Unity Cloud `Default WebGL` target.
5. Keep project subfolder path as:
   `unity_cloud_minimal`

## Done when

Unity Cloud gets past the no-scenes error and produces either a WebGL build or a new specific error.
