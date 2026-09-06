// @ts-self-types="./runtime-plugin-support.d.ts"
const errorMessage =
  "ax-tui/runtime-plugin-support is Bun-only and is not available in Node.js. Use Bun to import this entrypoint."

export function ensureRuntimePluginSupport() {
  throw new Error(
    "ax-tui/runtime-plugin-support is Bun-only and is not available in Node.js. Use Bun to import this entrypoint.",
  )
}

export function createRuntimePlugin() {
  throw new Error(
    "ax-tui/runtime-plugin-support is Bun-only and is not available in Node.js. Use Bun to import this entrypoint.",
  )
}

export function runtimeModuleIdForSpecifier() {
  throw new Error(
    "ax-tui/runtime-plugin-support is Bun-only and is not available in Node.js. Use Bun to import this entrypoint.",
  )
}

throw new Error(errorMessage)
