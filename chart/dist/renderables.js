import { Renderable, parseColor } from "ax-tui";
import { layoutSparkline } from "./sparkline.js";
import { layoutGauge } from "./gauge.js";
import { layoutBarChart } from "./barchart.js";
import { layoutChart, validateChartOptions } from "./chart.js";
function paintCells(buffer, cells, offsetX, offsetY, defaultFg) {
    for (const cell of cells) {
        buffer.drawText(cell.char, offsetX + cell.x, offsetY + cell.y, parseColor(cell.fg ?? defaultFg), parseColor(cell.bg ?? "transparent"));
    }
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
function memoLayout(cache, layout, width, height) {
    if (cache !== null && cache.width === width && cache.height === height) {
        return { cache, cells: cache.cells };
    }
    const cells = layout();
    return { cache: { width, height, cells }, cells };
}
/** Compact sparkline chart renderable. */
export class SparklineRenderable extends Renderable {
    _layout;
    _cache = null;
    constructor(ctx, options) {
        super(ctx, options);
        this._layout = {
            data: options.data ?? [],
            max: options.max,
            direction: options.direction,
            color: options.color,
            barColor: options.barColor,
            backgroundColor: options.backgroundColor,
        };
        this.width = options.width ?? "100%";
        this.height = options.height ?? 1;
    }
    get data() {
        return this._layout.data;
    }
    set data(value) {
        this._layout.data = value ?? [];
        this.requestRender();
    }
    get max() {
        return this._layout.max;
    }
    set max(value) {
        this._layout.max = value;
        this.requestRender();
    }
    get direction() {
        return this._layout.direction;
    }
    set direction(value) {
        this._layout.direction = value;
        this.requestRender();
    }
    get color() {
        return this._layout.color;
    }
    set color(value) {
        this._layout.color = value;
        this.requestRender();
    }
    get backgroundColor() {
        return this._layout.backgroundColor;
    }
    set backgroundColor(value) {
        this._layout.backgroundColor = value;
        this.requestRender();
    }
    renderSelf(buffer) {
        if (!this.visible)
            return;
        const { cache, cells } = memoLayout(this._cache, () => layoutSparkline(this._layout, this.width, this.height), this.width, this.height);
        this._cache = cache;
        paintCells(buffer, cells, this.x, this.y, "white");
    }
    requestRender() {
        this._cache = null;
        super.requestRender();
    }
}
/** Horizontal gauge renderable. */
export class GaugeRenderable extends Renderable {
    _layout;
    _cache = null;
    constructor(ctx, options) {
        super(ctx, options);
        this._layout = {
            ratio: options.ratio,
            label: options.label,
            color: options.color,
            labelColor: options.labelColor,
            backgroundColor: options.backgroundColor,
            unicode: options.unicode,
        };
        this.width = options.width ?? "100%";
        this.height = options.height ?? 1;
    }
    get ratio() {
        return this._layout.ratio;
    }
    set ratio(value) {
        this._layout.ratio = value;
        this.requestRender();
    }
    get label() {
        return this._layout.label;
    }
    set label(value) {
        this._layout.label = value;
        this.requestRender();
    }
    get color() {
        return this._layout.color;
    }
    set color(value) {
        this._layout.color = value;
        this.requestRender();
    }
    get unicode() {
        return this._layout.unicode;
    }
    set unicode(value) {
        this._layout.unicode = value;
        this.requestRender();
    }
    renderSelf(buffer) {
        if (!this.visible)
            return;
        const { cache, cells } = memoLayout(this._cache, () => layoutGauge(this._layout, this.width, this.height), this.width, this.height);
        this._cache = cache;
        paintCells(buffer, cells, this.x, this.y, "white");
    }
    requestRender() {
        this._cache = null;
        super.requestRender();
    }
}
/** Bar-chart renderable. */
export class BarChartRenderable extends Renderable {
    _layout;
    _cache = null;
    constructor(ctx, options) {
        super(ctx, options);
        this._layout = {
            data: options.data ?? [],
            barWidth: options.barWidth,
            barGap: options.barGap,
            max: options.max,
            showValues: options.showValues,
            showLabels: options.showLabels,
            color: options.color,
            backgroundColor: options.backgroundColor,
        };
        this.width = options.width ?? "100%";
        this.height = options.height ?? 8;
    }
    get data() {
        return this._layout.data;
    }
    set data(value) {
        this._layout.data = value ?? [];
        this.requestRender();
    }
    get barWidth() {
        return this._layout.barWidth;
    }
    set barWidth(value) {
        this._layout.barWidth = value;
        this.requestRender();
    }
    get barGap() {
        return this._layout.barGap;
    }
    set barGap(value) {
        this._layout.barGap = value;
        this.requestRender();
    }
    get max() {
        return this._layout.max;
    }
    set max(value) {
        this._layout.max = value;
        this.requestRender();
    }
    get color() {
        return this._layout.color;
    }
    set color(value) {
        this._layout.color = value;
        this.requestRender();
    }
    renderSelf(buffer) {
        if (!this.visible)
            return;
        const { cache, cells } = memoLayout(this._cache, () => layoutBarChart(this._layout, this.width, this.height), this.width, this.height);
        this._cache = cache;
        paintCells(buffer, cells, this.x, this.y, "white");
    }
    requestRender() {
        this._cache = null;
        super.requestRender();
    }
}
/** Cartesian chart renderable with axes, legend, and markers. */
export class ChartRenderable extends Renderable {
    _layout;
    _cache = null;
    constructor(ctx, options) {
        super(ctx, options);
        validateChartOptions(options);
        this._layout = {
            datasets: options.datasets ?? [],
            xAxis: options.xAxis,
            yAxis: options.yAxis,
            legendPosition: options.legendPosition,
            hiddenLegendConstraints: options.hiddenLegendConstraints,
            color: options.color,
            backgroundColor: options.backgroundColor,
        };
        this.width = options.width ?? "100%";
        this.height = options.height ?? 10;
    }
    get datasets() {
        return this._layout.datasets;
    }
    set datasets(value) {
        this._layout.datasets = value ?? [];
        this.requestRender();
    }
    get xAxis() {
        return this._layout.xAxis;
    }
    set xAxis(value) {
        validateChartOptions({ xAxis: value });
        this._layout.xAxis = value;
        this.requestRender();
    }
    get yAxis() {
        return this._layout.yAxis;
    }
    set yAxis(value) {
        validateChartOptions({ yAxis: value });
        this._layout.yAxis = value;
        this.requestRender();
    }
    get legendPosition() {
        return this._layout.legendPosition;
    }
    set legendPosition(value) {
        this._layout.legendPosition = value;
        this.requestRender();
    }
    get color() {
        return this._layout.color;
    }
    set color(value) {
        this._layout.color = value;
        this.requestRender();
    }
    renderSelf(buffer) {
        if (!this.visible)
            return;
        const { cache, cells } = memoLayout(this._cache, () => layoutChart(this._layout, this.width, this.height), this.width, this.height);
        this._cache = cache;
        paintCells(buffer, cells, this.x, this.y, "white");
    }
    requestRender() {
        this._cache = null;
        super.requestRender();
    }
}
