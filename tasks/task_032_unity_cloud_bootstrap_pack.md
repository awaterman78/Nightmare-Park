# Task 032, Unity Cloud Bootstrap Pack

## Goal

Upload Unity Cloud Bootstrap Pack v1 to make Unity Build Automation recognise `/unity` as a buildable Unity project.

## Steps

1. Upload this pack into GitHub.
2. Commit to `main`.
3. Rerun the Default WebGL build.
4. If Unity asks for build method, use:
   `NightmarePark.Editor.NightmareParkCloudBuildBootstrap.PerformWebGLBuild`
5. If it fails again, capture the build log from Build History.

## Done when

Unity Cloud Build gets past the initial project recognition/build execution error.
