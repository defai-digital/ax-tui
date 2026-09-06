import {
  BoxSizing,
  Align,
  Dimension,
  Direction,
  Display,
  Edge,
  FlexDirection,
  Gutter,
  Justify,
  LogLevel,
  MeasureMode,
  Overflow,
  PositionType,
  Unit,
  Wrap,
} from "../yoga.js"
/** Align string. */
export type AlignString =
  | "auto"
  | "flex-start"
  | "center"
  | "flex-end"
  | "stretch"
  | "baseline"
  | "space-between"
  | "space-around"
  | "space-evenly"
/** Box sizing string. */
export type BoxSizingString = "border-box" | "content-box"
/** Dimension string. */
export type DimensionString = "width" | "height"
/** Direction string. */
export type DirectionString = "inherit" | "ltr" | "rtl"
/** Display string. */
export type DisplayString = "flex" | "none" | "contents"
/** Edge string. */
export type EdgeString = "left" | "top" | "right" | "bottom" | "start" | "end" | "horizontal" | "vertical" | "all"
/** Flex direction string. */
export type FlexDirectionString = "column" | "column-reverse" | "row" | "row-reverse"
/** Gutter string. */
export type GutterString = "column" | "row" | "all"
/** Justify string. */
export type JustifyString = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly"
/** Log level string. */
export type LogLevelString = "error" | "warn" | "info" | "debug" | "verbose" | "fatal"
/** Measure mode string. */
export type MeasureModeString = "undefined" | "exactly" | "at-most"
/** Overflow string. */
export type OverflowString = "visible" | "hidden" | "scroll"
/** Position type string. */
export type PositionTypeString = "static" | "relative" | "absolute"
/** Unit string. */
export type UnitString = "undefined" | "point" | "percent" | "auto"
/** Wrap string. */
export type WrapString = "no-wrap" | "wrap" | "wrap-reverse"
/** Parse align. */
export declare function parseAlign(value: string | null | undefined): Align
/** Parse align items. */
export declare function parseAlignItems(value: string | null | undefined): Align
/** Parse box sizing. */
export declare function parseBoxSizing(value: string): BoxSizing
/** Parse dimension. */
export declare function parseDimension(value: string): Dimension
/** Parse direction. */
export declare function parseDirection(value: string): Direction
/** Parse display. */
export declare function parseDisplay(value: string): Display
/** Parse edge. */
export declare function parseEdge(value: string): Edge
/** Parse flex direction. */
export declare function parseFlexDirection(value: string | null | undefined): FlexDirection
/** Parse gutter. */
export declare function parseGutter(value: string): Gutter
/** Parse justify. */
export declare function parseJustify(value: string | null | undefined): Justify
/** Parse log level. */
export declare function parseLogLevel(value: string): LogLevel
/** Parse measure mode. */
export declare function parseMeasureMode(value: string): MeasureMode
/** Parse overflow. */
export declare function parseOverflow(value: string | null | undefined): Overflow
/** Parse position type. */
export declare function parsePositionType(value: string | null | undefined): PositionType
/** Parse unit. */
export declare function parseUnit(value: string): Unit
/** Parse wrap. */
export declare function parseWrap(value: string | null | undefined): Wrap
