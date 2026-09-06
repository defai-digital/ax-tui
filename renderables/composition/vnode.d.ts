import { Renderable, type RenderableOptions } from "../../Renderable.js"
import type { RenderContext } from "../../types.js"
/** VChild. */
export type VChild = VNode | Renderable | VChild[] | null | undefined | false
/** Pending call. */
export interface PendingCall {
  method: string
  args: any[]
  isProperty?: boolean
}
declare const BrandedVNode: unique symbol
/** VNode. */
export interface VNode<P = any, C = VChild[]> {
  [BrandedVNode]: true
  type: Construct<P>
  props?: P
  children?: C
  __delegateMap?: Record<string, string>
  __pendingCalls?: PendingCall[]
}
/** Proxied VNode. */
export type ProxiedVNode<TCtor extends RenderableConstructor<any>> = VNode<
  TCtor extends RenderableConstructor<infer P> ? P : any
> & {
  [K in keyof InstanceType<TCtor>]: InstanceType<TCtor>[K] extends (...args: infer Args) => any
    ? (...args: Args) => ProxiedVNode<TCtor>
    : InstanceType<TCtor>[K]
}
/** Renderable constructor. */
export interface RenderableConstructor<P extends RenderableOptions<any> = RenderableOptions<any>> {
  new (ctx: RenderContext, options: P): Renderable
}
/** Functional construct. */
export type FunctionalConstruct<P = any> = (props: P, children?: VChild[]) => VNode
/** Construct. */
export type Construct<P = any> =
  | RenderableConstructor<P extends RenderableOptions<any> ? P : never>
  | FunctionalConstruct<P>
/** H. */
export declare function h<TCtor extends RenderableConstructor<any>>(
  type: TCtor,
  props?: TCtor extends RenderableConstructor<infer P> ? P : never,
  ...children: VChild[]
): ProxiedVNode<TCtor>
/** H. */
export declare function h<P>(type: FunctionalConstruct<P>, props?: P, ...children: VChild[]): VNode<P>
/** H. */
export declare function h<P>(type: Construct<P>, props?: P, ...children: VChild[]): VNode<P> | ProxiedVNode<any>
/** Is VNode. */
export declare function isVNode(node: any): node is VNode
/** Maybe make renderable. */
export declare function maybeMakeRenderable(
  ctx: RenderContext,
  node: Renderable | VNode<any, any[]> | unknown,
): Renderable | null
/** Wrap with delegates. */
export declare function wrapWithDelegates<T extends InstanceType<RenderableConstructor>>(
  instance: T,
  delegateMap: Record<string, string> | undefined,
): T
/** Instantiate fn. */
export type InstantiateFn<NodeType extends VNode | Renderable> = Renderable & {
  __node?: NodeType
}
/** Instantiate. */
export declare function instantiate<NodeType extends VNode | Renderable>(
  ctx: RenderContext,
  node: NodeType,
): InstantiateFn<NodeType>
/** Delegate map. */
export type DelegateMap<T> = Partial<Record<keyof T, string>>
/** Validate shape. */
export type ValidateShape<Given, AllowedKeys> = {
  [K in keyof Given]: K extends keyof AllowedKeys ? NonNullable<Given[K]> : never
}
type InferNode<T> = T extends InstantiateFn<infer U> ? U : never
/** Delegate. */
export declare function delegate<
  Factory extends InstantiateFn<any>,
  InnerNode extends InferNode<Factory>,
  TargetMap extends Record<keyof InnerNode, string>,
  const Mapping extends Partial<TargetMap>,
>(mapping: ValidateShape<Mapping, TargetMap>, vnode: Factory): Renderable
/** Delegate. */
export declare function delegate<
  ConstructorType extends RenderableConstructor<any>,
  TargetMap extends Record<keyof InstanceType<ConstructorType>, string>,
  const Mapping extends Partial<TargetMap>,
>(mapping: ValidateShape<Mapping, TargetMap>, vnode: ProxiedVNode<ConstructorType>): ProxiedVNode<ConstructorType>
/** Delegate. */
export declare function delegate<
  ConstructorType extends RenderableConstructor<any>,
  const Mapping extends DelegateMap<InstanceType<ConstructorType>>,
>(
  mapping: ValidateShape<Mapping, string>,
  vnode: VNode & {
    type: ConstructorType
  },
): VNode
export {}
