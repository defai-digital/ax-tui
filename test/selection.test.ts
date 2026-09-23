import { describe, expect, test } from "vitest"
import { ASCIIFontSelectionHelper, type LocalSelectionBounds } from "../src/lib/selection.js"

function activeSelection(anchorX: number, anchorY: number, focusX: number, focusY: number): LocalSelectionBounds {
  return { anchorX, anchorY, focusX, focusY, isActive: true }
}

describe("ASCIIFontSelectionHelper", () => {
  test("selects the same cells when dragged right-to-left as left-to-right", () => {
    const forward = new ASCIIFontSelectionHelper(() => "AB", () => "tiny")
    const backward = new ASCIIFontSelectionHelper(() => "AB", () => "tiny")

    forward.onLocalSelectionChanged(activeSelection(0, 0, 100, 0), 10, 5)
    backward.onLocalSelectionChanged(activeSelection(100, 0, 0, 0), 10, 5)

    expect(forward.hasSelection()).toBe(true)
    expect(backward.hasSelection()).toBe(true)
    expect(backward.getSelection()).toEqual(forward.getSelection())
    expect(forward.getSelection()).toEqual({ start: 0, end: 2 })
  })

  test("selects the same cells when dragged bottom-to-top as top-to-bottom", () => {
    const forward = new ASCIIFontSelectionHelper(() => "AB", () => "tiny")
    const backward = new ASCIIFontSelectionHelper(() => "AB", () => "tiny")

    forward.onLocalSelectionChanged(activeSelection(0, 0, 100, 4), 10, 5)
    backward.onLocalSelectionChanged(activeSelection(100, 4, 0, 0), 10, 5)

    expect(forward.hasSelection()).toBe(true)
    expect(backward.hasSelection()).toBe(true)
    expect(backward.getSelection()).toEqual(forward.getSelection())
    expect(forward.getSelection()).toEqual({ start: 0, end: 2 })
  })

  test("a rectangle that only crosses the renderable from below still selects it", () => {
    const helper = new ASCIIFontSelectionHelper(() => "AB", () => "tiny")

    // Anchor is below the box (height 5), focus is above it: the normalized
    // rectangle covers the whole renderable.
    helper.onLocalSelectionChanged(activeSelection(0, 10, 0, 0), 10, 5)

    expect(helper.hasSelection()).toBe(true)
    expect(helper.getSelection()).toEqual({ start: 0, end: 2 })
  })

  test("a rectangle entirely below the renderable does not select it", () => {
    const helper = new ASCIIFontSelectionHelper(() => "AB", () => "tiny")

    helper.onLocalSelectionChanged(activeSelection(0, 10, 0, 8), 10, 5)

    expect(helper.hasSelection()).toBe(false)
  })
})
