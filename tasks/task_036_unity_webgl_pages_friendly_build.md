# Task 036, Unity WebGL Pages Friendly Build

## Goal

Create a Unity WebGL build that is easier to host on GitHub Pages and other basic static hosts.

## Why

The first successful Unity Cloud build uses Brotli `.br` files.

For easy static hosting, we want uncompressed build files.

## Steps

1. Upload this pack to the repo root.
2. Confirm this file exists:
   `unity_cloud_minimal/Assets/Editor/WebGLPagesFriendlySettings.cs`
3. Commit to `main`.
4. Run the Unity Cloud build again.
5. Download the new WebGL ZIP.
6. Check that the Build folder uses files like:
   `.data`
   `.framework.js`
   `.wasm`

## Done when

The Unity WebGL output can be uploaded to GitHub Pages without requiring custom compression headers.
