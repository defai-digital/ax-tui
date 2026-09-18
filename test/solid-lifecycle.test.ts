import { build } from "esbuild"
import { spawnSync } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "vitest"
import { resolveNodeSolidRuntimeImport, transformSolidSource } from "../solid/source/scripts/solid-transform.js"

const root = fileURLToPath(new URL("../", import.meta.url))
const solidEntry = path.join(root, "solid/source/index.ts")
const supportsFfi = spawnSync(process.execPath, ["--experimental-ffi", "-e", "require('node:ffi')"]).status === 0

async function runSolidScenario(source: string): Promise<void> {
  await mkdir(path.join(root, ".internal"), { recursive: true })
  const fixture = await mkdtemp(path.join(root, ".internal/solid-lifecycle-"))
  const driver = path.join(fixture, "driver.mjs")
  try {
    await build({
      stdin: {
        contents: await transformSolidSource(source, {
          filename: "solid-lifecycle.tsx",
          moduleName: solidEntry,
          resolvePath: (specifier) =>
            specifier === "ax-tui/solid" ? solidEntry : resolveNodeSolidRuntimeImport(specifier),
        }),
        resolveDir: root,
        sourcefile: "solid-lifecycle.tsx",
        loader: "js",
      },
      outfile: driver,
      bundle: true,
      packages: "external",
      platform: "node",
      format: "esm",
      logLevel: "silent",
      plugins: [
        {
          name: "solid-lifecycle-source",
          setup(builder) {
            builder.onResolve({ filter: /^solid-js(?:\/store)?$/ }, ({ path: specifier }) => ({
              path: resolveNodeSolidRuntimeImport(specifier)!,
              external: true,
            }))
            builder.onLoad({ filter: /\.tsx$/ }, async ({ path: filename }) => ({
              contents: await transformSolidSource(await readFile(filename, "utf8"), { filename }),
              loader: "js",
            }))
          },
        },
      ],
    })
    const result = spawnSync(
      process.execPath,
      ["--experimental-ffi", "--disable-warning=ExperimentalWarning", driver],
      {
        cwd: root,
        encoding: "utf8",
        timeout: 20_000,
        env: { ...process.env, AX_CODE_TUI_NATIVE_OFFLINE: "1" },
      },
    )
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
}

test.skipIf(!supportsFfi)(
  "keyed inline text moves preserve one copy and the requested sibling order",
  async () => {
    await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal, For } from "solid-js"
import { insertNode, testRender } from "ax-tui/solid"
import { TextNodeRenderable } from "ax-tui"

let updateItems
let text
const nodes = new Map()
const setup = await testRender(() => {
  const [items, setItems] = createSignal(["a", "b", "c"])
  updateItems = setItems
  return <text ref={text}><For each={items()}>{id => <span ref={node => nodes.set(id, node)}>{id}</span>}</For></text>
}, { width: 12, height: 1, useKittyKeyboard: null })
try {
  for (const order of [["a", "b", "c"], ["b", "c", "a"], ["c", "a", "b"], ["a"]]) {
    updateItems(order)
    await setup.renderOnce()
    assert.deepEqual(text.getTextChildren().map(node => node.id), order.map(id => nodes.get(id).id))
    assert.equal(setup.captureCharFrame().trim(), order.join(""))
  }

  const first = TextNodeRenderable.fromString("first")
  const second = TextNodeRenderable.fromString("second")
  const child = TextNodeRenderable.fromString("child")
  insertNode(first, child)
  insertNode(second, child)
  assert.deepEqual(first.getChildren(), [])
  assert.deepEqual(second.getChildren(), [child])
  insertNode(second, child, child)
  assert.deepEqual(second.getChildren(), [child])
} finally {
  setup.renderer.destroy()
}
`)
  },
  30_000,
)
