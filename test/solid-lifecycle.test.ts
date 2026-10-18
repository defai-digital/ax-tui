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

test.skipIf(!supportsFfi)("Solid virtual lists update reactively and keymaps clean up only their owner", async () => {
  await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal, Show } from "solid-js"
import { testRender, VirtualList, useKeymap } from "ax-tui/solid"
import { TextRenderable, Renderable, getKeymap, KeyEvent } from "ax-tui"
let toggle, update, list, childOwner
let childCalls = 0, siblingCalls = 0
function Child() {
  childOwner = useKeymap()
  childOwner.register({ bindings: [{ id: "child", keys: "x", handler: () => childCalls++ }] })
  const [items, setItems] = createSignal(Array.from({ length: 100 }, (_, i) => i))
  update = setItems
  return <VirtualList ref={value => list = value} items={items()} getKey={x => x}
    width="100%" height={6} renderItem={(x, i, ctx) => new TextRenderable(ctx, { content: "Row " + x })} />
}
const setup = await testRender(() => {
  useKeymap().register({ bindings: [{ id: "sibling", keys: "x", handler: () => siblingCalls++ }] })
  const [visible, setVisible] = createSignal(true)
  toggle = setVisible
  return <Show when={visible()}><Child /></Show>
}, { width: 30, height: 10, useKittyKeyboard: null })
const settle = async () => {
  for (let pass = 0; pass < 8; pass++) { await setup.renderOnce(); await new Promise(r => setImmediate(r)) }
}
const send = () => setup.renderer.keyInput.emit("keypress", new KeyEvent({
  name: "x", ctrl: false, shift: false, meta: false, sequence: "x", raw: "x",
}))
try {
  await settle()
  assert.ok(setup.captureCharFrame().includes("Row 0"))
  assert.ok(list.mountedCount <= 12)
  send(); assert.equal(childCalls, 1); assert.equal(siblingCalls, 0)
  update([999, 1000]); await settle()
  assert.ok(setup.captureCharFrame().includes("Row 999"))
  assert.equal(list.items.length, 2)
  toggle(false); await settle()
  assert.equal(list.isDestroyed, true)
  assert.deepEqual(getKeymap(setup.renderer).getActiveBindings().map(x => x.id), ["sibling"])
  assert.throws(() => childOwner.register({ bindings: [] }), /disposed/)
  send(); assert.equal(childCalls, 1); assert.equal(siblingCalls, 1)
  const keys = getKeymap(setup.renderer)
  keys.register({ bindings: [{ id: "sequence", keys: ["g", "g"], handler() {} }] })
  setup.renderer.keyInput.emit("keypress", new KeyEvent({
    name: "g", ctrl: false, shift: false, meta: false, sequence: "g", raw: "g",
  }))
  childOwner.cancelSequence()
  assert.deepEqual(keys.pendingKeys, ["g"], "disposed owners cannot cancel sibling input")
} finally { setup.renderer.destroy() }
assert.equal(Renderable.renderablesByNumber.size, 0)
`)
}, 30_000)

test.skipIf(!supportsFfi)("Solid feature owners release destroyed targets and stop updating destroyed lists", async () => {
  await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal } from "solid-js"
import { testRender, VirtualList, useKeymap, useRenderer } from "ax-tui/solid"
import { BoxRenderable, RenderableEvents, TextRenderable } from "ax-tui"
let list, updateWidth, unregister
const setup = await testRender(() => {
  const renderer = useRenderer()
  const target = new BoxRenderable(renderer, {})
  renderer.root.add(target)
  const baseline = target.listenerCount(RenderableEvents.DESTROYED)
  unregister = useKeymap().register({ target, bindings: [] })
  const before = target.listenerCount(RenderableEvents.DESTROYED)
  assert.equal(before, baseline + 2, "both core and owner must observe target destruction")
  target.destroy()
  assert.equal(target.listenerCount(RenderableEvents.DESTROYED), 0)
  const [width, setWidth] = createSignal(20)
  updateWidth = setWidth
  return <VirtualList ref={value => list = value} items={[1]} getKey={x => x} width={width()} height={5}
    renderItem={(x, i, ctx) => new TextRenderable(ctx, { content: "row" })} />
}, { width: 40, height: 10 })
try {
  await setup.renderOnce()
  list.destroyRecursively()
  let writesAfterDestroy = 0
  Object.defineProperty(list, "width", { set() { writesAfterDestroy++ }, get() { return 20 } })
  updateWidth(30)
  await new Promise(resolve => setImmediate(resolve))
  await setup.renderOnce()
  assert.equal(writesAfterDestroy, 0, "native layout setters must not run after destruction")
  unregister()
} finally { setup.renderer.destroy() }
`)
}, 30_000)

async function runSolidScenario(source: string): Promise<void> {
  await mkdir(path.join(root, ".internal"), { recursive: true })
  const fixture = await mkdtemp(path.join(root, ".internal/solid-lifecycle-"))
  const driver = path.join(fixture, "driver.mjs")
  try {
    await build({
      stdin: {
        contents: await transformSolidSource(source + '\nprocess.stdout.write("AX_SCENARIO_COMPLETE")\n', {
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
    expect(result.stdout, result.stderr).toContain("AX_SCENARIO_COMPLETE")
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
}

test.skipIf(!supportsFfi)("Solid overlay cleanup closes only the current owner's handles", async () => {
  await runSolidScenario(`
import assert from "node:assert/strict"
import { createSignal, onMount, Show } from "solid-js"
import { testRender, useOverlay, useRenderer } from "ax-tui/solid"
import { InputRenderable } from "ax-tui"
let toggle
let childContent
let siblingContent
let childHandle
let childOwner
function Child() {
  const renderer = useRenderer()
  const overlays = useOverlay()
  childOwner = overlays
  onMount(() => {
    childContent = new InputRenderable(renderer, { id: "child-overlay" })
    childHandle = overlays.show(childContent, { nonCapturing: true })
  })
  return <text>child</text>
}
const setup = await testRender(() => {
  const renderer = useRenderer()
  const overlays = useOverlay()
  const [visible, setVisible] = createSignal(true)
  toggle = setVisible
  onMount(() => {
    siblingContent = new InputRenderable(renderer, { id: "sibling-overlay" })
    overlays.show(siblingContent, { nonCapturing: true })
  })
  return <Show when={visible()}><Child /></Show>
}, { width: 40, height: 10, useKittyKeyboard: null })
try {
  await setup.renderOnce()
  toggle(false)
  await setup.renderOnce()
  assert.equal(childContent.isDestroyed, true)
  assert.equal(siblingContent.isDestroyed, false)
  childHandle.close()
  const unused = new InputRenderable(setup.renderer, { id: "unused" })
  assert.throws(() => childOwner.show(unused), /disposed/)
  unused.destroy()
} finally { setup.renderer.destroy() }
assert.equal(siblingContent.isDestroyed, true)
`)
}, 30_000)

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
