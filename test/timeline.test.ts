import { afterEach, expect, test, vi } from "vitest"
import { Timeline, createTimeline, engine } from "../src/animation/Timeline.js"

afterEach(() => {
  engine.clear()
  engine.detach()
})

test("paused parents cannot start a scheduled child", () => {
  const target = { x: 0 }
  const parent = new Timeline({ autoplay: false })
  const child = new Timeline({ autoplay: false }).add(target, { x: 10, duration: 100 })
  parent.sync(child, 10)
  parent.update(50)
  expect(child.isPlaying).toBe(false)
  expect(child.currentTime).toBe(0)
  expect(target.x).toBe(0)
})

test("sync rejects self references and ancestor cycles", () => {
  const a = new Timeline()
  const b = new Timeline()
  expect(() => a.sync(a)).toThrow(/cyc/i)
  a.sync(b)
  expect(() => b.sync(a)).toThrow(/cyc/i)
})

test("attaching the engine activates already running timelines", () => {
  createTimeline()
  const renderer = { setFrameCallback: vi.fn(), removeFrameCallback: vi.fn(), requestLive: vi.fn(), dropLive: vi.fn() }
  engine.attach(renderer as never)
  expect(renderer.requestLive).toHaveBeenCalledOnce()
  engine.detach()
  expect(renderer.dropLive).toHaveBeenCalledOnce()
})

test("parent duration caps child progress and callbacks on an overshooting frame", () => {
  const target = { x: 0 }
  const child = new Timeline({ duration: 1000 }).add(target, { x: 100, duration: 1000 })
  const beyondEnd = vi.fn()
  const parent = new Timeline({ duration: 100 }).sync(child).call(beyondEnd, 150).play()
  parent.update(200)
  expect(parent.currentTime).toBe(100)
  expect(child.currentTime).toBe(100)
  expect(target.x).toBe(10)
  expect(beyondEnd).not.toHaveBeenCalled()
})

test("loop overshoot advances children from the next cycle's origin", () => {
  const target = { x: 0 }
  const child = new Timeline({ duration: 100 }).add(target, { x: 10, duration: 100 })
  const callback = vi.fn()
  const parent = new Timeline({ duration: 100, loop: true }).sync(child).call(callback, 20).play()
  parent.update(125)
  expect(parent.currentTime).toBe(25)
  expect(child.currentTime).toBe(25)
  expect(target.x).toBe(2.5)
  expect(callback).toHaveBeenCalledTimes(2)
  parent.pause()
  parent.update(50)
  expect(child.currentTime).toBe(25)
  parent.play().update(25)
  expect(child.currentTime).toBe(50)
  expect(target.x).toBe(5)
})

test("syncing the only running timeline to a paused parent releases live rendering", () => {
  const child = createTimeline()
  const renderer = { setFrameCallback: vi.fn(), removeFrameCallback: vi.fn(), requestLive: vi.fn(), dropLive: vi.fn() }
  engine.attach(renderer as never)
  expect(renderer.requestLive).toHaveBeenCalledOnce()
  new Timeline({ autoplay: false }).sync(child)
  expect(renderer.dropLive).toHaveBeenCalledOnce()
})
