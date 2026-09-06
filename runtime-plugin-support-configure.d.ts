/**
 * Configures ax-tui runtime-plugin support before modules load.
 *
 * @module
 */
import { type CreateRuntimePluginOptions } from "./runtime-plugin.js"
/** Install runtime-plugin support if it is not already installed. */
export declare function ensureRuntimePluginSupport(options?: CreateRuntimePluginOptions): boolean
export { createRuntimePlugin, runtimeModuleIdForSpecifier } from "./runtime-plugin.js"
export type {
  CreateRuntimePluginOptions,
  RuntimeModuleEntry,
  RuntimeModuleExports,
  RuntimeModuleLoader,
} from "./runtime-plugin.js"
