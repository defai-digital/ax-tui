import { describe, expect, test, vi } from "vitest"
import { ManualClock } from "../src/testing/manual-clock.js"

describe("ManualClock", () => {
  test("a zero-delay interval fires once per advance instead of looping forever", () => {
    const clock = new ManualClock()
    const fn = vi.fn()
    clock.setInterval(fn, 0)

    clock.advance(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(clock.now()).toBe(1)

    clock.advance(1)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test("other timers due in the same advance still fire after a zero-delay interval", () => {
    const clock = new ManualClock()
    const order: string[] = []
    clock.setInterval(() => order.push("interval"), 0)
    clock.setTimeout(() => order.push("timeout"), 1)

    clock.advance(5)

    expect(order).toEqual(["interval", "timeout"])
    expect(clock.now()).toBe(5)
  })
})
