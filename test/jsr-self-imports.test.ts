import { readFile } from "node:fs/promises"
import { describe, expect, test } from "vitest"

type JsrConfig = {
  exports: Record<string, string>
  imports: Record<string, string>
}

async function readJsrConfig(): Promise<JsrConfig> {
  return JSON.parse(await readFile(new URL("../jsr.json", import.meta.url), "utf8"))
}

function typesPathForExport(target: string): string {
  if (target.endsWith(".ts")) return target
  if (target.endsWith("parser.worker.js")) return "./lib/tree-sitter/parser.worker.d.ts"
  if (target.endsWith(".node.js")) return target.replace(/\.node\.js$/, ".d.ts")
  if (target.endsWith(".js")) return target.replace(/\.js$/, ".d.ts")
  throw new Error(`No types mapping for ${target}`)
}

function selfTypesSpecifier(target: string): string {
  if (target.endsWith("parser.worker.js")) return "./lib/tree-sitter/parser.worker.d.ts"
  const fileName = target.slice(target.lastIndexOf("/") + 1)
  if (fileName.endsWith(".node.js")) return `./${fileName.replace(/\.node\.js$/, ".d.ts")}`
  return `./${fileName.replace(/\.js$/, ".d.ts")}`
}

describe("JSR package self imports", () => {
  test("maps every public self import to the local graph instead of npm", async () => {
    const config = await readJsrConfig()
    for (const [subpath, target] of Object.entries(config.exports)) {
      const specifier = subpath === "." ? "ax-tui" : `ax-tui/${subpath.slice(2)}`
      expect(config.imports[specifier], specifier).toBe(target)
    }
  })

  test("JavaScript entrypoints declare colocated types for JSR", async () => {
    const config = await readJsrConfig()
    for (const [subpath, target] of Object.entries(config.exports)) {
      if (target.endsWith(".ts")) continue
      const source = await readFile(new URL(`../${target.slice(2)}`, import.meta.url), "utf8")
      const expected = `// @ts-self-types="${selfTypesSpecifier(target)}"`
      expect(source, subpath).toContain(expected)
    }
  })

  test("every entrypoint has a module doc and no slow-type augmentations", async () => {
    const config = await readJsrConfig()
    for (const [subpath, target] of Object.entries(config.exports)) {
      const typesPath = typesPathForExport(target)
      const source = await readFile(new URL(`../${typesPath.slice(2)}`, import.meta.url), "utf8")
      expect(source, `${subpath} (${typesPath})`).toMatch(/@module\b/)
      expect(source, `${subpath} must not use declare global`).not.toMatch(/declare\s+global\s*\{/)
      expect(source, `${subpath} must not use module augmentation`).not.toMatch(/declare\s+module\s+["']/)
    }
  })
})
