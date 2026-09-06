import type { CliRenderer } from "../renderer.js"
/** Plugin context. */
export type PluginContext = object
/** Slot mode. */
export type SlotMode = "append" | "replace" | "single_winner"
/** Plugin error phase. */
export type PluginErrorPhase = "setup" | "render" | "dispose" | "error_placeholder"
/** Plugin error source. */
export type PluginErrorSource = "registry" | "core" | (string & {})
/** Plugin error event. */
export interface PluginErrorEvent {
  pluginId: string
  slot?: string
  phase: PluginErrorPhase
  source: PluginErrorSource
  error: Error
  timestamp: number
}
/** Plugin error report. */
export interface PluginErrorReport {
  pluginId: string
  slot?: string
  phase: PluginErrorPhase
  source?: PluginErrorSource
  error: unknown
}
/** Slot renderer. */
export type SlotRenderer<TNode, TProps, TContext extends PluginContext = PluginContext> = (
  ctx: Readonly<TContext>,
  props: TProps,
) => TNode
/** Plugin. */
export interface Plugin<TNode, TSlots extends object, TContext extends PluginContext = PluginContext> {
  id: string
  order?: number
  setup?: (ctx: Readonly<TContext>, renderer: CliRenderer) => void
  dispose?: () => void
  slots: {
    [K in keyof TSlots]?: SlotRenderer<TNode, TSlots[K], TContext>
  }
}
/** Resolved slot renderer. */
export interface ResolvedSlotRenderer<TNode, TProps, TContext extends PluginContext = PluginContext> {
  id: string
  renderer: SlotRenderer<TNode, TProps, TContext>
}
