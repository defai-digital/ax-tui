import { BaseRenderable, Renderable, type RenderableOptions } from "../Renderable.js"
import type { CliRenderer } from "../renderer.js"
import type { RenderContext } from "../types.js"
import { SlotRegistry, type SlotRegistryOptions } from "./registry.js"
import type { PluginContext, PluginErrorEvent, SlotMode } from "./types.js"
/** Core slot mode. */
export type CoreSlotMode = SlotMode
type CoreSlotProps<TSlotName extends string, TData extends object> = {
  [K in TSlotName]: TData
}
/** Core slot registry. */
export type CoreSlotRegistry<
  TSlotName extends string,
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> = SlotRegistry<BaseRenderable, CoreSlotProps<TSlotName, TData>, TContext>
/** Core slot renderer. */
export type CoreSlotRenderer<
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> = (ctx: Readonly<TContext>, data: TData) => BaseRenderable
/** Core managed slot. */
export interface CoreManagedSlot<
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> {
  render: CoreSlotRenderer<TContext, TData>
  onActivate?: (ctx: Readonly<TContext>) => void
  onDeactivate?: (ctx: Readonly<TContext>) => void
  onDispose?: (ctx: Readonly<TContext>) => void
}
/** Core slot contribution. */
export type CoreSlotContribution<
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> = CoreSlotRenderer<TContext, TData> | CoreManagedSlot<TContext, TData>
/** Core plugin. */
export interface CorePlugin<
  TSlotName extends string,
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> {
  id: string
  order?: number
  setup?: (ctx: Readonly<TContext>, renderer: CliRenderer) => void
  dispose?: () => void
  slots: Partial<Record<TSlotName, CoreSlotContribution<TContext, TData>>>
}
/** Core resolved slot renderer. */
export interface CoreResolvedSlotRenderer<
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> {
  id: string
  renderer: CoreSlotRenderer<TContext, TData>
}
type FallbackNodes = BaseRenderable | BaseRenderable[] | undefined
/** Core slot failure placeholder. */
export type CoreSlotFailurePlaceholder<TContext extends PluginContext = PluginContext> = (
  failure: PluginErrorEvent,
  ctx: Readonly<TContext>,
) => FallbackNodes
/** Create core slot registry. */
export declare function createCoreSlotRegistry<
  TSlotName extends string,
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
>(renderer: CliRenderer, context: TContext, options?: SlotRegistryOptions): CoreSlotRegistry<TSlotName, TContext, TData>
/** Register core plugin. */
export declare function registerCorePlugin<
  TSlotName extends string,
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
>(registry: CoreSlotRegistry<TSlotName, TContext, TData>, plugin: CorePlugin<TSlotName, TContext, TData>): () => void
/** Resolve core slot. */
export declare function resolveCoreSlot<
  TSlotName extends string,
  K extends TSlotName,
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
>(registry: CoreSlotRegistry<TSlotName, TContext, TData>, slot: K): Array<CoreResolvedSlotRenderer<TContext, TData>>
/** Slot renderable options. */
export interface SlotRenderableOptions<
  TSlotName extends string,
  K extends TSlotName,
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> extends RenderableOptions {
  registry: CoreSlotRegistry<TSlotName, TContext, TData>
  name: K
  data?: TData
  mode?: CoreSlotMode
  fallback?: FallbackNodes | (() => FallbackNodes)
  pluginFailurePlaceholder?: CoreSlotFailurePlaceholder<TContext>
}
/** Slot renderable class. */
export declare class SlotRenderable<
  TSlotName extends string = string,
  TContext extends PluginContext = PluginContext,
  TData extends object = Record<string, unknown>,
> extends Renderable {
  private _mode
  private _slotRegistry
  private _slotName
  private _data
  private _fallbackOption
  private _pluginFailurePlaceholder?
  private _disposed
  private _mountedNodes
  private _pluginNodes
  private _activePluginIds
  private _fallbackNodes
  private _unsubscribe
  constructor(ctx: RenderContext, options: SlotRenderableOptions<TSlotName, TSlotName, TContext, TData>)
  get mode(): CoreSlotMode
  set mode(value: CoreSlotMode)
  get data(): TData
  set data(value: TData)
  refresh(): void
  protected destroySelf(): void
  private _cleanupAll
  private _ensureFallbackNodes
  private _callManagedHook
  private _detachNodeFromMount
  private _cleanupInactivePluginNodes
  private _cleanupReplacedPluginNodes
  private _resolvePluginFailurePlaceholder
  private _reconcileMountedNodes
}
export {}
