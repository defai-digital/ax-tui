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
  const fixture = await mkdtemp(path.join(root, ".internal/solid-regressions-"))
  const driver = path.join(fixture, "driver.mjs")
  try {
    await build({
      stdin: {
        contents: await transformSolidSource(source, {
          filename: "solid-regressions.tsx",
          moduleName: solidEntry,
          resolvePath: (specifier) =>
            specifier === "ax-tui/solid" ? solidEntry : resolveNodeSolidRuntimeImport(specifier),
        }),
        resolveDir: root,
        sourcefile: "solid-regressions.tsx",
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
          name: "solid-regressions-source",
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
  "nullish text/content props render as empty strings, not literal null/undefined",
  async () => {
    await runSolidScenario(`
import assert from "node:assert/strict"
import { testRender } from "ax-tui/solid"

const setup = await testRender(() => <text content={undefined} />, { width: 12, height: 1, useKittyKeyboard: null })
try {
  await setup.renderOnce()
  assert.equal(setup.captureCharFrame().trim(), "")
} finally {
  setup.renderer.destroy()
}

let codeRef
const code = await testRender(() => <ascii_font ref={codeRef} text={null} />, { width: 12, height: 4, useKittyKeyboard: null })
try {
  await code.renderOnce()
  assert.equal(code.captureCharFrame().trim(), "")
} finally {
  code.renderer.destroy()
}
`)
  },
)

test.skipIf(!supportsFfi)(
  "layout style subkeys removed from a later style object restore their defaults",
  async () => {
    await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal } from "solid-js"
import { testRender } from "ax-tui/solid"

let boxRef
const [style, setStyle] = createSignal({ width: 6, zIndex: 2 })
const setup = await testRender(() => <box ref={boxRef} style={style()} />, {
  width: 20,
  height: 2,
  useKittyKeyboard: null,
})
try {
  await setup.renderOnce()
  assert.equal(boxRef.width, 6)
  assert.equal(boxRef.zIndex, 2)

  // width disappears, zIndex changes: width must fall back to "auto"
  // (filling the 20-col parent) instead of sticking at 6.
  setStyle({ zIndex: 3 })
  await setup.renderOnce()
  assert.equal(boxRef.zIndex, 3)
  assert.equal(boxRef.width, 20)

  // Clearing the whole style restores the captured pre-style zIndex.
  setStyle(undefined)
  await setup.renderOnce()
  assert.equal(boxRef.zIndex, 0)
} finally {
  setup.renderer.destroy()
}
`)
  },
)

test.skipIf(!supportsFfi)("spread props that disappear are unset instead of sticking", async () => {
  await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal } from "solid-js"
import { testRender } from "ax-tui/solid"

let boxRef
const [props, setProps] = createSignal({ zIndex: 3, title: "hello" })
const setup = await testRender(() => <box ref={boxRef} {...props()} />, {
  width: 20,
  height: 2,
  useKittyKeyboard: null,
})
try {
  await setup.renderOnce()
  assert.equal(boxRef.zIndex, 3)
  assert.equal(boxRef.title, "hello")

  setProps({})
  await setup.renderOnce()
  // The generic unset assigns undefined, which setters treat as "back to
  // default" (zIndex has no explicit default translation, so it reads back
  // as undefined rather than its effective 0).
  assert.equal(boxRef.zIndex, undefined)
  assert.equal(boxRef.title, undefined)
} finally {
  setup.renderer.destroy()
}
`)
})

test.skipIf(!supportsFfi)(
  "changing id after insertion does not desync removal into a ghost node",
  async () => {
    await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal, Show } from "solid-js"
import { testRender } from "ax-tui/solid"

let parentRef
const [id, setId] = createSignal("a")
const [show, setShow] = createSignal(true)
const setup = await testRender(
  () => (
    <box ref={parentRef}>
      <Show when={show()}>
        <box id={id()} width={2} height={1} />
      </Show>
      <text>marker</text>
    </box>
  ),
  { width: 20, height: 2, useKittyKeyboard: null },
)
try {
  await setup.renderOnce()
  assert.equal(parentRef.getChildren().length, 2)

  // Post-insert id changes are ignored; removal must still find the node.
  setId("b")
  await setup.renderOnce()
  setShow(false)
  await setup.renderOnce()
  // <Show> leaves its internal slot node behind; the inner box must be gone.
  const remaining = parentRef.getChildren().filter((child) => !child.id.startsWith("slot-"))
  assert.equal(remaining.length, 1)
  assert.equal(remaining[0].id, "text-1")
} finally {
  setup.renderer.destroy()
}
`)
  },
)

test.skipIf(!supportsFfi)("unmounting a Portal destroys its container subtree", async () => {
  await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal, Show } from "solid-js"
import { testRender, Portal } from "ax-tui/solid"

let portalRef
const [show, setShow] = createSignal(true)
const setup = await testRender(
  () => (
    <box>
      <Show when={show()}>
        <Portal ref={portalRef}>
          <text>portal</text>
        </Portal>
      </Show>
    </box>
  ),
  { width: 20, height: 2, useKittyKeyboard: null },
)
try {
  await setup.renderOnce()
  assert.ok(portalRef)
  assert.equal(portalRef.isDestroyed, false)

  setShow(false)
  await setup.renderOnce()
  assert.equal(portalRef.isDestroyed, true)
} finally {
  setup.renderer.destroy()
}
`)
})
