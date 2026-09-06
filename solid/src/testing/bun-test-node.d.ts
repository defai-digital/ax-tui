import { after, afterEach, before, beforeEach, describe, test } from "node:test"
export { after as afterAll, afterEach, before as beforeAll, beforeEach, describe, test }
/** It. */
export declare const it: typeof test
/** Expect. */
export declare function expect(received: unknown): {
  readonly not: /*elided*/ any
  toBe(expected: unknown): void
  toBeDefined(): void
  toBeFalsy(): void
  toBeTruthy(): void
  toContain(expected: unknown): void
  toEqual(expected: unknown): void
}
