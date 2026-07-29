# CI benchmark

Scratch branch used to measure GitHub Actions CI wall-clock on this monorepo,
comparing GitHub-hosted runners against Namespace runners.

Identical application code on both branches; the only variable is the runner
and the cache mechanism in `.github/workflows/ci.yml`.

- `bench/gha-baseline` - stock `ubuntu-latest` / `macos-latest` / `windows-latest`
- `bench/namespace` - `nscloud-*` runners with a cache volume

Not intended to be merged.
