# AGENTS.md

Guidance for AI coding agents operating in the ax-tui repository. This file is
the sole project-memory file for this repo.

## Language

Everything written to disk must be English only: source, documentation,
comments, configuration, commit messages, tests. Replies to the user follow
the user's language.

## What this project is

**ax-tui** is a standalone, MIT-licensed SolidJS terminal UI framework with a
native renderer, extracted from the AX Code monorepo (`packages/ax-code-tui`)
and generalized for open-source use. npm name: `ax-tui`. The renderer and
native libraries are derived from OpenTUI 0.4.1 (MIT, copyright opentui);
AX-authored portions are copyright DEFAI Digital. See `LICENSE`,
`UPSTREAM.md`, and `DIVERGENCES.md`.

## Project map

```
index.js, index-*.js      Pre-bundled renderer snapshot (upstream lineage —
                          do not hand-edit hashed chunks; use the patch tools)
*.d.ts                    Type declarations for the renderer surface
lib/                      Renderer internals (styled text, key parsing, …)
renderables/              Renderable classes (Box, Text, ScrollBox, Markdown, …)
solid/                    SolidJS reconciler, JSX runtimes, preload shims,
                          solid/transform build API, solid/patches/
spinner/                  TypeScript source plus COMMITTED dist/ output
testing/                  Headless test renderer, mock input, frame capture
platform/, plugins/, post/, animation/
assets/                   tree-sitter wasm + highlight grammars (zig dropped)
native/                   Manifest-verified GitHub asset delivery and cache
vendor/                   Vendored native shared libraries per platform;
                          vendor/manifest.json is the authoritative record
patches/                  Named, idempotent divergence patch contracts (docs)
script/                   Repo maintenance tools (see below)
```

## Maintenance tools (script/)

- `vendor-tui-native.ts` — fetch/verify native libraries from the pinned
  upstream npm platform packages; `--check` verifies the committed tree
  against `vendor/manifest.json` fully offline.
- `tui-patches.ts` — idempotent applier/checker for the required divergence
  patches (`--apply` / `--check`). Contracts are marker-based, not diffs.
- `check-tui-spinner-dist.ts` — rebuilds spinner sources to a temp dir and
  compares against the committed `spinner/dist`.
- `tui-dist.ts` — distribution allowlist helpers for downstream consumers
  that copy this package (e.g. the AX Code CLI).
- `tui-surface.ts` — the supported SolidJS JSX intrinsic allowlist.
- `stage-native-assets.ts` — stages verified native libraries and license
  assets for the matching version's GitHub release before JSR publication.

Each tool has a colocated `*.test.ts` run by `pnpm test` (vitest).

## The vendor → patch → check loop

When refreshing the upstream snapshot:

1. Pin one exact upstream source/package/native version (`VERSION` in
   `script/vendor-tui-native.ts`).
2. `pnpm run vendor` fetches and verifies native artifacts (SRI, binary magic,
   architecture) and rewrites `vendor/manifest.json`.
3. `pnpm run apply:patches` applies every divergence contract; review every
   `DIVERGENCES.md` ledger row instead of overwriting fixes.
4. `pnpm run build` rebuilds `spinner/dist` (it is committed).
5. `pnpm run check` = vendor integrity + patch contracts + spinner dist
   freshness. `pnpm test` runs the maintenance tool tests.
6. Update `UPSTREAM.md`, `DIVERGENCES.md`, and `MAINTENANCE.md` in the same
   change.

Rules that must hold at all times:

- Never hand-edit new hashed renderer chunks after an upstream refresh —
  express changes as named, idempotent patch contracts.
- JavaScript/declaration artifacts and native libraries are refreshed
  together; a consolidation must never be an implicit upstream upgrade.
- Application code uses only the documented package exports (`ax-tui`,
  `ax-tui/solid`, `ax-tui/solid/*`, `ax-tui/spinner`, `ax-tui/spinner/solid`,
  `ax-tui/testing`, `ax-tui/yoga`, `ax-tui/runtime-plugin*`).
- The native resolver maps `(platform, arch, AX_CODE_TUI_LIBC)` to
  `vendor/<target>/`; upstream platform package names and
  `libopentui`/`opentui.dll` filenames are ABI/provenance identifiers only.
- `ax-tui/native` prepares native assets for downstream staging. Prefer
  bundled libraries; otherwise verify cached/downloaded library and license
  hashes. Preserve the signed-bundle exception: native bytes are verified
  before signing, not against unsigned hashes when loading a signed bundle.
- JSR self-imports must map to local exports in `jsr.json`, never to an
  unpublished npm self-package. Publish immutable, verified native release
  assets before the JSR version. Registry publication needs explicit approval.
- `AX_CODE_TUI_*` environment variables and `AX_CODE_TUI_` runtime prefixes
  are the package's public env/identity contract — do not rename them.

## Environment and commands

- Node.js >= 24; pnpm via corepack (`only-allow pnpm` convention). All
  dependency versions are pinned directly in `package.json` (no catalog).
- `pnpm install` — install dependencies.
- `pnpm run build` — rebuild `spinner/dist` from `spinner/src`.
- `pnpm run typecheck` — typecheck spinner sources (`tsc -p spinner/tsconfig.json`).
- `pnpm run check` — vendor + patches + spinner-dist verification.
- `pnpm test` — vitest over `test/*.test.ts` (framework-internal guards) and
  `script/*.test.ts` (maintenance tools), per `vitest.config.ts`. The config
  aliases the `ax-tui` self-reference to the package root because vite-node
  does not apply Node's package self-reference resolution.
- Formatting: Prettier, `semi: false`, `printWidth: 120` (matching the AX Code
  style this repo was extracted from); ESM only; `import type` for
  type-only imports.

## Hard rules

- Keep the renderer snapshot's `import.meta.url`-relative resolution for
  native and tree-sitter assets intact.
- Never commit secrets; `vendor/manifest.json` hashes must stay accurate.
- Keep `spinner/dist` committed and in sync with `spinner/src`
  (`check:spinner-dist` must pass).
- Keep both copyright lines in `LICENSE` and `solid/LICENSE`.
