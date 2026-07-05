# Testing Nightmare Park from GitHub Pages

## What this patch does

This adds a root `index.html` that redirects to:

```text
prototypes/browser_v5_2/index.html
```

It also adds `.nojekyll`, which helps GitHub Pages serve the project as plain static files.

## GitHub Pages settings

Go to:

```text
Settings > Pages
```

Set:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

Then save.

Your test page should be:

```text
https://awaterman78.github.io/Nightmare-Park/
```

Or directly:

```text
https://awaterman78.github.io/Nightmare-Park/prototypes/browser_v5_2/
```

## Important

This is still the browser prototype, not the final Unity game.

The design pack is the brief for the proper Unity and Blender vertical slice.
