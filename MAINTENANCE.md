# ax-tui maintenance

`ax-tui` is a standalone, AX-owned terminal UI package extracted from the AX Code monorepo. Its supported product
surface is:

- `ax-tui` for the native renderer and renderables;
- `ax-tui/solid` for the SolidJS reconciler and JSX runtime;
- `ax-tui/spinner` and `ax-tui/spinner/solid` for the AX spinner.

Application code must use these exports only.

## Ownership boundary

AX (DEFAI Digital) owns package identity, exports, integration, release staging, regression policy, and local fixes.
The current renderer snapshot and native libraries retain their upstream MIT lineage; see
[UPSTREAM.md](./UPSTREAM.md), [DIVERGENCES.md](./DIVERGENCES.md), [LICENSE](./LICENSE), and
[`vendor/manifest.json`](./vendor/manifest.json).

The root contains the renderer JavaScript, declarations, runtime-plugin glue, tree-sitter assets, and native libraries.
`solid/` contains the reconciler, JSX runtimes, preload shims, and the supported `./solid/transform` build API.
`spinner/` contains TypeScript source plus committed `dist/` output. `script/` contains the repo's own maintenance
tools (native vendoring, patch contracts, dist freshness, distribution allowlist, JSX surface). These are subpaths of
one package, not independent packages.

The root contains the renderer JavaScript, declarations, runtime-plugin glue, tree-sitter assets, and native libraries.
`solid/` contains the reconciler, JSX runtimes, preload shims, and the supported `./solid/transform` build API.
`spinner/` contains TypeScript source plus committed `dist/` output. These are subpaths of one package, not independent
workspace packages.

The native resolver maps `(platform, arch, AX_CODE_TUI_LIBC)` to `vendor/<target>/` relative to the package root.
Upstream platform package names and `libopentui`/`opentui.dll` filenames remain only as ABI and provenance identifiers.

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
5. Rebuild the spinner output with `pnpm run build`.
6. Run all verification below and update provenance, hashes, and divergences in the same change.

## Verification

```sh
pnpm run check            # vendor + patches + spinner dist
pnpm run typecheck        # spinner sources
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
