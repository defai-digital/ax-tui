# AGENTS.md

Guidance for AI coding agents operating in the ax-tui repository. This is the
sole project-memory file for this repo.

## Language

Everything written to disk must be English: source, documentation, comments,
configuration, commit messages, and tests. Replies follow the user's language.

## Ownership and source

**ax-tui** is an independently maintained, MIT-licensed SolidJS terminal UI
framework. Its initial renderer, Solid reconciler, and native implementation
were absorbed from OpenTUI 0.4.1, commit
`b7e0bb9c3d2a75c2bc267d2af27b7237f734d13b`. This is a source fork, not a
clean-room implementation. Keep the upstream copyright and DEFAI Digital
copyright in `LICENSE`, `solid/LICENSE`, and `native/renderer/LICENSE`.
See `UPSTREAM.md` for provenance and `DIVERGENCES.md` for preserved AX behavior.

Development builds use this repository's sources, never upstream renderer
bundles or upstream native npm packages. Changes from other projects require
explicit review, attribution, compatibility tests, and an updated provenance
record; they are not part of the normal build workflow.

## Project map

- `src/`: TypeScript renderer, renderables, FFI, input, workers, and testing utilities.
- `solid/source/`: TypeScript/TSX reconciler, JSX runtime, and build integration.
- `native/source/`: TypeScript native delivery and verified download cache.
- `native/renderer/`: Zig/C native renderer, Yoga bindings, and native tests.
- `spinner/src/`, `chart/src/`: TypeScript widgets; their `dist/` output is committed.
- Root `index*.js`, `*.d.ts`, `lib/`, `renderables/`, `platform/`, `testing/`,
  `solid/*.js`, `solid/src/`, and `native/*.js`: generated runtime/declaration artifacts.
- `renderer-artifacts.json`: exact generated renderer artifact inventory.
- `assets/`: tree-sitter WASM and highlight grammars; the Zig grammar is omitted.
- `vendor/`: locally compiled native binaries and per-target licenses.
- `vendor/manifest.json`: authoritative binary hashes and local source build provenance.
- `script/`: build, verification, packaging, and release staging tools.
- `patches/`, `solid/patches/`: historical behavior contracts, now implemented in source.

## Commands

Use Node.js >= 24 and pnpm via Corepack. Native rendering on Node requires
Node 26+ with `--experimental-ffi`. All direct dependency versions are pinned.
TypeScript 7.0.2 is the development compiler; Solid's JSX transform uses Babel.

- `pnpm install`: install dependencies.
- `pnpm run build`: regenerate renderer JS/declarations and spinner/chart dist.
- `pnpm run build:renderer`: regenerate only renderer, Solid, and native-delivery artifacts.
- `pnpm run typecheck`: check core, Solid, native delivery, spinner, and chart sources.
- `pnpm run check`: verify native hashes/source provenance, AX contracts, and all generated output.
- `pnpm test`: Vitest framework and maintenance regressions.
- `pnpm run build:native`: build the host's library with Zig pinned in `.zig-version`.
- `pnpm run build:native --all`: build and stage all eight native targets.
- `pnpm run build:native --target=linux-x64`: build one explicit target.
- `pnpm run test:native`: run the native Zig suite.
- `pnpm run check:jsr`: dry-run the JSR publication payload.

`AX_CODE_TUI_ZIG` selects the compiler executable. `AX_CODE_TUI_MACOS_SDK`
selects a macOS SDK for native builds. See `MAINTENANCE.md` for SDK requirements.
`vendor` is a compatibility alias for the local native build; `apply:patches`
is an alias for rebuilding source. Neither command fetches OpenTUI packages.

## Required workflow

1. Edit TypeScript/TSX or Zig/C source, never generated JS, declarations, or binary bytes.
2. Add a behavioral regression for bug fixes.
3. Run `pnpm run build`, `pnpm run typecheck`, `pnpm run check`, and `pnpm test`.
4. For native changes, run the native suite and rebuild every supported target.
   Source hashes intentionally make `check:vendor` fail for stale target builds.
5. Review changes to generated artifacts, distribution payload, provenance, and public exports.

Keep generated JS/declarations and widget dist committed. Rebuild affected
native artifacts in the same change when the ABI changes. Preserve compatibility
with the documented package exports; application code must not import source
or internal generated files.

## Hard rules

- Preserve `import.meta.url`-relative native and tree-sitter asset resolution.
- Preserve `AX_CODE_TUI_*` public environment variables and runtime identities.
- Keep `libopentui`/`opentui.dll` and native ABI symbol names for compatibility;
  these names are not upstream package dependencies.
- Prefer bundled native libraries; verify downloaded/cached binary and license
  hashes. Signed downstream bundles are verified before signing, not against
  unsigned hashes when loaded after signing.
- Never commit secrets, `.internal/`, Zig caches, or compiler/SDK installations.
- JSR self-imports map to local exports in `jsr.json`, never to unpublished npm
  self-packages. Exclude native binaries and development source from JSR payloads.
- Publish verified, immutable native release assets before the matching JSR
  version. Registry publication requires explicit user approval.
- Use ESM and `import type`. Format handwritten TypeScript with Prettier,
  `semi: false`, `printWidth: 120`.
