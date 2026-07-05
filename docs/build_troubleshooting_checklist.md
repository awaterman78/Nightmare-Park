# Build Troubleshooting Checklist

## Browser prototype workflow

If it fails, check:

| Issue | Fix |
|---|---|
| Pages not enabled | Settings > Pages > Source > GitHub Actions |
| Prototype folder missing | Ensure `prototypes/browser_v7_test_build/index.html` exists |
| Artifact upload failed | Check workflow logs |

## Unity workflow

If it fails, check first red error.

Likely errors:

### No Unity project found

Fix:

Check project path is:

```text
unity
```

Confirm these exist:

```text
unity/Assets
unity/Packages/manifest.json
unity/ProjectSettings/ProjectVersion.txt
```

### License activation failed

Fix:

Add Unity secrets to GitHub Actions.

### Compile errors

Fix:

Copy the first C# compile error and fix the script.

### Missing scene

Fix:

Confirm:

```text
unity/Assets/Scenes/ArenaOne_Test.unity
```

or let the bootstrap script create it.

### WebGL build failed

Fix:

Check Unity version and WebGL target settings.
