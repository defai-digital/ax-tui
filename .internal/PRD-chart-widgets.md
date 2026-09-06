# PRD: Chart Widgets for ax-tui

Status: approved (autonomous mode decision frame recorded 2026-09-05)
Owner: ax-tui maintainers
Related: `.internal/ADR-0001-chart-widgets-package.md`, `.internal/TECH-SPEC-chart-widgets.md`

## Problem

ax-tui has no data-visualization primitives. ratatui (the reference Rust TUI
library) ships `Chart`, `BarChart`, `Sparkline`, `Gauge`/`LineGauge`, and
`Canvas`. Verified gap: the exported renderable set (`renderables/index.d.ts`)
and the Solid intrinsic allowlist (`script/tui-surface.ts`) contain no chart,
graph, plot, sparkline, axis, or dataset surface.

Terminal dashboards built on ax-tui (agent token usage, CI metrics, system
monitors) currently must hand-roll text tables or import foreign chart libs
that do not integrate with the renderable tree.

## Goals

1. Ship a `chart/` package (subpath exports `ax-tui/chart` and
   `ax-tui/chart/solid`) mirroring the proven `spinner/` package pattern.
2. Faithfully port ratatui v0.30.2 rendering semantics for: Sparkline, Gauge,
   BarChart (vertical), and Chart (datasets, markers, axes, legend).
3. Provide a braille (2x4 dots/cell) grid substrate reusable by a future
   Canvas widget.
4. Deterministic, headless-testable rendering: pure layout functions produce
   cell lists; tests assert exact frames without a native renderer.

## Non-goals (v1)

- `Canvas` widget with arbitrary shapes (Circle/Rectangle/Map) — v2; the grid
  substrate is designed to support it.
- `LineGauge`, horizontal `BarChart`, bar groups, `GraphType::Area` /
  `fill_to_y`, Quadrant/Sextant/Octant/HalfBlock markers — v2.
- Axis label collision avoidance beyond ratatui's own behavior (ratatui itself
  punts; we match it).
- Auto-generated axis tick labels (plotext-style rulers) — v2 candidate.
- Animation/interactivity (hover, zoom) — none.
- Any change to the vendored renderer snapshot or native libraries.

## Users and scenarios

- CLI dashboards: `<sparkline data={latencies} />` in a status bar.
- Agent TUIs: token/cost usage over time via `<chart>` with braille lines.
- Progress display: `<gauge ratio={done/total} />`.
- Comparisons: `<barchart data={counts} />`.

## Requirements

### Functional

- R1 Sparkline: multi-row block-element rendering, 8 ticks per cell, explicit
  or auto max, left-to-right / right-to-left direction, missing (non-finite)
  values render as gaps.
- R2 Gauge: ratio 0..1 (clamped), default `NN%` label (suppressible,
  overridable), centered label, optional unicode eighth-block partial fill.
- R3 BarChart: vertical bars, barWidth/barGap, value labels overlaid on the
  bar bottom row (ratatui placement rules), bar labels below, explicit or auto
  max, per-bar colors.
- R4 Chart: datasets with `graphType` line/scatter/bar, markers
  dot/block/braille, explicit axis bounds (required when an axis object is
  given; auto-derived from data when axes are omitted), optional axis labels
  and titles, axis lines drawn only when the corresponding axis has labels
  (ratatui rule), legend with auto-hide, line interpolation via
  Cohen-Sutherland clipping + integer Bresenham in pixel space.
- R5 Solid intrinsics `<sparkline>`, `<gauge>`, `<barchart>`, `<chart>`
  registered via `extend()` with prop-based configuration (no children).
- R6 All widgets accept `width`/`height` layout options and sensible defaults.

### Robustness (edge-case contract, from external design review)

- E1 Zero width or height renders nothing, never throws.
- E2 Non-finite (NaN/Infinity) data points are skipped; the rest renders.
- E3 Empty datasets render axes/labels/legend frame but zero data marks.
- E4 Reversed or degenerate bounds (min >= max) render no data, no throw.
- E5 Out-of-bounds points are clipped/dropped silently (ratatui behavior).
- E6 1x1 and 2x2 areas: data-only rendering; axes/labels/legend omitted when
  they do not fit.
- E7 Gauge ratio is clamped to [0,1]; NaN treated as 0.
- E8 Sparkline/BarChart max <= 0 renders empty bars, never divides by zero.
- E9 Braille cells with colliding datasets: last-write-wins color per cell
  (ratatui has one fg per braille cell); documented and tested.

### Quality

- Q1 `pnpm test`, `pnpm run typecheck`, `pnpm run check` all pass.
- Q2 `chart/dist` committed and verified fresh by a `check:chart-dist` gate
  mirroring `check:spinner-dist`.
- Q3 npm `files` and JSR `publish.include` allowlists updated; package
  integrity test covers the new exports.
- Q4 Pure layout modules have zero runtime dependency on `ax-tui` (only
  type-only imports), so they unit-test without native libraries.

## Success metrics

- Frame-exact tests for every widget and every edge case E1-E9.
- A consumer can render `<chart>` with two braille datasets, axes, and legend
  in under 15 lines of TSX.
- No modifications to vendored snapshot files; `pnpm run check:patches` stays
  green untouched.

## Review trail

- Requested reviewers: DeepSeek (deepseek-v4-pro) and GLM-5.3 via
  ax-trust.defai.digital. Both council fan-out attempts failed provider-side
  (empty error after 3 retries; `deepseek` provider disabled, GLM collided on
  the same failing provider). Recorded in global memory
  `ensemble-provider-availability`.
- Fallback external review: single-member council claude-code/claude-sonnet-5
  (13 observations, all triaged into this PRD / the ADR): bounds contract,
  non-finite filtering, zero-size guards, 1x1 policy, empty-dataset policy,
  label-overlap punt, composable chart stages, shared coordinate mapping
  parameterized by marker resolution, edge-case fixtures first, Canvas
  explicitly out of scope, shared block-glyph module, BrailleGrid exported as
  a documented utility (not a separate subpath), braille color-collision
  policy.
- ratatui v0.30.2 source study (scout report) is the algorithmic reference;
  key corrections vs older docs: row-major braille bit layout, axis lines only
  with labels, value labels on the bar bottom row, legend auto-hide ratios.
