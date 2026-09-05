import { describe, expect, test } from "vitest"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import {
  applyKittyKeyboardOptOut,
  applySlimCatalogue,
  axRuntimeIdentityApplied,
  checkTuiPatches,
  findFfiModule,
  findRendererModule,
  geometryGuardApplied,
  identityFiles,
  nativeResolverApplied,
  kittyKeyboardOptOutApplied,
  pointerPinApplied,
  slimCatalogueApplied,
  zigParserDropped,
} from "./tui-patches"
import { AX_TUI_JSX_UNUSED } from "./tui-surface"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

describe("script.tui-patches", () => {
  test("required patches are applied to the committed vendor tree", () => {
    const results = checkTuiPatches()
    expect(results.filter((item) => !item.ok)).toEqual([])
  })

  test("pointer pin, geometry guard, and native resolver stay reviewable as named contracts", () => {
    const ffi = readFileSync(findFfiModule(), "utf8")
    expect(pointerPinApplied(ffi)).toBe(true)
    expect(geometryGuardApplied(ffi)).toBe(true)
    expect(nativeResolverApplied(ffi)).toBe(true)
    expect(zigParserDropped(ffi)).toBe(true)
  })

  test("apply helpers are idempotent on already-patched source", () => {
    const ffi = readFileSync(findFfiModule(), "utf8")
    const renderer = readFileSync(findRendererModule(), "utf8")
    expect(pointerPinApplied(ffi)).toBe(true)
    expect(geometryGuardApplied(ffi)).toBe(true)
    expect(nativeResolverApplied(ffi)).toBe(true)
    expect(kittyKeyboardOptOutApplied(renderer)).toBe(true)
    expect(applyKittyKeyboardOptOut(renderer)).toBe(renderer)
  })

  test("Kitty keyboard null opt-out is preserved instead of defaulted back on", () => {
    const source = "const kittyConfig = config.useKittyKeyboard ?? {};"
    const next = applyKittyKeyboardOptOut(source)
    expect(kittyKeyboardOptOutApplied(next)).toBe(true)
    expect(next).toContain("config.useKittyKeyboard === undefined")
    expect(next).not.toContain("config.useKittyKeyboard ?? {}")
  })

  test("AX-owned runtime configuration and plugin identities use AX names", () => {
    const sources = [
      readFileSync(join(ROOT, "index-07zpr2dg.js"), "utf8"),
      readFileSync(join(ROOT, "index-pcvh9d34.js"), "utf8"),
      readFileSync(join(ROOT, "runtime-plugin.js"), "utf8"),
      readFileSync(join(ROOT, "solid", "scripts", "solid-plugin.js"), "utf8"),
    ]
    expect(sources.every(axRuntimeIdentityApplied)).toBe(true)
  })

  test("slim-catalogue apply does not strip SelectRenderableEvents or reconciler aliases", () => {
    const source = `import {
  ASCIIFontRenderable,
  BoxRenderable,
  SelectRenderable,
  SelectRenderableEvents,
  TabSelectRenderable,
  TabSelectRenderableEvents,
  TextRenderable
} from "ax-tui";
import { SelectRenderable as SelectRenderable2 } from "ax-tui";
var baseComponents = {
  box: BoxRenderable,
  text: TextRenderable,
  select: SelectRenderable,
  ascii_font: ASCIIFontRenderable,
  tab_select: TabSelectRenderable,
};
if (node instanceof SelectRenderable2) {
  event = SelectRenderableEvents.SELECTION_CHANGED;
}
`
    const next = applySlimCatalogue(source)
    expect(slimCatalogueApplied(next)).toBe(true)
    expect(next).not.toContain("ascii_font:")
    expect(next).not.toContain("ASCIIFontRenderable")
    expect(next).toContain("SelectRenderableEvents")
    expect(next).toContain("TabSelectRenderableEvents")
    expect(next).toContain("SelectRenderable as SelectRenderable2")
    expect(next).toContain("SelectRenderable2")
  })

  test("identityFiles skips dot-directories, node_modules, vendor, and patches", () => {
    const fixture = mkdtempSync(join(tmpdir(), "ax-tui-identity-"))
    try {
      mkdirSync(join(fixture, ".git", "hooks"), { recursive: true })
      mkdirSync(join(fixture, ".ax-code"), { recursive: true })
      mkdirSync(join(fixture, "node_modules", "dep"), { recursive: true })
      mkdirSync(join(fixture, "vendor", "darwin-arm64"), { recursive: true })
      mkdirSync(join(fixture, "patches"), { recursive: true })
      mkdirSync(join(fixture, "solid"), { recursive: true })
      writeFileSync(join(fixture, "index.js"), "")
      writeFileSync(join(fixture, "solid", "components.js"), "")
      writeFileSync(join(fixture, ".git", "hooks", "hook.js"), "")
      writeFileSync(join(fixture, ".ax-code", "cached.js"), "")
      writeFileSync(join(fixture, "node_modules", "dep", "index.js"), "")
      writeFileSync(join(fixture, "vendor", "darwin-arm64", "shim.js"), "")
      writeFileSync(join(fixture, "patches", "notes.d.ts"), "")

      const found = identityFiles(fixture).map((file) => relative(fixture, file)).sort()
      expect(found).toEqual([join("index.js"), join("solid", "components.js")].sort())
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  test("Solid catalogue does not register unused TUI widgets", () => {
    for (const name of ["index.js", "index.bun.js", "components.js"]) {
      const source = readFileSync(join(ROOT, "solid", name), "utf8")
      expect(slimCatalogueApplied(source), name).toBe(true)
      for (const tag of AX_TUI_JSX_UNUSED) {
        expect(source, `${name} still mentions ${tag}`).not.toContain(`${tag}:`)
      }
    }
  })
})
