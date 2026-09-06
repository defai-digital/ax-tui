import { BaseRenderable } from "ax-tui"
import { SlotRenderable } from "./elements/index.js"
/** SolidJS DOM node in the ax-tui renderable tree. */
export type DomNode = BaseRenderable
/** Create an empty slot renderable used by the SolidJS reconciler. */
export declare function createSlotNode(): SlotRenderable
/** SolidJS render primitive used by the JSX runtime. */
export declare const _render: (code: () => BaseRenderable, node: BaseRenderable) => () => void
/** SolidJS effect primitive used by the JSX runtime. */
export declare const effect: <T>(fn: (prev?: T) => T, init?: T) => void
/** SolidJS memo primitive used by the JSX runtime. */
export declare const memo: <T>(fn: () => T, equal: boolean) => () => T
/** SolidJS component constructor primitive. */
export declare const createComponent: <T>(Comp: (props: T) => BaseRenderable, props: T) => BaseRenderable
/** Create a renderable from a JSX tag name. */
export declare const createElement: (tag: string) => BaseRenderable
/** Create a text renderable from a string value. */
export declare const createTextNode: (value: string) => BaseRenderable
/** Insert a child renderable into a parent before an optional anchor. */
export declare const insertNode: (
  parent: BaseRenderable,
  node: BaseRenderable,
  anchor?: BaseRenderable | undefined,
) => void
/** Insert a SolidJS accessor's output into a parent renderable. */
export declare const insert: <T>(
  parent: any,
  accessor: T | (() => T),
  marker?: any | null,
  initial?: any,
) => BaseRenderable
/** Spread props onto a renderable node. */
export declare const spread: <T>(node: any, accessor: (() => T) | T, skipChildren?: boolean) => void
/** Set a single prop on a renderable node. */
export declare const setProp: <T>(node: BaseRenderable, name: string, value: T, prev?: T | undefined) => T
/** Merge SolidJS prop objects. */
export declare const mergeProps: (...sources: unknown[]) => unknown
/** Run a SolidJS `use:` directive against a renderable. */
export declare const use: <A, T>(fn: (element: BaseRenderable, arg: A) => T, element: BaseRenderable, arg: A) => T
