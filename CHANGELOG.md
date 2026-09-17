# Changelog

All notable changes to ax-tui are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). ax-tui is pre-1.0
software; breaking changes are called out explicitly when they occur.

## [Unreleased]

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
