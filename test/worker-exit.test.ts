import { expect, test } from "vitest"
import { Worker, type WorkerErrorEvent } from "../src/platform/worker.js"

const hasWorkerRuntime = Worker.name !== "UnsupportedWorker"

// The Node worker shim must surface a worker that exits without emitting an
// "error" (process.exit, OOM kill) as an error event; otherwise consumers wait
// on pending requests forever.
test.skipIf(!hasWorkerRuntime)("worker shim reports unexpected exit as an error event", async () => {
  const worker = new Worker(new URL("data:text/javascript,process.exit(1)"))
  try {
    const event = await new Promise<WorkerErrorEvent>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("no error event within 5s")), 5_000)
      worker.onerror = (event) => {
        clearTimeout(timer)
        resolve(event)
      }
    })
    expect(event.message).toContain("exited")
    expect(event.error).toBeInstanceOf(Error)
  } finally {
    await worker.terminate().catch(() => {})
  }
})
