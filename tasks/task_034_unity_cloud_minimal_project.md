# Task 034, Unity Cloud Minimal Project

## Goal

Prove Unity Build Automation can build from the repo using a clean minimal Unity project.

## Upload

Upload this pack into the root of the repo.

## Unity Build Automation target settings

Use:

```text
Project subfolder path: unity_cloud_minimal
Platform: WebGL
Build profile path: blank
Custom build method: NightmarePark.Editor.CloudBuild.PerformWebGLBuild
```

If there is no field for build method, save the target and run the build anyway.

## Done when

Unity Cloud produces a WebGL build or gives a different, more specific error.
