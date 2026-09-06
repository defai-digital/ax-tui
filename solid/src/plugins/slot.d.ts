import {
  SlotRegistry,
  type CliRenderer,
  type Plugin,
  type PluginContext,
  type PluginErrorEvent,
  type SlotMode,
  type SlotRegistryOptions,
} from "ax-tui"
import { type JSX } from "solid-js"
export type { SlotMode }
type SlotMap = Record<string, object>
/** Solid plugin. */
export type SolidPlugin<TSlots extends SlotMap, TContext extends PluginContext = PluginContext> = Plugin<
  JSX.Element,
  TSlots,
  TContext
>
/** Solid slot props. */
export type SolidSlotProps<
  TSlots extends SlotMap,
  K extends keyof TSlots,
  TContext extends PluginContext = PluginContext,
> = {
  registry: SlotRegistry<JSX.Element, TSlots, TContext>
  name: K
  mode?: SlotMode
  children?: JSX.Element
  pluginFailurePlaceholder?: (failure: PluginErrorEvent) => JSX.Element
} & TSlots[K]
/** Solid bound slot props. */
export type SolidBoundSlotProps<TSlots extends SlotMap, K extends keyof TSlots> = {
  name: K
  mode?: SlotMode
  children?: JSX.Element
} & TSlots[K]
/** Solid registry slot component. */
export type SolidRegistrySlotComponent<TSlots extends SlotMap, TContext extends PluginContext = PluginContext> = <
  K extends keyof TSlots,
>(
  props: SolidSlotProps<TSlots, K, TContext>,
) => JSX.Element
/** Solid slot component. */
export type SolidSlotComponent<TSlots extends SlotMap> = <K extends keyof TSlots>(
  props: SolidBoundSlotProps<TSlots, K>,
) => JSX.Element
/** Solid slot options. */
export interface SolidSlotOptions {
  pluginFailurePlaceholder?: (failure: PluginErrorEvent) => JSX.Element
}
/** Create solid slot registry. */
export declare function createSolidSlotRegistry<TSlots extends SlotMap, TContext extends PluginContext = PluginContext>(
  renderer: CliRenderer,
  context: TContext,
  options?: SlotRegistryOptions,
): SlotRegistry<JSX.Element, TSlots, TContext>
/** Create slot. */
export declare function createSlot<TSlots extends SlotMap, TContext extends PluginContext = PluginContext>(
  registry: SlotRegistry<JSX.Element, TSlots, TContext>,
  options?: SolidSlotOptions,
): SolidSlotComponent<TSlots>
/** Slot. */
export declare function Slot<
  TSlots extends SlotMap,
  TContext extends PluginContext = PluginContext,
  K extends keyof TSlots = keyof TSlots,
>(props: SolidSlotProps<TSlots, K, TContext>): JSX.Element
