import { Renderable, parseColor } from "ax-tui"
import type { OptimizedBuffer, RenderContext, RenderableOptions } from "ax-tui"
import type { Cell } from "./cells.js"
import { layoutSparkline, type SparklineLayoutOptions } from "./sparkline.js"
import { layoutGauge, type GaugeLayoutOptions } from "./gauge.js"
import { layoutBarChart, type BarChartLayoutOptions } from "./barchart.js"
import { layoutChart, validateChartOptions, type AxisOptions, type ChartLayoutOptions } from "./chart.js"
import type { ColorInput } from "./types.js"

function paintCells(
  buffer: OptimizedBuffer,
  cells: readonly Cell[],
  offsetX: number,
  offsetY: number,
  defaultFg: ColorInput,
): void {
  for (const cell of cells) {
    buffer.drawText(
      cell.char,
      offsetX + cell.x,
      offsetY + cell.y,
      parseColor(cell.fg ?? defaultFg),
      parseColor(cell.bg ?? "transparent"),
    )
  }
}

/**
 * Cached result of a pure layout function.
 */
interface LayoutCache {
  width: number
  height: number
  cells: Cell[]
}

/**
 * Memoize a pure layout function keyed on the resolved render dimensions.
 *
 * The chart layout functions are pure: their output depends only on their
 * options and the render dimensions, and each call allocates a fresh `Cell[]`
 * (plus, for `layoutChart`, a grid per dataset). Calling them on every render
 * frame is wasted work whenever an unrelated renderable elsewhere in the tree
 * is animating — a common case in a TUI that always has spinners or streaming
 * text running. Caching the result avoids the re-layout and the per-cell
 * `parseColor` churn it triggers in `paintCells`.
 *
 * Invalidation is two-fold and both halves are required for correctness:
 * - Data/set-option changes call `requestRender()`, which the renderables
 *   override to clear the cache before delegating to the base class.
 * - Resizes may not go through `requestRender()`, so the resolved width/height
 *   are compared on every render and the cache is rebuilt on a mismatch.
 */
function memoLayout(
  cache: LayoutCache | null,
  layout: () => Cell[],
  width: number,
  height: number,
): { cache: LayoutCache; cells: Cell[] } {
  if (cache !== null && cache.width === width && cache.height === height) {
    return { cache, cells: cache.cells }
  }
  const cells = layout()
  return { cache: { width, height, cells }, cells }
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

/** Sparkline options. */
export interface SparklineOptions extends RenderableOptions<SparklineRenderable>, SparklineLayoutOptions {}

/** Compact sparkline chart renderable. */
export class SparklineRenderable extends Renderable {
  private _layout: SparklineLayoutOptions
  private _cache: LayoutCache | null = null

  constructor(ctx: RenderContext, options: SparklineOptions) {
    super(ctx, options)
    this._layout = {
      data: options.data ?? [],
      max: options.max,
      direction: options.direction,
      color: options.color,
      barColor: options.barColor,
      backgroundColor: options.backgroundColor,
    }
    this.width = options.width ?? "100%"
    this.height = options.height ?? 1
  }

  get data(): readonly (number | null | undefined)[] {
    return this._layout.data
  }

  set data(value: readonly (number | null | undefined)[]) {
    this._layout.data = value ?? []
    this.requestRender()
  }

  get max(): number | undefined {
    return this._layout.max
  }

  set max(value: number | undefined) {
    this._layout.max = value
    this.requestRender()
  }

  get direction(): "ltr" | "rtl" | undefined {
    return this._layout.direction
  }

  set direction(value: "ltr" | "rtl" | undefined) {
    this._layout.direction = value
    this.requestRender()
  }

  get color(): ColorInput | undefined {
    return this._layout.color
  }

  set color(value: ColorInput | undefined) {
    this._layout.color = value
    this.requestRender()
  }

  get backgroundColor(): ColorInput | undefined {
    return this._layout.backgroundColor
  }

  set backgroundColor(value: ColorInput | undefined) {
    this._layout.backgroundColor = value
    this.requestRender()
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    if (!this.visible) return
    const { cache, cells } = memoLayout(
      this._cache,
      () => layoutSparkline(this._layout, this.width, this.height),
      this.width,
      this.height,
    )
    this._cache = cache
    paintCells(buffer, cells, this.x, this.y, "white")
  }

  override requestRender(): void {
    this._cache = null
    super.requestRender()
  }
}

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------

/** Gauge options. */
export interface GaugeOptions extends RenderableOptions<GaugeRenderable>, GaugeLayoutOptions {}

/** Horizontal gauge renderable. */
export class GaugeRenderable extends Renderable {
  private _layout: GaugeLayoutOptions
  private _cache: LayoutCache | null = null

  constructor(ctx: RenderContext, options: GaugeOptions) {
    super(ctx, options)
    this._layout = {
      ratio: options.ratio,
      label: options.label,
      color: options.color,
      labelColor: options.labelColor,
      backgroundColor: options.backgroundColor,
      unicode: options.unicode,
    }
    this.width = options.width ?? "100%"
    this.height = options.height ?? 1
  }

  get ratio(): number | undefined {
    return this._layout.ratio
  }

  set ratio(value: number | undefined) {
    this._layout.ratio = value
    this.requestRender()
  }

  get label(): string | null | undefined {
    return this._layout.label
  }

  set label(value: string | null | undefined) {
    this._layout.label = value
    this.requestRender()
  }

  get color(): ColorInput | undefined {
    return this._layout.color
  }

  set color(value: ColorInput | undefined) {
    this._layout.color = value
    this.requestRender()
  }

  get unicode(): boolean | undefined {
    return this._layout.unicode
  }

  set unicode(value: boolean | undefined) {
    this._layout.unicode = value
    this.requestRender()
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    if (!this.visible) return
    const { cache, cells } = memoLayout(
      this._cache,
      () => layoutGauge(this._layout, this.width, this.height),
      this.width,
      this.height,
    )
    this._cache = cache
    paintCells(buffer, cells, this.x, this.y, "white")
  }

  override requestRender(): void {
    this._cache = null
    super.requestRender()
  }
}

// ---------------------------------------------------------------------------
// BarChart
// ---------------------------------------------------------------------------

/** Bar chart options. */
export interface BarChartOptions extends RenderableOptions<BarChartRenderable>, BarChartLayoutOptions {}

/** Bar-chart renderable. */
export class BarChartRenderable extends Renderable {
  private _layout: BarChartLayoutOptions
  private _cache: LayoutCache | null = null

  constructor(ctx: RenderContext, options: BarChartOptions) {
    super(ctx, options)
    this._layout = {
      data: options.data ?? [],
      barWidth: options.barWidth,
      barGap: options.barGap,
      max: options.max,
      showValues: options.showValues,
      showLabels: options.showLabels,
      color: options.color,
      backgroundColor: options.backgroundColor,
    }
    this.width = options.width ?? "100%"
    this.height = options.height ?? 8
  }

  get data(): BarChartLayoutOptions["data"] {
    return this._layout.data
  }

  set data(value: BarChartLayoutOptions["data"]) {
    this._layout.data = value ?? []
    this.requestRender()
  }

  get barWidth(): number | undefined {
    return this._layout.barWidth
  }

  set barWidth(value: number | undefined) {
    this._layout.barWidth = value
    this.requestRender()
  }

  get barGap(): number | undefined {
    return this._layout.barGap
  }

  set barGap(value: number | undefined) {
    this._layout.barGap = value
    this.requestRender()
  }

  get max(): number | undefined {
    return this._layout.max
  }

  set max(value: number | undefined) {
    this._layout.max = value
    this.requestRender()
  }

  get color(): ColorInput | undefined {
    return this._layout.color
  }

  set color(value: ColorInput | undefined) {
    this._layout.color = value
    this.requestRender()
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    if (!this.visible) return
    const { cache, cells } = memoLayout(
      this._cache,
      () => layoutBarChart(this._layout, this.width, this.height),
      this.width,
      this.height,
    )
    this._cache = cache
    paintCells(buffer, cells, this.x, this.y, "white")
  }

  override requestRender(): void {
    this._cache = null
    super.requestRender()
  }
}

// ---------------------------------------------------------------------------
// Chart
// ---------------------------------------------------------------------------

/** Chart options. */
export interface ChartOptions extends RenderableOptions<ChartRenderable>, ChartLayoutOptions {}

/** Cartesian chart renderable with axes, legend, and markers. */
export class ChartRenderable extends Renderable {
  private _layout: ChartLayoutOptions
  private _cache: LayoutCache | null = null

  constructor(ctx: RenderContext, options: ChartOptions) {
    super(ctx, options)
    validateChartOptions(options)
    this._layout = {
      datasets: options.datasets ?? [],
      xAxis: options.xAxis,
      yAxis: options.yAxis,
      legendPosition: options.legendPosition,
      hiddenLegendConstraints: options.hiddenLegendConstraints,
      color: options.color,
      backgroundColor: options.backgroundColor,
    }
    this.width = options.width ?? "100%"
    this.height = options.height ?? 10
  }

  get datasets(): ChartLayoutOptions["datasets"] {
    return this._layout.datasets
  }

  set datasets(value: ChartLayoutOptions["datasets"]) {
    this._layout.datasets = value ?? []
    this.requestRender()
  }

  get xAxis(): AxisOptions | undefined {
    return this._layout.xAxis
  }

  set xAxis(value: AxisOptions | undefined) {
    validateChartOptions({ xAxis: value })
    this._layout.xAxis = value
    this.requestRender()
  }

  get yAxis(): AxisOptions | undefined {
    return this._layout.yAxis
  }

  set yAxis(value: AxisOptions | undefined) {
    validateChartOptions({ yAxis: value })
    this._layout.yAxis = value
    this.requestRender()
  }

  get legendPosition(): ChartLayoutOptions["legendPosition"] {
    return this._layout.legendPosition
  }

  set legendPosition(value: ChartLayoutOptions["legendPosition"]) {
    this._layout.legendPosition = value
    this.requestRender()
  }

  get color(): ColorInput | undefined {
    return this._layout.color
  }

  set color(value: ColorInput | undefined) {
    this._layout.color = value
    this.requestRender()
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    if (!this.visible) return
    const { cache, cells } = memoLayout(
      this._cache,
      () => layoutChart(this._layout, this.width, this.height),
      this.width,
      this.height,
    )
    this._cache = cache
    paintCells(buffer, cells, this.x, this.y, "white")
  }

  override requestRender(): void {
    this._cache = null
    super.requestRender()
  }
}
