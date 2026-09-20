# Changelog

All notable changes to ax-tui are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Breaking changes are called out explicitly when they occur.

## [1.0.3] - 2026-09-20

### Fixed

- Preserve overflow direction when clamping infinite renderer values, while
  safely handling `NaN` and invalid numeric table widths.

### Changed

- Consolidate internal numeric bounds, table fitting, and keyboard modifier
  decoding without changing the public API.

## [1.0.2] - 2026-09-18

### Fixed

- Move existing inline Solid text nodes without duplicating them during keyed
  reordering or reparenting.
- Preserve completed child animations when resuming a parent timeline, and
  complete finite animations without waiting through a final loop delay when
  no completion callback is registered.
- Honor one-shot keyboard and paste listeners, including reentrant dispatch,
  and preserve the event emitter as the listener receiver.
- Emit empty syntax-highlight responses after edits and resets so consumers
  can clear highlights when the final highlighted token is removed.

## [1.0.1] - 2026-09-18

### Fixed

- Replace and remove reactive Solid text styles without retaining stale colors
  or attributes; preserve intrinsic tag styles. Append nodes when an insertion
  anchor has disappeared, including within inline text.
- Keep paused timelines from advancing children, reject cyclic synchronization,
  bound child progress to the parent duration, and refresh live rendering when
  attaching the engine or synchronizing a running child.
- Fold edits into pending parser resets using the latest content, discard
  superseded queued edits, and retire failed workers so initialization can retry.

- Make native buffer resize atomic on allocation failure and report failure to
  TypeScript. Reject overflowing dimensions and undersized grayscale/border
  arrays before native access. Native ABI 2 is required for checked resize.
- Preserve Unicode grapheme clusters, color intent, and row endings in captured
  frames, including wide characters at the right edge.
- Keep tree-sitter timers and queued edits isolated per client; cancel removed
  buffers before disposal, clear acknowledged timeouts, and ignore stale parser
  initialization responses. Cancelled debounce promises reject with AbortError.
- Reject malformed percentages, non-finite layout values, and invalid frame
  rates. Preserve large overlapping objects during viewport culling.
- Key parser caches by SHA-256 of the full source URL, commit downloads
  atomically, and bound network downloads to 64 MiB and 30 seconds.

### Performance

- Allocate captured colors once per span and use an ASCII capture fast path.
  A fixed 120 by 40 ASCII frame benchmark on macOS arm64 / Node 26.5.0 improved
  from 1.75 ms to 0.088 ms median per capture. This measures span capture only;
  it is not an application-wide rendering benchmark.

### Validation

- Add Linux, macOS, and Windows CI for source checking, artifact freshness,
  native runtime integration, and regressions. Release asset publication now
  waits for these gates. Keep checkout and compiler line endings deterministic.

### Changed

- Move the remaining inline widget-build and release-validation JavaScript
  into TypeScript maintenance scripts checked by TypeScript 7.

- Complete native interface separation: AX-owned library filenames, ABI
  version verification, native Yoga creation, notifications, diagnostics,
  and debug tool names. No OpenTUI native library is loaded or accepted.
- Move the former `OPENTUI_*` terminal overrides to `AX_CODE_TUI_*` names.
  Existing AX settings remain unchanged. Two deprecated TypeScript Yoga
  methods forward to AX TUI for application compatibility.
- Verify source, generated runtime, package dependencies, and native build
  configuration for accidental upstream coupling with `check:independence`.
  Historical MIT source attribution remains intact.

Version 1.0.1 supplies the matching ABI 2 native assets; published v1.0.0 assets remain immutable.

## [1.0.0] - 2026-09-18

### Changed

- Absorb the OpenTUI 0.4.1 renderer, Solid reconciler, and Zig/C source into an
  independently maintained AX TUI source fork, preserving MIT attribution.
  TypeScript 7 now checks and builds every JavaScript runtime entry from owned
  TypeScript/TSX. Generated artifacts remain committed for package consumers.
- Build all eight native targets from local source with Zig 0.15.2, recording
  source hashes and compiler configuration instead of downloading OpenTUI
  npm platform packages. Native ABI names remain compatible.
- Default configuration and data paths now use the `ax-tui` namespace instead
  of `opentui`. Applications can retain an explicit custom name; existing
  default-path files are not moved automatically.

### Fixed

- Prevent chart rasterization from hanging or overflowing when finite axis
  bounds approach JavaScript's numeric limits; reject invalid pixel endpoints.
- Apply individual X/Y axis colors to their corresponding chart lines.
- Include `stdinParserTimeoutMs` in the generated renderer configuration type.

### Validation

- Add FFI and terminal-input regressions, local native build verification,
  and end-to-end Solid reactivity, disposal, highlighting, and cache checks.

## [0.1.6] - 2026-09-17

### Fixed

- Raise the stdin parser's pending-escape-sequence timeout from 20ms to
  100ms (configurable via `CliRendererConfig.stdinParserTimeoutMs`).
  Under real load, a terminal reply (cursor position report, palette query,
  Kitty keyboard negotiation) can arrive across two separate stdin reads
  more than 20ms apart. When the old timeout fired mid-sequence, the parser
  forgot it was mid-sequence and re-parsed the second half's bytes as
  literal printable keystrokes into whatever had focus -- visible as stray
  fragments like `29H` or `[0;0;0m` landing in the chat input or
  transcript. 100ms matches vim's `ttimeoutlen` default for the same class
  of problem.
- Narrow `ChartRenderable.datasets` getter to return `readonly Dataset[]`
  instead of `readonly Dataset[] | undefined`. The constructor and setter
  already coerce `undefined` to `[]`, so the runtime value is always an
  array; the previous type leaked the input shape and forced downstream
  consumers to add non-null assertions.

## [0.1.5] - 2026-09-14

### Changed

- Upgrade development type checking and spinner/chart builds to the official
  Go-based TypeScript 7.0.2 compiler. The generated JavaScript and declarations
  remain unchanged; the Solid transform still uses Babel and the native
  renderer ABI is unchanged. No Go toolchain is required for installation.

## [0.1.4] - 2026-09-12

### Fixed

- Chart renderables (sparkline, gauge, bar chart, cartesian chart) recompute
  their layout on every frame again. The 0.1.3 memoization served stale frames
  when data was mutated in place through the live `data`/`datasets`
  references without a `requestRender` — despite the 0.1.3 notes claiming no
  behavior change. The single-pass auto-bounds computation stays.
- Add the missing chart update accessors (`barColor`; gauge
  `labelColor`/`backgroundColor`; `showValues`/`showLabels` and bar chart
  `backgroundColor`; `hiddenLegendConstraints` and chart `backgroundColor`).
  The Solid reconciler assigns props directly, so without a setter these
  updates were silently dropped into inert own-properties and never rendered.

## [0.1.3] - 2026-09-07

### Performance

- Memoize chart layouts in the sparkline, gauge, bar chart, and cartesian chart
  renderables and compute auto-bounds in a single pass. A static chart no
  longer re-layouts or re-parses cell colors on every frame while unrelated
  renderables elsewhere in the tree animate. No behavior change.

## [0.1.2] - 2026-09-05

### Documentation

- Publish a real JSR overview page: the package readme is the JSR readme source
  and the entrypoints carry `@module` documentation.
- Record the chart widgets PRD, ADR, and tech spec in the AX Code monorepo.

## [0.1.1] - 2026-09-05

### Added

- Chart widgets: `ax-tui/chart` and `ax-tui/chart/solid` (TypeScript sources
  plus committed dist output) with JSR documentation and types.
- Verified native asset delivery: the JSR package ships JavaScript and type
  declarations only; native renderer libraries are published as version-pinned
  GitHub release assets and verified against `vendor/manifest.json` before the
  JSR package goes out.

### Fixed

- JSR self imports now map to local exports instead of falling back to npm
  lookups.
- Hardened maintenance scripts and spinner interval validation.

## [0.1.0] - 2026-09-05

Initial standalone release of the ax-tui package on JSR. The 0.1.0 registry
build was unusable and is superseded by 0.1.1.
