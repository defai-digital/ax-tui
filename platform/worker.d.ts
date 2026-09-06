/** WORKER UNAVAILABLE. */
export declare const WORKER_UNAVAILABLE = "AX Code TUI tree-sitter workers are not available for this runtime yet."
/** Worker message event. */
export interface WorkerMessageEvent<T = unknown> {
  readonly data: T
}
/** Worker error event. */
export interface WorkerErrorEvent {
  readonly error?: unknown
  readonly message: string
}
/** Worker message handler. */
export type WorkerMessageHandler<T = unknown> = (event: WorkerMessageEvent<T>) => void | Promise<void>
/** Worker error handler. */
export type WorkerErrorHandler = (event: WorkerErrorEvent) => void
/** Platform worker options. */
export interface PlatformWorkerOptions {
  name?: string
}
/** Platform worker handle. */
export interface PlatformWorkerHandle {
  onmessage: WorkerMessageHandler | null
  onerror: WorkerErrorHandler | null
  postMessage(value: unknown): void
  terminate(): void | Promise<number>
  addEventListener(type: "message" | "error", listener: WorkerMessageHandler | WorkerErrorHandler): void
  removeEventListener(type: "message" | "error", listener: WorkerMessageHandler | WorkerErrorHandler): void
}
/** Platform worker constructor. */
export type PlatformWorkerConstructor = new (
  specifier: string | URL,
  options?: PlatformWorkerOptions,
) => PlatformWorkerHandle
/** Worker. */
export declare const Worker: PlatformWorkerConstructor
/** Is worker runtime. */
export declare const isWorkerRuntime: boolean
/** Post worker message. */
export declare function postWorkerMessage(value: unknown): void
/** Set worker message handler. */
export declare function setWorkerMessageHandler<T>(handler: WorkerMessageHandler<T>): () => void
