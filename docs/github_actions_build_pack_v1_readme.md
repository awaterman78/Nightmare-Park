# GitHub Actions Build Pack v1

## Project

Nightmare Park, Monster Royale

## Purpose

Unity Cloud Build is currently failing without usable logs.

This pack moves build testing to GitHub Actions so we can see actual logs and stop guessing.

## What this pack adds

1. Browser prototype deployment workflow.
2. Unity WebGL diagnostic workflow.
3. GitHub Pages setup guide.
4. Unity GitHub Actions setup guide.
5. Build troubleshooting checklist.

## Workflows added

```text
.github/workflows/deploy-browser-prototype.yml
.github/workflows/unity-webgl-diagnostic-build.yml
```

## Immediate goal

Get a reliable playable browser prototype link:

```text
https://awaterman78.github.io/Nightmare-Park/
```

## Unity goal

Use GitHub Actions to attempt the Unity WebGL build and capture readable logs.

## Important

The Unity build may still fail because the Unity project skeleton may need fixing.

That is fine.

The point is that GitHub Actions will show the actual error.
