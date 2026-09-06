/**
 * Bun runtime-plugin factory for ax-tui virtual modules.
 *
 * @module
 */
import { type BunPlugin } from "bun"
/** Runtime module exports. */
export type RuntimeModuleExports = Record<string, unknown>
/** Runtime module loader. */
export type RuntimeModuleLoader = () => RuntimeModuleExports | Promise<RuntimeModuleExports>
/** Runtime module entry. */
export type RuntimeModuleEntry = RuntimeModuleExports | RuntimeModuleLoader
/** Runtime plugin rewrite options. */
export interface RuntimePluginRewriteOptions {
  nodeModulesRuntimeSpecifiers?: boolean
  nodeModulesBareSpecifiers?: boolean
}
/** Create runtime plugin options. */
export interface CreateRuntimePluginOptions {
  core?: RuntimeModuleEntry
  additional?: Record<string, RuntimeModuleEntry>
  rewrite?: RuntimePluginRewriteOptions
}
/** Is core runtime module specifier. */
export declare const isCoreRuntimeModuleSpecifier: (specifier: string) => boolean
/** Runtime module id for specifier. */
export declare const runtimeModuleIdForSpecifier: (specifier: string) => string
/** Create the Bun plugin that virtualizes ax-tui runtime modules. */
export declare function createRuntimePlugin(input?: CreateRuntimePluginOptions): BunPlugin
