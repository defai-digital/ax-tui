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

JSR native assets come from AX TUI's matching GitHub release, are verified
against the manifest, and are immutable. Signed downstream bundles verify
native inputs before signing changes the bytes. See `MAINTENANCE.md`.
