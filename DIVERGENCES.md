# AX TUI behavior ledger

Inherited AX fixes now live in the owned TypeScript sources. Behavior changes must have an observable rationale and a regression guard.

| ID                         | Scope                    | AX behavior                                                                                                                                                                                                                 | Regression guard                          |
| -------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `ffi-pointer-pin`          | Node FFI                 | Pointer source owners stay strongly reachable until synchronous native consumers return.                                                                                                                                    | `tui-ffi-pointer-pin.test.ts`             |
| `ffi-geometry-guard`       | Native draw boundary     | Negative, fractional, non-finite, and empty geometry is sanitized before strict Node FFI marshaling.                                                                                                                        | `tui-ffi-coordinate-guard.test.ts`        |
| `vendored-native-resolver` | Offline packaging        | Runtime selects a hash-pinned native library relative to `ax-tui`, with `AX_CODE_TUI_LIBC` for Linux override.                                                                                                              | `tui-vendored-native-resolver.test.ts`    |
| `kitty-keyboard-opt-out`   | Terminal input           | An explicit `useKittyKeyboard: null` disables Kitty protocol enablement and parsing instead of being replaced by the default configuration.                                                                                 | `check:patches` and source contract tests |
| `stdin-parser-timeout`     | Terminal input           | The pending-escape-sequence assembly timeout is 100ms (configurable via `stdinParserTimeoutMs`), not 20ms, so a terminal reply split across two reads under load isn't abandoned mid-sequence and re-typed as literal text. | `check:patches` and source contract tests |
| `drop-zig-parser`          | Tree-sitter assets       | The unused Zig parser and registration are omitted from the shipped package.                                                                                                                                                | `check:patches`                           |
| `slim-solid-catalogue`     | Solid reconciler         | Unused ASCII font, select, and tab-select intrinsic registrations are omitted.                                                                                                                                              | `check:patches` and TUI surface tests     |
| `drop-test-remnants`       | Package contents         | Upstream-only test/reproduction artifacts are not shipped.                                                                                                                                                                  | `check:patches`                           |
| `ax-runtime-identity`      | JS runtime configuration | AX-owned flags, virtual module IDs, worker globals, and Solid plugin keys use AX Code TUI names. Native ABI filenames, symbols, and capability keys retain their pinned upstream spelling.                                  | `check:patches` and source contract tests |

## Source ownership

These contracts are implemented in `src/`, `solid/source/`, and `native/source/`.
`script/tui-patches.ts` checks them without rewriting generated bundles.
`test/core-ffi.test.ts` and `test/core-stdin-parser.test.ts` cover the imported
FFI adapter and terminal parser. `test/source-renderer.test.ts` exercises Solid
reactivity, cleanup, and bundled tree-sitter assets against the locally built
native backend. The historical AX Code regression names above identify their
original downstream guards; downstream applications retain their own suites.

`native-asset-delivery` delegates to `ax-tui/native`, preferring bundled assets
and otherwise using bounded downloads and a manifest-verified cache. Guards:
`test/native-delivery.test.ts`, `test/native-delivery-renderer.test.ts`, and
`script/stage-native-assets.test.ts`.

`source-native-build` replaces upstream package extraction with local Zig/C
compilation. `check:vendor` verifies source hashes as well as binary hashes,
licenses, and architecture; `script/build-native.test.ts` and
`script/vendor-tui-native.test.ts` guard the build metadata and target selection.

Chart coordinate normalization now handles finite bounds near the limits of
JavaScript numbers without overflowing or hanging rasterization. Invalid
raster endpoints fail closed. X/Y axis colors apply to their respective lines;
`test/chart-layout.test.ts` covers these behaviors.

`DataPathsManager` defaults to the `ax-tui` application namespace, so its
configuration and parser cache do not share OpenTUI defaults.
`test/data-paths.test.ts` verifies isolation and custom application paths.

External source changes must preserve these contracts or include an explicit
behavioral change and updated tests. Never replace generated bundles directly.
