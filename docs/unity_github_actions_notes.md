# Unity GitHub Actions Notes

## Why use GitHub Actions

Unity Cloud Build is failing but not giving us logs on the current account.

GitHub Actions gives us visible logs.

## Unity build action

This workflow uses GameCI Unity Builder.

It is a community Unity build action, not official Unity Cloud.

## Expected first outcome

The first Unity build may fail.

Likely reasons:

1. Unity license activation required.
2. Unity project skeleton still incomplete.
3. Scripts need compile fixes.
4. WebGL module or Unity version mismatch.
5. Project settings need more complete values.

That is acceptable.

The purpose is to get the real error.

## Secrets

The Unity workflow may require GitHub repository secrets later:

```text
UNITY_LICENSE
UNITY_EMAIL
UNITY_PASSWORD
```

Do not paste those into ChatGPT.

Only put them in GitHub repo secrets if needed.

## Repository secrets location

GitHub repo:

```text
Settings > Secrets and variables > Actions > New repository secret
```

## First run

Try the workflow first.

If it fails because of licensing, then we handle Unity activation separately.
