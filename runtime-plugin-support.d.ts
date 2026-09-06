/**
 * Installs ax-tui runtime-plugin support in Bun.
 *
 * @module
 */
import { ensureRuntimePluginSupport } from "./runtime-plugin-support-configure.js"
export { ensureRuntimePluginSupport }
export {
  createRuntimePlugin,
  runtimeModuleIdForSpecifier,
  type CreateRuntimePluginOptions,
  type RuntimeModuleEntry,
  type RuntimeModuleExports,
  type RuntimeModuleLoader,
} from "./runtime-plugin-support-configure.js"
