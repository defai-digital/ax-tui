import { spawnSync } from "node:child_process"
import { expect, test } from "vitest"

const supportsFfi = spawnSync(process.execPath, ["--experimental-ffi", "-e", "require('node:ffi')"]).status === 0

test.skipIf(!supportsFfi)(
  "native captures preserve graphemes, row boundaries, color intent and resized storage",
  () => {
    const result = spawnSync(
      process.execPath,
      [
        "--experimental-ffi",
        "--disable-warning=ExperimentalWarning",
        "--input-type=module",
        "-e",
        `
import assert from "node:assert/strict"
import { OptimizedBuffer, RGBA } from "ax-tui"
const fg = RGBA.fromIndex(1)
const bg = RGBA.defaultBackground()
for (const method of ["unicode", "wcwidth"]) {
  for (const line of ["界", "e\\u0301", "👩‍💻", "😀"]) {
    const buffer = OptimizedBuffer.create(12, 2, method)
    try {
      buffer.clear(bg)
      buffer.drawText(line, 0, 0, fg, bg)
      buffer.drawText("end", 0, 1, fg, bg)
      const bytes = new TextDecoder().decode(buffer.getRealCharBytes(true))
      const spans = buffer.getSpanLines()
      assert.equal(spans.map(row => row.spans.map(span => span.text).join("")).join("\\n") + "\\n", bytes)
      assert.ok(spans[0].spans.map(span => span.text).join("").startsWith(line))
      assert.equal(spans[0].spans.reduce((n, span) => n + span.width, 0), 12)
      assert.equal(spans[0].spans[0].fg.intent, "indexed")
      assert.equal(spans[0].spans[0].bg.intent, "default")
      const oldCapture = spans[0].spans[0].fg.toInts()
      buffer.clear(RGBA.fromHex("#fff"))
      assert.deepEqual(spans[0].spans[0].fg.toInts(), oldCapture)
      for (let i = 0; i < 100; i++) {
        buffer.resize(10 + i % 3, 2 + i % 2)
        assert.equal(buffer.buffers.char.length, buffer.width * buffer.height)
        buffer.drawText("ok", 0, 0, fg)
        assert.ok(buffer.getSpanLines()[0].spans.map(span => span.text).join("").startsWith("ok"))
      }
    } finally { buffer.destroy() }
  }
}
const narrow = OptimizedBuffer.create(2, 2, "unicode")
try {
  narrow.drawText("界", 0, 0, fg)
  narrow.drawText("界", 0, 1, fg)
  assert.equal(new TextDecoder().decode(narrow.getRealCharBytes(true)), "界\\n界\\n")
  narrow.drawText("e\\u0301e\\u0301", 0, 0, fg)
  narrow.drawText("e\\u0301e\\u0301", 0, 1, fg)
  assert.equal(new TextDecoder().decode(narrow.getRealCharBytes(true)), "e\\u0301e\\u0301\\ne\\u0301e\\u0301\\n")
  assert.throws(() => narrow.drawGrayscaleBuffer(0, 0, new Float32Array(1), 2, 2), RangeError)
  assert.throws(() => narrow.resize(65536, 65536), RangeError)
  narrow.drawGrayscaleBuffer(-2147483648, -2147483648, new Float32Array(4), 2, 2)
  narrow.drawGrayscaleBuffer(0, 0, new Float32Array([NaN, Infinity, -Infinity, 1]), 2, 2)
} finally { narrow.destroy() }
console.log("Native buffer regression passed")
`,
      ],
      { encoding: "utf8", timeout: 20_000 },
    )
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
    expect(result.stdout).toContain("Native buffer regression passed")
  },
  25_000,
)
