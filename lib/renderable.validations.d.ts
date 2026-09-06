import type { RenderableOptions, Renderable } from "../Renderable.js"
import type { PositionTypeString, OverflowString } from "./yoga.options.js"
/** Validate options. */
export declare function validateOptions(id: string, options: RenderableOptions<Renderable>): void
/** Is valid percentage. */
export declare function isValidPercentage(value: any): value is `${number}%`
/** Is margin type. */
export declare function isMarginType(value: any): value is number | "auto" | `${number}%`
/** Is padding type. */
export declare function isPaddingType(value: any): value is number | `${number}%`
/** Is position type. */
export declare function isPositionType(value: any): value is number | "auto" | `${number}%`
/** Is position type type. */
export declare function isPositionTypeType(value: any): value is PositionTypeString
/** Is overflow type. */
export declare function isOverflowType(value: any): value is OverflowString
/** Is dimension type. */
export declare function isDimensionType(value: any): value is number | "auto" | `${number}%`
/** Is flex basis type. */
export declare function isFlexBasisType(value: any): value is number | "auto" | undefined
/** Is size type. */
export declare function isSizeType(value: any): value is number | `${number}%` | undefined
