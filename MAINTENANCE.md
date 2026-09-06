# ax-tui maintenance

`ax-tui` is a standalone, AX-owned terminal UI package extracted from the AX Code monorepo. Its supported product
surface is:

- `ax-tui` for the native renderer and renderables;
- `ax-tui/solid` for the SolidJS reconciler and JSX runtime;
- `ax-tui/spinner` and `ax-tui/spinner/solid` for the AX spinner;
- `ax-tui/chart` and `ax-tui/chart/solid` for the ratatui-style chart widgets.

Application code must use these exports only.

## Ownership boundary

AX (DEFAI Digital) owns package identity, exports, integration, release staging, regression policy, and local fixes.
The current renderer snapshot and native libraries retain their upstream MIT lineage; see
[UPSTREAM.md](./UPSTREAM.md), [DIVERGENCES.md](./DIVERGENCES.md), [LICENSE](./LICENSE), and
[`vendor/manifest.json`](./vendor/manifest.json).

The root contains the renderer JavaScript, declarations, runtime-plugin glue, tree-sitter assets, and native libraries.
`solid/` contains the reconciler, JSX runtimes, preload shims, and the supported `./solid/transform` build API.
`spinner/` and `chart/` contain TypeScript source plus committed `dist/` output. `script/` contains the repo's own
maintenance tools (native vendoring, patch contracts, dist freshness, distribution allowlist, JSX surface). These are
subpaths of one package, not independent packages.

The root contains the renderer JavaScript, declarations, runtime-plugin glue, tree-sitter assets, and native libraries.
`solid/` contains the reconciler, JSX runtimes, preload shims, and the supported `./solid/transform` build API.
`spinner/` and `chart/` contain TypeScript source plus committed `dist/` output. These are subpaths of one package, not
independent workspace packages.

The native resolver maps `(platform, arch, AX_CODE_TUI_LIBC)` to `vendor/<target>/` relative to the package root.
Upstream platform package names and `libopentui`/`opentui.dll` filenames remain only as ABI and provenance identifiers.

If bundled native files are absent, `ax-tui/native` prepares version-pinned GitHub release assets in a private cache.
Binary size/SHA-256 and license SHA-256 must match `vendor/manifest.json` before an entry is committed or reused.
`AX_CODE_TUI_NATIVE_CACHE_DIR` overrides the cache location; `AX_CODE_TUI_NATIVE_OFFLINE=1` forbids downloads.
Invalid cache entries fail closed. Remove only the reported cache entry to prepare it again.
Bundled files remain loadable after platform signing changes their bytes; build tooling verifies before signing.

## Required AX divergences

Named, idempotent patch contracts live under `patches/` and `solid/patches/`. They preserve:

- Node FFI pointer liveness;
- safe native draw geometry;
- a working Kitty keyboard protocol opt-out;
- deterministic, offline native resolution;
- omission of the unused Zig parser;
- the reduced Solid intrinsic catalogue; and
- removal of upstream-only test remnants; and
- AX-owned runtime flags and plugin/worker identities.

Do not hand-edit new hashed renderer chunks after an upstream refresh. Apply and verify the contracts:

```sh
pnpm run apply:patches
pnpm run check:patches
```

The current renderer is a pre-bundled JavaScript snapshot. Converting it to owned, narrow source modules is a separate
compatibility phase: preserve `import.meta.url` resolution for native and tree-sitter assets, and prove native/JS ABI
compatibility before changing the source baseline.

## Upstream refresh

1. Pin one exact upstream source/package/native version.
2. Refresh renderer and Solid artifacts together at the repository root.
3. If the native ABI changed, update `VERSION` in `script/vendor-tui-native.ts` and run `pnpm run vendor`.
4. Run `pnpm run apply:patches`; review every ledger entry instead of overwriting AX fixes.
5. Rebuild the spinner and chart outputs with `pnpm run build`.
6. Run all verification below and update provenance, hashes, and divergences in the same change.

## Verification

```sh
pnpm run check            # vendor + patches + spinner/chart dist
pnpm run typecheck        # spinner and chart sources
pnpm test                 # maintenance tool tests (vitest, script/*.test.ts)
```

Downstream consumers (for example the AX Code monorepo) additionally run their own renderer, layering, and
startup-smoke suites against this package.

## Runtime invariants

The compatible terminal profile is the default. The advanced profile is opt-in through
`AX_CODE_TUI_ADVANCED_TERMINAL=1` and enables alternate-screen plus the render thread. Kitty keyboard negotiation is
enabled in both profiles unless `AX_CODE_TUI_KITTY_KEYBOARD=0` explicitly disables it.

Terminal teardown is ordered and best-effort: title cleanup, renderer destruction, mouse reset, main-screen clearing,
and output flushing are separate failure domains. Deferred work, timers, subscriptions, process handlers, and renderable
access must use the named TUI lifecycle and safety helpers so route changes and shutdown cannot leave stale work behind.

## Releasing to JSR

The package is published to JSR as [`@defai-digital/ax-tui`](https://jsr.io/@defai-digital/ax-tui) from the
`.github/workflows/jsr.yml` workflow using GitHub OIDC trusted publishing (no long-lived tokens).

1. Bump `version` in both `package.json` and `jsr.json` (they must match).
2. Commit, push `main`, then create the matching tag (`v<version>`) and push it.
3. The workflow validates the tag against `jsr.json`, rebuilds the spinner and chart dists, runs `check` and the test
   suite, dry-runs the JSR publish, and then publishes with provenance.
   The native-assets job first stages all libraries and licenses, publishes them under the matching GitHub tag,
   and verifies downloaded bytes against the staged artifacts. Existing assets are never overwritten.

Keep every `ax-tui` self-import mapped to its local export in `jsr.json`; otherwise JSR's npm-compatible manifest
can accidentally depend on an unpublished npm package. The native-cache rendering test runs under Node 26 in
the publish job; Node 24 retains non-rendering maintenance support.

Downstream bundlers import `prepareNativeLibrary` from `ax-tui/native`, copy its `libraryPath` and `licensePath`
into their own `vendor/<target>/`, and verify against the manifest before platform signing. They must not
duplicate the framework's downloader or assume that JSR contains the native files.

The JSR tarball ships JavaScript, type declarations, tree-sitter assets, and `vendor/manifest.json` only — the
native renderer libraries exceed JSR size limits and are distributed out-of-band (GitHub Releases), with the
manifest recording the expected artifacts. See `UPSTREAM.md` and the extraction PRD/ADR in the AX Code monorepo
(`.internal/prd/PRD-2026-09-05-ax-tui-extraction.md`, `ADR-074`).

```sh
pnpm run check:jsr        # local dry run of the exact publish payload
```

The JSR score and package page also use settings that are not in `jsr.json`.
After publishing, open https://jsr.io/@defai-digital/ax-tui/settings and set:

- **Readme Source** to **Readme**, so the Overview tab shows `README.md`
  instead of only the main entrypoint `@module` JSDoc.
- **Description** to the package.json description (max 250 characters).
- **Runtime compatibility:** Node.js and Bun supported; Deno unknown;
  Cloudflare Workers and browsers unsupported (native terminal renderer).
