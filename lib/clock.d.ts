/** Timer handle. */
export type TimerHandle = ReturnType<typeof globalThis.setTimeout> | number
/** Clock. */
export interface Clock {
  now(): number
  setTimeout(fn: () => void, delayMs: number): TimerHandle
  clearTimeout(handle: TimerHandle): void
  setInterval(fn: () => void, delayMs: number): TimerHandle
  clearInterval(handle: TimerHandle): void
}
/** System clock class. */
export declare class SystemClock implements Clock {
  now(): number
  setTimeout(fn: () => void, delayMs: number): TimerHandle
  clearTimeout(handle: TimerHandle): void
  setInterval(fn: () => void, delayMs: number): TimerHandle
  clearInterval(handle: TimerHandle): void
}
