import { describe, expect, test, vi } from "vitest"

vi.mock("ax-tui", () => {
  class Renderable {
    ctx: unknown
    width: number | string = 0
    height: number | string = 0
    visible = true
    x = 0
    y = 0

    constructor(ctx: unknown, options?: { width?: number | string; height?: number | string }) {
      this.ctx = ctx
      if (options?.width !== undefined) this.width = options.width
      if (options?.height !== undefined) this.height = options.height
    }

    requestRender() {}
  }

  return {
    Renderable,
    parseColor: (value: unknown) => value,
  }
})

import {
  BarChartRenderable,
  ChartRenderable,
  GaugeRenderable,
  SparklineRenderable,
} from "../chart/src/renderables"

const ctx = {} as never

interface DrawCall {
  char: string
  x: number
  y: number
  fg: unknown
  bg: unknown
}

function createFakeBuffer() {
  const calls: DrawCall[] = []
  return {
    calls,
    drawText(char: string, x: number, y: number, fg: unknown, bg: unknown) {
      calls.push({ char, x, y, fg, bg })
    },
  }
}

function renderSelf(renderable: object, buffer: unknown): void {
  ;(renderable as unknown as { renderSelf(buffer: unknown): void }).renderSelf(buffer)
}

function frameOf(calls: readonly DrawCall[], width: number, height: number): string[] {
  const rows: string[][] = Array.from({ length: height }, () => Array<string>(width).fill(" "))
  for (const call of calls) {
    if (call.x < 0 || call.y < 0 || call.x >= width || call.y >= height) continue
    rows[call.y]![call.x] = call.char
  }
  return rows.map((row) => row.join(""))
}

describe("SparklineRenderable", () => {
  test("defaults to full width and one row", () => {
    const sparkline = new SparklineRenderable(ctx, { data: [1, 2, 3] })
    expect(sparkline.width).toBe("100%")
    expect(sparkline.height).toBe(1)
  })

  test("paints the layout at the renderable offset", () => {
    const sparkline = new SparklineRenderable(ctx, { data: [0, 4, 8], max: 8, width: 3, height: 1 })
    sparkline.x = 2
    sparkline.y = 3
    const buffer = createFakeBuffer()
    renderSelf(sparkline, buffer)
    expect(buffer.calls[0]).toMatchObject({ x: 2, y: 3 })
    expect(buffer.calls.every((call) => call.x >= 2 && call.y === 3)).toBe(true)
  })

  test("produces the expected frame through drawText", () => {
    const sparkline = new SparklineRenderable(ctx, { data: [0, 4, 8], max: 8, width: 3, height: 1 })
    const buffer = createFakeBuffer()
    renderSelf(sparkline, buffer)
    expect(frameOf(buffer.calls, 3, 1)).toEqual([" ▄█"])
  })

  test("skips painting when not visible", () => {
    const sparkline = new SparklineRenderable(ctx, { data: [1], width: 1, height: 1 })
    sparkline.visible = false
    const buffer = createFakeBuffer()
    renderSelf(sparkline, buffer)
    expect(buffer.calls).toHaveLength(0)
  })

  test("setters request a render", () => {
    const sparkline = new SparklineRenderable(ctx, { data: [1], width: 1, height: 1 })
    const spy = vi.spyOn(sparkline, "requestRender")
    sparkline.data = [1, 2]
    sparkline.max = 2
    sparkline.direction = "rtl"
    sparkline.color = "red"
    sparkline.backgroundColor = "blue"
    expect(spy).toHaveBeenCalledTimes(5)
    expect(sparkline.data).toEqual([1, 2])
    expect(sparkline.max).toBe(2)
    expect(sparkline.direction).toBe("rtl")
  })
})

describe("GaugeRenderable", () => {
  test("defaults to full width and one row", () => {
    const gauge = new GaugeRenderable(ctx, { ratio: 0.5 })
    expect(gauge.width).toBe("100%")
    expect(gauge.height).toBe(1)
  })

  test("paints fill and label", () => {
    const gauge = new GaugeRenderable(ctx, { ratio: 0.5, width: 10, height: 1 })
    const buffer = createFakeBuffer()
    renderSelf(gauge, buffer)
    expect(frameOf(buffer.calls, 10, 1)).toEqual(["███50%    "])
  })

  test("ratio setter requests a render", () => {
    const gauge = new GaugeRenderable(ctx, { ratio: 0.5, width: 10, height: 1 })
    const spy = vi.spyOn(gauge, "requestRender")
    gauge.ratio = 0.75
    expect(spy).toHaveBeenCalledTimes(1)
    expect(gauge.ratio).toBe(0.75)
  })
})

describe("BarChartRenderable", () => {
  test("defaults to full width and eight rows", () => {
    const chart = new BarChartRenderable(ctx, { data: [1] })
    expect(chart.width).toBe("100%")
    expect(chart.height).toBe(8)
  })

  test("paints bars and labels", () => {
    const chart = new BarChartRenderable(ctx, {
      data: [{ value: 2, label: "a" }, { value: 4, label: "b" }],
      max: 4,
      width: 3,
      height: 3,
    })
    const buffer = createFakeBuffer()
    renderSelf(chart, buffer)
    expect(frameOf(buffer.calls, 3, 3)).toEqual(["  █", "2 4", "a b"])
  })

  test("data setter requests a render", () => {
    const chart = new BarChartRenderable(ctx, { data: [1], width: 1, height: 1 })
    const spy = vi.spyOn(chart, "requestRender")
    chart.data = [1, 2]
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe("ChartRenderable", () => {
  test("defaults to full width and ten rows", () => {
    const chart = new ChartRenderable(ctx, {})
    expect(chart.width).toBe("100%")
    expect(chart.height).toBe(10)
  })

  test("throws TypeError on invalid axis bounds at construction", () => {
    expect(() => new ChartRenderable(ctx, { xAxis: { bounds: [0, NaN] } })).toThrow(TypeError)
    expect(() => new ChartRenderable(ctx, { yAxis: {} })).toThrow(/finite/)
  })

  test("axis setters validate bounds and request a render", () => {
    const chart = new ChartRenderable(ctx, { width: 5, height: 5 })
    const spy = vi.spyOn(chart, "requestRender")
    expect(() => {
      chart.xAxis = { bounds: [0, Infinity] }
    }).toThrow(TypeError)
    chart.xAxis = { bounds: [0, 10], labels: ["0", "10"] }
    expect(spy).toHaveBeenCalledTimes(1)
    expect(chart.xAxis?.bounds).toEqual([0, 10])
  })

  test("paints a braille line dataset", () => {
    const chart = new ChartRenderable(ctx, {
      datasets: [{ data: [[0, 0], [5, 10]], graphType: "line" }],
      width: 6,
      height: 3,
    })
    const buffer = createFakeBuffer()
    renderSelf(chart, buffer)
    expect(frameOf(buffer.calls, 6, 3)).toEqual(["    ⡠⠊", "  ⡠⠊  ", "⡠⠊    "])
  })

  test("datasets setter requests a render", () => {
    const chart = new ChartRenderable(ctx, { width: 5, height: 5 })
    const spy = vi.spyOn(chart, "requestRender")
    chart.datasets = [{ data: [[0, 0]] }]
    chart.legendPosition = "top-left"
    chart.color = "red"
    expect(spy).toHaveBeenCalledTimes(3)
  })
})
