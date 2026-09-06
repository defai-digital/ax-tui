/**
 * Configures Solid runtime-plugin support for Bun.
 *
 * @module
 */
import { type RuntimeModuleEntry, type RuntimePluginRewriteOptions } from "ax-tui/runtime-plugin"
/** Solid runtime plugin support options. */
export interface SolidRuntimePluginSupportOptions {
  additional?: Record<string, RuntimeModuleEntry>
  core?: RuntimeModuleEntry
  rewrite?: RuntimePluginRewriteOptions
}
/** Install runtime-plugin support if it is not already installed. */
export declare function ensureRuntimePluginSupport(options?: SolidRuntimePluginSupportOptions): boolean
