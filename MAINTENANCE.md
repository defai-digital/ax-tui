# AX TUI maintenance

AX TUI owns and builds its TypeScript, SolidJS, and native renderer sources.
The source origin and licenses are documented in `UPSTREAM.md`; preserved
behavior is tracked in `DIVERGENCES.md`. There is no upstream bundle-refresh
step in the development workflow.

## TypeScript and SolidJS

The official TypeScript 7.0.2 compiler checks the renderer (`src/`), Solid
integration (`solid/source/`), native delivery (`native/source/`), and widgets.
Solid TSX uses the Babel universal transform through `ax-tui/solid/transform`.
The Node bundle selects Solid's reactive runtime; Bun retains its own entry.

```sh
pnpm install
pnpm run build
pnpm run typecheck
pnpm run check
pnpm test
pnpm run check:jsr
```

`build:renderer` compiles the local source to a temporary directory, emits
declarations, and synchronizes only the generated files listed in
`renderer-artifacts.json`. `check:renderer-dist` rebuilds and compares every
artifact byte. Root JavaScript and declarations are distribution products;
edit their TypeScript source instead. Spinner/chart `dist/` output is also
committed and verified against source.

`check:patches` retains its historical command name but now verifies AX
contracts in source. `apply:patches` is a compatibility alias for
`build:renderer`; there is no JavaScript bundle patcher. The historical
contract documents remain under `patches/` and `solid/patches/`.

## Native builds

Install Zig 0.15.2 (pinned in `.zig-version`), or set `AX_CODE_TUI_ZIG` to that
executable. Yoga and uucode are downloaded by Zig using content hashes from
`native/renderer/build.zig.zon`; populated Zig caches allow offline rebuilding.

```sh
pnpm run test:native
pnpm run build:native                    # current host
pnpm run build:native --target=linux-x64  # one exact target
pnpm run build:native --all              # all eight release targets
pnpm run check:vendor
```

`vendor` is a compatibility alias for `build:native --all`. It never downloads
OpenTUI binaries. The builder checks the compiler version, compiles local
source, validates binary format and architecture, and stages libraries plus
licenses in `vendor/`. It records source hashes and build configuration in
`vendor/manifest.json`. After native source edits, all target builds must be
refreshed; building only the host deliberately leaves other targets stale.

macOS targets require an Apple SDK containing CoreAudio, AudioToolbox, and
CoreFoundation. `AX_CODE_TUI_MACOS_SDK=/path/to/MacOSX.sdk` passes an explicit
SDK to the renderer build; ensure Zig's host SDK discovery uses a compatible
SDK too. Zig 0.15.2 can fail to link with recent Apple SDKs whose `.tbd` stubs
only advertise `arm64e-macos`. Prefer an SDK supported by the pinned compiler.
The initial local validation used a task-local copy of the SDK with arm64
aliases added to those stubs; no system SDK was modified. Other platforms
were cross-compiled; their runtime acceptance must be verified on those hosts.

The native ABI names and `libopentui`/`opentui.dll` filenames remain compatible.
Changes to the TypeScript FFI and native ABI must be built and tested together.
Native source, Zig caches, and SDKs are excluded from runtime distributions.

## Runtime and packaging invariants

Use documented package exports (`ax-tui`, `ax-tui/solid`, widget, native,
testing, Yoga, and runtime-plugin subpaths). Keep `import.meta.url`-relative
native, worker, and tree-sitter asset resolution intact. Preserve the
`AX_CODE_TUI_*` public environment and runtime identity contracts.

Native resolution maps platform, architecture, and `AX_CODE_TUI_LIBC` to a
bundled library. When absent, `ax-tui/native` prepares a verified private cache
from AX TUI's version-matched GitHub release. Binary size/SHA-256 and license
SHA-256 must match the manifest. `AX_CODE_TUI_NATIVE_CACHE_DIR` overrides the
cache; `AX_CODE_TUI_NATIVE_OFFLINE=1` forbids downloads. Invalid caches fail
closed. Signed downstream bundles verify their inputs before signing; the
runtime must not reject signed bytes using the unsigned manifest hash.

Node 26+ with `--experimental-ffi` is required for Node native rendering.
Node 24 supports maintenance tools but skips native rendering integration
checks. Vitest runs the framework and maintenance regressions; `test:native`
runs the Zig suite separately. Downstream applications should additionally
run their own input, rendering, startup, and teardown acceptance tests.

## Releases

Registry publication requires explicit approval. Changes to native bytes
require a new package version and new immutable release assets; do not
replace assets attached to a previously published version.

1. Add a version section to `CHANGELOG.md`; release notes are generated from it.
2. Bump `package.json` and `jsr.json` together.
3. Run all verification above, including native builds/tests when affected.
4. After approval, push the release commit and matching `v<version>` tag.
5. `.github/workflows/jsr.yml` stages verified native libraries and licenses,
   creates the release, checks existing assets byte-for-byte, and publishes
   the JSR package only after native assets are available.

JSR exports JavaScript/declarations, widget source, tree-sitter assets, and
`vendor/manifest.json`. Native binaries are delivered through GitHub Releases
to stay within JSR size limits. Every `ax-tui` self-import must map to its local
export in `jsr.json`; never introduce an unpublished npm self-dependency.
Downstream bundlers should use `prepareNativeLibrary` from `ax-tui/native`
and preserve the verified library/license pair.

The JSR page settings remain external to `jsr.json`: select the README as the
readme source and use the package description. Runtime support is Node and
Bun; the native renderer does not target web browsers or Cloudflare Workers.
