import { spawnSync } from "node:child_process"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "vitest"
import { transformSolidSource, resolveNodeSolidRuntimeImport } from "../solid/scripts/solid-transform.js"

const root = fileURLToPath(new URL("../", import.meta.url))
const supportsFfi = spawnSync(process.execPath, ["--experimental-ffi", "-e", "require('node:ffi')"]).status === 0

test.skipIf(!supportsFfi)(
  "owned renderer mounts reactive Solid TSX, cleans up, and highlights with bundled assets",
  async () => {
    await mkdir(path.join(root, ".internal"), { recursive: true })
    const fixture = await mkdtemp(path.join(root, ".internal/source-renderer-"))
    try {
      const source = `
import assert from "node:assert/strict"
import { createSignal, onCleanup } from "solid-js"
import { testRender } from "ax-tui/solid"
import { TreeSitterClient } from "ax-tui"

let setCount
let cleaned = 0
const setup = await testRender(() => {
  const [count, update] = createSignal(1)
  setCount = update
  onCleanup(() => { cleaned++ })
  return <box width={36} height={4} flexDirection="column"><text>Count: {count()}</text><text>Local native renderer</text></box>
}, { width: 36, height: 4, useKittyKeyboard: null })
try {
  await setup.renderOnce()
  assert.ok(setup.captureCharFrame().includes("Count: 1"))
  setCount(2)
  await setup.renderOnce()
  const frame = setup.captureCharFrame()
  assert.ok(frame.includes("Count: 2"), frame)
  assert.ok(frame.includes("Local native renderer"), frame)
  assert.ok(!frame.includes("Count: 1"), frame)
} finally {
  setup.renderer.destroy()
}
assert.equal(cleaned, 1)

const client = new TreeSitterClient({ dataPath: process.argv[2] })
try {
  const highlighted = await client.highlightOnce("const value: number = 42", "typescript")
  assert.equal(highlighted.error, undefined)
  assert.ok(highlighted.highlights?.length > 0, JSON.stringify(highlighted))
} finally {
  await client.destroy()
}
console.log("Source renderer integration passed")
`
      const driver = path.join(fixture, "driver.mjs")
      await writeFile(
        driver,
        await transformSolidSource(source, {
          filename: "source-renderer.tsx",
          resolvePath: resolveNodeSolidRuntimeImport,
        }),
      )
      const result = spawnSync(
        process.execPath,
        ["--experimental-ffi", "--disable-warning=ExperimentalWarning", driver, path.join(fixture, "parsers")],
        {
          cwd: root,
          encoding: "utf8",
          timeout: 20_000,
          env: { ...process.env, AX_CODE_TUI_NATIVE_OFFLINE: "1" },
        },
      )
      expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
      expect(result.stdout).toContain("Source renderer integration passed")
    } finally {
      await rm(fixture, { recursive: true, force: true })
    }
  },
  30_000,
)
