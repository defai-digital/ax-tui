import { expect, test } from "vitest"
import { MouseParser } from "../src/lib/parse.mouse.js"

const seq = (value: string): Buffer => Buffer.from(value, "latin1")

test("SGR release untracks only the released button, preserving other drags", () => {
  const parser = new MouseParser()

  expect(parser.parseMouseEvent(seq("\x1b[<0;10;5M"))?.type).toBe("down") // left down
  expect(parser.parseMouseEvent(seq("\x1b[<2;10;5M"))?.type).toBe("down") // right down
  expect(parser.parseMouseEvent(seq("\x1b[<2;10;5m"))?.type).toBe("up") // right up

  // Left button is still held: motion with the left button must stay a drag.
  const motion = parser.parseMouseEvent(seq("\x1b[<32;11;5M"))
  expect(motion?.type).toBe("drag")
})

test("SGR releasing the last held button ends the drag", () => {
  const parser = new MouseParser()

  parser.parseMouseEvent(seq("\x1b[<0;10;5M")) // left down
  parser.parseMouseEvent(seq("\x1b[<0;10;5m")) // left up

  const motion = parser.parseMouseEvent(seq("\x1b[<32;11;5M"))
  expect(motion?.type).toBe("move")
})

test("SGR button-agnostic motion reports the codified button values per encoding", () => {
  const parser = new MouseParser()

  // 35 = motion (32) + "no button" (3), e.g. hover with any-button tracking.
  // SGR maps the no-button code to 0 (established stdin-parser contract).
  const hover = parser.parseMouseEvent(seq("\x1b[<35;10;5M"))
  expect(hover?.type).toBe("move")
  expect(hover?.button).toBe(0)

  // X10/basic encoding of the same event: ESC [ M <67> <x+33> <y+33>.
  const basicHover = parser.parseMouseEvent(seq("\x1b[MC" + String.fromCharCode(33 + 9) + String.fromCharCode(33 + 4)))
  expect(basicHover?.type).toBe("move")
  expect(basicHover?.button).toBe(-1)
  expect(hover?.x).toBe(basicHover?.x)
  expect(hover?.y).toBe(basicHover?.y)
})
