/**
 * JSX runtime for `"jsxImportSource": "ax-tui/solid"`.
 *
 * @module
 */
import type { TimeToFirstDrawRenderable } from "ax-tui"
import type {
  BoxProps,
  CodeProps,
  ExtendedComponentProps,
  ExtendedIntrinsicElements,
  InputProps,
  LinkProps,
  MarkdownProps,
  AxTuiComponents,
  ScrollBoxProps,
  SpanProps,
  TextareaProps,
  TextProps,
} from "./src/types/elements.js"
import type { JSX as SolidJSX } from "solid-js"

type JsxComponent = (props: Record<string, unknown>) => unknown

/** Create a JSX element for the ax-tui SolidJS runtime. */
export declare function jsx(type: string | JsxComponent, props?: Record<string, unknown> | null): JSX.Element
/** Create a JSX element with static children. */
export declare const jsxs: typeof jsx
/** Create a JSX element in development mode. */
export declare function jsxDEV(type: string | JsxComponent, props?: Record<string, unknown> | null): JSX.Element
/** JSX fragment that renders its children without a wrapper node. */
export declare function Fragment(props: { children?: JSX.Element }): JSX.Element

/** JSX namespace. */
export declare namespace JSX {
  type Element = SolidJSX.Element

  interface IntrinsicElements extends ExtendedIntrinsicElements<AxTuiComponents> {
    box: BoxProps
    text: TextProps
    span: SpanProps
    input: InputProps
    scrollbox: ScrollBoxProps
    code: CodeProps
    textarea: TextareaProps
    markdown: MarkdownProps
    time_to_first_draw: ExtendedComponentProps<typeof TimeToFirstDrawRenderable>

    b: SpanProps
    strong: SpanProps
    i: SpanProps
    em: SpanProps
    u: SpanProps
    br: {}
    a: LinkProps
  }

  interface ElementChildrenAttribute {
    children: {}
  }
}
