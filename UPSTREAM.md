# Source provenance

AX TUI is an independently maintained source fork. DEFAI Digital maintains
its TypeScript renderer, SolidJS integration, native implementation, public
API, builds, and releases in this repository.

The initial implementation was absorbed from [OpenTUI](https://github.com/anomalyco/opentui)
under MIT at tag `v0.4.1`, commit
`b7e0bb9c3d2a75c2bc267d2af27b7237f734d13b`:

| Imported source                                     | AX TUI location    |
| --------------------------------------------------- | ------------------ |
| `packages/core/src` (runtime TypeScript)            | `src/`             |
| `packages/solid` (reconciler and build integration) | `solid/source/`    |
| `packages/core/src/zig` (native source and tests)   | `native/renderer/` |

AX's existing fixes, public exports, runtime identities, native delivery, and
reduced JSX catalogue are maintained directly in those sources. Default
configuration/data paths now use `ax-tui`, avoiding the OpenTUI application
namespace; callers can still set an explicit application name. The Solid
universal reconciler's JavaScript was converted to TypeScript. Generated
JavaScript and declarations are built locally; native libraries are compiled
locally with Zig 0.15.2. No OpenTUI npm package is used to build or run AX TUI.
This is a derivative implementation, not a clean-room rewrite. Original MIT
copyright and license notices remain in the source and distributed licenses.

`vendor/manifest.json` records each target's source-tree SHA-256, Zig version,
target triple, optimization mode, binary size/hash, and license hash. Its
`origin` field identifies historical source provenance, not a binary download
location. `renderer-artifacts.json` records generated TypeScript artifacts.
Native libraries are named `libaxtui.so`, `libaxtui.dylib`, and `axtui.dll`.
The loader verifies `axTuiAbiVersion()` before binding renderer functions.
Terminal settings use `AX_CODE_TUI_*`, and notification identities belong to
AX TUI. Two deprecated public TypeScript Yoga methods retain their old names
and forward to the AX implementation; no upstream native symbol is required.

Future fixes are developed here. Adopting external changes is a deliberate
source review, with attribution and regression coverage, rather than a bundle
refresh. There is no automatic upstream sync or native-package download step.

Optional performance qualification runs a separately installed, exactly pinned
OpenTUI package in isolated child processes. It is a comparison subject only;
its code and binaries never enter AX TUI's build, runtime, or distribution.
See `MAINTENANCE.md` for the shared workloads and reproducibility limits.

## Other dependencies and influences

Native build dependencies remain hash-pinned in `native/renderer/build.zig.zon`:
Yoga (MIT) and uucode (MIT). The vendored miniaudio header retains its embedded
license. `native/renderer/THIRD_PARTY_LICENSES.txt` preserves the dependency
notices, including Unicode data and UTF-8 decoding notices; each distributed
native `LICENSE` includes them. TypeScript dependencies remain pinned in `package.json` and the pnpm
lockfile. Independence from OpenTUI does not remove these dependencies.

Chart behavior is informed by ratatui 0.30.2, and spinner presets derive from
cli-spinners; their source attribution remains in the widget modules. Kimi
Code and Grok Build are read-only design influences with no code extraction.

The autocomplete and overlay APIs use the documented behavior of Kimi Code's
`packages/pi-tui/README.md` at commit
[`4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`](https://github.com/MoonshotAI/kimi-code/tree/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/packages/pi-tui)
as a reviewed design reference: slash-command/path completion, positioned
overlays, reversible visibility, noncapturing focus, and previous-focus
restoration. That package retains Mario Zechner's 2025 MIT license. AX's
`src/lib/autocomplete.ts`, `src/lib/editor-autocomplete.ts`, and
`src/lib/overlay.ts` are original implementations integrated with AX's native
text engine and renderable tree; no pi-tui source, runtime, or dependency was
copied. `useOverlay` adds Solid owner cleanup. Compatibility tests cover stale
requests, Unicode ranges, native editing/undo, overlay focus and destruction,
viewport resizing, and Solid cleanup. These APIs deliberately use explicit
UTF-16 completion ranges and `close()` for permanent overlay removal. Image
protocols and large-paste folding are outside this integration.

The later focus, command-palette, and image APIs are original AX implementations
informed by read-only review of these MIT-licensed snapshots:

- Ink `26d2c3f83008142061c22267482489588cc3823c`: focus traversal API and
  registration/order lifecycle tests.
- Textual `5e5b7ef58b8c5572c13a3ff9027d756623661495`: visible-tree focus
  traversal, command providers, and command search lifecycle.
- OpenTUI `f8f608e2b9a41685d613a1156708ff06c826c3ce`: image protocol fallback,
  aspect-preserving layout, and source/resource lifetime tests.
- Pi `482c1381a00d8d00bc81697e4a980c593db6803e`: terminal-cell image sizing,
  text fallback, and caller-supplied image conversion.

No source, renderer bundle, decoder, or dependency was copied from those
snapshots. AX retains its Solid reconciler and native cell composition. The
native terminal-control FIFO, bounded PNG decoder, command registry and palette
are developed in this repository, with behavioral/native regressions.

Kitty placeholder encoding follows the public
[graphics protocol](https://sw.kovidgoyal.net/kitty/graphics-protocol/#unicode-placeholders).
`src/lib/kitty-diacritics.ts` records the 297 numeric protocol coordinate constants
from the specification's Unicode 6.0 row/column mapping. The inspected mapping is
[`rowcolumn-diacritics.txt`](https://sw.kovidgoyal.net/kitty/_downloads/f0a0de9ec8d9ff4456206db8e0814937/rowcolumn-diacritics.txt),
SHA-256 `a80368b3272c41d8b50f3f640cf4305b6423e5a1aae6b72a405129bc29425f2c`.
These are fixed interoperability values, not an imported implementation. PNG
filtering, chunk ordering and checksums follow the
[W3C PNG specification](https://www.w3.org/TR/2025/REC-png-3-20250624/).

The scoped keymap and virtual-list APIs are original AX implementations. Reviewed
design references are OpenTUI's `packages/keymap` at MIT-licensed commit
`212eb27da4adf5b907031ad153fc6a5b9f713fbf` and Nous Research's MIT-licensed
Hermes Agent `ui-tui/src/lib/virtualHeights.ts` and
`ui-tui/src/hooks/useVirtualHistory.ts` at commit
`521f4dc2a1a4e19d56419a899f779d60efa01716`. The reviewed concepts are scoped
binding precedence, discoverable commands, measured row heights, and scroll
anchoring. No source or dependency from those revisions was copied. AX uses a
renderer-owned dispatcher and a Fenwick height index integrated with its own
ScrollBox, native layout, and Solid owner lifecycle. Compatibility tests exercise
real native editors and rows, sequence cancellation, bounded mounting of 10,000
items, resize/prepend anchoring, mouse/keyboard scrolling, and Solid disposal.

Shortcut help also reviews `packages/keymap/src/extras/formatting.ts` and
`extras/binding-lookup.ts` from that same OpenTUI commit as design references
for readable key labels and command metadata lookup. AX's `keymap-help.ts`,
`KeymapHelpRenderable`, and Solid `KeymapHelp` are original, display-only
implementations over explicit snapshots. They preserve eligible registration
order rather than resolving or executing commands. No additional upstream code,
dependency, native ABI change, or routing behavior is imported. Tests cover
metadata isolation, Unicode/search, control characters, native wrapping, input
nonconsumption, and reactive cleanup after external destruction.

Public GitHub Packages distributions bundle AX TUI's manifest-verified native assets.
The matching GitHub release also preserves these assets immutably. Signed downstream bundles verify
native inputs before signing changes the bytes. See `MAINTENANCE.md`.

The POSIX terminal regression harness is an original AX implementation informed
by Grok Build's Apache-2.0-licensed Rust PTY tests at commit
`2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8`, under
`crates/codegen/xai-grok-pager-pty-harness/tests/pty_e2e/`:
`scroll_anchor_holds_parked_marker_during_live_stream.rs` and
`wheel_burst_scrolls_viewport_without_frame_amplification.rs`. Those reference
tests are marked ignored; AX does not claim to have run them. The reviewed
ideas are visible-marker anchoring during below-viewport updates and bounded
synchronized repaint counts after real wheel input. No Rust source or external
runtime dependency was copied. AX's tests execute on macOS/Linux with a Python
standard-library PTY driver and the public Node renderer, including input,
stream-update, resize, and shutdown assertions. The narrow ASCII screen decoder
is a fixture utility, not a general terminal emulator. Windows retains native
buffer regressions; this harness makes no ConPTY compatibility claim.

The maintained native interface is now ABI 2: checked buffer resize reports
allocation failure and preserves existing storage. All supported binaries are
rebuilt from the corresponding local source and recorded in the manifest.
Version 1.0.1 supplies this interface without changing the immutable v1.0.0 release assets.
