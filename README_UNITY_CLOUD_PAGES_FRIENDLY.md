# Unity Cloud Pages Friendly Pack v1

## Purpose

The current Unity Cloud build works, but the WebGL output uses Brotli `.br` files.

That is fine when hosted somewhere that sends the correct compression headers, but it can be awkward on simple static hosting.

This pack tells Unity to create a simpler uncompressed WebGL build.

## What it changes

Adds:

```text
unity_cloud_minimal/Assets/Editor/WebGLPagesFriendlySettings.cs
tasks/task_036_unity_webgl_pages_friendly_build.md
```

The script sets:

```text
PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
```

## Why

Uncompressed WebGL build files are easier to upload and test on basic static hosting such as GitHub Pages.

## How to use

1. Upload this pack to the repo root.
2. Commit to `main`.
3. Re-run Unity Cloud Build using:
   `Project subfolder path: unity_cloud_minimal`
4. Download the new ZIP.
5. The new ZIP should contain files without `.br`, for example:
   `.data`, `.framework.js`, `.wasm`

This is still the minimal Unity test build. Once hosting works, we move the actual Nightmare Park scene into the same working pipeline.
