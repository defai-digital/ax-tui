import { afterEach, expect, test, vi } from "vitest"
import { TreeSitterClient } from "../src/lib/tree-sitter/client.js"
import { clearAllDebounces } from "../src/lib/debounce.js"

// Keep worker messaging observable without starting a real parser thread.
function initializedClient() {
  const client = new TreeSitterClient({ dataPath: ".internal/test-parsers" }, { autoStartWorker: false })
  const postMessage = vi.fn()
  const state = client as any
  state.initialized = true
  state.worker = {
    postMessage,
    terminate: vi.fn(),
    onmessage: null,
    onerror: null,
  }
  state.buffers.set(1, {
    id: 1,
    content: "old",
    version: 1,
    filetype: "typescript",
    hasParser: true,
  })
  return { client, postMessage, state }
}

afterEach(() => {
  clearAllDebounces()
  vi.useRealTimers()
})

test("clients with the same buffer IDs reset independently", async () => {
  vi.useFakeTimers()
  const a = initializedClient()
  const b = initializedClient()
  await a.client.resetBuffer(1, 2, "first")
  await b.client.resetBuffer(1, 2, "second")
  await vi.advanceTimersByTimeAsync(10)
  expect(a.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "RESET_BUFFER", content: "first" }))
  expect(b.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "RESET_BUFFER", content: "second" }))
  await a.client.destroy()
  await b.client.destroy()
})

test("destroying one client preserves another client's pending reset", async () => {
  vi.useFakeTimers()
  const a = initializedClient()
  const b = initializedClient()
  await b.client.resetBuffer(1, 2, "second")
  await a.client.destroy()
  await vi.advanceTimersByTimeAsync(10)
  expect(b.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "RESET_BUFFER" }))
  await b.client.destroy()
})

test("removal cancels resets before waiting for worker acknowledgement and clears its timeout", async () => {
  vi.useFakeTimers()
  const { client, postMessage, state } = initializedClient()
  await client.resetBuffer(1, 2, "removed")
  const removed = client.removeBuffer(1)
  await vi.advanceTimersByTimeAsync(20)
  expect(postMessage.mock.calls.map(([message]) => message.type)).toEqual(["DISPOSE_BUFFER"])
  state.handleWorkerMessage({ data: { type: "BUFFER_DISPOSED", bufferId: 1 } })
  await removed
  expect(vi.getTimerCount()).toBe(0)
  await client.destroy()
})

test("queued edits cannot outlive client destruction", async () => {
  const { client, postMessage } = initializedClient()
  const error = vi.spyOn(console, "error").mockImplementation(() => {})
  try {
    client.updateBuffer(1, [], "new", 2)
    await client.destroy()
    await Promise.resolve()
    expect(postMessage).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  } finally {
    error.mockRestore()
  }
})

test("a delayed parser initialization cannot resurrect a removed buffer", async () => {
  const { client, state, postMessage } = initializedClient()
  const creating = client.createBuffer(2, "pending", "typescript")
  const init = postMessage.mock.calls.at(-1)![0]
  const removed = client.removeBuffer(2)
  state.handleWorkerMessage({
    data: {
      type: "PARSER_INIT_RESPONSE",
      messageId: init.messageId,
      bufferId: 2,
      hasParser: true,
    },
  })
  state.handleWorkerMessage({ data: { type: "BUFFER_DISPOSED", bufferId: 2 } })
  await removed
  expect(await creating).toBe(false)
  expect(client.getBuffer(2)).toBeUndefined()
  await client.destroy()
})

test("initialization send failure clears the timeout immediately", async () => {
  vi.useFakeTimers()
  const { client, state, postMessage } = initializedClient()
  state.initialized = false
  postMessage.mockImplementation(() => {
    throw new Error("worker closed")
  })
  await expect(client.initialize()).rejects.toThrow("worker closed")
  expect(vi.getTimerCount()).toBe(0)
  await client.destroy()
})
