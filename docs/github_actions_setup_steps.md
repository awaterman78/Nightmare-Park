# GitHub Actions Setup Steps

## Step 1, upload this pack

Upload the files into the root of the repo.

It should add:

```text
.github/workflows/deploy-browser-prototype.yml
.github/workflows/unity-webgl-diagnostic-build.yml
docs/github_actions_build_pack_v1_readme.md
docs/github_actions_setup_steps.md
docs/unity_github_actions_notes.md
```

## Step 2, enable GitHub Pages via Actions

In GitHub:

1. Go to the repo.
2. Go to Settings.
3. Go to Pages.
4. Under Build and deployment, set Source to:

```text
GitHub Actions
```

## Step 3, run browser deployment

Go to:

```text
Actions
Deploy Browser Prototype
Run workflow
```

This should publish the current browser prototype to GitHub Pages.

## Step 4, test the link

Open:

```text
https://awaterman78.github.io/Nightmare-Park/
```

## Step 5, run Unity diagnostic build

Go to:

```text
Actions
Unity WebGL Diagnostic Build
Run workflow
```

This may fail.

If it fails, open the workflow run and copy the first red error.

That is what we need.
