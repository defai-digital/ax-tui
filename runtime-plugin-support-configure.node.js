// @ts-self-types="./runtime-plugin-support-configure.d.ts"
const errorMessage = "ax-tui/runtime-plugin-support/configure is Bun-only and is not available in Node.js. Use Bun to import this entrypoint.";
function ensureRuntimePluginSupport() {
  throw new Error(
    "ax-tui/runtime-plugin-support/configure is Bun-only and is not available in Node.js. Use Bun to import this entrypoint."
  );
}
function createRuntimePlugin() {
  throw new Error(
    "ax-tui/runtime-plugin-support/configure is Bun-only and is not available in Node.js. Use Bun to import this entrypoint."
  );
}
function runtimeModuleIdForSpecifier() {
  throw new Error(
    "ax-tui/runtime-plugin-support/configure is Bun-only and is not available in Node.js. Use Bun to import this entrypoint."
  );
}
throw new Error(errorMessage);
export {
  createRuntimePlugin,
  ensureRuntimePluginSupport,
  runtimeModuleIdForSpecifier
};
