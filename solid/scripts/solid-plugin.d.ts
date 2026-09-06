/**
 * Bun plugin that runs the ax-tui SolidJS transform.
 *
 * @module
 */
import { type BunPlugin } from "bun"
import { type ResolveImportPath } from "./solid-transform.js"
/** Create solid transform plugin options. */
export interface CreateSolidTransformPluginOptions {
  moduleName?: string
  resolvePath?: ResolveImportPath
}
/** Ensure solid transform plugin. */
export declare function ensureSolidTransformPlugin(input?: CreateSolidTransformPluginOptions): boolean
/** Reset solid transform plugin state. */
export declare function resetSolidTransformPluginState(): void
/** Create the Bun plugin that transforms ax-tui SolidJS sources. */
export declare function createSolidTransformPlugin(input?: CreateSolidTransformPluginOptions): BunPlugin
declare const solidTransformPlugin: BunPlugin
/** Default export for this module. */
export default solidTransformPlugin
