import type { TimeToFirstDrawRenderable } from "ax-tui"
import type { ExtendedComponentProps } from "./types/elements.js"
/** Props for the SolidJS {@link TimeToFirstDraw} component. */
export type TimeToFirstDrawProps = ExtendedComponentProps<typeof TimeToFirstDrawRenderable>
/** SolidJS component wrapping {@link TimeToFirstDrawRenderable}. */
export declare const TimeToFirstDraw: (props: TimeToFirstDrawProps) => any
