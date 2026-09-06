import { readFile } from "node:fs/promises"
import { describe, expect, test } from "vitest"

describe("JSR package self imports", () => {
  test("maps every public self import to the local graph instead of npm", async () => {
    const config = JSON.parse(await readFile(new URL("../jsr.json", import.meta.url), "utf8"))
    for (const [subpath, target] of Object.entries(config.exports)) {
      const specifier = subpath === "." ? "ax-tui" : `ax-tui/${subpath.slice(2)}`
      expect(config.imports[specifier], specifier).toBe(target)
    }
  })
})
